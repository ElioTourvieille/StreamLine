'use client'

import { useState } from 'react'
import { Plus, Search, X, Loader2, Building2, Mail, Phone, ExternalLink } from 'lucide-react'

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
  { id: '1', name: 'Marc Dupont', company: 'Acme Corp', contactEmail: 'marc@acmecorp.com', phone: '+33 6 12 34 56 78', status: 'ACTIVE', projects: 3 },
  { id: '2', name: 'Sophie Chen', company: 'TechFlow', contactEmail: 'sophie@techflow.io', status: 'ACTIVE', projects: 1 },
  { id: '3', name: 'Alex Martin', company: 'Boldmix', contactEmail: 'alex@boldmix.co', phone: '+33 7 98 76 54 32', status: 'ACTIVE', projects: 2 },
  { id: '4', name: 'Julie Renard', company: 'Stellar', contactEmail: 'julie@stellar.design', status: 'ACTIVE', projects: 1 },
  { id: '5', name: 'Tom Girard', company: 'InnoWave', contactEmail: 'tom@innowave.fr', status: 'ACTIVE', projects: 1 },
  { id: '6', name: 'Camille Noir', company: 'Lexis', contactEmail: 'cnoir@lexis.fr', phone: '+33 1 23 45 67 89', status: 'ARCHIVED', projects: 0 },
]

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-line rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-lg font-semibold text-ink">New Client</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { label: 'Contact Name', key: 'name', required: true, placeholder: 'Jean Dupont' },
            { label: 'Company', key: 'company', required: false, placeholder: 'Acme Corp' },
            { label: 'Email', key: 'contactEmail', required: true, placeholder: 'contact@company.com', type: 'email' },
            { label: 'Phone', key: 'phone', required: false, placeholder: '+33 6 00 00 00 00' },
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
                className="w-full bg-bg border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-surface-high hover:bg-surface-higher border border-line text-ink-dim text-sm font-medium py-2.5 rounded-md transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-violet hover:bg-violet-hover text-white text-sm font-semibold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Client
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {showModal && (
        <NewClientModal
          onClose={() => setShowModal(false)}
          onSave={c => { setClients(prev => [c, ...prev]); setShowModal(false) }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-semibold text-ink tracking-tight leading-10">Clients</h1>
          <p className="text-ink-muted text-sm mt-1">{clients.filter(c => c.status === 'ACTIVE').length} active clients</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface border border-line rounded-lg pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {['Client', 'Company', 'Email', 'Phone', 'Projects', 'Status', ''].map(h => (
                <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id}
                className={`h-12 border-b border-line hover:bg-surface-high transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                <td className="px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-[11px] font-bold text-violet-glow flex-shrink-0">
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-ink">{c.name}</span>
                  </div>
                </td>
                <td className="px-6">
                  <div className="flex items-center gap-1.5 text-sm text-ink-dim">
                    {c.company && <><Building2 className="w-3.5 h-3.5 text-ink-faint" />{c.company}</>}
                  </div>
                </td>
                <td className="px-6">
                  <div className="flex items-center gap-1.5 text-sm text-ink-muted">
                    <Mail className="w-3.5 h-3.5 text-ink-faint" />
                    {c.contactEmail}
                  </div>
                </td>
                <td className="px-6">
                  {c.phone
                    ? <div className="flex items-center gap-1.5 text-sm text-ink-muted"><Phone className="w-3.5 h-3.5 text-ink-faint" />{c.phone}</div>
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
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-8 h-8 text-ink-faint mx-auto mb-3" />
            <p className="text-ink-muted text-sm">No clients found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
