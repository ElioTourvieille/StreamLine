'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, X, Loader2, Building2, Mail, Phone,
  ExternalLink, Users, Copy, Check, Send,
} from 'lucide-react'
import { api, type Client } from '@/lib/api'
import { useApiData } from '@/lib/hooks'

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
      setError(err instanceof Error ? err.message : 'Error creating client')
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
          <h2 className="text-base sm:text-lg font-semibold text-ink">New Client</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors p-1"><X className="w-5 h-5" /></button>
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
              <input type={type ?? 'text'} required={required} placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
            </div>
          ))}
          {error && <p className="text-danger text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-surface-high hover:bg-surface border border-line text-ink-dim text-sm font-medium py-2.5 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-violet hover:bg-violet-hover text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Create Client
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
      setError(err instanceof Error ? err.message : 'Error generating portal link')
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
          <h2 className="text-base font-semibold text-ink">Send Portal Link</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 sm:p-6">
          {!portalUrl ? (
            <form onSubmit={handleInvite} className="space-y-4">
              <p className="text-sm text-ink-muted">Generate a secure portal link for <span className="text-ink font-medium">{client.name}</span>. They can access it without an account.</p>
              <div>
                <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">Client email <span className="text-danger">*</span></label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-violet transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">Client name <span className="text-danger">*</span></label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-violet transition-colors" />
              </div>
              {error && <p className="text-danger text-sm">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 bg-surface-high border border-line text-ink-dim text-sm font-medium py-2.5 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-violet hover:bg-violet-hover text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Generate Link
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
                <Check className="w-4 h-4 text-success shrink-0" />
                <p className="text-sm text-success font-medium">Portal link generated!</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted mb-2">Share this link with {form.name}:</p>
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
              <p className="text-xs text-ink-faint">Link valid for 90 days. The client can access it without creating an account.</p>
              <button onClick={onClose}
                className="w-full bg-surface-high hover:bg-surface border border-line text-ink text-sm font-medium py-2.5 rounded-lg transition-colors">Done</button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ isSearch, onAdd }: { isSearch: boolean; onAdd: () => void }) {
  if (isSearch) return (
    <div className="py-16 flex flex-col items-center text-center">
      <Search className="w-8 h-8 text-ink-faint mb-3" />
      <p className="text-ink-muted text-sm font-medium mb-1">No results</p>
      <p className="text-ink-faint text-xs">Try a different name, company or email.</p>
    </div>
  )
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="py-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center mb-4">
        <Users className="w-7 h-7 text-violet/50" />
      </div>
      <p className="text-ink font-semibold text-base mb-1">No clients yet</p>
      <p className="text-ink-muted text-sm max-w-xs mb-6 leading-relaxed">Add your first client to start a project and send them a portal link.</p>
      <button onClick={onAdd}
        className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]">
        <Plus className="w-4 h-4" />Add your first client
      </button>
    </motion.div>
  )
}

// ─── Clients page ─────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const router = useRouter()
  const [search, setSearch]       = useState('')
  const [showNew, setShowNew]     = useState(false)
  const [inviteClient, setInviteClient] = useState<Client | null>(null)
  const [localClients, setLocalClients] = useState<Client[] | null>(null)

  const fetchClients = useCallback(() => api.clients.list(), [])
  const { data: apiClients, loading, error } = useApiData(fetchClients)

  const clients  = localClients ?? apiClients ?? []
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  )
  const isEmpty    = !loading && clients.length === 0
  const isNoResult = !isEmpty && filtered.length === 0

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
          <p className="text-ink-muted text-sm mt-1">{clients.filter(c => c.status === 'ACTIVE').length} active clients</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98] shrink-0">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">New Client</span><span className="sm:hidden">New</span>
        </button>
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
              <input type="text" placeholder="Search clients..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface border border-line rounded-lg pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
            </div>
          )}
          <EmptyState isSearch={isNoResult} onAdd={() => setShowNew(true)} />
        </>
      ) : (
        <>
          <div className="relative mb-5 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
            <input type="text" placeholder="Search clients..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-line rounded-lg pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
          </div>

          <div className="bg-surface border border-line rounded-xl overflow-hidden">
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
                  <button onClick={() => setInviteClient(c)}
                    className="shrink-0 text-ink-faint hover:text-violet transition-colors p-1" title="Send portal link">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="border-b border-line">
                  {['Client', 'Company', 'Email', 'Phone', 'Status', ''].map(h => (
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.status === 'ACTIVE' ? 'bg-success/15 text-success' : 'bg-white/10 text-ink-muted'}`}>
                        {c.status === 'ACTIVE' ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-6">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setInviteClient(c)} title="Send portal link"
                          className="text-ink-faint hover:text-violet transition-colors flex items-center gap-1.5 text-xs font-medium">
                          <Send className="w-3.5 h-3.5" /><span className="hidden lg:inline">Portal link</span>
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
