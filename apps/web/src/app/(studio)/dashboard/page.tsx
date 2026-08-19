'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, AlertTriangle, CheckCircle2, Clock, FolderOpen,
  Users, Sparkles, ArrowRight, RefreshCw,
  GitCommit, UserPlus, ThumbsUp, MessageSquare,
} from 'lucide-react'
import { api, type OrgStats, type ActivityEvent, type Project, type Client } from '@/lib/api'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function formatRelative(iso: string) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs} h`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Hier'
  return `il y a ${days} jours`
}

function milestoneProgress(project: Project) {
  const ms = project.milestones ?? []
  if (!ms.length) return 0
  return Math.round(ms.filter(m => m.status === 'COMPLETED').length / ms.length * 100)
}

const STATUS_DISPLAY: Record<string, { label: string; dot: string }> = {
  DRAFT:     { label: 'Brouillon',    dot: 'bg-ink-muted' },
  ACTIVE:    { label: 'Dans les temps', dot: 'bg-success' },
  REVIEW:    { label: 'En révision',  dot: 'bg-warning' },
  COMPLETED: { label: 'Terminé',      dot: 'bg-ink-muted' },
  ARCHIVED:  { label: 'Archivé',      dot: 'bg-ink-muted' },
}

const STATUS_STYLE: Record<string, string> = {
  DRAFT:     'bg-ink/5 text-ink-muted',
  ACTIVE:    'bg-success/8 text-success',
  REVIEW:    'bg-warning/8 text-warning',
  COMPLETED: 'bg-ink/8 text-ink-muted',
  ARCHIVED:  'bg-ink/5 text-ink-muted',
}

const PROGRESS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-success', REVIEW: 'bg-warning',
  COMPLETED: 'bg-ink-muted', DRAFT: 'bg-violet', ARCHIVED: 'bg-ink-muted',
}

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  project_created:    <GitCommit  className="w-3.5 h-3.5 text-white" />,
  client_added:       <UserPlus   className="w-3.5 h-3.5 text-white" />,
  deliverable_approved: <ThumbsUp  className="w-3.5 h-3.5 text-white" />,
  deliverable_changes:  <MessageSquare className="w-3.5 h-3.5 text-white" />,
}

const ACTIVITY_COLOR: Record<string, string> = {
  project_created:      'bg-violet',
  client_added:         'bg-blue-500',
  deliverable_approved: 'bg-success',
  deliverable_changes:  'bg-warning',
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as const },
})

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto animate-pulse">
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 bg-surface rounded-lg w-56" />
          <div className="h-4 bg-surface rounded-lg w-80" />
        </div>
        <div className="h-9 bg-surface rounded-lg w-32 shrink-0" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-surface border border-line rounded-xl p-5 h-28" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-surface border border-line rounded-xl h-72" />
        <div className="bg-surface border border-line rounded-xl h-72" />
      </div>
    </div>
  )
}

// ─── Onboarding empty state ───────────────────────────────────────────────────

function OnboardingState() {
  return (
    <motion.div {...fadeUp(0.1)} className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center mb-5">
        <FolderOpen className="w-8 h-8 text-violet/50" />
      </div>
      <h2 className="text-xl font-semibold text-ink mb-2">Votre studio est prêt</h2>
      <p className="text-ink-muted text-sm max-w-sm mb-8 leading-relaxed">
        Commencez par ajouter un client, créez un projet et envoyez-lui un lien vers le portail — tout le cycle en moins de 5 minutes.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/clients"
          className="flex items-center gap-2 bg-surface hover:bg-surface-high border border-line text-ink px-4 py-2.5 rounded-lg text-sm font-medium transition-colors group">
          <Users className="w-4 h-4 text-ink-muted" />
          Ajouter un client
          <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link href="/projects/new"
          className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Nouveau projet
        </Link>
        <Link href="/ai-generator"
          className="flex items-center gap-2 bg-surface hover:bg-surface-high border border-line text-ink-dim px-4 py-2.5 rounded-lg text-sm font-medium transition-colors group">
          <Sparkles className="w-4 h-4 text-violet/60 group-hover:text-violet transition-colors" />
          Générer une proposition
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-2xl w-full text-left">
        {[
          { step: '1', title: 'Ajouter un client', desc: 'Créez une fiche client avec ses coordonnées.' },
          { step: '2', title: 'Créer un projet', desc: 'Configurez les jalons, les livrables, et associez le client.' },
          { step: '3', title: 'Envoyer le portail', desc: 'Invitez le client — il peut consulter et approuver les livrables.' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="bg-surface border border-line rounded-xl p-4">
            <div className="w-6 h-6 rounded-full bg-violet/15 border border-violet/30 flex items-center justify-center text-xs font-bold text-violet-glow mb-3">{step}</div>
            <p className="text-sm font-semibold text-ink mb-1">{title}</p>
            <p className="text-xs text-ink-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

type DashData = {
  stats: OrgStats
  activity: ActivityEvent[]
  projects: Project[]
  clients: Client[]
  userName: string
}

export default function DashboardPage() {
  const [dash, setDash] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const user = await api.users.me()
      const orgId = user.organizationId ?? ''

      const [stats, activity, projects, clients] = await Promise.all([
        orgId ? api.organizations.stats(orgId) : Promise.resolve({ activeProjects: 0, totalClients: 0, pendingValidations: 0, completedMilestones: 0 } as OrgStats),
        orgId ? api.organizations.activity(orgId) : Promise.resolve([] as ActivityEvent[]),
        api.projects.list(),
        api.clients.list(),
      ])

      setDash({ stats, activity, projects, clients, userName: user.name })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec du chargement du tableau de bord')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="p-6 sm:p-8 max-w-[1400px] mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-danger text-sm">{error}</p>
        <button onClick={load} className="flex items-center gap-2 text-ink-muted hover:text-ink text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
      </div>
    )
  }

  const { stats, activity, projects, clients, userName } = dash!
  const firstName = userName?.split(' ')[0] ?? ''

  const clientMap = new Map(clients.map(c => [c.id, c]))

  const activeProjects = projects
    .filter(p => p.status !== 'COMPLETED' && p.status !== 'ARCHIVED')
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 3)

  const isEmpty = projects.length === 0 && clients.length === 0

  const STAT_CARDS = [
    { label: 'Projets actifs',        value: stats.activeProjects,      color: 'text-violet-glow',  alert: null },
    { label: 'Validations en attente', value: stats.pendingValidations,  color: 'text-warning',      alert: stats.pendingValidations > 0 ? 'Attention requise' : null, alertStyle: 'bg-warning/15 text-warning' },
    { label: 'Jalons terminés',       value: stats.completedMilestones, color: 'text-success',       alert: null },
    { label: 'Total clients',         value: stats.totalClients,        color: 'text-ink',           alert: null },
  ]

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight leading-tight">
            {greeting()}{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            {stats.activeProjects > 0
              ? `${stats.activeProjects} projet${stats.activeProjects !== 1 ? 's' : ''} actif${stats.activeProjects !== 1 ? 's' : ''} · ${stats.pendingValidations} validation${stats.pendingValidations !== 1 ? 's' : ''} en attente`
              : "Voici ce qui se passe dans votre studio aujourd'hui."}
          </p>
        </div>
        <Link href="/projects/new"
          className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98] shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau projet</span>
          <span className="sm:hidden">Nouveau</span>
        </Link>
      </motion.div>

      {isEmpty ? <OnboardingState /> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {STAT_CARDS.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i * 0.06)}
                className="bg-surface border border-line rounded-xl p-4 sm:p-5 hover:bg-surface-high transition-colors">
                <p className="text-xs font-medium text-ink-muted mb-2 sm:mb-3">
                  {s.label}
                </p>
                <p className={`text-3xl sm:text-[2.25rem] font-semibold leading-none mb-2 sm:mb-3 ${s.color}`}>
                  {s.value}
                </p>
                {s.alert && (
                  <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded ${s.alertStyle}`}>
                    <AlertTriangle className="w-3 h-3" />
                    {s.alert}
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Content grid */}
          <motion.div {...fadeUp(0.28)} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

            {/* Active projects */}
            <div className="bg-surface border border-line rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
                <h2 className="text-base sm:text-lg font-semibold text-ink">Projets actifs</h2>
                <Link href="/projects" className="text-xs text-ink-muted hover:text-ink transition-colors">
                  Voir tout →
                </Link>
              </div>

              {activeProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
                  <FolderOpen className="w-8 h-8 text-ink-faint" />
                  <p className="text-sm text-ink-muted">Aucun projet actif pour l’instant.</p>
                  <Link href="/projects/new"
                    className="text-xs text-violet-glow hover:underline">
                    Créer votre premier projet →
                  </Link>
                </div>
              ) : (
                <>
                  {/* Mobile */}
                  <div className="sm:hidden divide-y divide-line">
                    {activeProjects.map(p => {
                      const client = clientMap.get(p.clientId)
                      const progress = milestoneProgress(p)
                      return (
                        <Link key={p.id} href={`/projects/${p.id}`}
                          className="flex items-center justify-between px-4 py-3.5 hover:bg-surface-high transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                            <p className="text-xs text-ink-muted mt-0.5">{client?.company ?? client?.name ?? '—'}</p>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0 ml-3">
                            <div className="h-1.5 w-14 rounded-full bg-ink/10">
                              <div className={`h-full rounded-full ${PROGRESS_COLOR[p.status] ?? 'bg-violet'}`} style={{ width: `${progress}%` }} />
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[p.status] ?? 'bg-ink/5 text-ink-muted'}`}>
                              {STATUS_DISPLAY[p.status]?.label ?? p.status}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Desktop */}
                  <table className="w-full hidden sm:table">
                    <thead>
                      <tr className="border-b border-line">
                        {['Projet', 'Client', 'Avancement', 'Statut'].map(h => (
                          <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeProjects.map((p, i) => {
                        const client = clientMap.get(p.clientId)
                        const progress = milestoneProgress(p)
                        const isLast = i === activeProjects.length - 1
                        return (
                          <tr key={p.id} className={`h-14 hover:bg-surface-high transition-colors cursor-pointer ${isLast ? '' : 'border-b border-line'}`}>
                            <td className="px-6">
                              <Link href={`/projects/${p.id}`} className="text-sm font-semibold text-ink hover:text-violet-glow transition-colors">
                                {p.name}
                              </Link>
                            </td>
                            <td className="px-6 text-sm text-ink-muted">{client?.company ?? client?.name ?? '—'}</td>
                            <td className="px-6">
                              <div className="flex items-center gap-2.5">
                                <div className="h-1.5 w-20 rounded-full bg-ink/10">
                                  <div className={`h-full rounded-full ${PROGRESS_COLOR[p.status] ?? 'bg-violet'}`} style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-xs text-ink-muted">{progress}%</span>
                              </div>
                            </td>
                            <td className="px-6">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[p.status] ?? 'bg-ink/5 text-ink-muted'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DISPLAY[p.status]?.dot ?? 'bg-ink-muted'}`} />
                                {STATUS_DISPLAY[p.status]?.label ?? p.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            {/* Activity feed */}
            <div className="bg-surface border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line">
                <h2 className="text-base sm:text-lg font-semibold text-ink">Fil d’activité</h2>
              </div>
              <div className="p-5">
                {activity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <CheckCircle2 className="w-8 h-8 text-ink-faint" />
                    <p className="text-sm text-ink-muted">Aucune activité pour l’instant.</p>
                    <p className="text-xs text-ink-faint">Les approbations et événements de projet apparaîtront ici.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity.slice(0, 5).map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full ${ACTIVITY_COLOR[a.type] ?? 'bg-surface-high'} flex items-center justify-center shrink-0 mt-0.5`}>
                          {ACTIVITY_ICON[a.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink leading-snug">{a.title}</p>
                          {a.actor && (
                            <p className="text-[11px] text-ink-faint mt-0.5">par {a.actor}</p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-ink-faint" />
                            <p className="text-[11px] text-ink-muted">{formatRelative(a.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
