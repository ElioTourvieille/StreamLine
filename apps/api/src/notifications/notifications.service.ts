import { Injectable, Logger, Inject } from '@nestjs/common'
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { DYNAMO_CLIENT } from '../database/database.module'

const TABLE = process.env.DYNAMO_TABLE ?? 'streamline'

export type NotifType = 'deliverable_approved' | 'deliverable_changes' | 'invite_accepted' | 'system'

export interface NotifPayload {
  type: NotifType
  title: string
  description?: string
  projectId?: string
}

@Injectable()
export class NotificationsService {
  private readonly log = new Logger(NotificationsService.name)
  // Resend is loaded lazily so the app starts without RESEND_API_KEY in dev
  private resend: import('resend').Resend | null = null

  constructor(@Inject(DYNAMO_CLIENT) private readonly db: DynamoDBDocumentClient) {}

  // ─── In-app notifications (DynamoDB) ─────────────────────────────────────

  async createNotification(userId: string, payload: NotifPayload) {
    const id = uuidv4()
    const now = new Date().toISOString()

    await this.db.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: `USER#${userId}`,
          SK: `NOTIF#${now}#${id}`,
          id,
          userId,
          type: payload.type,
          title: payload.title,
          description: payload.description,
          projectId: payload.projectId,
          isRead: false,
          createdAt: now,
        },
      }),
    )
    return id
  }

  async getNotifications(userId: string) {
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':sk': 'NOTIF#' },
        ScanIndexForward: false,
        Limit: 50,
      }),
    )
    return result.Items ?? []
  }

  async markAsRead(userId: string, notifId: string) {
    // Query to find the item's full SK
    const result = await this.db.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        FilterExpression: '#id = :id',
        ExpressionAttributeNames: { '#id': 'id' },
        ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':sk': 'NOTIF#', ':id': notifId },
      }),
    )
    const item = result.Items?.[0]
    if (!item) return null

    await this.db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: item.PK, SK: item.SK },
        UpdateExpression: 'SET isRead = :t',
        ExpressionAttributeValues: { ':t': true },
      }),
    )
    return { ...item, isRead: true }
  }

  // ─── Email (Resend, lazy-loaded) ──────────────────────────────────────────

  private getClient() {
    if (!process.env.RESEND_API_KEY) return null
    if (!this.resend) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Resend } = require('resend') as typeof import('resend')
      this.resend = new Resend(process.env.RESEND_API_KEY)
    }
    return this.resend
  }

  async sendDeliverableReady(opts: {
    to: string
    clientName: string
    projectName: string
    deliverableTitle: string
    portalUrl: string
  }) {
    const client = this.getClient()
    if (!client) {
      this.log.debug(`[DEV] Email to ${opts.to}: Deliverable ready — ${opts.deliverableTitle}`)
      return
    }
    await client.emails.send({
      from: `StreamLine <noreply@${process.env.EMAIL_DOMAIN ?? 'streamline.studio'}>`,
      to: opts.to,
      subject: `Action requise : "${opts.deliverableTitle}" attend votre validation`,
      html: this.deliverableReadyHtml(opts),
    })
  }

  async sendValidationAction(opts: {
    to: string
    studioName: string
    clientName: string
    projectName: string
    deliverableTitle: string
    action: 'APPROVED' | 'CHANGES_REQUESTED'
    comment?: string
    dashboardUrl: string
  }) {
    const client = this.getClient()
    const label = opts.action === 'APPROVED' ? '✅ Approuvé' : '🔄 Modifications demandées'
    if (!client) {
      this.log.debug(`[DEV] Email to ${opts.to}: ${label} — ${opts.deliverableTitle}`)
      return
    }
    await client.emails.send({
      from: `StreamLine <noreply@${process.env.EMAIL_DOMAIN ?? 'streamline.studio'}>`,
      to: opts.to,
      subject: `${label} : "${opts.deliverableTitle}" par ${opts.clientName}`,
      html: this.validationActionHtml(opts),
    })
  }

  async sendTeamInvite(opts: {
    to: string
    inviterName: string
    studioName: string
    inviteUrl: string
  }) {
    const client = this.getClient()
    if (!client) {
      this.log.debug(`[DEV] Email to ${opts.to}: invited to join ${opts.studioName}`)
      return
    }
    await client.emails.send({
      from: `StreamLine <noreply@${process.env.EMAIL_DOMAIN ?? 'streamline.studio'}>`,
      to: opts.to,
      subject: `${opts.inviterName} vous invite à rejoindre ${opts.studioName} sur StreamLine`,
      html: this.teamInviteHtml(opts),
    })
  }

  private deliverableReadyHtml(opts: { clientName: string; projectName: string; deliverableTitle: string; portalUrl: string }) {
    return `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#F7F7FB;color:#14141C;padding:40px">
<div style="max-width:520px;margin:auto;background:#FFFFFF;border:1px solid #E4E4EA;border-radius:12px;padding:32px">
  <h1 style="font-size:20px;font-weight:600;margin:0 0 8px">Nouveau livrable à valider</h1>
  <p style="color:#6B6C80;margin:0 0 24px">Bonjour ${opts.clientName}, un nouvel élément attend votre validation sur <strong style="color:#14141C">${opts.projectName}</strong>.</p>
  <div style="background:#F7F7FB;border:1px solid #E4E4EA;border-radius:8px;padding:16px;margin-bottom:24px">
    <p style="margin:0;font-weight:600">${opts.deliverableTitle}</p>
  </div>
  <a href="${opts.portalUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none">Consulter et valider →</a>
  <p style="color:#6B6C80;font-size:12px;margin-top:24px">StreamLine — le hub de projet du studio</p>
</div></body></html>`
  }

  private validationActionHtml(opts: { studioName: string; clientName: string; projectName: string; deliverableTitle: string; action: string; comment?: string; dashboardUrl: string }) {
    const isApproved = opts.action === 'APPROVED'
    const color = isApproved ? '#0F6B32' : '#A34B08'
    const label = isApproved ? 'Approuvé ✅' : 'Modifications demandées 🔄'
    return `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#F7F7FB;color:#14141C;padding:40px">
<div style="max-width:520px;margin:auto;background:#FFFFFF;border:1px solid #E4E4EA;border-radius:12px;padding:32px">
  <h1 style="font-size:20px;font-weight:600;margin:0 0 8px">Mise à jour côté client</h1>
  <p style="color:#6B6C80;margin:0 0 24px"><strong style="color:#14141C">${opts.clientName}</strong> a répondu à un livrable sur <strong style="color:#14141C">${opts.projectName}</strong>.</p>
  <div style="background:#F7F7FB;border:1px solid #E4E4EA;border-radius:8px;padding:16px;margin-bottom:16px">
    <p style="margin:0 0 8px;font-weight:600">${opts.deliverableTitle}</p>
    <span style="background:${color}1a;color:${color};font-size:12px;font-weight:600;padding:4px 10px;border-radius:9999px">${label}</span>
  </div>
  ${opts.comment ? `<div style="background:#F7F7FB;border-left:3px solid ${color};padding:12px 16px;margin-bottom:24px;border-radius:0 8px 8px 0"><p style="margin:0;color:#45465A;font-size:14px">« ${opts.comment} »</p></div>` : ''}
  <a href="${opts.dashboardUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none">Voir dans le tableau de bord →</a>
</div></body></html>`
  }

  private teamInviteHtml(opts: { inviterName: string; studioName: string; inviteUrl: string }) {
    return `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#F7F7FB;color:#14141C;padding:40px">
<div style="max-width:520px;margin:auto;background:#FFFFFF;border:1px solid #E4E4EA;border-radius:12px;padding:32px">
  <h1 style="font-size:20px;font-weight:600;margin:0 0 8px">Vous êtes invité·e chez ${opts.studioName}</h1>
  <p style="color:#6B6C80;margin:0 0 24px"><strong style="color:#14141C">${opts.inviterName}</strong> vous invite à rejoindre <strong style="color:#14141C">${opts.studioName}</strong> sur StreamLine.</p>
  <a href="${opts.inviteUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none">Rejoindre l’équipe →</a>
  <p style="color:#6B6C80;font-size:12px;margin-top:24px">Ce lien expire dans 7 jours. Si vous ne vous attendiez pas à cette invitation, ignorez simplement cet e-mail.</p>
</div></body></html>`
  }
}
