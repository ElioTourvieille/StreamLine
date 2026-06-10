import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class NotificationsService {
  private readonly log = new Logger(NotificationsService.name)
  // Resend is loaded lazily so the app starts without RESEND_API_KEY in dev
  private resend: import('resend').Resend | null = null

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
      subject: `Action required: "${opts.deliverableTitle}" awaits your approval`,
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
    const label = opts.action === 'APPROVED' ? '✅ Approved' : '🔄 Changes requested'
    if (!client) {
      this.log.debug(`[DEV] Email to ${opts.to}: ${label} — ${opts.deliverableTitle}`)
      return
    }
    await client.emails.send({
      from: `StreamLine <noreply@${process.env.EMAIL_DOMAIN ?? 'streamline.studio'}>`,
      to: opts.to,
      subject: `${label}: "${opts.deliverableTitle}" by ${opts.clientName}`,
      html: this.validationActionHtml(opts),
    })
  }

  private deliverableReadyHtml(opts: { clientName: string; projectName: string; deliverableTitle: string; portalUrl: string }) {
    return `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#131317;color:#F1F5F9;padding:40px">
<div style="max-width:520px;margin:auto;background:#1A1A24;border:1px solid #2D2D3D;border-radius:12px;padding:32px">
  <h1 style="font-size:20px;font-weight:600;margin:0 0 8px">New deliverable ready for review</h1>
  <p style="color:#64748B;margin:0 0 24px">Hi ${opts.clientName}, a new item is waiting for your approval on <strong style="color:#F1F5F9">${opts.projectName}</strong>.</p>
  <div style="background:#131317;border:1px solid #2D2D3D;border-radius:8px;padding:16px;margin-bottom:24px">
    <p style="margin:0;font-weight:600">${opts.deliverableTitle}</p>
  </div>
  <a href="${opts.portalUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none">Review &amp; Approve →</a>
  <p style="color:#64748B;font-size:12px;margin-top:24px">StreamLine — The studio project hub</p>
</div></body></html>`
  }

  private validationActionHtml(opts: { studioName: string; clientName: string; projectName: string; deliverableTitle: string; action: string; comment?: string; dashboardUrl: string }) {
    const isApproved = opts.action === 'APPROVED'
    const color = isApproved ? '#22C55E' : '#F59E0B'
    const label = isApproved ? 'Approved ✅' : 'Changes Requested 🔄'
    return `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#131317;color:#F1F5F9;padding:40px">
<div style="max-width:520px;margin:auto;background:#1A1A24;border:1px solid #2D2D3D;border-radius:12px;padding:32px">
  <h1 style="font-size:20px;font-weight:600;margin:0 0 8px">Client validation update</h1>
  <p style="color:#64748B;margin:0 0 24px"><strong style="color:#F1F5F9">${opts.clientName}</strong> has responded to a deliverable on <strong style="color:#F1F5F9">${opts.projectName}</strong>.</p>
  <div style="background:#131317;border:1px solid #2D2D3D;border-radius:8px;padding:16px;margin-bottom:16px">
    <p style="margin:0 0 8px;font-weight:600">${opts.deliverableTitle}</p>
    <span style="background:${color}26;color:${color};font-size:12px;font-weight:600;padding:4px 10px;border-radius:9999px">${label}</span>
  </div>
  ${opts.comment ? `<div style="background:#131317;border-left:3px solid ${color};padding:12px 16px;margin-bottom:24px;border-radius:0 8px 8px 0"><p style="margin:0;color:#ccc3d8;font-size:14px">"${opts.comment}"</p></div>` : ''}
  <a href="${opts.dashboardUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none">View in Dashboard →</a>
</div></body></html>`
  }
}
