'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, RotateCcw, Compass, MessageSquare,
  ExternalLink, Loader2, Check, AlertTriangle,
} from 'lucide-react'

// ─── Mock data (replace with apiFetch('/portal/:token') once DynamoDB is live) ─

const MOCK = {
  client: { name: 'Alex Rossi', company: 'Acme Corp' },
  project: {
    name: 'E-Commerce Redesign 2026',
    phase: 'Development',
    progress: 72,
    milestones: [
      { label: 'Discovery',   date: 'Jan 12',       done: true  },
      { label: 'Strategy',    date: 'Feb 04',       done: true  },
      { label: 'UX/UI Design',date: 'Mar 18',       done: true  },
      { label: 'Development', date: 'In Progress',  done: false, active: true },
      { label: 'QA',          date: 'ETA: May 20',  done: false },
      { label: 'Launch',      date: 'ETA: Jun 12',  done: false },
    ],
  },
  deliverables: [
    {
      id: 'd1',
      title: 'Homepage Hero Section',
      type: 'DESIGN_APPROVAL',
      description: "In this third iteration, we've refined the value proposition. Key changes: updated imagery, improved contrast, and repositioned CTA aligned with eye-tracking data.",
      previewUrl: '',
      deadline: 'Dec 15, 2026',
      status: 'PENDING',
      comments: [
        { name: 'Julianne V. (Designer)', text: "I've pushed V3 with the requested font weights. Take a look at the 'Get Started' button.", time: '4h ago' },
      ],
    },
    {
      id: 'd2',
      title: 'Category Landing Pages',
      type: 'DESIGN_APPROVAL',
      description: 'New layout for the 6 main product categories with SEO-optimised headings and filtering UX.',
      previewUrl: '',
      deadline: 'Dec 20, 2026',
      status: 'PENDING',
      comments: [],
    },
    {
      id: 'd3',
      title: 'Checkout Flow UX',
      type: 'DESIGN_APPROVAL',
      description: 'Redesigned 3-step checkout reducing friction and abandonment rate.',
      previewUrl: '',
      deadline: 'Nov 24, 2026',
      status: 'APPROVED',
      comments: [],
    },
  ],
  updates: [
    { text: 'Mobile responsive UI for Cart page completed.', time: '2 hours ago' },
    { text: 'Design System documentation updated.', time: 'Yesterday, 4:12 PM' },
    { text: 'Weekly PM check-in rescheduled to Thursday.', time: 'Apr 12, 10:00 AM' },
  ],
}

type Deliverable = typeof MOCK.deliverables[0]

