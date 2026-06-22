import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Inject,
} from '@nestjs/common'
import {
  DynamoDBDocumentClient, PutCommand, UpdateCommand, QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { DYNAMO_CLIENT } from '../database/database.module'
import { NotificationsService } from '../notifications/notifications.service'
import {
  CreateDeliverableDto, ValidateDeliverableDto,
  DeliverableStatus, DeliverableType,
} from './dto/deliverable.dto'
import { JwtPayload, Role } from '../auth/dto/auth.dto'

const TABLE = process.env.DYNAMO_TABLE ?? 'streamline'

@Injectable()
export class DeliverablesService {
  constructor(
    @Inject(DYNAMO_CLIENT) private readonly db: DynamoDBDocumentClient,
    private readonly notify: NotificationsService,
  ) {}

  async create(dto: CreateDeliverableDto, user: JwtPayload) {
    if (!user.organizationId) throw new BadRequestException('No organization')
    const id = uuidv4()
    const now = new Date().toISOString()

    const item = {
      PK: `PROJECT#${dto.projectId}`,
      SK: `DELIVERABLE#${id}`,
      GSI1PK: `DELIVERABLE#${id}`,
      GSI1SK: `DELIVERABLE#${id}`,
      id,
      projectId: dto.projectId,
      organizationId: user.organizationId,
      title: dto.title,
      type: dto.type ?? DeliverableType.OTHER,
      description: dto.description,
      previewUrl: dto.previewUrl,
      deadline: dto.deadline,
      status: DeliverableStatus.PENDING,
      comments: [],
      createdBy: user.sub,
      createdAt: now,
      updatedAt: now,
    }

    await this.db.send(new PutCommand({ TableName: TABLE, Item: item }))
    return item
  }

  async findByProject(projectId: string, user: JwtPayload) {
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':pk': `PROJECT#${projectId}`, ':sk': 'DELIVERABLE#' },
      }),
    )
    const items = result.Items ?? []
    // STUDIO: filter by org; CLIENT: filter by clientId matching project
    if (user.role === Role.STUDIO) {
      return items.filter(i => i.organizationId === user.organizationId)
    }
    return items
  }

  async findById(id: string) {
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': `DELIVERABLE#${id}` },
        Limit: 1,
      }),
    )
    const item = result.Items?.[0]
    if (!item) throw new NotFoundException('Deliverable not found')
    return item
  }

  async validate(
    id: string,
    dto: ValidateDeliverableDto,
    actor: { name: string; email: string; organizationId?: string },
  ) {
    const deliverable = await this.findById(id)

    if (deliverable.status !== DeliverableStatus.PENDING) {
      throw new BadRequestException('Deliverable has already been reviewed')
    }

    const comment = dto.comment
      ? { id: uuidv4(), name: actor.name, text: dto.comment, createdAt: new Date().toISOString() }
      : null

    const now = new Date().toISOString()
    const updates = ['#s = :status', 'updatedAt = :now', 'reviewedAt = :now', 'reviewedBy = :reviewer']
    const values: Record<string, unknown> = {
      ':status': dto.action,
      ':now': now,
      ':reviewer': actor.name,
    }
    const names: Record<string, string> = { '#s': 'status' }

    if (comment) {
      updates.push('comments = list_append(if_not_exists(comments, :empty), :c)')
      values[':c'] = [comment]
      values[':empty'] = []
    }

    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `PROJECT#${deliverable.projectId}`, SK: `DELIVERABLE#${id}` },
        UpdateExpression: `SET ${updates.join(', ')}`,
        ExpressionAttributeValues: values,
        ExpressionAttributeNames: names,
      }),
    )

    // In-app notification for the studio user who created the deliverable
    if (deliverable.createdBy) {
      await this.notify.createNotification(String(deliverable.createdBy), {
        type: dto.action === 'APPROVED' ? 'deliverable_approved' : 'deliverable_changes',
        title: dto.action === 'APPROVED'
          ? `"${deliverable.title as string}" approved`
          : `Changes requested on "${deliverable.title as string}"`,
        description: dto.comment
          ? `"${dto.comment}" — by ${actor.name}`
          : `Reviewed by ${actor.name}`,
        projectId: String(deliverable.projectId),
      }).catch(() => { /* non-blocking */ })
    }

    // Notify studio via email
    const dashboardUrl = `${process.env.WEB_URL ?? 'http://localhost:3000'}/projects/${deliverable.projectId}`
    await this.notify.sendValidationAction({
      to: process.env.STUDIO_NOTIFY_EMAIL ?? 'studio@example.com',
      studioName: 'Origin Studio',
      clientName: actor.name,
      projectName: deliverable.projectId,
      deliverableTitle: deliverable.title as string,
      action: dto.action,
      comment: dto.comment,
      dashboardUrl,
    })

    return { ...deliverable, status: dto.action, reviewedBy: actor.name, updatedAt: now }
  }
}
