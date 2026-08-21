'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, X, Loader2, Send, Copy } from 'lucide-react'
import { api, type Client, type ClientStatus } from '@/lib/api'

// ─── Status config — shared by the client list and the client detail page ────

export const STATUS_CONFIG: Record<ClientStatus, { label: string; className: string }> = {
  ACTIVE:      { label: 'Actif',        className: 'bg-success/8 text-success border-success/30' },
  FOLLOW_UP:   { label: 'À relancer',   className: 'bg-warning/8 text-warning border-warning/30' },
  MAINTENANCE: { label: 'Maintenance',  className: 'bg-info/8 text-info border-info/30' },
  COMPLETED:   { label: 'Terminé',      className: 'bg-violet/15 text-violet-glow border-violet/30' },
  ARCHIVED:    { label: 'Archivé',      className: 'bg-ink/5 text-ink-muted border-line' },
}

// ─── Status dropdown ──────────────────────────────────────────────────────────

export function StatusDropdown({ client, onChange }: { client: Client; onChange: (s: ClientStatus) => void }) {
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

// ─── Invite modal ─────────────────────────────────────────────────────────────

export function InviteModal({ client, onClose }: { client: Client; onClose: () => void }) {
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
