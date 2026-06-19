# PROGRESS.md — StreamLine

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
