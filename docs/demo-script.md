# StreamLine — Demo Script (3 min)

> Enregistrement : Loom ou OBS · Résolution 1440×900 min · Zoom navigateur 100%  
> Deadline soumission : **29 juin 17h00 PDT (= 02h00 le 30 à Genève)**

---

## Préparation (avant d'enregistrer)

- [ ] Compte démo vierge créé (ou reset) : email `demo@origin-studio.ch`
- [ ] **1 client existant** dans le compte : "Acme Corp" · `acme@client.com` · inviteToken déjà généré
- [ ] Navigation privée ouverte dans un autre onglet (pas encore l'URL portail)
- [ ] Onglets pré-ouverts : StreamLine studio (logged in) + navigation privée vide
- [ ] Micro testé, notifications OS désactivées, barre d'adresse propre
- [ ] URL prod Vercel ou `localhost:3000` (choisir l'un, s'y tenir)

---

## 0:00 – 0:20 · Landing page → Register → Dashboard

**Actions :**
1. Aller sur `/` — 4 secondes sur le hero (headline + badge "Powered by Claude API")
2. Scroller légèrement pour montrer les 3 feature cards
3. Cliquer **"Get started"** → `/register`
4. Remplir rapidement (valeurs préparées à l'avance) :
   - Full name : `Alex Martin`
   - Email : `demo@origin-studio.ch`
   - Password : `••••••••`
   - Studio : `Origin Studio`
5. Submit → dashboard charge avec état vide + message onboarding
6. **Dire :** *"Studio created instantly. The dashboard pulls live stats from DynamoDB."*

> L'empty state montre le polish UX. Les données réelles apparaîtront au fil de la démo.

---

## 0:20 – 0:45 · Nouveau projet + 3 jalons + démarrer le premier

**Actions :**
1. Sidebar → **Projects** → **"New Project"**
2. Remplir :
   - Name : `Refonte L'ARC`
   - Client : `Acme Corp` (dropdown)
   - Deadline : date ~3 mois
3. Ajouter 3 milestones :
   - `Design & Wireframes`
   - `Development`
   - `QA & Launch`
4. Submit → redirection vers `/projects/[id]`
5. Sur la timeline, cliquer **"Start"** sur *Design & Wireframes*
6. → Badge **"● In Progress"** s'affiche en violet, barre de progression à 0%
7. **Dire :** *"Milestones stored as DynamoDB items under `PROJECT#id | MILESTONE#id` — single-table design, zero joins."*

---

## 0:45 – 1:15 · AI Proposal Generator — brief → streaming → download

**Actions :**
1. Sidebar → **AI Generator**
2. Remplir le brief (cliquer vite — valeurs préparées) :
   - Client Name : `Acme Corp`
   - Project Type : **"E-commerce"**
   - Budget : `$10,000 – $25,000`
   - Timeline : `2 months`
   - Description : `Full e-commerce replatforming — Shopify headless, ERP integration, mobile-first`
   - Deliverables : `Design system` · `Frontend` · `API integration` (Enter après chaque)
3. Cliquer **"Generate Proposal"**
4. → **Montrer le streaming token par token pendant ~15s sans couper** — c'est le différenciateur
5. Scroller doucement : montrer sections, table de pricing, planning
6. Cliquer **"Download .md"** → fichier téléchargé
7. **Dire :** *"Claude Opus 4.8 with adaptive thinking — streamed live, fully editable before sending."*

> **Backup :** si le streaming prend >25s, parler de l'architecture single-table pendant ce temps.

---

## 1:15 – 1:45 · Livrable → Lien portail → Portail client

**Actions :**
1. Sidebar → **Projects** → `Refonte L'ARC`
2. Section Deliverables → **"Add Deliverable"**
3. Remplir :
   - Title : `Homepage Section Design`
   - Type : `Design`
   - Description : `First mockup for client review`
4. Submit → livrable apparaît avec badge **PENDING**
5. Sidebar → **Clients** → `Acme Corp` → copier le lien portail
6. Coller dans la **navigation privée** → portail charge
7. Header : `Acme Corp` · livrable visible dans la liste
8. **Dire :** *"No login required — secure token stored in DynamoDB with 90-day TTL. Zero friction for the client."*

---

## 1:45 – 2:15 · Client approuve → Notification temps réel côté studio

**Actions :**
1. (Navigation privée — portail) : cliquer **"Homepage Section Design"**
2. Taper : `Looks great, approved!`
3. Cliquer **"Approve"** → animation de succès ✅
4. **Alt+Tab** vers l'onglet studio
5. → Sidebar : **badge violet (1)** sur la cloche
6. Cliquer la cloche → `/notifications`
7. Notification : *"Homepage Section Design approved"* → cliquer → redirige vers le projet
8. Livrable affiche le badge **APPROVED** vert
9. **Dire :** *"DynamoDB write triggers an in-app notification and a Resend email simultaneously — non-blocking, fully async."*

> **Si le badge n'apparaît pas immédiatement** : naviguer vers /dashboard puis revenir — le polling 30s se déclenche.

---

## 2:15 – 2:45 · Messages → Settings → Sidebar live update

**Actions :**
1. Sidebar → **Messages**
2. Thread `Refonte L'ARC` → taper : `Design phase confirmed, moving to dev`
3. **Send** → bulle violette apparaît à droite
4. Sidebar → **Settings**
5. Section Studio : `Origin Studio` → `Origin Studio Geneva` → **Save**
6. Bas de sidebar → nom mis à jour en temps réel
7. **Dire :** *"Every piece of data — messages, settings, user profile — wired to live API endpoints. Zero hardcoded state."*

---

## 2:45 – 3:00 · Conclusion — tech stack

**Actions :**
1. Sidebar → **Dashboard** → stats mises à jour (1 projet actif, 1 validation)
2. Fade / couper vers la **landing page**

**Voice-over final :**
> *"StreamLine — built with **Next.js 15 App Router**, **NestJS 10**, **DynamoDB single-table design** with GSI indexes, and **Claude Opus 4.8** for real-time AI streaming. Deployed on **Vercel and AWS**. Studio management, client portal, AI proposals, email notifications — fully integrated, end to end."*

---

## Checklist soumission H0

### Vidéo
- [ ] Enregistrée (Loom / OBS) — durée cible 2:50–3:10
- [ ] Uploadée sur **YouTube** (visibilité : Non listé)
- [ ] Lien YouTube copié : `https://youtu.be/___________`

### Assets techniques (obligatoires H0)
- [x] `docs/dynamo-screenshot.png` — screenshot table `streamline` → onglet **Paramètres** ✅
- [x] `docs/dynamo-indexes.png` — onglet **Index** (GSI1 + GSI2) ✅
- [x] `docs/architecture.md` ✅
- [x] `README.md` ✅
- [x] `docs/devpost-description.md` ✅

### Devpost
- [ ] Compte Devpost connecté sur [h01.devpost.com](https://h01.devpost.com)
- [ ] Titre : `StreamLine — AI-powered project hub for digital studios`
- [ ] Description : copier-coller `docs/devpost-description.md`
- [ ] Lien vidéo YouTube ajouté
- [ ] Lien GitHub (repo public) ajouté
- [ ] Screenshots ajoutés : landing, dashboard, portail client, AI generator
- [ ] Tech stack coché : Next.js · NestJS · DynamoDB · Vercel · AWS · Claude API

### Vercel / AWS
- [ ] App déployée sur Vercel — URL prod : `https://_____________.vercel.app`
- [ ] **Vercel Team ID** : Settings → General → Team ID (format `team_xxx`)
- [ ] Env vars Vercel : `ANTHROPIC_API_KEY` · `RESEND_API_KEY` · `EMAIL_DOMAIN` · `NEXT_PUBLIC_API_URL`
- [ ] API NestJS déployée — URL notée
- [ ] DynamoDB table `streamline-prod` provisionnée en prod

### Repo
- [ ] Code pushé sur `main`
- [ ] Repo **public** (ou lien partagé avec les juges)
- [ ] `.env` et `.env.local` dans `.gitignore` ✅

---

**Deadline : 29 juin 17h00 PDT = 02h00 le 30 juin à Genève**
