'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, RotateCcw, Compass, MessageSquare, ExternalLink, Loader2, Check, AlertTriangle } from 'lucide-react'

// ─── Mock data (replace with apiFetch('/portal/:token') once DynamoDB is live) ─

const MOCK = {
  client: { name: 'Alex Rossi', company: 'Acme Corp' },
  project: {
    name: 'E-Commerce Redesign 2026',
    phase: 'Development',
    progress: 72,
    milestones: [
      { label: 'Discovery', date: 'Jan 12', done: true },
      { label: 'Strategy', date: 'Feb 04', done: true },
      { label: 'UX/UI Design', date: 'Mar 18', done: true },
      { label: 'Development', date: 'In Progress', done: false, active: true },
      { label: 'QA', date: 'ETA: May 20', done: false },
      { label: 'Launch', date: 'ETA: Jun 12', done: false },
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
    { text: 'Mobile responsive UI for Cart page completed.', time: '2 hours ago', color: 'bg-ink-muted' },
    { text: 'Design System documentation updated.', time: 'Yesterday, 4:12 PM', color: 'bg-success' },
    { text: 'Weekly PM check-in rescheduled to Thursday.', time: 'Apr 12, 10:00 AM', color: 'bg-warning' },
  ],
}

type Deliverable = typeof MOCK.deliverables[0]

const TYPE_LABEL: Record<string, string> = {
  DESIGN_APPROVAL: 'Design Approval',
  DOCUMENT: 'Document',
  ASSET: 'Asset',
  PROTOTYPE: 'Prototype',
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-warning/15 text-warning',
  APPROVED: 'bg-success/15 text-success',
  CHANGES_REQUESTED: 'bg-danger/15 text-danger',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending Your Approval',
  APPROVED: 'Approved',
  CHANGES_REQUESTED: 'Changes Requested',
}

// ─── Deliverable card ────────────────────────────────────────────────────────

function DeliverableCard({
  d,
  onAction,
}: {
  d: Deliverable
  onAction: (id: string, action: 'APPROVED' | 'CHANGES_REQUESTED', comment: string) => Promise<void>
}) {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [done, setDone] = useState(d.status !== 'PENDING')
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
    <div className="bg-surface border border-line rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-line">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-ink">{d.title}</h3>
          <span className="text-[11px] font-medium text-ink-muted bg-surface-high border border-line px-2 py-0.5 rounded">
            {TYPE_LABEL[d.type] ?? d.type}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[currentStatus] ?? ''}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {STATUS_LABEL[currentStatus]}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_280px] divide-x divide-line">
        {/* Left: description + preview + comments */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div className="bg-surface-high border border-line rounded-lg p-4">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Designer&apos;s Notes</p>
            <p className="text-sm text-ink-dim leading-relaxed">{d.description}</p>
          </div>

          {/* Preview placeholder */}
          {d.previewUrl ? (
            <a href={d.previewUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-violet-glow hover:underline">
              <ExternalLink className="w-4 h-4" /> Open Preview
            </a>
          ) : (
            <div className="h-36 bg-surface-high border border-dashed border-line rounded-lg flex items-center justify-center">
              <p className="text-sm text-ink-faint">Preview not attached</p>
            </div>
          )}

          {/* Comments */}
          {d.comments.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest">Activity</p>
              {d.comments.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-[10px] font-bold text-violet-glow">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-dim">{c.name} <span className="font-normal text-ink-faint">{c.time}</span></p>
                    <p className="text-sm text-ink-dim mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: validation panel */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest">Your Validation</p>

          {done ? (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${currentStatus === 'APPROVED' ? 'bg-success/10 border border-success/30' : 'bg-warning/10 border border-warning/30'}`}>
              {currentStatus === 'APPROVED'
                ? <CheckCircle2 className="w-5 h-5 text-success" />
                : <AlertTriangle className="w-5 h-5 text-warning" />}
              <div>
                <p className={`text-sm font-semibold ${currentStatus === 'APPROVED' ? 'text-success' : 'text-warning'}`}>
                  {currentStatus === 'APPROVED' ? 'You approved this' : 'Changes requested'}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">Response recorded</p>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => handle('APPROVED')}
                disabled={!!loading}
                className="flex items-center justify-center gap-2 w-full bg-success hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors active:scale-[0.98] disabled:opacity-60"
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
                  className="w-full bg-bg border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors resize-none"
                />
                <button
                  onClick={() => handle('CHANGES_REQUESTED')}
                  disabled={!!loading || !comment.trim()}
                  className="flex items-center justify-center gap-2 w-full bg-warning/15 hover:bg-warning/25 border border-warning/40 text-warning font-semibold py-2.5 rounded-lg transition-colors active:scale-[0.98] disabled:opacity-40"
                >
                  {loading === 'CHANGES_REQUESTED'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <RotateCcw className="w-4 h-4" />}
                  Request Changes
                </button>
              </div>
            </>
          )}

          {d.deadline && (
            <div className="mt-auto pt-4 border-t border-line">
              <p className="text-[11px] text-ink-muted uppercase tracking-wide mb-1">Deadline</p>
              <p className="text-sm font-medium text-ink">{d.deadline}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Portal page ─────────────────────────────────────────────────────────────

export default function PortalPage() {
  const [deliverables, setDeliverables] = useState(MOCK.deliverables)
  const { client, project, updates } = MOCK

  const pending = deliverables.filter(d => d.status === 'PENDING').length
  const approved = deliverables.filter(d => d.status === 'APPROVED').length

  async function handleValidation(id: string, action: 'APPROVED' | 'CHANGES_REQUESTED', _comment: string) {
    // In prod: await apiFetch(`/portal/${token}/deliverables/${id}/validate`, { method:'POST', body: JSON.stringify({action, comment: _comment}) })
    await new Promise(r => setTimeout(r, 700))
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, status: action } : d))
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-surface-dim border-b border-line px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet flex items-center justify-center">
            <Compass className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-ink text-sm">StreamLine</span>
          <span className="text-[11px] font-semibold bg-surface-high border border-line text-ink-muted px-2 py-0.5 rounded uppercase tracking-wide">
            Client Portal
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <span>{client.company}</span>
          <div className="w-7 h-7 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-[10px] font-bold text-violet-glow">
            {client.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            Welcome back, {client.name.split(' ')[0]} 👋
          </h1>
          <p className="text-ink-muted text-sm mt-1">Project: <span className="text-ink font-medium">{project.name}</span></p>
        </div>

        {/* Milestone timeline */}
        <div className="bg-surface border border-line rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-ink">{project.phase} Phase</h2>
            <span className="text-xs font-semibold bg-surface-high border border-line text-ink-dim px-2.5 py-1 rounded-full">
              {project.progress}% Completed
            </span>
          </div>
          <div className="w-full h-1 bg-line rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-violet rounded-full transition-all" style={{ width: `${project.progress}%` }} />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-line" />
            <div className="absolute top-4 left-4 h-0.5 bg-violet" style={{ width: '52%' }} />
            {project.milestones.map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  m.done ? 'bg-success border-success' : m.active ? 'bg-surface border-violet ring-4 ring-violet/20' : 'bg-surface border-line'
                }`}>
                  {m.done
                    ? <CheckCircle2 className="w-4 h-4 text-white" />
                    : m.active ? <Circle className="w-3 h-3 text-violet fill-violet" />
                    : <Circle className="w-3 h-3 text-line" />}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${m.active ? 'text-ink' : m.done ? 'text-success' : 'text-ink-muted'}`}>{m.label}</p>
                  <p className="text-[10px] text-ink-faint">{m.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border-l-4 border-warning border border-line rounded-lg p-4">
            <p className="text-[11px] font-semibold text-warning uppercase tracking-widest mb-1">Validations</p>
            <p className="text-2xl font-bold text-ink mb-3">{pending} Pending</p>
            <button className="text-sm font-semibold text-warning hover:text-amber-400 transition-colors">
              Review Now →
            </button>
          </div>
          <div className="bg-surface border-l-4 border-success border border-line rounded-lg p-4">
            <p className="text-[11px] font-semibold text-success uppercase tracking-widest mb-1">Approved</p>
            <p className="text-2xl font-bold text-ink mb-3">{approved} Deliverables</p>
            <button className="text-sm font-semibold text-success hover:text-green-400 transition-colors">
              View History →
            </button>
          </div>
          <div className="bg-surface border-l-4 border-info border border-line rounded-lg p-4">
            <p className="text-[11px] font-semibold text-info uppercase tracking-widest mb-1">Latest Updates</p>
            <p className="text-sm text-ink-dim leading-snug">{updates[0].text}</p>
            <p className="text-[11px] text-ink-muted mt-1">{updates[0].time}</p>
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">Deliverables</h2>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <MessageSquare className="w-4 h-4" />
              <span>{deliverables.length} items</span>
            </div>
          </div>

          <div className="space-y-4">
            {deliverables.map((d) => (
              <DeliverableCard key={d.id} d={d} onAction={handleValidation} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
