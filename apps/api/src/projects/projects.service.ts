import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { DYNAMO_CLIENT } from '../database/database.module'
import {
  CreateProjectDto,
  UpdateProjectDto,
  UpdateMilestoneDto,
  ProjectStatus,
  MilestoneStatus,
} from './dto/project.dto'
import { JwtPayload, Role } from '../auth/dto/auth.dto'

const TABLE = process.env.DYNAMO_TABLE ?? 'streamline'

@Injectable()
export class ProjectsService {
  constructor(@Inject(DYNAMO_CLIENT) private readonly db: DynamoDBDocumentClient) {}

  async create(dto: CreateProjectDto, user: JwtPayload) {
    this.requireOrg(user)
    const id = uuidv4()
    const now = new Date().toISOString()

    const milestones = (dto.milestones ?? []).map((m) => ({
      id: uuidv4(),
      title: m.title,
      dueDate: m.dueDate,
      status: m.status ?? MilestoneStatus.PENDING,
    }))

    const project = {
      PK: `ORG#${user.organizationId}`,
      SK: `PROJECT#${id}`,
      GSI1PK: `CLIENT#${dto.clientId}`,
      GSI1SK: `PROJECT#${id}`,
      GSI2PK: `PROJECT#${id}`,
      GSI2SK: `PROJECT#${id}`,
      id,
      organizationId: user.organizationId,
      clientId: dto.clientId,
      name: dto.name,
      description: dto.description,
      status: ProjectStatus.DRAFT,
      milestones,
      startDate: dto.startDate,
      endDate: dto.endDate,
      createdAt: now,
      updatedAt: now,
    }

    await this.db.send(new PutCommand({ TableName: TABLE, Item: project }))
    return project
  }

  async findAll(user: JwtPayload, clientId?: string) {
    this.requireOrg(user)

    // Filter by client via GSI1
    if (clientId) {
      const result = await this.db.send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
          ExpressionAttributeValues: {
            ':pk': `CLIENT#${clientId}`,
            ':sk': 'PROJECT#',
          },
        }),
      )
      return (result.Items ?? []).filter((p) => p.organizationId === user.organizationId)
    }

    // All projects of the org
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `ORG#${user.organizationId}`,
          ':sk': 'PROJECT#',
        },
      }),
    )
    return result.Items ?? []
  }

  async findById(id: string, user: JwtPayload) {
    const project = await this.getProjectById(id)
    this.assertAccess(project, user)
    return project
  }

  async update(id: string, dto: UpdateProjectDto, user: JwtPayload) {
    const project = await this.getProjectById(id)
    this.assertStudioAccess(project, user)

    const updates: string[] = []
    const values: Record<string, unknown> = {}

    const fields: (keyof UpdateProjectDto)[] = ['name', 'description', 'status', 'startDate', 'endDate']
    for (const f of fields) {
      if (dto[f] !== undefined) {
        updates.push(`${f} = :${f}`)
        values[`:${f}`] = dto[f]
      }
    }

    if (updates.length === 0) return project

    const now = new Date().toISOString()
    updates.push('updatedAt = :now')
    values[':now'] = now

    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${project.organizationId}`, SK: `PROJECT#${id}` },
        UpdateExpression: `SET ${updates.join(', ')}`,
        ExpressionAttributeValues: values,
      }),
    )

    return { ...project, ...dto, updatedAt: now }
  }

  async remove(id: string, user: JwtPayload) {
    const project = await this.getProjectById(id)
    this.assertStudioAccess(project, user)

    await this.db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${project.organizationId}`, SK: `PROJECT#${id}` },
      }),
    )
  }

  async addMilestone(id: string, dto: { title: string; dueDate: string }, user: JwtPayload) {
    const project = await this.getProjectById(id)
    this.assertStudioAccess(project, user)

    const milestone = {
      id: uuidv4(),
      title: dto.title,
      dueDate: dto.dueDate,
      status: MilestoneStatus.PENDING,
    }

    const now = new Date().toISOString()
    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${project.organizationId}`, SK: `PROJECT#${id}` },
        UpdateExpression: 'SET milestones = list_append(if_not_exists(milestones, :empty), :m), updatedAt = :now',
        ExpressionAttributeValues: { ':m': [milestone], ':empty': [], ':now': now },
      }),
    )

    return milestone
  }

  async updateMilestone(id: string, milestoneId: string, dto: UpdateMilestoneDto, user: JwtPayload) {
    const project = await this.getProjectById(id)
    this.assertStudioAccess(project, user)

    const milestones: Array<Record<string, unknown>> = project.milestones ?? []
    const idx = milestones.findIndex((m) => m.id === milestoneId)
    if (idx === -1) throw new NotFoundException('Milestone not found')

    milestones[idx] = { ...milestones[idx], ...dto }
    const now = new Date().toISOString()

    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${project.organizationId}`, SK: `PROJECT#${id}` },
        UpdateExpression: 'SET milestones = :milestones, updatedAt = :now',
        ExpressionAttributeValues: { ':milestones': milestones, ':now': now },
      }),
    )

    return milestones[idx]
  }

  async getProjectById(id: string) {
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: { ':pk': `PROJECT#${id}` },
        Limit: 1,
      }),
    )
    const item = result.Items?.[0]
    if (!item) throw new NotFoundException('Project not found')
    return item
  }

  private requireOrg(user: JwtPayload) {
    if (!user.organizationId) throw new BadRequestException('You must belong to an organization first')
  }

  private assertAccess(project: Record<string, unknown>, user: JwtPayload) {
    if (user.role === Role.STUDIO && project.organizationId !== user.organizationId) throw new ForbiddenException()
    if (user.role === Role.CLIENT && project.clientId !== user.clientId) throw new ForbiddenException()
  }

  private assertStudioAccess(project: Record<string, unknown>, user: JwtPayload) {
    if (user.role !== Role.STUDIO || project.organizationId !== user.organizationId) throw new ForbiddenException()
  }
}
