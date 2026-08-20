'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Compass, FolderOpen, Users, Sparkles,
  ArrowRight, Zap, CheckCircle2,
} from 'lucide-react'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
})

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as const },
})

const FEATURES = [
  {
    icon: FolderOpen,
    title: 'Espace projet',
    desc: "Jalons, livrables, membres de l'équipe et suivi de l'avancement — tout au même endroit.",
    items: ['Frise des jalons', 'Indicateur de santé', "Fil d'activité"],
    highlight: false,
  },
  {
    icon: Users,
    title: 'Portail client',
    desc: 'Partagez un lien magique. Pas de compte, aucune friction. Votre client consulte et approuve le travail en quelques secondes.',
    items: ['Accès par lien magique', 'Approuver ou demander des modifications', 'Commenter les livrables'],
    highlight: false,
  },
  {
    icon: Sparkles,
    title: 'Générateur de propositions IA',
    desc: 'Transformez un brief en proposition de projet soignée en quelques secondes, avec un rendu en temps réel.',
    items: ['Claude Opus 4.8', 'Rendu en temps réel', 'Téléchargement en Markdown'],
    highlight: true,
  },
]

const STEPS = [
  { n: '1', title: 'Ajouter un client', desc: 'Créez une fiche client avec les coordonnées et les informations de l’entreprise.' },
  { n: '2', title: 'Créer un projet', desc: 'Configurez les jalons, associez le client et ajoutez des livrables.' },
  { n: '3', title: 'Partager le portail', desc: 'Envoyez un lien magique — le client approuve directement le travail.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-line/40 bg-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet flex items-center justify-center shrink-0">
              <Compass className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-ink">StreamLine</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login"
              className="text-sm text-ink-muted hover:text-ink transition-colors px-3 py-1.5 hidden sm:block">
              Se connecter
            </Link>
            <Link href="/register"
              className="text-sm font-semibold bg-violet hover:bg-violet-hover text-white px-4 py-1.5 rounded-lg transition-colors active:scale-[0.98]">
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-5 sm:px-8 text-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, color-mix(in srgb, var(--color-violet) 20%, #f7f7fb) 0%, #f7f7fb 58%)' }}>

        {/* Grid decoration */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(20,20,28,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,20,28,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />

        <div className="relative max-w-4xl mx-auto">
          <motion.div {...fade(0)}
            className="inline-flex items-center gap-2 bg-violet/10 border border-violet/25 rounded-full px-3.5 py-1 text-xs font-medium text-violet-glow mb-7">
            <Zap className="w-3 h-3" />
            Par Origin Studio · Genève
          </motion.div>

          <motion.h1 {...fade(0.07)}
            className="text-[40px] sm:text-[62px] font-semibold tracking-tight leading-[1.1] mb-6">
            La plateforme de suivi de projet pour<br />
            <span className="text-violet">les studios web</span>
          </motion.h1>

          <motion.p {...fade(0.13)}
            className="text-base sm:text-xl text-ink-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Gérez vos clients, suivez vos livrables, et offrez à vos clients un
            portail d’approbation soigné — fini les fils d’e-mails et les tableurs.
          </motion.p>

          <motion.div {...fade(0.19)}
            className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register"
              className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors active:scale-[0.98] w-full sm:w-auto justify-center">
              Commencer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 bg-surface hover:bg-surface-high border border-line text-ink-dim font-medium px-6 py-3 rounded-lg text-sm transition-colors w-full sm:w-auto justify-center">
              Se connecter à mon studio
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Dashboard preview ──────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-24">
        <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto">
          <div className="rounded-xl border border-line overflow-hidden shadow-[0_0_80px_rgba(124,58,237,0.10)]"
            style={{ background: '#EFF0F4' }}>

            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-bg">
              <div className="flex gap-1.5">
                {['bg-danger/60', 'bg-warning/60', 'bg-success/60'].map(c => (
                  <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
                ))}
              </div>
              <div className="flex-1 bg-surface border border-line rounded-md px-3 py-1 text-[11px] text-ink-faint max-w-xs mx-auto">
                app.streamline.studio/dashboard
              </div>
            </div>

            {/* App shell */}
            <div className="flex h-[280px] sm:h-[320px]">
              {/* Sidebar */}
              <div className="w-[160px] border-r border-line bg-surface-dim p-3 shrink-0 hidden sm:flex flex-col">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="w-5 h-5 rounded-md bg-violet flex items-center justify-center shrink-0">
                    <Compass className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-ink">StreamLine</span>
                </div>
                {['Tableau de bord', 'Projets', 'Clients', 'Propositions IA', 'Messages', 'Notifications'].map((item, i) => (
                  <div key={item}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5 ${i === 0 ? 'bg-surface-high' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-violet' : 'bg-line'}`} />
                    <span className={`text-[10px] ${i === 0 ? 'text-ink font-medium' : 'text-ink-faint'}`}>{item}</span>
                    {item === 'Notifications' && (
                      <span className="ml-auto bg-violet rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold text-white">2</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">Bonjour, Elio</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">3 projets actifs · 2 validations en attente</p>
                  </div>
                  <div className="bg-violet text-white text-[10px] font-semibold px-3 py-1 rounded-lg">+ Nouveau projet</div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Projets actifs',       value: '3', color: 'text-violet-glow' },
                    { label: 'Validations en attente', value: '2', color: 'text-warning' },
                    { label: 'Jalons terminés',      value: '8', color: 'text-success' },
                    { label: 'Total clients',        value: '5', color: 'text-ink' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-bg border border-line rounded-lg p-2.5">
                      <p className="text-[9px] text-ink-faint uppercase tracking-wide mb-1 leading-tight">{label}</p>
                      <p className={`text-xl font-semibold leading-none ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Project rows */}
                <div className="bg-bg border border-line rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-line">
                    <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest">Projets actifs</p>
                  </div>
                  {[
                    { name: "Refonte L'ARC",   client: 'L\'ARC',  progress: 75, label: 'Dans les temps', c: 'text-success bg-success/8' },
                    { name: 'Site Pictet Group', client: 'Pictet', progress: 40, label: 'En révision',   c: 'text-warning bg-warning/8' },
                    { name: 'App Mobile Verso',  client: 'Verso',  progress: 20, label: 'Brouillon',     c: 'text-ink-muted bg-ink/5' },
                  ].map(p => (
                    <div key={p.name} className="flex items-center gap-3 px-3 py-2.5 border-b border-line last:border-0 hover:bg-surface-high transition-colors">
                      <p className="text-[11px] font-medium text-ink flex-1 truncate">{p.name}</p>
                      <p className="text-[10px] text-ink-faint w-10 hidden sm:block truncate">{p.client}</p>
                      <div className="h-1 w-14 bg-line rounded-full">
                        <div className="h-full bg-success rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${p.c}`}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div {...inView(0)} className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink mb-3">Tout ce dont votre studio a besoin</h2>
            <p className="text-ink-muted text-sm max-w-sm">Deux publics, une seule plateforme. Côté studio et côté client.</p>
          </motion.div>

          <div className="divide-y divide-line">
            {FEATURES.map(({ icon: Icon, title, desc, items, highlight }, i) => (
              <motion.div key={title} {...inView(i * 0.09)}
                className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 sm:gap-8 py-5 items-center">
                {/* Left: icon + title */}
                <div className="flex items-center gap-3">
                  <div className={[
                    'shrink-0 rounded-lg flex items-center justify-center',
                    highlight
                      ? 'w-8 h-8 bg-violet/15 border border-violet/30'
                      : 'w-8 h-8 bg-surface-high border border-line',
                  ].join(' ')}>
                    <Icon className={highlight ? 'w-3.5 h-3.5 text-violet-glow' : 'w-3.5 h-3.5 text-ink-muted'} />
                  </div>
                  <h3 className="text-sm font-semibold text-ink">{title}</h3>
                </div>
                {/* Right: desc + chips */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <p className="text-xs text-ink-muted leading-relaxed flex-1 min-w-50">{desc}</p>
                  <div className="flex flex-wrap gap-2 shrink-0 max-w-70 sm:justify-end">
                    {items.map(item => (
                      <span key={item} className={[
                        'flex items-center gap-1 text-[11px] rounded-md px-2 py-1',
                        highlight
                          ? 'text-violet-glow bg-violet/8 border border-violet/15'
                          : 'text-ink-faint bg-surface-high border border-line',
                      ].join(' ')}>
                        <CheckCircle2 className="w-2.5 h-2.5 text-success/60 shrink-0" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div {...inView(0)} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink mb-3">Opérationnel en quelques minutes</h2>
            <p className="text-ink-muted text-sm">Tout le cycle — du client à l’approbation — en moins de 5 minutes.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            <div className="absolute top-7 left-[20%] right-[20%] h-px bg-line hidden sm:block" />
            {STEPS.map(({ n, title, desc }, i) => (
              <motion.div key={n} {...inView(i * 0.1)} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center mb-4 relative z-10">
                  <span className="text-2xl font-bold text-violet-glow">{n}</span>
                </div>
                <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed max-w-[200px]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-28">
        <motion.div {...inView(0)}
          className="max-w-2xl mx-auto border border-violet/20 rounded-2xl p-10 sm:p-14 text-center"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #ece3fb 0%, #ffffff 65%)' }}>
          <div className="w-12 h-12 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center mx-auto mb-6">
            <Compass className="w-6 h-6 text-violet/70" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink mb-3">Prêt à simplifier la gestion de votre studio ?</h2>
          <p className="text-ink-muted text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Créez votre compte et configurez votre premier projet en quelques minutes.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-violet hover:bg-violet-hover text-white font-semibold px-8 py-3.5 rounded-lg text-sm transition-colors active:scale-[0.98]">
            Créer votre studio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-line px-5 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-violet/15 border border-violet/20 flex items-center justify-center">
              <Compass className="w-2.5 h-2.5 text-violet-glow" />
            </div>
            <span className="text-xs text-ink-muted">
              StreamLine par{' '}
              <a href="https://www.origin-studio.ch/" target="_blank" rel="noopener noreferrer"
                className="text-ink-dim hover:text-ink transition-colors">
                Origin Studio
              </a>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-ink-faint">
            {['Next.js 15', 'NestJS 10', 'DynamoDB', 'Claude Opus 4.8', 'Vercel'].map((t, i, arr) => (
              <span key={t} className="flex items-center gap-3">
                {t}{i < arr.length - 1 && <span className="text-line">·</span>}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
