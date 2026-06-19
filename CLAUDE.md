# CLAUDE.md — StreamLine

> Fichier de contexte pour Claude Code. À placer à la racine du monorepo.  
> Mis à jour : juin 2026

---

## 📖 Lis ça en premier à chaque session

**Avant de toucher au code, lis `PROGRESS.md`** (à la racine).  
Il contient l'entrée de la dernière session : ce qui a été fait, ce qui bloque, et la prochaine étape.  
À la fin de chaque session, mets-le à jour (voir section [Journal d'avancement](#journal-davancement)).

---

## 🎯 Projet

**StreamLine** est une plateforme B2B SaaS de suivi de projets pour studios web et agences digitales.  
Soumis au hackathon **H0 (AWS + Vercel)** — deadline : **29 juin 2026, 17h00 PDT**.

**Studio propriétaire :** Origin Studio (Genève, CH) — https://www.origin-studio.ch/

### Deux vues distinctes
- **Studio** : dashboard interne pour gérer clients, projets, livrables
- **Client** : portail public (magic link / token) pour suivre l'avancement et approuver les livrables

---

## 🏗️ Architecture

```
streamline/
├── apps/
│   ├── api/                    NestJS 10 — port 3001
│   │   └── src/
│   │       ├── auth/           JWT + Passport + guards
│   │       ├── clients/        CRUD + invite portal
│   │       ├── deliverables/   Livrables + workflow validation
│   │       ├── organizations/  Studio settings
│   │       ├── projects/       CRUD + milestones + membres
│   │       ├── users/          Profil utilisateur
│   │       ├── notifications/  Resend email (lazy-loaded)
│   │       ├── portal/         Routes publiques (no JWT)
│   │       └── database/       DynamoDB module
│   └── web/                    Next.js 15 App Router — port 3000
│       └── src/
│           ├── app/
│           │   ├── (auth)/     login, register
│           │   ├── (studio)/   layout sidebar — routes protégées
│           │   ├── portal/     portail client public
│           │   └── api/        Next.js route handlers
│           └── lib/
│               ├── api.ts      typed API client (fetch wrapper)
│               └── hooks.ts    useApiData<T>
├── scripts/
│   └── setup-dynamo.mjs        Provisioning DynamoDB
├── PROGRESS.md                 ← Journal d'avancement (voir ci-dessous)
└── pnpm-workspace.yaml
```

### Stack technique

| Couche | Techno | Notes |
|--------|--------|-------|
| Frontend | Next.js 15 (App Router) | Tailwind v4, dark theme |
| Backend | NestJS 10 | API REST, guards JWT |
| Base de données | DynamoDB (AWS) | Single-table design, GSI1/GSI2, TTL 90j |
| Auth | JWT maison | register + login + me |
| AI | Claude Opus 4.8 via Anthropic API | Streaming temps réel |
| Email | Resend | Magic links, notifications (lazy-loaded) |
| Déploiement | Vercel (web) + AWS (api) | Requis H0 |

---

## 🗄️ DynamoDB — Single-Table Design

**Table :** `streamline-{env}` | Script de setup : `pnpm db:setup`

### Patterns PK/SK

```
ORG#{orgId}          | METADATA                        → Organisation
ORG#{orgId}          | CLIENT#{clientId}               → Client
ORG#{orgId}          | PROJECT#{projectId}             → Projet
PROJECT#{projectId}  | METADATA                        → Détail projet
PROJECT#{projectId}  | MILESTONE#{milestoneId}         → Jalon
PROJECT#{projectId}  | DELIVERABLE#{deliverableId}     → Livrable
USER#{userId}        | METADATA                        → Utilisateur
USER#{userId}        | NOTIF#{ts}#{notifId}            → Notification
INVITE#{token}       | METADATA + TTL 90j              → Token portal client
```

### GSI
- **GSI1** : accès inverse SK→PK
- **GSI2** : projets par client (`clientId` → `orgId`)

---

## 🚦 État d'avancement — ce qui existe vraiment

### ✅ Terminé et fonctionnel

- Auth JWT (register + login + me) avec création automatique d'organisation
- Clients : CRUD complet + invitation portal (génère token DynamoDB)
- Projets : CRUD + milestones + membres
- Livrables : create + list + workflow (approve / request changes)
- Portail client public `/portal/[token]` : accès par token, validations, animations Framer Motion, error states
- AI Proposal Generator `/ai-generator` : Claude Opus 4.8, streaming temps réel, rendu markdown, download `.md`
- Email via Resend (lazy-loaded — fonctionne sans la clé en dev)
- Design system : Tailwind v4, thème dark, responsive mobile, sidebar avec état actif

### ⚠️ Partiellement fait (à wirer)

- **Dashboard** `/dashboard` : UI + animations ✅ — stats hardcodées, pas de fetch réel
- **Sidebar user info** : "Elio Rossi / Origin Studio" hardcodé — doit venir de `api.auth.me()`

### ❌ Pages inexistantes (liens morts dans la sidebar)

- `/documents` — page non créée
- `/messages` — page non créée
- `/settings` — page non créée

### ❌ Non configuré (bloquant en prod)

- `ANTHROPIC_API_KEY` dans `apps/web/.env.local` (placeholder)
- DynamoDB table à provisionner : `pnpm db:setup`
- Credentials AWS dans `apps/api/.env`

---

## 🗺️ Routes API NestJS (référence complète)

| Méthode | Route | Auth | Rôle |
|---------|-------|------|------|
| POST | `/api/auth/register` | ❌ | — |
| POST | `/api/auth/login` | ❌ | — |
| GET | `/api/auth/me` | ✅ | any |
| GET | `/api/health` | ❌ | — |
| POST/GET/PATCH | `/api/organizations/:id` | ✅ | STUDIO |
| POST/GET/PATCH/DELETE | `/api/clients` | ✅ | STUDIO |
| POST | `/api/clients/:id/invite` | ✅ | STUDIO |
| POST/GET/PATCH/DELETE | `/api/projects` | ✅ | STUDIO |
| POST/PATCH | `/api/projects/:id/milestones` | ✅ | STUDIO |
| POST/GET | `/api/deliverables` | ✅ | STUDIO/CLIENT |
| GET/PATCH | `/api/users/me` | ✅ | any |
| GET/POST/DELETE | `/api/projects/:id/members` | ✅ | STUDIO |
| GET | `/api/portal/:token` | ❌ | public |
| POST | `/api/portal/:token/deliverables/:id/validate` | ❌ | public |

---

## ⚡ Commandes

```bash
# Install
pnpm install

# Dev
pnpm dev              # web + api en parallèle
pnpm dev:web          # Next.js seul (port 3000)
pnpm dev:api          # NestJS seul (port 3001)

# DB
pnpm db:setup         # Provisioning DynamoDB (à faire une fois)

# Build
pnpm build

# Lint
pnpm lint
```

---

## 🔐 Variables d'environnement

### apps/web/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
ANTHROPIC_API_KEY=sk-ant-...          # ← à remplir
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### apps/api/.env
```env
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=...                 # ← à remplir
AWS_SECRET_ACCESS_KEY=...             # ← à remplir
DYNAMODB_TABLE_NAME=streamline-dev
DYNAMODB_ENDPOINT=http://localhost:8000   # local uniquement
RESEND_API_KEY=re_...                 # optionnel en dev
FRONTEND_URL=http://localhost:3000
JWT_SECRET=...                        # ← à remplir
```

---

## 🎨 Design System

Dark theme inspiré de Linear.app / Vercel dashboard.

```
bg-primary    : #0F0F13
bg-surface    : #1A1A24
accent-purple : #7C3AED
accent-blue   : #3B82F6
warning       : #F59E0B
danger        : #EF4444
success       : #22C55E
text-primary  : #F1F5F9
text-muted    : #64748B
border        : #2D2D3D
```

**Police :** Inter — **Radius :** 8px cards, 6px inputs, full badges  
**Composants :** shadcn/ui — **Animations :** Framer Motion

---

## 🧠 Conventions de code

### NestJS
- Un module = `module.ts` + `service.ts` + `controller.ts` + `dto/`
- DTOs avec `class-validator` + `class-transformer`
- Toujours `DynamoDBDocumentClient` (pas le client bas niveau)
- Erreurs DynamoDB gérées dans le service, pas le controller
- Routes protégées : `@UseGuards(JwtAuthGuard)` + `@Roles(Role.STUDIO)` si besoin

### Next.js
- App Router — Server Component par défaut
- `"use client"` uniquement si state / hooks / events browser
- Appels API via `lib/api.ts` (wrapper typé existant)
- Formulaires : `react-hook-form` + `zod`
- Pas de `useEffect` pour fetcher — async dans Server Components

### TypeScript
- Pas de `any` — `unknown` + type guards si nécessaire
- Types partagés dans `packages/shared/` si besoin d'en ajouter

---

## 🤖 Rappels pour Claude Code

1. **DynamoDB single-table** — penser PK/SK, pas de JOINs
2. **Two-audience** — studio vs portail client public (no auth)
3. **Hackathon** — fonctionnel > parfait. Les pages stubs avec empty state valent mieux que des liens morts
4. **Magic links** — les clients accèdent via token, pas de JWT classique
5. **Le flux démo ne doit jamais être cassé** :
   ```
   register → dashboard → créer client → inviter → créer projet
   → créer livrable → portail client → approuver → retour dashboard
   ```
6. **L'AI generator est le différenciateur** — il doit toujours streamer correctement

---

## 📓 Journal d'avancement

### Format PROGRESS.md

Le fichier `PROGRESS.md` à la racine du projet suit ce format :

```markdown
# PROGRESS.md — StreamLine

## Session N — JJ mois AAAA

**Fait :**
- Point 1
- Point 2

**Bloquants :**
- Problème rencontré ou aucun

**Prochaine étape :**
- Ce qu'il faut faire en premier à la session suivante
```

### Règle pour Claude Code

- **Début de session** : lire `PROGRESS.md`, reprendre où on s'est arrêté
- **Fin de session** : ajouter une entrée datée avec 3-4 lignes max
- Ne jamais supprimer les entrées précédentes, toujours ajouter en haut

---

## 📋 Sessions restantes (voir SESSIONS.md)

Ordre de priorité pour tenir le 29 juin :

| # | Session | Priorité |
|---|---------|----------|
| 1 | Env vars + DB setup + smoke test | 🔴 Critique |
| 2 | Dashboard wiring (stats réelles + activité) | 🔴 Critique |
| 3 | Sidebar user info via api.auth.me() | 🟠 Rapide |
| 4 | Page /settings (org settings) | 🟠 Important |
| 5 | Page /documents (stub + empty state) | 🟡 Hackathon |
| 6 | Page /messages (stub + empty state) | 🟡 Hackathon |
| 7 | Notifications center | 🟡 Hackathon |
| 8 | Polish — empty states + animations manquantes | 🟢 UX |
| 9 | Mobile responsive check + README + archi diagram | 🟢 Soumission |
| 10 | Vidéo démo prep + soumission Devpost | 🔴 Deadline |

---

## 🔗 Ressources

- Hackathon : https://h01.devpost.com — deadline **29 juin 17h00 PDT**
- DynamoDB docs : https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/
- Studio : https://www.origin-studio.ch/
