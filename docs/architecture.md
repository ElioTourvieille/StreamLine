# StreamLine — System Architecture

## Overview

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        PORTAL["Client Portal<br/>/portal/[token]<br/>No auth required"]
        STUDIO["Studio App<br/>Next.js 15 App Router<br/>JWT auth"]
    end

    subgraph Vercel["Vercel (Frontend)"]
        WEB["Next.js 15<br/>App Router<br/>Tailwind v4 · Framer Motion"]
        ROUTE["Next.js Route Handlers<br/>/api/ai/generate<br/>Streaming SSE"]
    end

    subgraph AWS_API["AWS (Backend)"]
        API["NestJS 10<br/>REST API<br/>Port 3001<br/>JWT + Guards"]
        subgraph Modules["Modules"]
            AUTH["auth/"]
            CLIENTS["clients/"]
            PROJECTS["projects/"]
            DELIVERABLES["deliverables/"]
            PORTAL_MOD["portal/"]
            NOTIFS["notifications/"]
            ORGS["organizations/"]
        end
    end

    subgraph AWS_DB["AWS DynamoDB"]
        TABLE["streamline-{env}<br/>Single-table design"]
        GSI1["GSI1<br/>SK → PK<br/>inverse access"]
        GSI2["GSI2<br/>Project by ID<br/>cross-org lookup"]
    end

    subgraph External["External Services"]
        CLAUDE["Anthropic API<br/>Claude Opus 4.8<br/>Streaming proposals"]
        RESEND["Resend<br/>Magic link emails<br/>Notifications"]
    end

    STUDIO --> WEB
    PORTAL --> WEB
    WEB --> ROUTE
    WEB --> API
    ROUTE --> CLAUDE
    API --> Modules
    Modules --> TABLE
    TABLE --> GSI1
    TABLE --> GSI2
    API --> RESEND

    style Client fill:#1A1A24,stroke:#2D2D3D,color:#F1F5F9
    style Vercel fill:#0F0F13,stroke:#7C3AED,color:#F1F5F9
    style AWS_API fill:#0F0F13,stroke:#3B82F6,color:#F1F5F9
    style AWS_DB fill:#0F0F13,stroke:#F59E0B,color:#F1F5F9
    style External fill:#0F0F13,stroke:#22C55E,color:#F1F5F9
```

## DynamoDB Single-Table Design

One table (`streamline-{env}`) stores all entities using composite PK/SK keys.

| PK | SK | Entity |
|----|----|--------|
| `ORG#{orgId}` | `METADATA` | Organisation |
| `ORG#{orgId}` | `CLIENT#{clientId}` | Client |
| `ORG#{orgId}` | `PROJECT#{projectId}` | Project (list view) |
| `PROJECT#{projectId}` | `METADATA` | Project detail + milestones |
| `PROJECT#{projectId}` | `DELIVERABLE#{id}` | Deliverable |
| `PROJECT#{projectId}` | `MSG#{iso}#{uuid}` | Chat message |
| `USER#{userId}` | `METADATA` | User profile |
| `USER#{userId}` | `NOTIF#{iso}#{uuid}` | Notification |
| `INVITE#{token}` | `METADATA` | Portal invite (TTL 90d) |

### Access patterns

- **Studio dashboard** → `ORG#x | begins_with(PROJECT#)` via base table
- **Project detail** → `GSI2: PROJECT#x` (cross-org lookup by project ID)
- **Client projects** → `GSI1: CLIENT#x | begins_with(PROJECT#)`
- **Notifications** → `USER#x | begins_with(NOTIF#)` newest-first
- **Messages** → `PROJECT#x | begins_with(MSG#)` chronological

## Request Flow — Client Portal Validation

```mermaid
sequenceDiagram
    participant C as Client Browser
    participant V as Vercel (Next.js)
    participant A as NestJS API
    participant D as DynamoDB
    participant N as Resend

    C->>V: GET /portal/[token]
    V->>A: GET /api/portal/:token
    A->>D: GetItem INVITE#token
    A->>D: Query ORG#orgId CLIENT#clientId
    A->>D: Query deliverables by project
    A-->>V: { client, projects, deliverables }
    V-->>C: Render portal page

    C->>V: POST validate deliverable
    V->>A: POST /api/portal/:token/deliverables/:id/validate
    A->>D: UpdateItem deliverable status
    A->>D: PutItem NOTIF for studio user
    A->>N: Send email notification (async)
    A-->>C: { status: APPROVED }
```

## Request Flow — AI Proposal Generator

```mermaid
sequenceDiagram
    participant S as Studio Browser
    participant V as Vercel Route Handler
    participant AI as Anthropic API

    S->>V: POST /api/ai/generate { brief }
    V->>AI: messages.stream() claude-opus-4-8
    AI-->>V: SSE stream chunks
    V-->>S: ReadableStream (real-time)
    S->>S: Render markdown as it streams
```

---

## AWS Setup Required

> **For H0 submission:** Two screenshots from the AWS Console (eu-west-3).

### Table overview (Paramètres tab)
![DynamoDB table — streamline, Active, Pay per request](./dynamo-screenshot.png)

### GSI indexes (Index tab)
![DynamoDB GSI1 and GSI2](./dynamo-indexes.png)
