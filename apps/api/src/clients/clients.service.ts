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
import { CreateClientDto, UpdateClientDto, InviteClientDto, ClientStatus } from './dto/client.dto'
import { JwtPayload, Role } from '../auth/dto/auth.dto'

const TABLE = process.env.DYNAMO_TABLE ?? 'streamline'

@Injectable()
export class ClientsService {
  constructor(@Inject(DYNAMO_CLIENT) private readonly db: DynamoDBDocumentClient) {}

  async create(dto: CreateClientDto, user: JwtPayload) {
    this.requireOrg(user)
    const id = uuidv4()
    const now = new Date().toISOString()

    const client = {
      PK: `ORG#${user.organizationId}`,
      SK: `CLIENT#${id}`,
      GSI1PK: `CLIENT#${id}`,
      GSI1SK: `CLIENT#${id}`,
      id,
      organizationId: user.organizationId,
      name: dto.name,
      contactEmail: dto.contactEmail,
      company: dto.company,
      phone: dto.phone,
      logoUrl: dto.logoUrl,
      status: ClientStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    }

    await this.db.send(new PutCommand({ TableName: TABLE, Item: client }))
    return client
  }

  async findAll(user: JwtPayload) {
    this.requireOrg(user)
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `ORG#${user.organizationId}`,
          ':sk': 'CLIENT#',
        },
      }),
    )
    return result.Items ?? []
  }

  async findById(id: string, user: JwtPayload) {
    const client = await this.getClientById(id)
    this.assertAccess(client, user)
    return client
  }

  async update(id: string, dto: UpdateClientDto, user: JwtPayload) {
    const client = await this.getClientById(id)
    this.assertAccess(client, user)

    const updates: string[] = []
    const values: Record<string, unknown> = {}

    const fields: (keyof UpdateClientDto)[] = ['name', 'contactEmail', 'company', 'phone', 'logoUrl', 'status']
    for (const f of fields) {
      if (dto[f] !== undefined) {
        updates.push(`${f} = :${f}`)
        values[`:${f}`] = dto[f]
      }
    }

    if (updates.length === 0) return client

    const now = new Date().toISOString()
    updates.push('updatedAt = :now')
    values[':now'] = now

    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${client.organizationId}`, SK: `CLIENT#${id}` },
        UpdateExpression: `SET ${updates.join(', ')}`,
        ExpressionAttributeValues: values,
      }),
    )

    return { ...client, ...dto, updatedAt: now }
  }

  async remove(id: string, user: JwtPayload) {
    const client = await this.getClientById(id)
    this.assertAccess(client, user)

    await this.db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${client.organizationId}`, SK: `CLIENT#${id}` },
      }),
    )
  }

  async invite(id: string, dto: InviteClientDto, user: JwtPayload) {
    const client = await this.getClientById(id)
    this.assertAccess(client, user)

    const inviteToken = uuidv4()
    const now = new Date().toISOString()

    // Store invite token on the client record
    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `ORG#${client.organizationId}`, SK: `CLIENT#${id}` },
        UpdateExpression: 'SET inviteToken = :token, inviteEmail = :email, inviteName = :name, invitedAt = :now, updatedAt = :now',
        ExpressionAttributeValues: {
          ':token': inviteToken,
          ':email': dto.email,
          ':name': dto.name,
          ':now': now,
        },
      }),
    )

    // TODO: send email via SES/Resend with portal URL
    const portalUrl = `${process.env.WEB_URL ?? 'http://localhost:3000'}/portal/accept?token=${inviteToken}`

    return { inviteToken, portalUrl, email: dto.email }
  }

  async getClientById(id: string) {
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': `CLIENT#${id}` },
        Limit: 1,
      }),
    )
    const item = result.Items?.[0]
    if (!item) throw new NotFoundException('Client not found')
    return item
  }

  private requireOrg(user: JwtPayload) {
    if (!user.organizationId) {
      throw new BadRequestException('You must belong to an organization first')
    }
  }

  private assertAccess(client: Record<string, unknown>, user: JwtPayload) {
    // STUDIO: must own the org
    if (user.role === Role.STUDIO && client.organizationId !== user.organizationId) {
      throw new ForbiddenException()
    }
    // CLIENT: must be linked to this client record
    if (user.role === Role.CLIENT && client.linkedUserId !== user.sub) {
      throw new ForbiddenException()
    }
  }
}
