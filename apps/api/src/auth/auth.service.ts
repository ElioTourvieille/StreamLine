import {
  Injectable, ConflictException, UnauthorizedException,
  BadRequestException, NotFoundException, Inject,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, GetCommand, DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { RegisterDto, LoginDto, JwtPayload, Role } from './dto/auth.dto'
import { DYNAMO_CLIENT } from '../database/database.module'

const TABLE = process.env.DYNAMO_TABLE ?? 'streamline'

@Injectable()
export class AuthService {
  constructor(
    @Inject(DYNAMO_CLIENT) private readonly db: DynamoDBDocumentClient,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.inviteToken && dto.organizationName) {
      throw new BadRequestException('Provide either an invite token or a studio name, not both')
    }

    const existing = await this.findUserByEmail(dto.email)
    if (existing) throw new ConflictException('Email already in use')

    // Resolve the invite *before* creating the user, so a bad/expired token
    // fails the whole request instead of leaving an orphaned account behind.
    const invite = dto.inviteToken ? await this.consumeTeamInvite(dto.inviteToken, dto.email) : null

    const id = uuidv4()
    const hash = await bcrypt.hash(dto.password, 12)
    const role = dto.role ?? Role.STUDIO
    const now = new Date().toISOString()

    await this.db.send(new PutCommand({
      TableName: TABLE,
      Item: {
        PK: `USER#${id}`,
        SK: `USER#${id}`,
        GSI1PK: `EMAIL#${dto.email}`,
        GSI1SK: `USER#${id}`,
        id,
        email: dto.email,
        name: dto.name,
        passwordHash: hash,
        role,
        createdAt: now,
      },
    }))

    let organizationId: string | undefined

    if (invite) {
      organizationId = invite.organizationId
      await Promise.all([
        this.db.send(new UpdateCommand({
          TableName: TABLE,
          Key: { PK: `USER#${id}`, SK: `USER#${id}` },
          UpdateExpression: 'SET organizationId = :orgId, updatedAt = :now',
          ExpressionAttributeValues: { ':orgId': invite.organizationId, ':now': now },
        })),
        this.db.send(new PutCommand({
          TableName: TABLE,
          Item: { PK: `ORG#${invite.organizationId}`, SK: `MEMBER#${id}`, userId: id, role: 'MEMBER', joinedAt: now },
        })),
      ])
    } else if (dto.organizationName) {
      const orgId = uuidv4()
      const slug = dto.organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      await Promise.all([
        this.db.send(new PutCommand({
          TableName: TABLE,
          Item: {
            PK: `ORG#${orgId}`,
            SK: `ORG#${orgId}`,
            GSI1PK: `SLUG#${slug}`,
            GSI1SK: `ORG#${orgId}`,
            id: orgId,
            name: dto.organizationName,
            slug,
            ownerId: id,
            createdAt: now,
            updatedAt: now,
          },
        })),
        this.db.send(new UpdateCommand({
          TableName: TABLE,
          Key: { PK: `USER#${id}`, SK: `USER#${id}` },
          UpdateExpression: 'SET organizationId = :orgId, updatedAt = :now',
          ExpressionAttributeValues: { ':orgId': orgId, ':now': now },
        })),
        this.db.send(new PutCommand({
          TableName: TABLE,
          Item: { PK: `ORG#${orgId}`, SK: `MEMBER#${id}`, userId: id, role: 'OWNER', joinedAt: now },
        })),
      ])
      organizationId = orgId
    }

    const payload: JwtPayload = { sub: id, email: dto.email, role, organizationId }
    return { accessToken: this.jwtService.sign(payload), user: { id, email: dto.email, name: dto.name, role } }
  }

  /** Public preview — shown on the register page before the user commits to joining. Does not consume the invite. */
  async resolveTeamInvitePreview(token: string) {
    const invite = await this.getTeamInvite(token)
    const org = await this.db.send(
      new GetCommand({ TableName: TABLE, Key: { PK: `ORG#${invite.organizationId}`, SK: `ORG#${invite.organizationId}` } }),
    )
    return {
      email: invite.email,
      organizationName: org.Item?.name ? String(org.Item.name) : 'ce studio',
    }
  }

  async login(dto: LoginDto) {
    const user = await this.findUserByEmail(dto.email)
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId }
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }
  }

  private async getTeamInvite(token: string) {
    const result = await this.db.send(
      new GetCommand({ TableName: TABLE, Key: { PK: `TEAM_INVITE#${token}`, SK: `TEAM_INVITE#${token}` } }),
    )
    const item = result.Item as { organizationId: string; email: string; ttl?: number } | undefined
    if (!item) throw new NotFoundException('This invite link is invalid or has expired')

    // Same reasoning as the client portal token: don't trust DynamoDB's TTL
    // sweep to have run yet, enforce the cutoff ourselves on every read.
    if (item.ttl && item.ttl < Math.floor(Date.now() / 1000)) {
      throw new NotFoundException('This invite link is invalid or has expired')
    }
    return item
  }

  private async consumeTeamInvite(token: string, email: string) {
    const invite = await this.getTeamInvite(token)
    if (invite.email !== email) {
      throw new BadRequestException('This invite was sent to a different email address')
    }
    // Single-use: delete immediately so the same link can't create two accounts.
    await this.db.send(
      new DeleteCommand({ TableName: TABLE, Key: { PK: `TEAM_INVITE#${token}`, SK: `TEAM_INVITE#${token}` } }),
    )
    return invite
  }

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
}
