# StreamLine

**B2B project tracking platform for web studios and digital agencies.**

StreamLine gives studios a single workspace to manage clients, projects, and deliverables — while giving clients a frictionless portal (no account required) to review progress and approve work.

Built for the [H0 Hackathon](https://h01.devpost.com) · Deadline 29 June 2026  
By **Origin Studio** · Geneva, CH · [origin-studio.ch](https://www.origin-studio.ch/)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) · Tailwind v4 · Framer Motion |
| Backend | NestJS 10 · REST API · JWT Auth |
| Database | AWS DynamoDB (single-table design) |
| AI | Claude Opus 4.8 via Anthropic API (streaming) |
| Email | Resend (magic links, notifications) |
| Deployment | Vercel (frontend) · AWS (backend) |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url> && cd StreamLine

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp apps/api/.env.example apps/api/.env        # fill AWS + JWT keys
cp apps/web/.env.local.example apps/web/.env.local  # fill ANTHROPIC_API_KEY

# 4. Provision DynamoDB table and the S3 bucket for deliverable uploads
pnpm db:setup
pnpm s3:setup

# 5. Start development servers (web :3000 · api :3001)
pnpm dev
```

### Environment variables

**`apps/api/.env`**
```env
AWS_REGION=eu-central-2   # Zurich — Swiss data residency
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
DYNAMO_TABLE=streamline
S3_BUCKET=...            # deliverable file uploads — see pnpm s3:setup
JWT_SECRET=...
WEB_URL=http://localhost:3000
RESEND_API_KEY=re_...   # optional in dev
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full system diagram.

---

## Key Features

### Studio workspace
- **Dashboard** — live stats (active projects, pending validations, milestone health)
- **Clients** — full CRUD + magic-link portal invitations
- **Projects** — milestones timeline, deliverable tracking, project health gauge
- **Messages** — per-project chat threads with real-time polling
- **Notifications** — in-app bell with unread badge (deliverable approvals, change requests)
- **Settings** — studio profile, logo, website

### Client portal (no account required)
- Access via magic link / invite token
- Review project progress and deliverable status
- Approve deliverables or request changes with a comment
- Framer Motion animations · fully mobile-responsive

### AI Proposal Generator
- Powered by **Claude Opus 4.8** with real-time streaming
- Generate structured project proposals from a brief
- Download as `.md` for immediate use

### Data layer
- **DynamoDB single-table design** — one table, PK/SK patterns, GSI1/GSI2 indexes
- 90-day TTL on invite tokens
- Sub-10ms reads on hot paths

---

## Project Structure

```
streamline/
├── apps/
│   ├── api/          NestJS 10 — port 3001
│   └── web/          Next.js 15 — port 3000
├── scripts/
│   └── setup-dynamo.mjs
├── docs/
│   ├── architecture.md
│   └── devpost-description.md
└── pnpm-workspace.yaml
```

---

## Demo Flow

```
Register → Dashboard → Add client → Send portal invite
→ Create project + milestones → Add deliverable
→ Client opens portal → Approves deliverable
→ Studio receives notification → Dashboard updates
```
