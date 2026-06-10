import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
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
    const existing = await this.findUserByEmail(dto.email)
    if (existing) throw new ConflictException('Email already in use')

    const id = uuidv4()
    const hash = await bcrypt.hash(dto.password, 12)
    const role = dto.role ?? Role.STUDIO

    const user = {
      PK: `USER#${id}`,
      SK: `USER#${id}`,
      GSI1PK: `EMAIL#${dto.email}`,
      GSI1SK: `USER#${id}`,
      id,
      email: dto.email,
      name: dto.name,
      passwordHash: hash,
      role,
      createdAt: new Date().toISOString(),
    }

    await this.db.send(new PutCommand({ TableName: TABLE, Item: user }))

    const payload: JwtPayload = { sub: id, email: dto.email, role }
    return { accessToken: this.jwtService.sign(payload), user: { id, email: dto.email, name: dto.name, role } }
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
