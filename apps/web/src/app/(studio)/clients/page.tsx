'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, X, Loader2, Building2, Mail, Phone,
  ExternalLink, Users, Copy, Check, Send, ChevronDown,
} from 'lucide-react'
import { api, type Client, type ClientStatus } from '@/lib/api'
import { useApiData } from '@/lib/hooks'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ClientStatus, { label: string; className: string }> = {
  ACTIVE:      { label: 'Actif',        className: 'bg-success/8 text-success border-success/30' },
  FOLLOW_UP:   { label: 'À relancer',   className: 'bg-warning/8 text-warning border-warning/30' },
  MAINTENANCE: { label: 'Maintenance',  className: 'bg-info/8 text-info border-info/30' },
  COMPLETED:   { label: 'Terminé',      className: 'bg-violet/15 text-violet-glow border-violet/30' },
  ARCHIVED:    { label: 'Archivé',      className: 'bg-ink/5 text-ink-muted border-line' },
}

const TABS: { key: ClientStatus | 'ALL'; label: string }[] = [
  { key: 'ALL',         label: 'Tous' },
  { key: 'ACTIVE',      label: 'Actif' },
  { key: 'FOLLOW_UP',   label: 'À relancer' },
  { key: 'MAINTENANCE', label: 'Maintenance' },
  { key: 'COMPLETED',   label: 'Terminé' },
  { key: 'ARCHIVED',    label: 'Archivé' },
]

