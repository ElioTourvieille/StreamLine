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
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { DYNAMO_CLIENT } from '../database/database.module'
import { UpdateProfileDto, AddMemberDto, InviteTeamMemberDto, ProjectMemberRole } from './dto/user.dto'
import { NotificationsService } from '../notifications/notifications.service'
import { JwtPayload, Role } from '../auth/dto/auth.dto'

const TEAM_INVITE_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days — shorter than the client portal's 90d, teammates act fast or get re-invited

const TABLE = process.env.DYNAMO_TABLE ?? 'streamline'

@Injectable()
export class UsersService {
  constructor(
    @Inject(DYNAMO_CLIENT) private readonly db: DynamoDBDocumentClient,
    private readonly notify: NotificationsService,
  ) {}

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
    const names: Record<string, string> = {}

    // `name` is a DynamoDB reserved word — must alias it
    if (dto.name !== undefined) { updates.push('#n = :name'); values[':name'] = dto.name; names['#n'] = 'name' }
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
        ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
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

    // Hydrate each member ref with its full profile, keeping the org-level
    // role (OWNER/MEMBER) that lives on the MEMBER# ref, not on the user.
    const refs = result.Items ?? []
    const profiles = await Promise.all(
      refs.map(async (r) => {
        const profile = await this.getProfile(r.userId as string).catch(() => null)
        return profile ? { ...profile, orgRole: r.role ?? 'MEMBER', joinedAt: r.joinedAt ?? r.addedAt } : null
      }),
    )
    return profiles.filter(Boolean)
  }

  // ─── Team invites ───────────────────────────────────────────────────────

  async inviteMember(organizationId: string, dto: InviteTeamMemberDto, user: JwtPayload) {
    if (user.organizationId !== organizationId) throw new ForbiddenException()

    const existingUser = await this.findUserByEmail(dto.email)
    if (existingUser?.organizationId === organizationId) {
      throw new ConflictException('This person is already a member of your studio')
    }

    const org = await this.db.send(
      new GetCommand({ TableName: TABLE, Key: { PK: `ORG#${organizationId}`, SK: `ORG#${organizationId}` } }),
    )
    if (!org.Item) throw new NotFoundException('Organization not found')

    const inviter = await this.getProfile(user.sub).catch(() => null)

    const token = uuidv4()
    const now = new Date().toISOString()
    const ttl = Math.floor(Date.now() / 1000) + TEAM_INVITE_TTL_SECONDS

    await this.db.send(new PutCommand({
      TableName: TABLE,
      Item: {
        PK: `TEAM_INVITE#${token}`,
        SK: `TEAM_INVITE#${token}`,
        organizationId,
        email: dto.email,
        name: dto.name,
        invitedBy: user.sub,
        createdAt: now,
        ttl,
      },
    }))

    const inviteUrl = `${process.env.WEB_URL ?? 'http://localhost:3000'}/register?invite=${token}`

    await this.notify.sendTeamInvite({
      to: dto.email,
      inviterName: inviter?.name ? String(inviter.name) : 'Un membre de l’équipe',
      studioName: String(org.Item.name ?? 'Origin Studio'),
      inviteUrl,
    }).catch(() => { /* non-blocking — the invite still works via the returned link */ })

    return { inviteToken: token, inviteUrl, email: dto.email }
  }

  async removeOrgMember(organizationId: string, targetUserId: string, user: JwtPayload) {
    if (user.organizationId !== organizationId) throw new ForbiddenException()

    const org = await this.db.send(
      new GetCommand({ TableName: TABLE, Key: { PK: `ORG#${organizationId}`, SK: `ORG#${organizationId}` } }),
    )
    if (!org.Item) throw new NotFoundException('Organization not found')
    if (org.Item.ownerId !== user.sub) {
      throw new ForbiddenException('Only the studio owner can remove members')
    }
    if (targetUserId === org.Item.ownerId) {
      throw new ForbiddenException('The studio owner cannot be removed')
    }

    await this.db.send(
      new DeleteCommand({ TableName: TABLE, Key: { PK: `ORG#${organizationId}`, SK: `MEMBER#${targetUserId}` } }),
    )

    // Clear the user's org link so future logins/permission checks are
    // correct. Note: this doesn't revoke an already-issued JWT — that stays
    // valid for up to 7 days (its own expiry) even after removal here.
    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `USER#${targetUserId}`, SK: `USER#${targetUserId}` },
        UpdateExpression: 'REMOVE organizationId SET updatedAt = :now',
        ExpressionAttributeValues: { ':now': new Date().toISOString() },
        ConditionExpression: 'attribute_exists(PK)',
      }),
    )
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

  private async findUserByEmail(email: string) {
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': `EMAIL#${email}` },
        Limit: 1,
      }),
    )
    return result.Items?.[0] ?? null
  }

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
