'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, RotateCcw, Compass, MessageSquare,
  ExternalLink, Loader2, Check, AlertTriangle,
} from 'lucide-react'
import { api, type Deliverable, type PortalContext } from '@/lib/api'
import { useApiData } from '@/lib/hooks'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  DESIGN_APPROVAL: 'Design Approval',
  DOCUMENT:        'Document',
  ASSET:           'Asset',
  PROTOTYPE:       'Prototype',
  VIDEO:           'Video',
  OTHER:           'Other',
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:           'bg-warning/15 text-warning',
  APPROVED:          'bg-success/15 text-success',
  CHANGES_REQUESTED: 'bg-danger/15 text-danger',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:           'Pending Approval',
  APPROVED:          'Approved',
  CHANGES_REQUESTED: 'Changes Requested',
}

// ─── Deliverable card ────────────────────────────────────────────────────────

function DeliverableCard({
  d,
  index,
  token,
  onAction,
}: {
  d: Deliverable
  index: number
  token: string
  onAction: (id: string, action: 'APPROVED' | 'CHANGES_REQUESTED') => void
}) {
  const [comment, setComment]           = useState('')
  const [loading, setLoading]           = useState<string | null>(null)
  const [done, setDone]                 = useState(d.status !== 'PENDING')
  const [currentStatus, setCurrentStatus] = useState(d.status)

  async function handle(action: 'APPROVED' | 'CHANGES_REQUESTED') {
    if (action === 'CHANGES_REQUESTED' && !comment.trim()) return
    setLoading(action)
    try {
      await api.portal.validate(token, d.id, { action, comment: comment || undefined })
      setCurrentStatus(action)
      setDone(true)
      onAction(d.id, action)
    } catch {
      // keep the UI as-is on error so the user can retry
    } finally {
      setLoading(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface border border-line rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-line">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <h3 className="text-base font-semibold text-ink truncate">{d.title}</h3>
          <span className="text-[11px] font-medium text-ink-muted bg-surface-high border border-line px-2 py-0.5 rounded shrink-0">
            {TYPE_LABEL[d.type] ?? d.type}
          </span>
        </div>
        <motion.span
          key={currentStatus}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLE[currentStatus] ?? ''}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {STATUS_LABEL[currentStatus] ?? currentStatus}
        </motion.span>
      </div>

      {/* Body */}
      <div className="flex flex-col md:grid md:grid-cols-[1fr_280px] md:divide-x md:divide-line">
        {/* Left: description + preview + comments */}
        <div className="p-4 sm:p-6 space-y-4">
          {d.description && (
            <div className="bg-surface-high border border-line rounded-lg p-4">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Designer&apos;s Notes</p>
              <p className="text-sm text-ink-dim leading-relaxed">{d.description}</p>
            </div>
          )}

          {d.previewUrl ? (
            <a href={d.previewUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-violet-glow hover:underline">
              <ExternalLink className="w-4 h-4" />Open Preview
            </a>
          ) : (
            <div className="h-32 bg-surface-high border border-dashed border-line rounded-lg flex items-center justify-center">
              <p className="text-sm text-ink-faint">Preview not attached</p>
            </div>
          )}

          {d.comments.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest">Activity</p>
              {d.comments.map((c, i) => (
                <div key={c.id ?? i} className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-[10px] font-bold text-violet-glow">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-dim">
                      {c.name} <span className="font-normal text-ink-faint">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </p>
                    <p className="text-sm text-ink-dim mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: validation panel */}
        <div className="p-4 sm:p-6 border-t border-line md:border-t-0 flex flex-col gap-4">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest">Your Validation</p>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 4 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  currentStatus === 'APPROVED'
                    ? 'bg-success/10 border border-success/30'
                    : 'bg-warning/10 border border-warning/30'
                }`}
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3, type: 'spring', stiffness: 300 }}>
                  {currentStatus === 'APPROVED'
                    ? <CheckCircle2 className="w-6 h-6 text-success" />
                    : <AlertTriangle className="w-6 h-6 text-warning" />}
                </motion.div>
                <div>
                  <p className={`text-sm font-semibold ${currentStatus === 'APPROVED' ? 'text-success' : 'text-warning'}`}>
                    {currentStatus === 'APPROVED' ? 'You approved this' : 'Changes requested'}
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">Response recorded</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-3">
                <button onClick={() => handle('APPROVED')} disabled={!!loading}
                  className="flex items-center justify-center gap-2 w-full bg-success hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-60 text-sm">
                  {loading === 'APPROVED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Approve
                </button>
                <div className="space-y-2">
                  <textarea rows={3} placeholder="Describe the changes you need…"
                    value={comment} onChange={e => setComment(e.target.value)}
                    className="w-full bg-bg border border-line rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors resize-none" />
                  <button onClick={() => handle('CHANGES_REQUESTED')}
                    disabled={!!loading || !comment.trim()}
                    className="flex items-center justify-center gap-2 w-full bg-warning/15 hover:bg-warning/25 border border-warning/40 text-warning font-semibold py-3 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-40 text-sm">
                    {loading === 'CHANGES_REQUESTED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Request Changes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {d.deadline && (
            <div className="mt-auto pt-4 border-t border-line">
              <p className="text-[11px] text-ink-muted uppercase tracking-wide mb-1">Deadline</p>
              <p className="text-sm font-medium text-ink">{new Date(d.deadline).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Loading / Error states ───────────────────────────────────────────────────

function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
    </div>
  )
}

function PortalError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-danger/60" />
        </div>
        <p className="text-ink font-semibold text-base mb-1">Unable to load portal</p>
        <p className="text-ink-muted text-sm">{message.includes('404') || message.includes('Not Found')
          ? 'This link is invalid or has expired.'
          : 'Something went wrong. Please try again later.'}</p>
      </div>
    </div>
  )
}

// ─── Portal page ─────────────────────────────────────────────────────────────

export default function PortalPage() {
  const { token } = useParams<{ token: string }>()

  const fetchPortal = useCallback(() => api.portal.get(token), [token])
  const { data: ctx, loading, error } = useApiData<PortalContext>(fetchPortal)

  const [statuses, setStatuses] = useState<Record<string, string>>({})

  if (loading) return <PortalSkeleton />
  if (error || !ctx) return <PortalError message={error ?? 'Unknown error'} />

  const { client, projects, deliverablesByProject } = ctx

  const allDeliverables = deliverablesByProject.flatMap(g => g.items)
  const pending  = allDeliverables.filter(d => (statuses[d.id] ?? d.status) === 'PENDING').length
  const approved = allDeliverables.filter(d => (statuses[d.id] ?? d.status) === 'APPROVED').length

  const firstProject = projects[0]
  const milestones   = firstProject?.milestones ?? []
  const doneCount    = milestones.filter(m => m.status === 'DONE').length
  const progress     = milestones.length > 0 ? Math.round(doneCount / milestones.length * 100) : 0
  const activeMilestone = milestones.find(m => m.status === 'IN_PROGRESS')

  function handleAction(id: string, action: 'APPROVED' | 'CHANGES_REQUESTED') {
    setStatuses(prev => ({ ...prev, [id]: action }))
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-surface-dim/95 backdrop-blur border-b border-line px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet flex items-center justify-center shrink-0">
            <Compass className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-ink text-sm hidden sm:inline">StreamLine</span>
          <span className="text-[10px] sm:text-[11px] font-semibold bg-surface-high border border-line text-ink-muted px-2 py-0.5 rounded uppercase tracking-wide">
            Client Portal
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-ink-muted">
          <span className="hidden sm:inline">{client.company}</span>
          <div className="w-7 h-7 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-[10px] font-bold text-violet-glow shrink-0">
            {client.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            Welcome back, {client.name.split(' ')[0]}
          </h1>
          {firstProject && (
            <p className="text-ink-muted text-sm mt-1">
              Project: <span className="text-ink font-medium">{firstProject.name}</span>
            </p>
          )}
        </motion.div>

        {/* Milestone timeline */}
        {milestones.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06 }}
            className="bg-surface border border-line rounded-xl p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-ink">{activeMilestone?.title ?? 'Progress'}</h2>
              <span className="text-xs font-semibold bg-surface-high border border-line text-ink-dim px-2.5 py-1 rounded-full shrink-0">
                {progress}% Complete
              </span>
            </div>

            <div className="w-full h-1.5 bg-line rounded-full mb-5 sm:mb-6 overflow-hidden">
              <motion.div className="h-full bg-violet rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="relative flex items-start justify-between min-w-[480px] sm:min-w-0">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-line" />
                <div className="absolute top-4 left-4 h-0.5 bg-violet" style={{ width: `${progress}%` }} />
                {milestones.map(m => (
                  <div key={m.id} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      m.status === 'DONE'        ? 'bg-success border-success'
                      : m.status === 'IN_PROGRESS' ? 'bg-surface border-violet ring-4 ring-violet/20'
                      : 'bg-surface border-line'
                    }`}>
                      {m.status === 'DONE'
                        ? <CheckCircle2 className="w-4 h-4 text-white" />
                        : m.status === 'IN_PROGRESS'
                          ? <Circle className="w-3 h-3 text-violet fill-violet" />
                          : <Circle className="w-3 h-3 text-line" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium whitespace-nowrap ${
                        m.status === 'IN_PROGRESS' ? 'text-ink' : m.status === 'DONE' ? 'text-success' : 'text-ink-muted'
                      }`}>{m.title}</p>
                      {m.dueDate && <p className="text-[10px] text-ink-faint whitespace-nowrap">{new Date(m.dueDate).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action cards */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div className="bg-surface border border-line border-l-4 border-l-warning rounded-xl p-4">
            <p className="text-[11px] font-semibold text-warning uppercase tracking-widest mb-1">Validations</p>
            <p className="text-2xl font-bold text-ink mb-2">{pending} Pending</p>
            {pending > 0 && (
              <a href="#deliverables" className="text-sm font-semibold text-warning hover:text-amber-400 transition-colors">
                Review Now →
              </a>
            )}
          </div>
          <div className="bg-surface border border-line border-l-4 border-l-success rounded-xl p-4">
            <p className="text-[11px] font-semibold text-success uppercase tracking-widest mb-1">Approved</p>
            <p className="text-2xl font-bold text-ink mb-2">{approved} Deliverable{approved !== 1 ? 's' : ''}</p>
            <span className="text-sm font-semibold text-success">{approved > 0 ? 'Great progress!' : 'Nothing yet'}</span>
          </div>
          <div className="bg-surface border border-line border-l-4 border-l-info rounded-xl p-4">
            <p className="text-[11px] font-semibold text-info uppercase tracking-widest mb-1">Total</p>
            <p className="text-2xl font-bold text-ink mb-2">{allDeliverables.length} Item{allDeliverables.length !== 1 ? 's' : ''}</p>
            <span className="text-sm text-ink-muted">In this project</span>
          </div>
        </motion.div>

        {/* Deliverables by project */}
        <div id="deliverables">
          {deliverablesByProject.map(group => {
            const proj = projects.find(p => p.id === group.projectId)
            return (
              <div key={group.projectId} className="mb-8">
                {projects.length > 1 && (
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-semibold text-ink">{proj?.name ?? group.projectId}</h2>
                    <div className="flex items-center gap-1.5 text-sm text-ink-muted">
                      <MessageSquare className="w-4 h-4" />
                      <span>{group.items.length} items</span>
                    </div>
                  </div>
                )}

                {projects.length === 1 && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-ink">Deliverables</h2>
                    <div className="flex items-center gap-2 text-sm text-ink-muted">
                      <MessageSquare className="w-4 h-4" />
                      <span>{group.items.length} items</span>
                    </div>
                  </div>
                )}

                {group.items.length === 0 ? (
                  <div className="bg-surface border border-line rounded-xl py-12 text-center">
                    <p className="text-ink-muted text-sm">No deliverables yet for this project.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {group.items.map((d, i) => (
                      <DeliverableCard key={d.id} d={d} index={i} token={token} onAction={handleAction} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {allDeliverables.length === 0 && (
            <div className="py-16 text-center bg-surface border border-line rounded-xl">
              <p className="text-ink-muted">No deliverables awaiting your review.</p>
            </div>
          )}

          <p className="text-center text-xs text-ink-faint mt-8 pb-4">
            Powered by StreamLine · Secure client portal
          </p>
        </div>
      </div>
    </div>
  )
}
