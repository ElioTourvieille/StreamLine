'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, Loader2, Building2, Mail, Phone, ExternalLink, Users } from 'lucide-react'

type Client = {
  id: string
  name: string
  company?: string
  contactEmail: string
  phone?: string
  status: 'ACTIVE' | 'ARCHIVED'
  projects: number
}

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Marc Dupont',  company: 'Acme Corp', contactEmail: 'marc@acmecorp.com',   phone: '+33 6 12 34 56 78', status: 'ACTIVE',   projects: 3 },
  { id: '2', name: 'Sophie Chen',  company: 'TechFlow',  contactEmail: 'sophie@techflow.io',                             status: 'ACTIVE',   projects: 1 },
  { id: '3', name: 'Alex Martin',  company: 'Boldmix',   contactEmail: 'alex@boldmix.co',     phone: '+33 7 98 76 54 32', status: 'ACTIVE',   projects: 2 },
  { id: '4', name: 'Julie Renard', company: 'Stellar',   contactEmail: 'julie@stellar.design',                           status: 'ACTIVE',   projects: 1 },
  { id: '5', name: 'Tom Girard',   company: 'InnoWave',  contactEmail: 'tom@innowave.fr',                                status: 'ACTIVE',   projects: 1 },
  { id: '6', name: 'Camille Noir', company: 'Lexis',     contactEmail: 'cnoir@lexis.fr',      phone: '+33 1 23 45 67 89', status: 'ARCHIVED', projects: 0 },
]

// ─── New client modal ─────────────────────────────────────────────────────────

function NewClientModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Client) => void }) {
  const [form, setForm] = useState({ name: '', company: '', contactEmail: '', phone: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    onSave({ id: String(Date.now()), ...form, status: 'ACTIVE', projects: 0 })
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-line rounded-t-2xl sm:rounded-xl w-full sm:max-w-md"
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
          <h2 className="text-base sm:text-lg font-semibold text-ink">New Client</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {[
            { label: 'Contact Name', key: 'name',         required: true,  placeholder: 'Jean Dupont' },
            { label: 'Company',      key: 'company',      required: false, placeholder: 'Acme Corp' },
            { label: 'Email',        key: 'contactEmail', required: true,  placeholder: 'contact@company.com', type: 'email' },
            { label: 'Phone',        key: 'phone',        required: false, placeholder: '+33 6 00 00 00 00' },
          ].map(({ label, key, required, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">
                {label} {required && <span className="text-danger">*</span>}
              </label>
              <input
                type={type ?? 'text'}
                required={required}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-surface-high hover:bg-surface border border-line text-ink-dim text-sm font-medium py-2.5 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-violet hover:bg-violet-hover text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Client
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ isSearch, onAdd }: { isSearch: boolean; onAdd: () => void }) {
  if (isSearch) {
    return (
      <div className="py-16 flex flex-col items-center text-center">
        <Search className="w-8 h-8 text-ink-faint mb-3" />
        <p className="text-ink-muted text-sm font-medium mb-1">No results</p>
        <p className="text-ink-faint text-xs">Try a different name, company or email.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="py-16 flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center mb-4">
        <Users className="w-7 h-7 text-violet/50" />
      </div>
      <p className="text-ink font-semibold text-base mb-1">No clients yet</p>
      <p className="text-ink-muted text-sm max-w-xs mb-6 leading-relaxed">
        Add your first client to start a project and send them a portal link.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" />
        Add your first client
      </button>
    </motion.div>
  )
}

// ─── Clients page ─────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [clients, setClients]     = useState<Client[]>(MOCK_CLIENTS)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered   = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  )
  const isEmpty    = clients.length === 0
  const isNoResult = !isEmpty && filtered.length === 0

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      <AnimatePresence>
        {showModal && (
          <NewClientModal
            onClose={() => setShowModal(false)}
            onSave={c => { setClients(prev => [c, ...prev]); setShowModal(false) }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6 sm:mb-8"
      >
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight leading-tight">Clients</h1>
          <p className="text-ink-muted text-sm mt-1">
            {clients.filter(c => c.status === 'ACTIVE').length} active clients
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Client</span>
          <span className="sm:hidden">New</span>
        </button>
      </motion.div>

      {/* Search */}
      {!isEmpty && (
        <div className="relative mb-5 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-line rounded-lg pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
          />
        </div>
      )}

      {/* Content */}
      {isEmpty || isNoResult ? (
        <EmptyState isSearch={isNoResult} onAdd={() => setShowModal(true)} />
      ) : (
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-line">
            {filtered.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-xs font-bold text-violet-glow shrink-0">
                  {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-ink truncate">{c.name}</p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      c.status === 'ACTIVE' ? 'bg-success/15 text-success' : 'bg-white/10 text-ink-muted'
                    }`}>
                      {c.status === 'ACTIVE' ? 'Active' : 'Archived'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted truncate mt-0.5">
                    {c.company ? `${c.company} · ` : ''}{c.contactEmail}
                  </p>
                </div>
                <button className="text-ink-faint hover:text-ink transition-colors shrink-0 p-1">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="border-b border-line">
                {['Client', 'Company', 'Email', 'Phone', 'Projects', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`h-12 border-b border-line hover:bg-surface-high transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                >
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
                    <div className="flex items-center gap-1.5 text-sm text-ink-muted">
                      <Mail className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                      {c.contactEmail}
                    </div>
                  </td>
                  <td className="px-6">
                    {c.phone
                      ? <div className="flex items-center gap-1.5 text-sm text-ink-muted"><Phone className="w-3.5 h-3.5 text-ink-faint shrink-0" />{c.phone}</div>
                      : <span className="text-ink-faint text-sm">—</span>}
                  </td>
                  <td className="px-6 text-sm text-ink">{c.projects}</td>
                  <td className="px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      c.status === 'ACTIVE' ? 'bg-success/15 text-success' : 'bg-white/10 text-ink-muted'
                    }`}>
                      {c.status === 'ACTIVE' ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-6">
                    <button className="text-ink-faint hover:text-ink transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
