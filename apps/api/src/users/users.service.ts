import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Inject,
} from '@nestjs/common'
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { DYNAMO_CLIENT } from '../database/database.module'
import { UpdateProfileDto, AddMemberDto, ProjectMemberRole } from './dto/user.dto'
import { JwtPayload, Role } from '../auth/dto/auth.dto'

const TABLE = process.env.DYNAMO_TABLE ?? 'streamline'

@Injectable()
export class UsersService {
  constructor(@Inject(DYNAMO_CLIENT) private readonly db: DynamoDBDocumentClient) {}

  // ─── Profile ─────────────────────────────────────────────────────────────

  async getProfile(userId: string) {
    const result = await this.db.send(
      new GetCommand({ TableName: TABLE, Key: { PK: `USER#${userId}`, SK: `USER#${userId}` } }),
    )
    if (!result.Item) throw new NotFoundException('User not found')
    const { passwordHash: _, ...safe } = result.Item
    return safe
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updates: string[] = []
    const values: Record<string, unknown> = {}

    if (dto.name !== undefined) { updates.push('name = :name'); values[':name'] = dto.name }
    if (dto.avatarUrl !== undefined) { updates.push('avatarUrl = :avatar'); values[':avatar'] = dto.avatarUrl }
    if (dto.jobTitle !== undefined) { updates.push('jobTitle = :job'); values[':job'] = dto.jobTitle }

    if (updates.length === 0) return this.getProfile(userId)

    const now = new Date().toISOString()
    updates.push('updatedAt = :now')
    values[':now'] = now

    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `USER#${userId}`, SK: `USER#${userId}` },
        UpdateExpression: `SET ${updates.join(', ')}`,
        ExpressionAttributeValues: values,
        ConditionExpression: 'attribute_exists(PK)',
      }),
    )

    return this.getProfile(userId)
  }

  async listOrgMembers(organizationId: string) {
    // Users linked to the org are queryable via GSI: filter by organizationId
    // Since users don't have a shared PK with the org, we scan by organizationId attribute via a GSI
    // For now we use a simple approach: query users via GSI1 where organizationId matches
    // This requires a GSI on organizationId — as an alternative we store member refs
    // under ORG#id MEMBER#userId keys for efficient listing
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `ORG#${organizationId}`,
          ':sk': 'MEMBER#',
        },
      }),
    )

    // Hydrate each member ref with full profile
    const refs = result.Items ?? []
    const profiles = await Promise.all(refs.map((r) => this.getProfile(r.userId as string).catch(() => null)))
    return profiles.filter(Boolean)
  }

  // ─── Project membership ───────────────────────────────────────────────────

  async listProjectMembers(projectId: string) {
    const project = await this.getProjectById(projectId)
    return project.members ?? []
  }

  async addProjectMember(projectId: string, dto: AddMemberDto, user: JwtPayload) {
    const project = await this.getProjectById(projectId)
    this.assertStudioOwns(project, user)

    const members: Array<Record<string, unknown>> = project.members ?? []
    if (members.some((m) => m.userId === dto.userId)) {
      throw new ConflictException('User is already a member of this project')
    }

    // Verify the target user exists and belongs to the same org
    const target = await this.db.send(
      new GetCommand({ TableName: TABLE, Key: { PK: `USER#${dto.userId}`, SK: `USER#${dto.userId}` } }),
    )
    if (!target.Item || target.Item.organizationId !== user.organizationId) {
      throw new NotFoundException('User not found in your organization')
    }

    const entry = {
      userId: dto.userId,
      name: target.Item.name,
      email: target.Item.email,
      role: dto.role ?? ProjectMemberRole.CONTRIBUTOR,
      addedAt: new Date().toISOString(),
    }

    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${project.organizationId}`, SK: `PROJECT#${projectId}` },
        UpdateExpression: 'SET members = list_append(if_not_exists(members, :empty), :m), updatedAt = :now',
        ExpressionAttributeValues: {
          ':m': [entry],
          ':empty': [],
          ':now': new Date().toISOString(),
        },
      }),
    )

    // Write member ref under ORG# for listOrgMembers
    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${user.organizationId}`, SK: `MEMBER#${dto.userId}` },
        UpdateExpression: 'SET userId = :uid, addedAt = :now',
        ExpressionAttributeValues: { ':uid': dto.userId, ':now': new Date().toISOString() },
      }),
    )

    return entry
  }

  async removeProjectMember(projectId: string, targetUserId: string, user: JwtPayload) {
    const project = await this.getProjectById(projectId)
    this.assertStudioOwns(project, user)

    const members: Array<Record<string, unknown>> = project.members ?? []
    const updated = members.filter((m) => m.userId !== targetUserId)

    if (updated.length === members.length) throw new NotFoundException('Member not found in project')

    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${project.organizationId}`, SK: `PROJECT#${projectId}` },
        UpdateExpression: 'SET members = :members, updatedAt = :now',
        ExpressionAttributeValues: { ':members': updated, ':now': new Date().toISOString() },
      }),
    )
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async getProjectById(id: string) {
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

  private assertStudioOwns(project: Record<string, unknown>, user: JwtPayload) {
    if (user.role !== Role.STUDIO || project.organizationId !== user.organizationId) {
      throw new ForbiddenException()
    }
  }
}