const TYPE_LABEL: Record<string, string> = {
  DESIGN_APPROVAL: 'Design Approval',
  DOCUMENT:        'Document',
  ASSET:           'Asset',
  PROTOTYPE:       'Prototype',
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
  onAction,
}: {
  d: Deliverable
  index: number
  onAction: (id: string, action: 'APPROVED' | 'CHANGES_REQUESTED', comment: string) => Promise<void>
}) {
  const [comment, setComment]           = useState('')
  const [loading, setLoading]           = useState<string | null>(null)
  const [done, setDone]                 = useState(d.status !== 'PENDING')
  const [currentStatus, setCurrentStatus] = useState(d.status)

  async function handle(action: 'APPROVED' | 'CHANGES_REQUESTED') {
    if (action === 'CHANGES_REQUESTED' && !comment.trim()) return
    setLoading(action)
    await onAction(d.id, action, comment)
    setCurrentStatus(action)
    setDone(true)
    setLoading(null)
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
          {STATUS_LABEL[currentStatus]}
        </motion.span>
      </div>

      {/* Body */}
      <div className="flex flex-col md:grid md:grid-cols-[1fr_280px] md:divide-x md:divide-line">
        {/* Left: description + preview + comments */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-surface-high border border-line rounded-lg p-4">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Designer&apos;s Notes</p>
            <p className="text-sm text-ink-dim leading-relaxed">{d.description}</p>
          </div>

          {d.previewUrl ? (
            <a href={d.previewUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-violet-glow hover:underline">
              <ExternalLink className="w-4 h-4" /> Open Preview
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
                <div key={i} className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-[10px] font-bold text-violet-glow">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-dim">
                      {c.name} <span className="font-normal text-ink-faint">{c.time}</span>
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3, type: 'spring', stiffness: 300 }}
                >
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
              <motion.div
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                <button
                  onClick={() => handle('APPROVED')}
                  disabled={!!loading}
                  className="flex items-center justify-center gap-2 w-full bg-success hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-60 text-sm"
                >
                  {loading === 'APPROVED'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Check className="w-4 h-4" />}
                  Approve
                </button>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Describe the changes you need…"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full bg-bg border border-line rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors resize-none"
                  />
                  <button
                    onClick={() => handle('CHANGES_REQUESTED')}
                    disabled={!!loading || !comment.trim()}
                    className="flex items-center justify-center gap-2 w-full bg-warning/15 hover:bg-warning/25 border border-warning/40 text-warning font-semibold py-3 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-40 text-sm"
                  >
                    {loading === 'CHANGES_REQUESTED'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <RotateCcw className="w-4 h-4" />}
                    Request Changes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {d.deadline && (
            <div className="mt-auto pt-4 border-t border-line">
              <p className="text-[11px] text-ink-muted uppercase tracking-wide mb-1">Deadline</p>
              <p className="text-sm font-medium text-ink">{d.deadline}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Portal page ─────────────────────────────────────────────────────────────

export default function PortalPage() {
  const [deliverables, setDeliverables] = useState(MOCK.deliverables)
  const { client, project, updates } = MOCK

  const pending  = deliverables.filter(d => d.status === 'PENDING').length
  const approved = deliverables.filter(d => d.status === 'APPROVED').length

  async function handleValidation(id: string, action: 'APPROVED' | 'CHANGES_REQUESTED', _comment: string) {
    await new Promise(r => setTimeout(r, 700))
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, status: action } : d))
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
            {client.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            Welcome back, {client.name.split(' ')[0]} 👋
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            Project: <span className="text-ink font-medium">{project.name}</span>
          </p>
        </motion.div>

        {/* Milestone timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="bg-surface border border-line rounded-xl p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-ink">{project.phase} Phase</h2>
            <span className="text-xs font-semibold bg-surface-high border border-line text-ink-dim px-2.5 py-1 rounded-full shrink-0">
              {project.progress}% Complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-line rounded-full mb-5 sm:mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-violet rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Milestones — horizontal scroll on mobile */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="relative flex items-start justify-between min-w-[480px] sm:min-w-0">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-line" />
              <div className="absolute top-4 left-4 h-0.5 bg-violet" style={{ width: '52%' }} />
              {project.milestones.map((m) => (
                <div key={m.label} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    m.done   ? 'bg-success border-success'
                    : m.active ? 'bg-surface border-violet ring-4 ring-violet/20'
                    : 'bg-surface border-line'
                  }`}>
                    {m.done
                      ? <CheckCircle2 className="w-4 h-4 text-white" />
                      : m.active
                        ? <Circle className="w-3 h-3 text-violet fill-violet" />
                        : <Circle className="w-3 h-3 text-line" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-medium whitespace-nowrap ${
                      m.active ? 'text-ink' : m.done ? 'text-success' : 'text-ink-muted'
                    }`}>{m.label}</p>
                    <p className="text-[10px] text-ink-faint whitespace-nowrap">{m.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Action cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div className="bg-surface border-l-4 border-warning border border-line rounded-xl p-4">
            <p className="text-[11px] font-semibold text-warning uppercase tracking-widest mb-1">Validations</p>
            <p className="text-2xl font-bold text-ink mb-2">{pending} Pending</p>
            <a href="#deliverables" className="text-sm font-semibold text-warning hover:text-amber-400 transition-colors">
              Review Now →
            </a>
          </div>
          <div className="bg-surface border-l-4 border-success border border-line rounded-xl p-4">
            <p className="text-[11px] font-semibold text-success uppercase tracking-widest mb-1">Approved</p>
            <p className="text-2xl font-bold text-ink mb-2">{approved} Deliverables</p>
            <span className="text-sm font-semibold text-success">Great progress!</span>
          </div>
          <div className="bg-surface border-l-4 border-info border border-line rounded-xl p-4">
            <p className="text-[11px] font-semibold text-info uppercase tracking-widest mb-1">Latest Update</p>
            <p className="text-sm text-ink-dim leading-snug">{updates[0].text}</p>
            <p className="text-[11px] text-ink-muted mt-1">{updates[0].time}</p>
          </div>
        </motion.div>

        {/* Deliverables */}
        <div id="deliverables">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">Deliverables</h2>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <MessageSquare className="w-4 h-4" />
              <span>{deliverables.length} items</span>
            </div>
          </div>

          <div className="space-y-4">
            {deliverables.map((d, i) => (
              <DeliverableCard key={d.id} d={d} index={i} onAction={handleValidation} />
            ))}
          </div>

          <p className="text-center text-xs text-ink-faint mt-8 pb-4">
            Powered by StreamLine · Secure client portal
          </p>
        </div>
      </div>
    </div>
  )
}
