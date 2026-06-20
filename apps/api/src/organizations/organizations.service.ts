import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { DYNAMO_CLIENT } from '../database/database.module'
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto'
import { JwtPayload } from '../auth/dto/auth.dto'

const TABLE = process.env.DYNAMO_TABLE ?? 'streamline'

@Injectable()
export class OrganizationsService {
  constructor(@Inject(DYNAMO_CLIENT) private readonly db: DynamoDBDocumentClient) {}

  async create(dto: CreateOrganizationDto, user: JwtPayload) {
    const existing = await this.findBySlug(dto.slug)
    if (existing) throw new ConflictException(`Slug "${dto.slug}" is already taken`)

    const id = uuidv4()
    const now = new Date().toISOString()

    const org = {
      PK: `ORG#${id}`,
      SK: `ORG#${id}`,
      GSI1PK: `SLUG#${dto.slug}`,
      GSI1SK: `ORG#${id}`,
      id,
      name: dto.name,
      slug: dto.slug,
      primaryColor: dto.primaryColor ?? '#6366f1',
      logoUrl: dto.logoUrl,
      ownerId: user.sub,
      createdAt: now,
      updatedAt: now,
    }

    await this.db.send(new PutCommand({ TableName: TABLE, Item: org }))

    // Link owner to this org
    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `USER#${user.sub}`, SK: `USER#${user.sub}` },
        UpdateExpression: 'SET organizationId = :orgId, updatedAt = :now',
        ExpressionAttributeValues: { ':orgId': id, ':now': now },
      }),
    )

    return org
  }

  async findById(id: string) {
    const result = await this.db.send(
      new GetCommand({ TableName: TABLE, Key: { PK: `ORG#${id}`, SK: `ORG#${id}` } }),
    )
    if (!result.Item) throw new NotFoundException('Organization not found')
    return result.Item
  }

  async update(id: string, dto: UpdateOrganizationDto, user: JwtPayload) {
    const org = await this.findById(id)
    if (org.ownerId !== user.sub) throw new ForbiddenException()

    const updates: string[] = []
    const values: Record<string, unknown> = {}
    const names: Record<string, string> = {}

    // `name` is a DynamoDB reserved word — must alias it
    if (dto.name !== undefined) { updates.push('#n = :name'); values[':name'] = dto.name; names['#n'] = 'name' }
    if (dto.primaryColor !== undefined) { updates.push('primaryColor = :color'); values[':color'] = dto.primaryColor }
    if (dto.logoUrl !== undefined) { updates.push('logoUrl = :logo'); values[':logo'] = dto.logoUrl }
    if (dto.website !== undefined) { updates.push('website = :website'); values[':website'] = dto.website }

    if (updates.length === 0) return org

    const now = new Date().toISOString()
    updates.push('updatedAt = :now')
    values[':now'] = now

    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${id}`, SK: `ORG#${id}` },
        UpdateExpression: `SET ${updates.join(', ')}`,
        ExpressionAttributeValues: values,
        ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      }),
    )

    return { ...org, ...dto, updatedAt: now }
  }

  async getStats(orgId: string) {
    const [projRes, clientRes] = await Promise.all([
      this.db.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':pk': `ORG#${orgId}`, ':sk': 'PROJECT#' },
      })),
      this.db.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':pk': `ORG#${orgId}`, ':sk': 'CLIENT#' },
      })),
    ])

    const projects = projRes.Items ?? []
    const clients  = clientRes.Items ?? []

    const activeProjects = projects.filter(
      p => p.status !== 'COMPLETED' && p.status !== 'ARCHIVED',
    ).length

    const completedMilestones = projects.reduce((sum, p) => {
      const ms = (p.milestones ?? []) as Array<{ status: string }>
      return sum + ms.filter(m => m.status === 'COMPLETED').length
    }, 0)

    // Count PENDING deliverables across up to 10 projects
    const delivBatches = await Promise.all(
      projects.slice(0, 10).map(p =>
        this.db.send(new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
          ExpressionAttributeValues: { ':pk': `PROJECT#${p.id}`, ':sk': 'DELIVERABLE#' },
        })).then(r => r.Items ?? []),
      ),
    )
    const pendingValidations = delivBatches.flat().filter(d => d.status === 'PENDING').length

    return { activeProjects, totalClients: clients.length, pendingValidations, completedMilestones }
  }

  async getActivity(orgId: string) {
    const [projRes, clientRes] = await Promise.all([
      this.db.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':pk': `ORG#${orgId}`, ':sk': 'PROJECT#' },
      })),
      this.db.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':pk': `ORG#${orgId}`, ':sk': 'CLIENT#' },
      })),
    ])

    const projects = projRes.Items ?? []
    const clients  = clientRes.Items ?? []

    // Deliverables for the 5 most recently created projects
    const recentProjects = [...projects]
      .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
      .slice(0, 5)

    const delivBatches = await Promise.all(
      recentProjects.map(p =>
        this.db.send(new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
          ExpressionAttributeValues: { ':pk': `PROJECT#${p.id}`, ':sk': 'DELIVERABLE#' },
        })).then(r => r.Items ?? []),
      ),
    )
    const deliverables = delivBatches.flat()

    type Event = { type: string; title: string; actor?: string; timestamp: string }
    const events: Event[] = []

    for (const p of projects) {
      if (p.createdAt) {
        events.push({ type: 'project_created', title: `Project "${p.name}" created`, timestamp: String(p.createdAt) })
      }
    }
    for (const c of clients) {
      if (c.createdAt) {
        events.push({ type: 'client_added', title: `Client "${c.company || c.name}" added`, timestamp: String(c.createdAt) })
      }
    }
    for (const d of deliverables) {
      if (d.status === 'APPROVED' || d.status === 'CHANGES_REQUESTED') {
        events.push({
          type: d.status === 'APPROVED' ? 'deliverable_approved' : 'deliverable_changes',
          title: d.status === 'APPROVED'
            ? `"${d.title}" approved`
            : `Changes requested on "${d.title}"`,
          actor: d.reviewedBy ? String(d.reviewedBy) : undefined,
          timestamp: String(d.updatedAt ?? d.createdAt ?? ''),
        })
      }
    }

    return events
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 10)
  }

  private async findBySlug(slug: string) {
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': `SLUG#${slug}` },
        Limit: 1,
      }),
    )
    return result.Items?.[0] ?? null
  }
}
