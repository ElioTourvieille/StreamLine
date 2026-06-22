# PROGRESS.md — StreamLine

## Session 12 — 22 juin 2026 (FINALE)

**Fait :**
- `docs/demo-script.md` généré : script minute-par-minute (0:00→3:00), checklist soumission H0 complète avec cases cochées pour les assets déjà faits
- Screenshots DynamoDB confirmés par l'utilisateur : `docs/dynamo-screenshot.png` + `docs/dynamo-indexes.png` ✅
- Favicon `apps/web/src/app/icon.svg` créé : fond violet #7C3AED + Compass Lucide blanc, auto-détecté par Next.js App Router
- "Send to Client" button AI Generator : route `api/proposals/send` (Resend + marked → HTML stylisé), modal animé Framer Motion (idle/sending/sent/error), TypeScript 0 erreur

**Bloquants :**
- Email "Project Proposal" en statut "Sent" dans Resend (pas encore "Delivered") — probablement spam Gmail ou délai de livraison. Non bloquant pour la démo.

**Prochaine étape — soumission avant 29 juin 17h00 PDT :**
1. Enregistrer la vidéo démo (~3 min) en suivant `docs/demo-script.md`
2. Uploader YouTube (Non listé) → copier le lien
3. Remplir Devpost : titre + description (`docs/devpost-description.md`) + vidéo + screenshots + GitHub
4. Récupérer Vercel Team ID (Settings → General) pour le formulaire H0
5. Soumettre → **deadline 02h00 le 30 juin à Genève**

---

## Session 11 — 22 juin 2026

**Fait :**
- **"Send to Client" button** — bouton de l'AI Generator maintenant fonctionnel de bout en bout :
  - `apps/web/src/app/api/proposals/send/route.ts` : POST handler `resend` + `marked` → email HTML stylisé (dark header, carte blanche, rendu markdown complet avec tables/blockquotes/code)
  - Modal animé Framer Motion sur le bouton "Send to Client" : champ email, état sending/sent/error, success screen avec CheckCircle
  - TypeScript 0 erreur web + api

**Bloquants :**
- ⚠️ Action manuelle : `RESEND_API_KEY` + `EMAIL_DOMAIN=origin-studio.ch` dans `apps/web/.env.local` pour que l'envoi fonctionne en prod (sans clé → 503)
- ⚠️ Action manuelle : screenshot DynamoDB → `docs/dynamo-screenshot.png` (obligatoire H0)

**Prochaine étape :**
1. Vidéo démo + soumission Devpost avant le 29 juin 17h00 PDT
2. Ajouter `RESEND_API_KEY` + `EMAIL_DOMAIN` dans Vercel env vars

---

## Session 10 — 22 juin 2026

**Fait :**
- **Fix email projectName** : `deliverables.service.ts` → `validate()` fetch le projet via GSI2 avant d'envoyer l'email → `projectName` contient maintenant le vrai nom (ex: "Refonte L'ARC") au lieu du UUID brut
- **sendDeliverableReady câblé** : à la création d'un livrable, `notifyClientDeliverableReady()` (non-bloquant) fetch le projet → fetch le client → si `inviteToken` + `contactEmail` présents, envoie l'email au client avec le lien portail. Flux démo complet : studio crée livrable → client reçoit email → ouvre portail
- **Landing page** `/` : remplace le `redirect('/dashboard')` par une vraie page marketing (nav, hero gradient violet, dashboard preview interactif, 3 feature cards, how-it-works, CTA final, footer)
- **Login lien mort** corrigé : `href="#"` → `href="/register"` + texte "Create an account"
- **Animations auth** : `motion.div` fade+slide-up (opacity 0→1, y 16→0, 400ms) sur les cards login et register
- TypeScript `tsc --noEmit` web + api : 0 erreur

**Bloquants :**
- ⚠️ Action manuelle : screenshot DynamoDB → `docs/dynamo-screenshot.png` (obligatoire H0)
- Resend nécessite `RESEND_API_KEY` + domaine vérifié pour emails réels en prod (sans clé → log console, non-bloquant)

**Prochaine étape :**
1. Smoke test complet du flux démo (register → client → projet → livrable → portail → approbation → notification)
2. Screenshot DynamoDB → `docs/dynamo-screenshot.png`
3. Vidéo démo + soumission Devpost avant le 29 juin 17h00 PDT

