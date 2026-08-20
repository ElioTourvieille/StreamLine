'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, Loader2, FolderOpen, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { api, type Client } from '@/lib/api'
import { useApiData } from '@/lib/hooks'
import { formatDate } from '@/lib/format'

const STATUS_STYLE: Record<string, string> = {
  ON_TRACK:   'bg-success/8 text-success',
  AT_RISK:    'bg-warning/8 text-warning',
  OVERDUE:    'bg-danger/8 text-danger',
  COMPLETED:  'bg-info/8 text-info',
  IN_PROGRESS:'bg-violet/15 text-violet-glow',
}

const STATUS_LABEL: Record<string, string> = {
  ON_TRACK:   'Dans les temps',
  AT_RISK:    'À risque',
  OVERDUE:    'En retard',
  COMPLETED:  'Terminé',
  IN_PROGRESS:'En cours',
}

function EmptyState({ isSearch }: { isSearch: boolean }) {
  if (isSearch) return (
    <div className="py-16 flex flex-col items-center text-center">
      <Search className="w-8 h-8 text-ink-faint mb-3" />
      <p className="text-ink-muted text-sm font-medium mb-1">Aucun résultat</p>
      <p className="text-ink-faint text-xs">Essayez un autre nom de projet ou statut.</p>
    </div>
  )
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="py-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center mb-4">
        <FolderOpen className="w-7 h-7 text-violet/50" />
      </div>
      <p className="text-ink font-semibold text-base mb-1">Aucun projet pour l’instant</p>
      <p className="text-ink-muted text-sm max-w-xs mb-6 leading-relaxed">Créez votre premier projet pour suivre les livrables et les validations clients.</p>
      <Link href="/projects/new"
        className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]">
        <Plus className="w-4 h-4" />Créer votre premier projet
      </Link>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('')

  const fetchProjects = useCallback(() => api.projects.list(), [])
  const fetchClients  = useCallback(() => api.clients.list(), [])
  const { data: projects, loading } = useApiData(fetchProjects)
  const { data: clients }           = useApiData(fetchClients)

  const clientMap = Object.fromEntries((clients ?? []).map((c: Client) => [c.id, c]))

  const filtered = (projects ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (clientMap[p.clientId]?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (clientMap[p.clientId]?.company ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const total     = projects?.length ?? 0
  const active    = (projects ?? []).filter(p => !['COMPLETED'].includes(p.status)).length
  const isEmpty   = !loading && total === 0
  const isNoResult= !isEmpty && filtered.length === 0

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight leading-tight">Projets</h1>
          <p className="text-ink-muted text-sm mt-1">{active} projet{active !== 1 ? 's' : ''} actif{active !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/projects/new"
          className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98] shrink-0">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">Nouveau projet</span><span className="sm:hidden">Nouveau</span>
        </Link>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
        </div>
      ) : isEmpty || isNoResult ? (
        <>
          {!isEmpty && (
            <div className="relative mb-5 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
              <input type="text" placeholder="Rechercher un projet…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface border border-line rounded-lg pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
            </div>
          )}
          <EmptyState isSearch={isNoResult} />
        </>
      ) : (
        <>
          <div className="relative mb-5 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
            <input type="text" placeholder="Rechercher un projet…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-line rounded-lg pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
          </div>

          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-line">
              {filtered.map(p => {
                const client = clientMap[p.clientId]
                return (
                  <Link key={p.id} href={`/projects/${p.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-high transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-4 h-4 text-violet/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                      <p className="text-xs text-ink-muted truncate mt-0.5">{client?.company ?? client?.name ?? '—'}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[p.status] ?? 'bg-ink/5 text-ink-muted'}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </Link>
                )
              })}
            </div>

            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="border-b border-line">
                  {['Projet', 'Client', 'Statut', 'Début', 'Fin', ''].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const client = clientMap[p.clientId]
                  const isLast = i === filtered.length - 1
                  return (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className={`h-12 border-b border-line hover:bg-surface-high transition-colors cursor-pointer ${isLast ? 'border-b-0' : ''}`}
                      onClick={() => window.location.href = `/projects/${p.id}`}>
                      <td className="px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center shrink-0">
                            <FolderOpen className="w-3.5 h-3.5 text-violet/60" />
                          </div>
                          <span className="text-sm font-medium text-ink">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6">
                        <span className="text-sm text-ink-muted">{client?.company ?? client?.name ?? '—'}</span>
                      </td>
                      <td className="px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[p.status] ?? 'bg-ink/5 text-ink-muted'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="px-6">
                        {p.startDate
                          ? <div className="flex items-center gap-1.5 text-sm text-ink-muted"><Clock className="w-3.5 h-3.5 text-ink-faint" />{formatDate(p.startDate)}</div>
                          : <span className="text-ink-faint text-sm">—</span>}
                      </td>
                      <td className="px-6">
                        {p.endDate
                          ? <div className="flex items-center gap-1.5 text-sm text-ink-muted"><CheckCircle2 className="w-3.5 h-3.5 text-ink-faint" />{formatDate(p.endDate)}</div>
                          : <span className="text-ink-faint text-sm">—</span>}
                      </td>
                      <td className="px-6">
                        <AlertCircle className="w-3.5 h-3.5 text-ink-faint hover:text-ink transition-colors" />
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
