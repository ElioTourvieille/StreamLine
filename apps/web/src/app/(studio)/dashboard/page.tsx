'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, AlertTriangle, CheckCircle2, Clock, FolderOpen, Users, Sparkles, ArrowRight, RefreshCw } from 'lucide-react'
import { api, type Client, type Project, type Deliverable, type Milestone } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

type DashData = {
  projects: Project[]
  clients: Client[]
  deliverables: Deliverable[]
  userName: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function milestoneProgress(milestones?: Milestone[]) {
  if (!milestones || milestones.length === 0) return 0
  const done = milestones.filter(m => m.status === 'COMPLETED').length
  return Math.round((done / milestones.length) * 100)
}

function projectPhase(project: Project) {
  const m = project.milestones?.find(m => m.status === 'IN_PROGRESS')
  if (m) return m.title
  const phases: Record<string, string> = {
    DRAFT: 'Discovery', ACTIVE: 'In Progress', REVIEW: 'Review',
    COMPLETED: 'Delivered', ARCHIVED: 'Archived',
  }
  return phases[project.status] ?? project.status
}

const STATUS_DISPLAY: Record<string, { label: string; style: string }> = {
  DRAFT:     { label: 'Draft',      style: 'bg-white/5 text-ink-muted' },
  ACTIVE:    { label: 'On Track',   style: 'bg-success/15 text-success' },
  REVIEW:    { label: 'In Review',  style: 'bg-warning/15 text-warning' },
  COMPLETED: { label: 'Completed',  style: 'bg-white/10 text-ink-muted' },
  ARCHIVED:  { label: 'Archived',   style: 'bg-white/5 text-ink-muted' },
}

const PROGRESS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-success', REVIEW: 'bg-warning',
  COMPLETED: 'bg-ink-muted', DRAFT: 'bg-violet', ARCHIVED: 'bg-ink-muted',
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as const },
})

// ─── Onboarding empty state ──────────────────────────────────────────────────