// ─── Status dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({ client, onChange }: { client: Client; onChange: (s: ClientStatus) => void }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[client.status] ?? STATUS_CONFIG.ACTIVE

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${cfg.className}`}
      >
        {cfg.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute left-0 top-full mt-1 z-20 bg-surface border border-line rounded-lg shadow-xl overflow-hidden min-w-[140px]"
            >
              {(Object.entries(STATUS_CONFIG) as [ClientStatus, typeof STATUS_CONFIG[ClientStatus]][]).map(([key, s]) => (
                <button
                  key={key}
                  onClick={e => { e.stopPropagation(); onChange(key); setOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-surface-high flex items-center gap-2 ${client.status === key ? 'text-ink' : 'text-ink-muted'}`}
                >
                  <span className={`w-2 h-2 rounded-full border ${s.className}`} />
                  {s.label}
                  {client.status === key && <Check className="w-3 h-3 ml-auto text-violet-glow" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── New client modal ─────────────────────────────────────────────────────────

function NewClientModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Client) => void }) {
  const [form, setForm] = useState({ name: '', company: '', contactEmail: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const created = await api.clients.create({ name: form.name, contactEmail: form.contactEmail, company: form.company || undefined, phone: form.phone || undefined })
      onSave(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du client')
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
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-line rounded-t-2xl sm:rounded-xl w-full sm:max-w-md"
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
          <h2 className="text-base sm:text-lg font-semibold text-ink">Nouveau client</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors p-1"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {[
            { label: 'Nom du contact', key: 'name',         required: true,  placeholder: 'Jean Dupont' },
            { label: 'Entreprise',     key: 'company',      required: false, placeholder: 'Acme Corp' },
            { label: 'E-mail',         key: 'contactEmail', required: true,  placeholder: 'contact@entreprise.com', type: 'email' },
            { label: 'Téléphone',      key: 'phone',        required: false, placeholder: '+41 22 000 00 00' },
          ].map(({ label, key, required, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">
                {label} {required && <span className="text-danger">*</span>}
              </label>
              <input type={type ?? 'text'} required={required} placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
            </div>
          ))}
          {error && <p className="text-danger text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-surface-high hover:bg-surface border border-line text-ink-dim text-sm font-medium py-2.5 rounded-lg transition-colors">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-violet hover:bg-violet-hover text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Créer le client
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [form, setForm] = useState({ email: client.contactEmail, name: client.name })
  const [loading, setLoading] = useState(false)
  const [portalUrl, setPortalUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.clients.invite(client.id, form)
      setPortalUrl(res.portalUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du lien')
    } finally {
      setLoading(false)
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          <h2 className="text-base font-semibold text-ink">Envoyer le lien du portail</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 sm:p-6">
          {!portalUrl ? (
            <form onSubmit={handleInvite} className="space-y-4">
              <p className="text-sm text-ink-muted">Générez un lien de portail sécurisé pour <span className="text-ink font-medium">{client.name}</span>. Il y accède sans avoir besoin de compte.</p>
              <div>
                <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">E-mail du client <span className="text-danger">*</span></label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-violet transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">Nom du client <span className="text-danger">*</span></label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-violet transition-colors" />
              </div>
              {error && <p className="text-danger text-sm">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 bg-surface-high border border-line text-ink-dim text-sm font-medium py-2.5 rounded-lg transition-colors">Annuler</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-violet hover:bg-violet-hover text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Générer le lien
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
                <Check className="w-4 h-4 text-success shrink-0" />
                <p className="text-sm text-success font-medium">Lien du portail généré !</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted mb-2">Partagez ce lien avec {form.name} :</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-bg border border-line rounded-lg px-3 py-2 text-xs text-violet-glow truncate">
                    {portalUrl}
                  </code>
                  <button onClick={copyUrl}
                    className="shrink-0 bg-surface-high hover:bg-surface-higher border border-line px-3 py-2 rounded-lg text-ink-muted hover:text-ink transition-colors">
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-ink-faint">Lien valable 90 jours. Le client y accède sans créer de compte.</p>
              <button onClick={onClose}
                className="w-full bg-surface-high hover:bg-surface border border-line text-ink text-sm font-medium py-2.5 rounded-lg transition-colors">Terminé</button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ isSearch, tab, onAdd }: { isSearch: boolean; tab: string; onAdd: () => void }) {
  if (isSearch) return (
    <div className="py-16 flex flex-col items-center text-center">
      <Search className="w-8 h-8 text-ink-faint mb-3" />
      <p className="text-ink-muted text-sm font-medium mb-1">Aucun résultat</p>
      <p className="text-ink-faint text-xs">Essayez un autre nom, entreprise ou e-mail.</p>
    </div>
  )
  const isTabFilter = tab !== 'ALL'
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="py-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center mb-4">
        <Users className="w-7 h-7 text-violet/50" />
      </div>
      {isTabFilter ? (
        <>
          <p className="text-ink font-semibold text-base mb-1">Aucun client « {STATUS_CONFIG[tab as ClientStatus]?.label ?? tab.toLowerCase()} »</p>
          <p className="text-ink-muted text-sm max-w-xs mb-4 leading-relaxed">Aucun client avec ce statut pour l’instant.</p>
        </>
      ) : (
        <>
          <p className="text-ink font-semibold text-base mb-1">Aucun client pour l’instant</p>
          <p className="text-ink-muted text-sm max-w-xs mb-6 leading-relaxed">Ajoutez votre premier client pour démarrer un projet et lui envoyer un lien de portail.</p>
          <button onClick={onAdd}
            className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]">
            <Plus className="w-4 h-4" />Ajouter votre premier client
          </button>
        </>
      )}
    </motion.div>
  )
}

// ─── Clients page ─────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const router = useRouter()
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState<ClientStatus | 'ALL'>('ALL')
  const [showNew, setShowNew]     = useState(false)
  const [inviteClient, setInviteClient] = useState<Client | null>(null)
  const [localClients, setLocalClients] = useState<Client[] | null>(null)

  const fetchClients = useCallback(() => api.clients.list(), [])
  const { data: apiClients, loading, error } = useApiData(fetchClients)

  const clients = localClients ?? apiClients ?? []

  const tabCounts = TABS.reduce<Record<string, number>>((acc, t) => {
    acc[t.key] = t.key === 'ALL' ? clients.length : clients.filter(c => c.status === t.key).length
    return acc
  }, {})

  const filtered = clients
    .filter(c => activeTab === 'ALL' || c.status === activeTab)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(search.toLowerCase())
    )

  const isEmpty    = !loading && clients.length === 0
  const isNoResult = !isEmpty && filtered.length === 0

  async function handleStatusChange(client: Client, newStatus: ClientStatus) {
    setLocalClients(prev => (prev ?? clients).map(c => c.id === client.id ? { ...c, status: newStatus } : c))
    try {
      await api.clients.update(client.id, { status: newStatus })
    } catch {
      setLocalClients(prev => (prev ?? clients).map(c => c.id === client.id ? { ...c, status: client.status } : c))
    }
  }

  if (error?.includes('401') || error?.includes('Unauthorized')) {
    localStorage.removeItem('sl_token')
    router.push('/login')
  }

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      <AnimatePresence>
        {showNew && (
          <NewClientModal
            onClose={() => setShowNew(false)}
            onSave={c => { setLocalClients(prev => [c, ...(prev ?? clients)]); setShowNew(false) }}
          />
        )}
        {inviteClient && <InviteModal client={inviteClient} onClose={() => setInviteClient(null)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight leading-tight">Clients</h1>
          <p className="text-ink-muted text-sm mt-1">{clients.filter(c => c.status === 'ACTIVE').length} clients actifs</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98] shrink-0">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">Nouveau client</span><span className="sm:hidden">Nouveau</span>
        </button>
      </motion.div>

      {/* Tabs */}
      {!isEmpty && (
        <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0',
                activeTab === tab.key
                  ? 'bg-surface-high text-ink'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-high/50',
              ].join(' ')}
            >
              {tab.label}
              {tabCounts[tab.key] > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.key ? 'bg-violet/20 text-violet-glow' : 'bg-line text-ink-muted'}`}>
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
        </div>
      ) : isEmpty || isNoResult ? (
        <>
          {!isEmpty && (
            <div className="relative mb-5 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
              <input type="text" placeholder="Rechercher un client..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface border border-line rounded-lg pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
            </div>
          )}
          <EmptyState isSearch={isNoResult} tab={activeTab} onAdd={() => setShowNew(true)} />
        </>
      ) : (
        <>
          <div className="relative mb-5 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
            <input type="text" placeholder="Rechercher un client..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-line rounded-lg pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
          </div>

          <div className="bg-surface border border-line rounded-xl">
            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-line">
              {filtered.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-xs font-bold text-violet-glow shrink-0">
                    {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{c.name}</p>
                    <p className="text-xs text-ink-muted truncate mt-0.5">{c.company ? `${c.company} · ` : ''}{c.contactEmail}</p>
                  </div>
                  <StatusDropdown client={c} onChange={s => { void handleStatusChange(c, s) }} />
                  <button onClick={() => setInviteClient(c)}
                    className="shrink-0 text-ink-faint hover:text-violet transition-colors p-1" title="Envoyer le lien du portail">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="border-b border-line">
                  {['Client', 'Entreprise', 'E-mail', 'Téléphone', 'Statut', ''].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className={`h-12 border-b border-line hover:bg-surface-high transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-[11px] font-bold text-violet-glow shrink-0">
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6">
                      {c.company
                        ? <div className="flex items-center gap-1.5 text-sm text-ink-dim"><Building2 className="w-3.5 h-3.5 text-ink-faint shrink-0" />{c.company}</div>
                        : <span className="text-ink-faint text-sm">—</span>}
                    </td>
                    <td className="px-6">
                      <div className="flex items-center gap-1.5 text-sm text-ink-muted"><Mail className="w-3.5 h-3.5 text-ink-faint shrink-0" />{c.contactEmail}</div>
                    </td>
                    <td className="px-6">
                      {c.phone
                        ? <div className="flex items-center gap-1.5 text-sm text-ink-muted"><Phone className="w-3.5 h-3.5 text-ink-faint shrink-0" />{c.phone}</div>
                        : <span className="text-ink-faint text-sm">—</span>}
                    </td>
                    <td className="px-6">
                      <StatusDropdown client={c} onChange={s => { void handleStatusChange(c, s) }} />
                    </td>
                    <td className="px-6">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setInviteClient(c)} title="Envoyer le lien du portail"
                          className="text-ink-faint hover:text-violet transition-colors flex items-center gap-1.5 text-xs font-medium">
                          <Send className="w-3.5 h-3.5" /><span className="hidden lg:inline">Lien du portail</span>
                        </button>
                        <ExternalLink className="w-3.5 h-3.5 text-ink-faint hover:text-ink transition-colors cursor-pointer" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
