# PROGRESS.md — StreamLine

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