---

## Session 9 — 22 juin 2026

**Fait :**
- **README.md** créé à la racine : description, stack, quick start 5 étapes, variables d'env, features, demo flow, lien vers docs/architecture.md
- **docs/architecture.md** : diagramme Mermaid complet (Browser → Vercel → NestJS → DynamoDB + Claude API + Resend), table des PK/SK patterns, sequence diagrams portal validation et AI generator
- **docs/devpost-description.md** : texte ~280 mots (Inspiration → What it does → How we built it → DynamoDB highlight → What's next), prêt à copier-coller sur Devpost
- Fix UX jalons : état `IN_PROGRESS` affiche maintenant "● In Progress" (texte violet) + bouton "Mark done" → l'utilisateur ne confond plus le bouton "Complete" avec le statut final

**Bloquants :**
- ⚠️ **Action manuelle requise** : screenshot DynamoDB table config depuis la console AWS → à sauvegarder dans `docs/dynamo-screenshot.png` (obligatoire H0)
- `next lint` : package `@eslint/eslintrc` manquant (préexistant, sans impact sur build/deploy)

**Prochaine étape :**
1. Screenshot DynamoDB → `docs/dynamo-screenshot.png`
2. Préparer vidéo démo (flux : register → client → portal → approve → notification)
3. Soumettre sur Devpost avant le 29 juin 17h00 PDT

---

## Session 8 — 22 juin 2026

**Fait :**
- **Polish empty states / compte vide** (décision confirmée : UI 100% anglais, y compris dates) :
  - `/clients` et `/projects` : empty states + CTA déjà présents (vérifiés, anglais)
  - Portail client sans livrables : nouvel empty state checkmark vert « No pending validations ✓ » (remplace le texte générique + suppression de la redondance)
  - Dashboard : `OnboardingState` + empty states activité/projets déjà présents
- **Dates uniformisées en anglais** : helper `lib/format.ts` (`formatDate` → "Jun 19, 2026", `formatDateLong`), remplace les 9 `toLocaleDateString()` locale-dépendants dans portal, projects, projects/[id]
- **Status badges** : audités — tous conformes au design system (tokens `success/warning/danger/violet/info` définis dans globals.css `@theme`)
- **Métadonnées SEO** : `layout.tsx` serveur (passthrough + `metadata`) pour `/dashboard`, `/clients`, `/projects`, `/portal/[token]` (portail en `noindex`)
- **Jalons — boutons de statut contextuels** dans `projects/[id]` :
  - `PENDING` → bouton « Start » (→ IN_PROGRESS), `IN_PROGRESS` → bouton « Complete » (→ COMPLETED), `COMPLETED` → check vert « Done » sans bouton
  - PATCH `/api/projects/:id/milestones/:milestoneId`, ajout `api.projects.updateMilestone()`, state local optimiste + barre de progression réactive
  - ⚠️ L'enum réel est `PENDING` (pas `UPCOMING`) — mappé en conséquence
- Nettoyage : import `Project` inutilisé retiré de projects/page.tsx
- TypeScript `tsc --noEmit` web : 0 erreur

**Bloquants :**
- `next lint` casse sur package `@eslint/eslintrc` manquant (souci d'outillage préexistant, sans rapport avec le code) — typecheck OK

**Prochaine étape :**
1. Mobile responsive check complet (visé 1280px OK)
2. README + architecture diagram pour la soumission Devpost
3. Vidéo démo prep + soumission Devpost

---

## Session 7 — 21 juin 2026

**Fait :**
- Centre de notifications complet end-to-end
- **Backend** :
  - `NotificationsService` : `createNotification`, `getNotifications`, `markAsRead` (DynamoDB injecté)
  - DynamoDB pattern : `USER#{userId}` | `NOTIF#{iso}#{uuid}` — newest first via `ScanIndexForward: false`
  - Fix reserved word : `id` aliasé `#id` dans `FilterExpression` de `markAsRead`
  - `NotificationsController` : `GET /api/users/me/notifications`, `PATCH /api/users/me/notifications/:id/read`
  - Trigger dans `deliverables.service.ts` : `createNotification` au validate (APPROVED → `deliverable_approved`, CHANGES_REQUESTED → `deliverable_changes`) — non-bloquant (`.catch(() => {})`)
- **Frontend** :
  - `api.ts` : type `Notification` + `api.notifications.list/markRead`
  - Sidebar : icône Bell + badge violet (count non lues), polling 30s
  - Page `/notifications` : tabs All/Validations/Documents/System, bordure gauche colorée par type, dot violet si non lu, "Mark all as read", click → markRead + redirect vers projet
  - Empty state : "You're all caught up ✓"

**Bloquants :**
- Aucun

**Prochaine étape :**
1. Mobile responsive check complet
2. README + architecture diagram pour la soumission Devpost
3. Vidéo démo prep + soumission Devpost

---

## Session 6 — 20 juin 2026

**Fait :**
- `/messages` complètement implémentée : layout 2 colonnes, bulles de messages, polling 5s
- Backend : `GET /api/projects/:id/messages`, `POST /api/projects/:id/messages`, `GET /api/organizations/:id/messages`
- DynamoDB pattern : `PROJECT#{id}` | `MSG#{iso}#{uuid}` — ordre chronologique naturel
- `api.ts` : types `Message`, `ProjectThread` + `api.messages.listByProject/send` + `api.organizations.messages()`
- Messages propres (auteur = user connecté) affichés à droite en violet, autres à gauche
- Polling `setInterval(5000)` avec `clearInterval` au changement de projet
- Auto-scroll to bottom après send/load
- Empty state dans la liste et dans la conversation
- TypeScript 0 erreur web + api

**Bloquants :**
- Aucun

**Prochaine étape :**
1. Mobile responsive check complet
2. README + architecture diagram pour la soumission Devpost
3. Vidéo démo prep + soumission Devpost

---

## Session 5 — 20 juin 2026

**Fait :**
- `/settings` complètement réécrite : 3 sections opérationnelles
  - **My Account** : Full Name éditable (PATCH /api/users/me), email read-only
  - **Studio** : name, website, logoUrl éditables (PATCH /api/organizations/:id), slug read-only, preview logo inline
  - **Danger Zone** : bouton Sign Out rouge avec dialog de confirmation inline
- `UpdateOrganizationDto` + `CreateOrganizationDto` : ajout champ `website` (`@IsUrl() @IsOptional()`)
- `api.ts` : `Organization` type enrichi (`website?`), ajout `api.organizations.update()`
- **Bug critique corrigé** : `name` est un mot réservé DynamoDB → `PATCH /api/users/me` et `PATCH /api/organizations/:id` retournaient 500. Fix : `ExpressionAttributeNames: { '#n': 'name' }` dans `users.service.ts` et `organizations.service.ts`
- TypeScript 0 erreur web + api

**Bloquants :**
- Aucun

**Prochaine étape :**
1. Mobile responsive check complet
2. README + architecture diagram pour la soumission Devpost
3. Vidéo démo prep + soumission Devpost

---

## Session 4 — 20 juin 2026

**Fait :**
- `GET /api/organizations/:id/stats` → `{ activeProjects, totalClients, pendingValidations, completedMilestones }` — agrège projets + clients + deliverables DynamoDB côté backend
- `GET /api/organizations/:id/activity` → 10 derniers événements (project_created, client_added, deliverable_approved, deliverable_changes) avec timestamps réels
- Dashboard `/dashboard` réécrit pour utiliser ces deux endpoints dédiés + `api.projects.list()` pour les 3 projets actifs
- Loading skeleton `animate-pulse` sur toute la page pendant le fetch
- Activity feed avec icônes distinctes par type d'événement (GitCommit, UserPlus, ThumbsUp, MessageSquare)
- Projets : 3 actifs les plus récents avec barre de progression milestones + dot de statut
- Empty state "no active projects" dans la section projets
- TypeScript 0 erreur web + api
- AI Generator testé et fonctionnel (fix `thinking: 'adaptive'` via cast `as any` — sans impact sur build/deploy)

**Bloquants :**
- Aucun

**Vérifié (rien à faire) :**
- Sidebar user info déjà wirée (`api.users.me()` + `api.organizations.get(orgId)`) — aucun hardcode restant
- Logout déjà fonctionnel (`localStorage.removeItem('sl_token')` + redirect `/login`)
- Initiales auto-générées depuis le nom réel

**Prochaine étape :**
1. Polish : empty states sur /documents, /messages + animations
2. Mobile responsive check complet
3. README + architecture diagram pour la soumission Devpost
4. Vidéo démo prep + soumission Devpost

---

## Session 3 — 20 juin 2026

**Fait :**
- Milestone fix validé : `POST /api/projects` avec milestones sans `dueDate` → 200 ✅ (3 milestones créés)
- `projects.service.ts` : `addMilestone` typé `dueDate?: string` (cohérent avec DTO)
- Dashboard `/dashboard` wirée à l'API réelle : stats (activeProjects, pendingValidations, changesRequested, completed), projets récents avec noms clients réels, activity feed depuis deliverables APPROVED/CHANGES_REQUESTED
- Sidebar : user info chargée via `api.users.me()` + `api.organizations.get(orgId)` — plus hardcodé
- Pages stubs créées : `/documents`, `/messages`, `/settings` (settings fonctionnel : update nom profil)
- `api.ts` : ajout `UserProfile`, `Organization`, `api.users.me()`, `api.organizations.get()`, correction type `Milestone.status` (`DONE`→`COMPLETED`)
- TypeScript 0 erreur web + api après tous les changements

**Bloquants :**
- Aucun bloquant connu. `ANTHROPIC_API_KEY` remplie par l'utilisateur.

**Prochaine étape :**
1. Tester le streaming AI Generator bout-en-bout dans le browser
2. Polish : empty states, animations manquantes sur settings/documents/messages
3. Mobile responsive check complet
4. README + architecture diagram pour la soumission Devpost
5. Vidéo démo prep + soumission Devpost

---


> Journal d'avancement par session. Lu par Claude Code au début de chaque session.  
> Format : ajouter en haut, ne jamais supprimer les entrées précédentes.

---

## Session 2 — 19 juin 2026

**Fait :**
- Toutes les pages studio wirées à l'API réelle : clients, projects list, projects/new, projects/[id], portal/[token]
- Page `/projects` créée (nouvelle, manquait)
- Tous les textes français traduits en anglais (ai-generator + route generate)
- `dotenv` ajouté à `apps/api/package.json` (manquait, empêchait le boot)
- TypeScript zéro erreur sur web ET api (`pnpm typecheck` clean)
- NestJS API boot OK — 31 routes mappées, `/api/health` → 200 ✅
- Next.js frontend boot OK — redirect vers `/dashboard` → 200 ✅

**Bloquants :**
- **AWS credentials manquantes** → tout appel DynamoDB retourne 500 (register, login, etc.)
  - `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY` commentées dans `apps/api/.env`
  - Aucun `~/.aws/credentials`, AWS CLI non installé, Docker non démarré
  - **Action requise** : ajouter les credentials dans `apps/api/.env` puis relancer `pnpm db:setup`
- **ANTHROPIC_API_KEY** incomplète dans `apps/web/.env.local` (valeur : `sk-ant-` seulement)
  - **Action requise** : remplir la vraie clé → AI Generator sera testable

**Smoke test résultats :**
| Test | Résultat | Raison |
|------|----------|--------|
| `GET /api/health` | ✅ 200 | Pas de DB requise |
| `GET http://localhost:3000` | ✅ 200 → /dashboard | Frontend up |
| `POST /api/auth/register` | ❌ 500 | DynamoDB unreachable (no AWS creds) |
| `pnpm db:setup` | ❌ non testé | Bloqué (no AWS creds) |
| AI Generator streaming | ❌ non testé | ANTHROPIC_API_KEY invalide |

**Prochaine étape :**
1. Remplir `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` dans `apps/api/.env`
2. Lancer `pnpm db:setup` et vérifier la table DynamoDB provisionnée
3. Remplir `ANTHROPIC_API_KEY` dans `apps/web/.env.local`
4. Relancer smoke test complet : register → dashboard → client → projet → AI → portal
5. Ensuite : wirer dashboard aux vraies stats + sidebar user info (Session 2 de SESSIONS.md)

---

## Session 1 — 19 juin 2026

**Fait :**
- Initialisation du journal PROGRESS.md
- CLAUDE.md et SESSIONS.md ajoutés à la racine du projet

**Bloquants :**
- Env vars non configurées (ANTHROPIC_API_KEY, AWS credentials, JWT_SECRET)
- DynamoDB table non provisionnée (`pnpm db:setup` pas encore lancé)

**Prochaine étape :**
- Remplir les .env, lancer `pnpm db:setup`, smoke test du flux complet (Session 1 de SESSIONS.md)
