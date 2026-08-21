'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, Building2, Mail, Phone, Send, Loader2,
  FolderOpen, MessageSquare, StickyNote,
} from 'lucide-react'
import { api, type Project, type ClientNote } from '@/lib/api'
import { useApiData } from '@/lib/hooks'
import { formatDate } from '@/lib/format'
import { STATUS_CONFIG, StatusDropdown, InviteModal } from '../_components'

const PROJECT_STATUS_LABEL: Record<string, string> = {
  DRAFT:       'Brouillon',
  ON_TRACK:    'Dans les temps',
  AT_RISK:     'À risque',
  OVERDUE:     'En retard',
  IN_PROGRESS: 'En cours',
  COMPLETED:   'Terminé',
}

const PROJECT_STATUS_STYLE: Record<string, string> = {
  DRAFT:       'bg-ink/5 text-ink-muted',
  ON_TRACK:    'bg-success/8 text-success',
  AT_RISK:     'bg-warning/8 text-warning',
  OVERDUE:     'bg-danger/8 text-danger',
  IN_PROGRESS: 'bg-violet/15 text-violet-glow',
  COMPLETED:   'bg-info/8 text-info',
}

function milestoneProgress(project: Project) {
  const ms = project.milestones ?? []
  if (!ms.length) return 0
  return Math.round(ms.filter(m => m.status === 'COMPLETED').length / ms.length * 100)
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()

  const fetchClient   = useCallback(() => api.clients.get(id), [id])
  const fetchProjects = useCallback(() => api.projects.list(id), [id])
  const fetchNotes    = useCallback(() => api.clients.notes.list(id), [id])

  const { data: client,   loading: loadingClient }   = useApiData(fetchClient)
  const { data: projects, loading: loadingProjects } = useApiData(fetchProjects)
  const { data: apiNotes, loading: loadingNotes }    = useApiData(fetchNotes)

  const [localStatus, setLocalStatus] = useState<string | null>(null)
  const [localNotes, setLocalNotes]   = useState<ClientNote[] | null>(null)
  const [noteText, setNoteText]       = useState('')
  const [savingNote, setSavingNote]   = useState(false)
  const [showInvite, setShowInvite]   = useState(false)

  const notes = localNotes ?? apiNotes ?? []

  async function handleStatusChange(newStatus: string) {
    if (!client) return
    setLocalStatus(newStatus)
    try {
      await api.clients.update(client.id, { status: newStatus as typeof client.status })
    } catch {
      setLocalStatus(client.status)
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteText.trim() || !client) return
    setSavingNote(true)
    try {
      const note = await api.clients.notes.add(client.id, noteText.trim())
      setLocalNotes([note, ...notes])
      setNoteText('')
    } catch {
      // keep the draft in the textarea so the user can retry
    } finally {
      setSavingNote(false)
    }
  }

  if (loadingClient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink-muted">Client introuvable.</p>
        <Link href="/clients" className="text-violet-glow text-sm mt-2 inline-block">← Retour aux clients</Link>
      </div>
    )
  }

  const status = (localStatus ?? client.status) as typeof client.status
  const initials = client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      <AnimatePresence>
        {showInvite && <InviteModal client={{ ...client, status }} onClose={() => setShowInvite(false)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <Link href="/clients" className="text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-8 h-8 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-xs font-bold text-violet-glow shrink-0">
          {initials}
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">{client.name}</h1>
        <StatusDropdown client={{ ...client, status }} onChange={s => { void handleStatusChange(s) }} />
        <div className="ml-auto">
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors active:scale-[0.98]">
            <Send className="w-4 h-4" /><span className="hidden sm:inline">Lien du portail</span><span className="sm:hidden">Portail</span>
          </button>
        </div>
      </div>
      {client.company && <p className="text-ink-muted text-sm ml-11">{client.company}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 sm:gap-6 mt-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Projects */}
          <div className="bg-surface border border-line rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-line">
              <FolderOpen className="w-4 h-4 text-ink-muted" />
              <h2 className="text-base font-semibold text-ink">Projets</h2>
            </div>
            {loadingProjects ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
              </div>
            ) : !projects || projects.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-ink-muted">Aucun projet pour ce client pour l’instant.</p>
                <Link href="/projects/new" className="text-sm text-violet-glow hover:underline mt-1 inline-block">
                  Créer un projet →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {projects.map(p => {
                  const progress = milestoneProgress(p)
                  return (
                    <Link key={p.id} href={`/projects/${p.id}`}
                      className="flex items-center gap-3 px-5 sm:px-6 py-3.5 hover:bg-surface-high transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="h-1 w-24 bg-line rounded-full">
                            <div className="h-full bg-violet rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[11px] text-ink-faint">{progress}%</span>
                        </div>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${PROJECT_STATUS_STYLE[p.status] ?? 'bg-ink/5 text-ink-muted'}`}>
                        {PROJECT_STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notes / activity log */}
          <div className="bg-surface border border-line rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-line">
              <StickyNote className="w-4 h-4 text-ink-muted" />
              <h2 className="text-base font-semibold text-ink">Notes internes</h2>
            </div>
            <div className="p-5 sm:p-6">
              <form onSubmit={handleAddNote} className="flex flex-col gap-2 mb-5">
                <textarea rows={2} value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Ajouter une note — appel, contexte, prochaine étape…"
                  className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors resize-none" />
                <button type="submit" disabled={savingNote || !noteText.trim()}
                  className="self-end flex items-center gap-2 bg-violet hover:bg-violet-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                  {savingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Ajouter la note
                </button>
              </form>

              {loadingNotes ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
                </div>
              ) : notes.length === 0 ? (
                <p className="text-sm text-ink-faint text-center py-6">Aucune note pour l’instant — visible uniquement par votre équipe.</p>
              ) : (
                <div className="space-y-4">
                  {notes.map(n => (
                    <div key={n.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-surface-high border border-line flex items-center justify-center text-[10px] font-bold text-ink-muted shrink-0">
                        {n.authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink-dim">
                          {n.authorName} <span className="font-normal text-ink-faint">{formatDate(n.createdAt)}</span>
                        </p>
                        <p className="text-sm text-ink-dim mt-0.5 whitespace-pre-wrap">{n.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="bg-surface border border-line rounded-lg p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">Coordonnées</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-ink-faint shrink-0" />
                <span className="text-sm text-ink-muted truncate">{client.contactEmail}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-ink-faint shrink-0" />
                  <span className="text-sm text-ink-muted">{client.phone}</span>
                </div>
              )}
              {client.company && (
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-ink-faint shrink-0" />
                  <span className="text-sm text-ink-muted">{client.company}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface border border-line rounded-lg p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">Aperçu</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-ink">{projects?.length ?? 0}</p>
                <p className="text-[11px] text-ink-muted">Projets</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-ink">{notes.length}</p>
                <p className="text-[11px] text-ink-muted">Notes</p>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-lg p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">Statut</h2>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_CONFIG[status]?.className ?? ''}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {STATUS_CONFIG[status]?.label ?? status}
            </span>
          </div>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-ink-faint mt-6">
        <MessageSquare className="w-3.5 h-3.5" />
        Les notes ci-dessus sont internes — jamais visibles par {client.name} dans le portail.
      </p>
    </div>
  )
}
