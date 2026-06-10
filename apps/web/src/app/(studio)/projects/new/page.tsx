'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, ArrowLeft, Loader2, Calendar } from 'lucide-react'

type Milestone = { id: string; title: string; dueDate: string }

const MOCK_CLIENTS = [
  { id: '1', name: 'Marc Dupont', company: 'Acme Corp' },
  { id: '2', name: 'Sophie Chen', company: 'TechFlow' },
  { id: '3', name: 'Alex Martin', company: 'Boldmix' },
  { id: '4', name: 'Julie Renard', company: 'Stellar' },
  { id: '5', name: 'Tom Girard', company: 'InnoWave' },
]

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-dim mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  )
}

const INPUT = 'w-full bg-bg border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    clientId: '',
    description: '',
    startDate: '',
    endDate: '',
  })
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: 'Discovery & Brief', dueDate: '' },
    { id: '2', title: 'Design Validation', dueDate: '' },
    { id: '3', title: 'Development', dueDate: '' },
    { id: '4', title: 'Launch', dueDate: '' },
  ])

  function addMilestone() {
    setMilestones(prev => [...prev, { id: String(Date.now()), title: '', dueDate: '' }])
  }

  function removeMilestone(id: string) {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  function updateMilestone(id: string, key: keyof Milestone, value: string) {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, [key]: value } : m))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    router.push('/projects/demo-0')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-ink tracking-tight">New Project</h1>
        <p className="text-ink-muted text-sm mt-1">Set up a project with milestones and assign it to a client.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: General */}
        <div className="bg-surface border border-line rounded-lg p-6 space-y-5">
          <h2 className="text-sm font-semibold text-ink-dim uppercase tracking-widest">General</h2>

          <Field label="Project Name" required>
            <input type="text" required placeholder="E-Commerce Redesign 2026" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={INPUT} />
          </Field>

          <Field label="Client" required>
            <select required value={form.clientId}
              onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
              className={INPUT + ' appearance-none cursor-pointer'}>
              <option value="">Select a client…</option>
              {MOCK_CLIENTS.map(c => (
                <option key={c.id} value={c.id}>{c.company} — {c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea rows={3} placeholder="Briefly describe the project scope and goals…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className={INPUT + ' resize-none'} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <input type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className={INPUT + ' pl-9 [color-scheme:dark]'} />
              </div>
            </Field>
            <Field label="End Date">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <input type="date" value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className={INPUT + ' pl-9 [color-scheme:dark]'} />
              </div>
            </Field>
          </div>
        </div>

        {/* Section: Milestones */}
        <div className="bg-surface border border-line rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-ink-dim uppercase tracking-widest">Milestones</h2>
            <button type="button" onClick={addMilestone}
              className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink border border-line hover:border-line-dim rounded-md px-3 py-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </button>
          </div>

          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 group">
                <div className="w-6 h-6 rounded-full border-2 border-line flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-ink-faint">{i + 1}</span>
                </div>
                <input
                  type="text"
                  placeholder={`Milestone ${i + 1}`}
                  value={m.title}
                  onChange={e => updateMilestone(m.id, 'title', e.target.value)}
                  className="flex-1 bg-bg border border-line rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
                />
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
                  <input
                    type="date"
                    value={m.dueDate}
                    onChange={e => updateMilestone(m.id, 'dueDate', e.target.value)}
                    className="bg-bg border border-line rounded-md pl-8 pr-3 py-2 text-sm text-ink focus:outline-none focus:border-violet transition-colors [color-scheme:dark] w-40"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMilestone(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-danger transition-all p-1.5 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard"
            className="flex-1 text-center bg-surface-high hover:bg-surface-higher border border-line text-ink-dim text-sm font-medium py-2.5 rounded-md transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 bg-violet hover:bg-violet-hover text-white text-sm font-semibold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Project
          </button>
        </div>
      </form>
    </div>
  )
}
