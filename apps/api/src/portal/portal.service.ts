import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import {
  DynamoDBDocumentClient, GetCommand, QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { DYNAMO_CLIENT } from '../database/database.module'
import { DeliverablesService } from '../deliverables/deliverables.service'
import { ValidateDeliverableDto } from '../deliverables/dto/deliverable.dto'
import { Role } from '../auth/dto/auth.dto'

const TABLE = process.env.DYNAMO_TABLE ?? 'streamline'

@Injectable()
export class PortalService {
  constructor(
    @Inject(DYNAMO_CLIENT) private readonly db: DynamoDBDocumentClient,
    private readonly deliverablesSvc: DeliverablesService,
  ) {}

  async resolveToken(token: string) {
    const result = await this.db.send(
      new GetCommand({ TableName: TABLE, Key: { PK: `TOKEN#${token}`, SK: `TOKEN#${token}` } }),
    )
    if (!result.Item) throw new NotFoundException('Invalid or expired portal link')
    return result.Item as { clientId: string; organizationId: string; email: string; name: string }
  }

  async getPortalContext(token: string) {
    const tokenItem = await this.resolveToken(token)

    // Get client record
    const clientResult = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': `CLIENT#${tokenItem.clientId}` },
        Limit: 1,
      }),
    )
    const client = clientResult.Items?.[0]
    if (!client) throw new NotFoundException('Client not found')

    // Get projects for this client
    const projectsResult = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `CLIENT#${tokenItem.clientId}`,
          ':sk': 'PROJECT#',
        },
      }),
    )
    const projects = projectsResult.Items ?? []

    // Get deliverables for all projects
    const fakeUser = { sub: tokenItem.clientId, email: tokenItem.email, role: Role.CLIENT }
    const deliverablesByProject = await Promise.all(
      projects.map(async (p) => {
        const items = await this.deliverablesSvc.findByProject(p.id as string, fakeUser)
        return { projectId: p.id, items }
      }),
    )

    return {
      client: { id: client.id, name: client.name, company: client.company, email: tokenItem.email },
      projects,
      deliverablesByProject,
    }
  }

  async validateDeliverable(token: string, deliverableId: string, dto: ValidateDeliverableDto) {
    const tokenItem = await this.resolveToken(token)
    return this.deliverablesSvc.validate(deliverableId, dto, {
      name: tokenItem.name,
      email: tokenItem.email,
    })
  }
}