function OnboardingState() {
  return (
    <motion.div {...fadeUp(0.1)} className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center mb-5">
        <FolderOpen className="w-8 h-8 text-violet/50" />
      </div>
      <h2 className="text-xl font-semibold text-ink mb-2">Your studio is all set</h2>
      <p className="text-ink-muted text-sm max-w-sm mb-8 leading-relaxed">
        Start by adding a client, create a project and send them a portal link — the whole loop in under 5 minutes.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/clients"
          className="flex items-center gap-2 bg-surface hover:bg-surface-high border border-line text-ink px-4 py-2.5 rounded-lg text-sm font-medium transition-colors group">
          <Users className="w-4 h-4 text-ink-muted" />
          Add a client
          <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link href="/projects/new"
          className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          New Project
        </Link>
        <Link href="/ai-generator"
          className="flex items-center gap-2 bg-surface hover:bg-surface-high border border-line text-ink-dim px-4 py-2.5 rounded-lg text-sm font-medium transition-colors group">
          <Sparkles className="w-4 h-4 text-violet/60 group-hover:text-violet transition-colors" />
          Generate a proposal
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-2xl w-full text-left">
        {[
          { step: '1', title: 'Add a client',     desc: 'Create a client profile with contact details.' },
          { step: '2', title: 'Create a project', desc: 'Set up milestones, deliverables, and assign the client.' },
          { step: '3', title: 'Send the portal',  desc: 'Invite the client — they can review and approve deliverables.' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="bg-surface border border-line rounded-xl p-4">
            <div className="w-6 h-6 rounded-full bg-violet/15 border border-violet/30 flex items-center justify-center text-xs font-bold text-violet-glow mb-3">
              {step}
            </div>
            <p className="text-sm font-semibold text-ink mb-1">{title}</p>
            <p className="text-xs text-ink-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dash, setDash] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [projects, clients, user] = await Promise.all([
          api.projects.list(),
          api.clients.list(),
          api.users.me(),
        ])

        // Fetch deliverables for the 5 most recent projects in parallel
        const recent = projects.slice(0, 5)
        const arrays = await Promise.all(
          recent.map(p => api.deliverables.list(p.id).catch(() => [] as Deliverable[]))
        )
        const deliverables = arrays.flat()

        setDash({ projects, clients, deliverables, userName: user.name })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const firstName = dash?.userName?.split(' ')[0] ?? ''

  if (loading) {
    return (
      <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-surface rounded-xl w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0,1,2,3].map(i => <div key={i} className="h-28 bg-surface rounded-xl" />)}
          </div>
          <div className="h-64 bg-surface rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 max-w-[1400px] mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-danger text-sm">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null) }}
          className="flex items-center gap-2 text-ink-muted hover:text-ink text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  const { projects = [], clients = [], deliverables = [] } = dash ?? {}

  const activeProjects = projects.filter(p => p.status !== 'COMPLETED' && p.status !== 'ARCHIVED')
  const completedProjects = projects.filter(p => p.status === 'COMPLETED')
  const pendingDeliverables = deliverables.filter(d => d.status === 'PENDING')
  const changesRequested = deliverables.filter(d => d.status === 'CHANGES_REQUESTED')

  const STATS = [
    {
      label: 'Active Projects',
      value: String(activeProjects.length),
      color: 'text-success',
      alert: null,
    },
    {
      label: 'Pending Validations',
      value: String(pendingDeliverables.length),
      color: 'text-warning',
      alert: pendingDeliverables.length > 0 ? 'Attention required' : null,
      alertColor: 'bg-warning/15 text-warning',
    },
    {
      label: 'Changes Requested',
      value: String(changesRequested.length),
      color: 'text-danger',
      alert: changesRequested.length > 0 ? 'Action needed' : null,
      alertColor: 'bg-danger/15 text-danger',
    },
    {
      label: 'Completed',
      value: String(completedProjects.length),
      color: 'text-success',
      alert: null,
    },
  ]

  // Build activity from deliverables that have been actioned
  const clientMap = new Map(clients.map(c => [c.id, c]))
  const projectMap = new Map(projects.map(p => [p.id, p]))

  const activity = deliverables
    .filter(d => (d.status === 'APPROVED' || d.status === 'CHANGES_REQUESTED') && d.comments.length > 0)
    .map(d => {
      const lastComment = d.comments[d.comments.length - 1]
      return {
        actor: lastComment.name,
        action: d.status === 'APPROVED'
          ? `approved ${d.title}`
          : `requested changes on ${d.title}`,
        project: projectMap.get(d.projectId)?.name ?? '',
        time: lastComment.createdAt,
        color: d.status === 'APPROVED' ? 'bg-success' : 'bg-danger',
      }
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5)

  const isEmpty = projects.length === 0

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight leading-tight">
            {greeting()}{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            {clients.length > 0
              ? `${activeProjects.length} active project${activeProjects.length !== 1 ? 's' : ''} across ${clients.length} client${clients.length !== 1 ? 's' : ''}.`
              : "Here is what's happening at your studio today."}
          </p>
        </div>
        <Link href="/projects/new"
          className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98] shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Project</span>
          <span className="sm:hidden">New</span>
        </Link>
      </motion.div>

      {isEmpty ? <OnboardingState /> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {STATS.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i * 0.06)}
                className="bg-surface border border-line rounded-xl p-4 sm:p-5 hover:bg-surface-high transition-colors">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-ink-muted uppercase tracking-widest leading-tight">{s.label}</p>
                </div>
                <p className={`text-3xl sm:text-[2.25rem] font-semibold leading-none mb-2 sm:mb-3 ${s.color}`}>{s.value}</p>
                {s.alert && (
                  <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded ${s.alertColor}`}>
                    <AlertTriangle className="w-3 h-3" />
                    {s.alert}
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Content grid */}
          <motion.div {...fadeUp(0.3)} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Projects */}
            <div className="bg-surface border border-line rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
                <h2 className="text-base sm:text-lg font-semibold text-ink">Recent Projects</h2>
              </div>

              {/* Mobile card view */}
              <div className="sm:hidden divide-y divide-line">
                {projects.slice(0, 6).map((p) => {
                  const client = clientMap.get(p.clientId)
                  const progress = milestoneProgress(p.milestones)
                  const st = STATUS_DISPLAY[p.status] ?? { label: p.status, style: 'bg-white/5 text-ink-muted' }
                  return (
                    <Link key={p.id} href={`/projects/${p.id}`}
                      className="flex items-center justify-between px-4 py-3.5 hover:bg-surface-high transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                        <p className="text-xs text-ink-muted mt-0.5">{client?.company ?? client?.name ?? '—'} · {projectPhase(p)}</p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <div className="h-1.5 w-14 rounded-full bg-white/10">
                          <div className={`h-full rounded-full ${PROGRESS_COLOR[p.status] ?? 'bg-violet'}`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.style}`}>
                          {st.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Desktop table */}
              <table className="w-full hidden sm:table">
                <thead>
                  <tr className="border-b border-line">
                    {['Project Name', 'Client', 'Phase', 'Progress', 'Status'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 6).map((p, i) => {
                    const client = clientMap.get(p.clientId)
                    const progress = milestoneProgress(p.milestones)
                    const st = STATUS_DISPLAY[p.status] ?? { label: p.status, style: 'bg-white/5 text-ink-muted' }
                    return (
                      <tr key={p.id}
                        className={`h-12 border-b border-line hover:bg-surface-high transition-colors cursor-pointer ${i === Math.min(projects.length, 6) - 1 ? 'border-b-0' : ''}`}>
                        <td className="px-6">
                          <Link href={`/projects/${p.id}`} className="text-sm font-semibold text-ink hover:text-violet-glow transition-colors">
                            {p.name}
                          </Link>
                        </td>
                        <td className="px-6 text-sm text-ink-muted">{client?.company ?? client?.name ?? '—'}</td>
                        <td className="px-6 text-sm text-ink">{projectPhase(p)}</td>
                        <td className="px-6">
                          <div className="h-1.5 w-20 rounded-full bg-white/10">
                            <div className={`h-full rounded-full ${PROGRESS_COLOR[p.status] ?? 'bg-violet'}`} style={{ width: `${progress}%` }} />
                          </div>
                        </td>
                        <td className="px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${st.style}`}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="px-5 sm:px-6 py-4 border-t border-line">
                <Link href="/projects" className="text-sm text-ink-muted hover:text-ink transition-colors">View all projects →</Link>
              </div>
            </div>

            {/* Activity feed */}
            <div className="bg-surface border border-line rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line">
                <h2 className="text-base sm:text-lg font-semibold text-ink">Activity Feed</h2>
              </div>
              <div className="p-5">
                {activity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-ink-faint" />
                    <p className="text-sm text-ink-muted">No activity yet.</p>
                    <p className="text-xs text-ink-faint">Approvals and feedback will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity.map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full ${a.color} flex items-center justify-center shrink-0 mt-0.5`}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink leading-snug">
                            <span className="font-semibold">{a.actor}</span>{' '}
                            <span className="text-ink-dim">{a.action}</span>
                          </p>
                          {a.project && (
                            <p className="text-[11px] text-ink-faint mt-0.5">{a.project}</p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-ink-faint" />
                            <p className="text-[11px] text-ink-muted">{formatRelative(a.time)}</p>
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
