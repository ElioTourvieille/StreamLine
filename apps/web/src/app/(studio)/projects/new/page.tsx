'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, ArrowLeft, Loader2, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { useApiData } from '@/lib/hooks'

type MilestoneLocal = { id: string; title: string; dueDate: string }

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
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({ name: '', clientId: '', description: '', startDate: '', endDate: '' })
  const [milestones, setMilestones] = useState<MilestoneLocal[]>([
    { id: '1', title: 'Découverte & Brief', dueDate: '' },
    { id: '2', title: 'Validation design', dueDate: '' },
    { id: '3', title: 'Développement', dueDate: '' },
    { id: '4', title: 'Lancement', dueDate: '' },
  ])

  const fetchClients = useCallback(() => api.clients.list(), [])
  const { data: clients, loading: loadingClients } = useApiData(fetchClients)

  function addMilestone() {
    setMilestones(prev => [...prev, { id: String(Date.now()), title: '', dueDate: '' }])
  }

  function removeMilestone(id: string) {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  function updateMilestone(id: string, key: keyof MilestoneLocal, value: string) {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, [key]: value } : m))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const milestonePayload = milestones
        .filter(m => m.title.trim())
        .map(({ title, dueDate }) => ({ title, dueDate: dueDate || undefined }))

      const project = await api.projects.create({
        name:        form.name,
        clientId:    form.clientId,
        description: form.description || undefined,
        startDate:   form.startDate || undefined,
        endDate:     form.endDate || undefined,
        milestones:  milestonePayload,
      })
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du projet')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <Link href="/projects"
        className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />Retour aux projets
      </Link>

      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-ink tracking-tight">Nouveau projet</h1>
        <p className="text-ink-muted text-sm mt-1">Configurez un projet avec ses jalons et associez-le à un client.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General */}
        <div className="bg-surface border border-line rounded-lg p-6 space-y-5">
          <h2 className="text-sm font-semibold text-ink-dim uppercase tracking-widest">Général</h2>

          <Field label="Nom du projet" required>
            <input type="text" required placeholder="Refonte e-commerce 2026" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={INPUT} />
          </Field>

          <Field label="Client" required>
            <select required value={form.clientId}
              onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
              disabled={loadingClients}
              className={INPUT + ' appearance-none cursor-pointer disabled:opacity-60'}>
              <option value="">{loadingClients ? 'Chargement des clients…' : 'Sélectionner un client…'}</option>
              {(clients ?? []).map(c => (
                <option key={c.id} value={c.id}>{c.company ? `${c.company} — ` : ''}{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea rows={3} placeholder="Décrivez brièvement le périmètre et les objectifs du projet…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className={INPUT + ' resize-none'} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date de début">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <input type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className={INPUT + ' pl-9 [scheme:dark]'} />
              </div>
            </Field>
            <Field label="Date de fin">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
                <input type="date" value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className={INPUT + ' pl-9 [scheme:dark]'} />
              </div>
            </Field>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-surface border border-line rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-ink-dim uppercase tracking-widest">Jalons</h2>
            <button type="button" onClick={addMilestone}
              className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink border border-line hover:border-line-dim rounded-md px-3 py-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" />Ajouter un jalon
            </button>
          </div>

          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 group">
                <div className="w-6 h-6 rounded-full border-2 border-line flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-ink-faint">{i + 1}</span>
                </div>
                <input type="text" placeholder={`Jalon ${i + 1}`} value={m.title}
                  onChange={e => updateMilestone(m.id, 'title', e.target.value)}
                  className="flex-1 bg-bg border border-line rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
                  <input type="date" value={m.dueDate}
                    onChange={e => updateMilestone(m.id, 'dueDate', e.target.value)}
                    className="bg-bg border border-line rounded-md pl-8 pr-3 py-2 text-sm text-ink focus:outline-none focus:border-violet transition-colors [scheme:dark] w-36 sm:w-40" />
                </div>
                <button type="button" onClick={() => removeMilestone(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-danger transition-all p-1.5 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/projects"
            className="flex-1 text-center bg-surface-high hover:bg-surface-higher border border-line text-ink-dim text-sm font-medium py-2.5 rounded-md transition-colors">
            Annuler
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 bg-violet hover:bg-violet-hover text-white text-sm font-semibold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}Créer le projet
          </button>
        </div>
      </form>
    </div>
  )
}
