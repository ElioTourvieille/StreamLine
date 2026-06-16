'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, CheckCircle2, Circle, AlertCircle, FileText,
  MessageSquare, Loader2, Plus, X, Users,
} from 'lucide-react'
import { api, type Deliverable } from '@/lib/api'
import { useApiData } from '@/lib/hooks'

// ─── Types ────────────────────────────────────────────────────────────────────

const VALIDATION_STYLES: Record<string, string> = {
  APPROVED:          'bg-success/15 text-success',
  PENDING:           'bg-warning/15 text-warning',
  CHANGES_REQUESTED: 'bg-danger/15 text-danger',
}

const STATUS_STYLES: Record<string, string> = {
  ON_TRACK:   'bg-success/15 text-success',
  AT_RISK:    'bg-warning/15 text-warning',
  OVERDUE:    'bg-danger/15 text-danger',
  IN_PROGRESS:'bg-violet/15 text-violet-glow',
  COMPLETED:  'bg-info/15 text-info',
}

const DELIVERABLE_TYPES = ['DESIGN_APPROVAL', 'DOCUMENT', 'ASSET', 'PROTOTYPE', 'VIDEO', 'OTHER']

// ─── New Deliverable Modal ────────────────────────────────────────────────────

function NewDeliverableModal({
  projectId,
  onClose,
  onSave,
}: {
  projectId: string
  onClose: () => void
  onSave: (d: Deliverable) => void
}) {
  const [form, setForm] = useState({ title: '', type: 'DESIGN_APPROVAL', description: '', previewUrl: '', deadline: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const d = await api.deliverables.create({
        projectId,
        title: form.title,
        type: form.type,
        description: form.description || undefined,
        previewUrl: form.previewUrl || undefined,
        deadline: form.deadline || undefined,
      })
      onSave(d)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating deliverable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-line rounded-t-2xl sm:rounded-xl w-full sm:max-w-md"
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
          <h2 className="text-base font-semibold text-ink">Request Validation</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink p-1"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">Title <span className="text-danger">*</span></label>
            <input type="text" required placeholder="Homepage Hero Section" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-violet transition-colors appearance-none cursor-pointer">
              {DELIVERABLE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">Description</label>
            <textarea rows={3} placeholder="Describe what the client needs to validate…" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">Preview URL</label>
            <input type="url" placeholder="https://figma.com/..." value={form.previewUrl}
              onChange={e => setForm(f => ({ ...f, previewUrl: e.target.value }))}
              className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">Deadline</label>
            <input type="date" value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-violet transition-colors [scheme:dark]" />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-surface-high border border-line text-ink-dim text-sm font-medium py-2.5 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-violet hover:bg-violet-hover text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Send Request
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Project Detail Page ──────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [showModal, setShowModal]             = useState(false)
  const [localDeliverables, setLocalDeliverables] = useState<Deliverable[] | null>(null)

  const fetchProject     = useCallback(() => api.projects.get(id), [id])
  const fetchDeliverables= useCallback(() => api.deliverables.list(id), [id])

  const { data: project,      loading: loadingProject } = useApiData(fetchProject)
  const { data: apiDeliverables, loading: loadingDels } = useApiData(fetchDeliverables)

  const deliverables = localDeliverables ?? apiDeliverables ?? []

  const pending  = deliverables.filter(d => d.status === 'PENDING').length
  const approved = deliverables.filter(d => d.status === 'APPROVED').length

  const milestones = project?.milestones ?? []
  const doneCount  = milestones.filter(m => m.status === 'DONE').length
  const progress   = milestones.length > 0 ? Math.round(doneCount / milestones.length * 100) : 0

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink-muted">Project not found.</p>
        <Link href="/projects" className="text-violet-glow text-sm mt-2 inline-block">← Back to Projects</Link>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      <AnimatePresence>
        {showModal && (
          <NewDeliverableModal
            projectId={id}
            onClose={() => setShowModal(false)}
            onSave={d => { setLocalDeliverables(prev => [...(prev ?? deliverables), d]); setShowModal(false) }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <Link href="/projects" className="text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">{project.name}</h1>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[project.status] ?? 'bg-white/5 text-ink-muted'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {project.status.replace(/_/g, ' ')}
        </span>
        <div className="ml-auto">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors active:scale-[0.98]">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Request Validation</span><span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 sm:gap-6 mt-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Scope card */}
          <div className="bg-surface border border-line rounded-lg p-5 sm:p-6">
            <h2 className="text-base font-semibold text-ink mb-3">Project Scope</h2>
            {project.description
              ? <p className="text-sm text-ink-dim leading-relaxed mb-5">{project.description}</p>
              : <p className="text-sm text-ink-faint mb-5">No description provided.</p>
            }
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-line">
              {[
                { label: 'Start', value: project.startDate ? new Date(project.startDate).toLocaleDateString() : '—' },
                { label: 'End',   value: project.endDate   ? new Date(project.endDate).toLocaleDateString()   : '—' },
                { label: 'Approvals', value: `${approved}/${deliverables.length}` },
                { label: 'Health',    value: `${progress}%` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] text-ink-muted uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-sm font-medium text-ink">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone timeline */}
          {milestones.length > 0 && (
            <div className="bg-surface border border-line rounded-lg p-5 sm:p-6">
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-5">Milestone Timeline</p>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="relative flex items-start justify-between min-w-[480px] sm:min-w-0">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-line" />
                  <div className="absolute top-4 left-4 h-0.5 bg-violet" style={{ width: `${progress}%` }} />
                  {milestones.map(m => (
                    <div key={m.id} className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        m.status === 'DONE'        ? 'bg-success border-success'
                        : m.status === 'IN_PROGRESS' ? 'bg-surface border-violet ring-4 ring-violet/20'
                        : m.status === 'BLOCKED'     ? 'bg-surface border-danger'
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
                          m.status === 'IN_PROGRESS' ? 'text-ink'
                          : m.status === 'DONE'      ? 'text-success'
                          : 'text-ink-muted'
                        }`}>{m.title}</p>
                        {m.dueDate && <p className="text-[10px] text-ink-faint whitespace-nowrap">{new Date(m.dueDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Deliverables */}
          <div className="bg-surface border border-line rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
              <h2 className="text-base font-semibold text-ink">Validations</h2>
              <span className="text-xs text-ink-muted">{pending} pending</span>
            </div>

            {loadingDels ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
              </div>
            ) : deliverables.length === 0 ? (
              <div className="py-10 text-center">
                <FileText className="w-7 h-7 text-ink-faint mx-auto mb-2" />
                <p className="text-sm text-ink-muted">No validations yet.</p>
                <button onClick={() => setShowModal(true)}
                  className="text-sm text-violet-glow hover:underline mt-1">Request your first validation →</button>
              </div>
            ) : (
              <table className="w-full">
                <tbody>
                  {deliverables.map((d, i) => (
                    <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className={`h-12 border-b border-line hover:bg-surface-high transition-colors ${i === deliverables.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-5 sm:px-6 text-sm font-medium text-ink">{d.title}</td>
                      <td className="px-5 sm:px-6 hidden sm:table-cell">
                        <span className="text-xs text-ink-muted">{d.type.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-5 sm:px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${VALIDATION_STYLES[d.status] ?? 'bg-white/5 text-ink-muted'}`}>
                          {d.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 sm:px-6 text-sm text-ink-muted text-right hidden sm:table-cell">
                        {d.deadline ? new Date(d.deadline).toLocaleDateString() : '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Stats */}
          <div className="bg-surface border border-line rounded-lg p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">Project Health</h2>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="38" fill="none" stroke="#2D2D3D" strokeWidth="8" />
                  <circle cx="48" cy="48" r="38" fill="none" stroke="#7c3aed" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 38 * progress / 100} ${2 * Math.PI * 38 * (1 - progress / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-ink">{progress}%</span>
                  <span className="text-[10px] text-ink-muted">Complete</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-line">
              {[
                { icon: CheckCircle2, label: 'Approved', value: approved },
                { icon: AlertCircle,  label: 'Pending',  value: pending  },
                { icon: FileText,     label: 'Total',    value: deliverables.length },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-base font-bold text-ink">{value}</p>
                  <p className="text-[11px] text-ink-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team (members from project if available) */}
          <div className="bg-surface border border-line rounded-lg p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">Project Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-ink-faint shrink-0" />
                <span className="text-sm text-ink-muted">Client ID: <span className="text-ink font-medium">{project.clientId.slice(0, 8)}…</span></span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-ink-faint shrink-0" />
                <span className="text-sm text-ink-muted">{deliverables.length} validation{deliverables.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
