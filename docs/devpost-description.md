## Inspiration

Running a web studio means juggling clients across email threads, Notion docs, Slack DMs, and spreadsheets — all while trying to get a simple "yes" on a design deliverable. We wanted one focused tool where the studio tracks everything internally and the client gets a clean, no-friction window into their project.

## What It Does

StreamLine is a B2B SaaS project tracking platform for web studios and digital agencies. It has two distinct audiences:

**Studio workspace** — A dashboard to manage clients, projects, and deliverables. Milestones have an interactive timeline. Deliverables go through an approval workflow. An AI-powered proposal generator (Claude Opus 4.8, real-time streaming) turns a brief into a structured project document in seconds.

**Client portal** — Clients receive a magic link. No account, no password. They see their project status, review deliverables, and approve (or request changes with a comment) in one tap. When they act, the studio gets an in-app notification instantly.

## How We Built It

- **Next.js 15** (App Router) deployed on Vercel for the frontend
- **NestJS 10** REST API running on AWS with JWT auth and role-based guards
- **DynamoDB single-table design** — one table handles organizations, clients, projects, milestones, deliverables, messages, notifications, and portal invites via composite PK/SK keys and two GSIs
- **Claude Opus 4.8** via the Anthropic API with adaptive thinking and streaming SSE for the proposal generator
- **Resend** for transactional emails (magic links, approval notifications)

## DynamoDB Design Highlight

We used a true single-table design: `ORG#{id} | PROJECT#{id}`, `PROJECT#{id} | MSG#{iso}#{uuid}`, `USER#{id} | NOTIF#{iso}#{uuid}`. GSI1 handles inverse lookups (SK→PK); GSI2 enables cross-org project access by ID. TTL on invite tokens (90 days) handles automatic cleanup without a cron job.

## What's Next

- Real-time updates via DynamoDB Streams + WebSockets (replace polling)
- Client-side messaging in the portal (two-way communication)
- Multi-member studio teams with per-project role assignment
- Stripe billing integration for client invoicing within the platform
