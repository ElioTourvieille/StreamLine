import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { marked } from 'marked'

export async function POST(req: NextRequest) {
  try {
    const { email, clientName, proposal } = (await req.json()) as {
      email: string
      clientName: string
      proposal: string
    }

    if (!email || !proposal) {
      return NextResponse.json({ error: 'Missing email or proposal' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const htmlBody = await marked(proposal)
    const from = `StreamLine <noreply@${process.env.EMAIL_DOMAIN ?? 'origin-studio.ch'}>`

    await resend.emails.send({
      from,
      to: email,
      subject: `Project Proposal — ${clientName}`,
      html: buildEmail(clientName, htmlBody),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send email' },
      { status: 500 },
    )
  }
}

function buildEmail(clientName: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;background:#f1f5f9;margin:0;padding:32px 16px;color:#1e293b}
  .wrap{max-width:680px;margin:0 auto}
  .card{background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(0,0,0,.06)}
  .top{background:#131317;padding:24px 32px;display:flex;align-items:center;justify-content:space-between}
  .brand{color:#f1f5f9;font-size:15px;font-weight:700;letter-spacing:-.2px}
  .badge{background:rgba(124,58,237,.2);border:1px solid rgba(124,58,237,.35);color:#c4b5fd;font-size:11px;font-weight:600;padding:3px 12px;border-radius:999px}
  .hero{background:linear-gradient(135deg,#1e0a3c 0%,#131317 100%);padding:32px}
  .hero h1{color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 6px}
  .hero p{color:#94a3b8;font-size:14px;margin:0}
  .body{padding:36px}
  .body h1{font-size:20px;font-weight:700;color:#0f172a;margin:0 0 16px;padding-bottom:14px;border-bottom:2px solid #e2e8f0}
  .body h2{font-size:16px;font-weight:600;color:#1e293b;margin:28px 0 10px}
  .body h3{font-size:14px;font-weight:600;color:#7c3aed;margin:20px 0 8px}
  .body p{font-size:14px;line-height:1.75;color:#475569;margin:0 0 14px}
  .body ul,.body ol{padding-left:22px;margin:0 0 14px}
  .body li{font-size:14px;line-height:1.75;color:#475569;margin-bottom:4px}
  .body strong{color:#1e293b;font-weight:600}
  .body em{color:#7c3aed;font-style:italic}
  .body table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}
  .body th{background:#f8fafc;color:#1e293b;font-weight:600;text-align:left;padding:10px 14px;border:1px solid #e2e8f0}
  .body td{padding:9px 14px;border:1px solid #e2e8f0;color:#475569}
  .body tr:nth-child(even) td{background:#f8fafc}
  .body blockquote{border-left:3px solid #7c3aed;padding:10px 18px;margin:16px 0;color:#64748b;background:#faf5ff;border-radius:0 8px 8px 0}
  .body code{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:.1em .4em;font-size:.85em;color:#7c3aed}
  .body pre{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:16px;overflow-x:auto;margin:0 0 14px}
  .body pre code{background:none;border:none;padding:0;color:#1e293b}
  .body hr{border:none;border-top:1px solid #e2e8f0;margin:28px 0}
  .foot{background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 32px;text-align:center}
  .foot p{font-size:12px;color:#94a3b8;margin:0}
  .foot a{color:#7c3aed;text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="top">
      <span class="brand">StreamLine</span>
      <span class="badge">Project Proposal</span>
    </div>
    <div class="hero">
      <h1>Your project proposal</h1>
      <p>Hi ${clientName}, please find the project proposal prepared for you below.</p>
    </div>
    <div class="body">${body}</div>
    <div class="foot">
      <p>Sent via <a href="https://www.origin-studio.ch">StreamLine by Origin Studio</a></p>
    </div>
  </div>
</div>
</body>
</html>`
}
