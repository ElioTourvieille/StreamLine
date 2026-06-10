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

    if (dto.name !== undefined) { updates.push('name = :name'); values[':name'] = dto.name }
    if (dto.primaryColor !== undefined) { updates.push('primaryColor = :color'); values[':color'] = dto.primaryColor }
    if (dto.logoUrl !== undefined) { updates.push('logoUrl = :logo'); values[':logo'] = dto.logoUrl }

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
      }),
    )

    return { ...org, ...dto, updatedAt: now }
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
