# CLAUDE.md — StreamLine

> Fichier de contexte pour Claude Code. À placer à la racine du monorepo.

---

## 📖 Lis ça en premier à chaque session

**Avant de toucher au code, lis `PROGRESS.md`** (à la racine).  
Il contient l'entrée de la dernière session : ce qui a été fait, ce qui bloque, et la prochaine étape.  
À la fin de chaque session, mets-le à jour (voir section [Journal d'avancement](#journal-davancement)).

---

## 🎯 Projet

**StreamLine** est l'outil interne d'Origin Studio pour suivre ses projets clients — studios web et agences digitales en général, mais un seul studio (mono-tenant) pour l'instant : Origin Studio lui-même et ses vrais clients.

Né comme soumission au hackathon H0 (AWS + Vercel, juin 2026), c'est maintenant un produit utilisé en interne — pas une démo. Priorité à la fiabilité et à la sécurité des données clients réelles, plus qu'au rythme de livraison de features.

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
│   │       ├── storage/        S3 — URLs pré-signées upload/download
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
| Frontend | Next.js 15 (App Router) | Tailwind v4, thème clair, 100% français |
| Backend | NestJS 10 | API REST, guards JWT |
| Base de données | DynamoDB (AWS, eu-central-2 Zurich) | Single-table design, GSI1/GSI2, TTL 90j |
| Stockage fichiers | S3 (AWS, eu-central-2 Zurich) | Bucket privé, URLs pré-signées |
| Auth | JWT maison | register + login + me |
| AI | Claude Opus 4.8 via Anthropic API | Streaming temps réel |
| Email | Resend | Magic links, notifications (lazy-loaded) |
| Monitoring | Sentry | Erreurs + traces, web + api — no-op si `SENTRY_DSN` absent |
| Déploiement | Vercel (web) + AWS Elastic Beanstalk (api) | — |

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
- Clients : CRUD complet + invitation portal (génère token DynamoDB, TTL 90j appliqué aussi côté lecture, pas juste au sweep DynamoDB) + fiche client `/clients/:id` (projets, notes internes horodatées, coordonnées) — la liste clique désormais vers la fiche
- Équipe : inviter des collègues dans le même studio (`/settings` → Équipe), rôle OWNER/MEMBER, retrait de membre par le propriétaire
- Projets : CRUD + milestones + membres
- Livrables : create + list + workflow (approve / request changes) + upload de fichiers réels (S3, URLs pré-signées, bucket privé, jamais public)
- Dashboard `/dashboard` : stats et activité réelles via `api.organizations.stats()`/`.activity()` — plus de données hardcodées
- Sidebar : nom/organisation chargés dynamiquement via `api.auth.me()`
- Pages `/documents`, `/messages`, `/settings` : construites (messages = threads par projet avec polling, settings = profil studio + compte)
- Portail client public `/portal/[token]` : accès par token, validations, animations Framer Motion, error states, téléchargement de fichiers
- AI Proposal Generator `/ai-generator` : Claude Opus 4.8, streaming temps réel, rendu markdown, download `.md`, envoi par e-mail au client
- Email via Resend (lazy-loaded — fonctionne sans la clé en dev)
- Design system : Tailwind v4, **thème clair** (voir `apps/web/DESIGN.md`), 100% français, responsive mobile
- Sécurité : `JWT_SECRET` sans fallback (l'API refuse de démarrer si absent), rate limiting sur les routes publiques du portail
- Monitoring d'erreurs : Sentry câblé sur web (client + server + edge + `global-error.tsx`) et api (`SentryModule` + `SentryGlobalFilter`, initialisé dans `instrument.ts` avant tout le reste) — lazy comme Resend, désactivé tant que `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` n'est pas renseigné

### ❌ Non configuré (bloquant en prod)

- `SENTRY_DSN` (api) et `NEXT_PUBLIC_SENTRY_DSN` (web) — tant que ce n'est pas rempli, aucune erreur prod n'est remontée
- DynamoDB table à provisionner : `pnpm db:setup`
- Bucket S3 à provisionner : `pnpm s3:setup` (sinon l'upload de fichiers échoue proprement avec une erreur 503, l'app démarre quand même)
- Credentials AWS dans `apps/api/.env`
- Le déploiement Elastic Beanstalk réel tourne encore à Paris (`eu-west-3`) — le code par défaut sur `eu-central-2` (Zurich), mais migrer l'infra déployée est une action manuelle distincte (voir `docs/architecture.md`)

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
| POST/GET | `/api/clients/:id/notes` | ✅ | STUDIO |
| POST | `/api/organizations/:orgId/invite` | ✅ | STUDIO |
| DELETE | `/api/organizations/:orgId/members/:userId` | ✅ | STUDIO |
| GET | `/api/auth/invite/:token` | ❌ | public |
| POST/GET/PATCH/DELETE | `/api/projects` | ✅ | STUDIO |
| POST/PATCH | `/api/projects/:id/milestones` | ✅ | STUDIO |
| POST/GET | `/api/deliverables` | ✅ | STUDIO/CLIENT |
| POST | `/api/deliverables/upload-url` | ✅ | STUDIO |
| GET | `/api/deliverables/:id/file-url` | ✅ | STUDIO/CLIENT |
| GET/PATCH | `/api/users/me` | ✅ | any |
| GET/POST/DELETE | `/api/projects/:id/members` | ✅ | STUDIO |
| GET | `/api/portal/:token` | ❌ | public |
| POST | `/api/portal/:token/deliverables/:id/validate` | ❌ | public |
| GET | `/api/portal/:token/deliverables/:id/file-url` | ❌ | public |

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
pnpm s3:setup          # Provisioning du bucket S3 pour les livrables (à faire une fois)

# Build
pnpm build

# Lint
pnpm lint
```

---

## 🔐 Variables d'environnement

### apps/web/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
ANTHROPIC_API_KEY=sk-ant-...          # rempli
RESEND_API_KEY=re_...                 # optionnel en dev — e-mail "Envoyer au client" de l'AI Generator
EMAIL_DOMAIN=origin-studio.ch
NEXT_PUBLIC_SENTRY_DSN=               # optionnel en dev — monitoring désactivé si vide
SENTRY_ORG=                           # optionnel — upload des source maps au build (CI/prod)
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

### apps/api/.env
```env
AWS_REGION=eu-central-2               # Zurich — résidence des données en Suisse
AWS_ACCESS_KEY_ID=...                 # ← à remplir
AWS_SECRET_ACCESS_KEY=...             # ← à remplir
DYNAMO_TABLE=streamline
DYNAMODB_ENDPOINT=http://localhost:8000   # local uniquement
S3_BUCKET=...                         # ← à remplir (upload de livrables, pnpm s3:setup)
RESEND_API_KEY=re_...                 # optionnel en dev
WEB_URL=http://localhost:3000
JWT_SECRET=...                        # ← à remplir
SENTRY_DSN=                           # optionnel en dev — monitoring désactivé si vide
```

---

## 🎨 Design System

Thème clair inspiré de Linear.app / Vercel dashboard — "The Studio Desk" (a remplacé le thème sombre "Studio Monitor" du hackathon).

**La palette et les règles complètes vivent dans `apps/web/DESIGN.md`** (tokens vérifiés WCAG AA, composants, do's/don'ts) — ne pas dupliquer les couleurs ici, ce fichier part vite en drift. En résumé : violet `#7c3aed` comme seul accent, surfaces claires à 4 niveaux (page/sidebar/carte/hover), pas d'ombres.

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
3. **Mono-tenant pour l'instant** — pas de facturation multi-org, priorité à la robustesse plutôt qu'à l'isolation stricte entre studios (voir décision produit dans `PROGRESS.md`)
4. **Magic links** — les clients accèdent via token, pas de JWT classique
5. **Le flux principal ne doit jamais être cassé** — de vrais clients l'utilisent :
   ```
   register → dashboard → créer client → inviter → créer projet
   → créer livrable → portail client → approuver → retour dashboard
   ```
6. **L'AI generator est le différenciateur** — il doit toujours streamer correctement, et générer en français
7. **Sécurité avant vitesse** — ce projet gère de vraies données clients ; ne jamais réintroduire un fallback de secret par défaut, toujours vérifier le scoping par organisation sur les nouvelles routes

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

## 📋 Prochaines priorités

La liste vivante des chantiers en cours vit dans `PROGRESS.md` (entrée la plus récente en haut). À date, les grands axes identifiés pour la transition hackathon → produit réel :

- Plafond de coût sur l'usage de l'AI Generator
- Domaine custom + migration de l'infra déployée vers `eu-central-2` (Zurich)
- Scoping CLIENT sur `deliverables.findById` (un client authentifié peut aujourd'hui consulter un livrable d'un autre client en devinant l'ID)
- Suite de tests automatisés (aucune aujourd'hui — seulement des vérifications e2e manuelles par session)

---

## 🔗 Ressources

- DynamoDB docs : https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/
- Studio : https://www.origin-studio.ch/
