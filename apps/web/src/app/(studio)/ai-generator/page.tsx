'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X, Loader2, Download, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import type { ProposalBrief } from '@/app/api/proposals/generate/route'

const PROJECT_TYPES = [
  'Site vitrine',
  'E-commerce',
  'Application web',
  'Application mobile',
  'Refonte UX/UI',
  'Identité visuelle',
  'SEO / Marketing digital',
  'Maintenance & support',
]

const BUDGET_RANGES = [
  '< CHF 5’000',
  'CHF 5’000 – 10’000',
  'CHF 10’000 – 25’000',
  'CHF 25’000 – 50’000',
  'CHF 50’000 – 100’000',
  '> CHF 100’000',
]

const TIMELINES = [
  '2 semaines',
  '1 mois',
  '2 mois',
  '3 mois',
  '6 mois',
  '6+ mois',
]

const DEFAULT_BRIEF: ProposalBrief = {
  clientName: '',
  projectType: '',
  budgetRange: '',
  timeline: '',
  description: '',
  deliverables: [],
  requirements: '',
}

export default function AiGeneratorPage() {
  const [brief, setBrief] = useState<ProposalBrief>(DEFAULT_BRIEF)
  const [tagInput, setTagInput] = useState('')
  const [proposal, setProposal] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [showSendModal, setShowSendModal] = useState(false)
  const [sendEmail, setSendEmail] = useState('')
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sendError, setSendError] = useState('')

  function set<K extends keyof ProposalBrief>(key: K, value: ProposalBrief[K]) {
    setBrief(prev => ({ ...prev, [key]: value }))
  }

  function addDeliverable() {
    const trimmed = tagInput.trim()
    if (trimmed && !brief.deliverables.includes(trimmed)) {
      set('deliverables', [...brief.deliverables, trimmed])
    }
    setTagInput('')
  }

  function removeDeliverable(item: string) {
    set('deliverables', brief.deliverables.filter(d => d !== item))
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addDeliverable()
    } else if (e.key === 'Backspace' && !tagInput && brief.deliverables.length) {
      set('deliverables', brief.deliverables.slice(0, -1))
    }
  }

  async function generate() {
    setError(null)
    setProposal('')
    setIsEditing(false)
    setIsGenerating(true)

    try {
      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief),
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setProposal(accumulated)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSendToClient(e: React.FormEvent) {
    e.preventDefault()
    if (!sendEmail.trim()) return
    setSendStatus('sending')
    setSendError('')
    try {
      const res = await fetch('/api/proposals/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sendEmail.trim(), clientName: brief.clientName, proposal }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setSendStatus('sent')
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Échec de l’envoi')
      setSendStatus('error')
    }
  }

  function openSendModal() {
    setSendEmail('')
    setSendStatus('idle')
    setSendError('')
    setShowSendModal(true)
  }

  function handleDownload() {
    const blob = new Blob([proposal], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proposition-${brief.clientName.toLowerCase().replace(/\s+/g, '-') || 'client'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const canGenerate =
    brief.clientName.trim() &&
    brief.projectType &&
    brief.budgetRange &&
    brief.timeline &&
    !isGenerating

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-line shrink-0">
        <div className="w-8 h-8 rounded-lg bg-violet/20 border border-violet/30 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-violet-glow" />
        </div>
        <div>
          <h1 className="text-ink font-semibold text-sm">Générateur de propositions IA</h1>
          <p className="text-ink-muted text-xs">Générez une proposition de projet professionnelle en quelques secondes</p>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Brief form */}
        <div className="w-[400px] shrink-0 border-r border-line flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {/* Client name */}
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">
                Nom du client <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={brief.clientName}
                onChange={e => set('clientName', e.target.value)}
                placeholder="ex. Acme Corp"
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
              />
            </div>

            {/* Project type */}
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">
                Type de projet <span className="text-danger">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PROJECT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => set('projectType', type)}
                    className={[
                      'px-2.5 py-1 rounded-md text-xs transition-colors border',
                      brief.projectType === type
                        ? 'bg-violet border-violet text-white'
                        : 'bg-surface border-line text-ink-muted hover:border-violet/40 hover:text-ink',
                    ].join(' ')}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget + Timeline — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-dim mb-1.5">
                  Budget <span className="text-danger">*</span>
                </label>
                <select
                  value={brief.budgetRange}
                  onChange={e => set('budgetRange', e.target.value)}
                  className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-violet transition-colors appearance-none"
                >
                  <option value="">Sélectionner...</option>
                  {BUDGET_RANGES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-dim mb-1.5">
                  Délai <span className="text-danger">*</span>
                </label>
                <select
                  value={brief.timeline}
                  onChange={e => set('timeline', e.target.value)}
                  className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-violet transition-colors appearance-none"
                >
                  <option value="">Sélectionner...</option>
                  {TIMELINES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">Description du projet</label>
              <textarea
                value={brief.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Décrivez le contexte, les objectifs et les enjeux du projet..."
                rows={4}
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors resize-none"
              />
            </div>

            {/* Deliverables (tag input) */}
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">Livrables clés</label>
              <div className="bg-surface border border-line rounded-lg px-3 py-2 flex flex-wrap gap-1.5 min-h-[42px] focus-within:border-violet transition-colors">
                {brief.deliverables.map(d => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet/15 border border-violet/30 rounded text-xs text-violet-glow"
                  >
                    {d}
                    <button onClick={() => removeDeliverable(d)} className="hover:text-danger transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={addDeliverable}
                  placeholder={brief.deliverables.length === 0 ? 'Ajoutez un livrable, appuyez sur Entrée...' : ''}
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
                />
              </div>
            </div>

            {/* Tech requirements */}
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">Stack technique & exigences</label>
              <textarea
                value={brief.requirements}
                onChange={e => set('requirements', e.target.value)}
                placeholder="ex. Next.js, Stripe, hébergement Vercel, conformité RGPD, responsive mobile..."
                rows={3}
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors resize-none"
              />
            </div>
          </div>

          {/* Generate button */}
          <div className="px-5 py-4 border-t border-line shrink-0">
            {error && (
              <p className="text-danger text-xs mb-3 flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5">⚠</span> {error}
              </p>
            )}
            <button
              onClick={generate}
              disabled={!canGenerate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet hover:bg-violet-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer la proposition
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT — Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview toolbar */}
          {proposal && (
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-line shrink-0">
              <button
                onClick={() => setIsEditing(false)}
                className={[
                  'px-3 py-1 rounded text-xs font-medium transition-colors',
                  !isEditing ? 'bg-surface-high text-ink' : 'text-ink-muted hover:text-ink',
                ].join(' ')}
              >
                Aperçu
              </button>
              <button
                onClick={() => {
                  setIsEditing(true)
                  setTimeout(() => textareaRef.current?.focus(), 50)
                }}
                className={[
                  'px-3 py-1 rounded text-xs font-medium transition-colors',
                  isEditing ? 'bg-surface-high text-ink' : 'text-ink-muted hover:text-ink',
                ].join(' ')}
              >
                Modifier
              </button>
              <div className="flex-1" />
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs text-ink-muted hover:text-ink hover:bg-surface-high transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger en .md
              </button>
              <button
                onClick={openSendModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-violet hover:bg-violet-hover text-white font-medium transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Envoyer au client
              </button>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            {!proposal && !isGenerating && (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
                <div className="w-14 h-14 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-violet/50" />
                </div>
                <div>
                  <p className="text-ink-dim text-sm font-medium">Remplissez le brief</p>
                  <p className="text-ink-muted text-xs mt-1 max-w-xs">
                    Complétez le formulaire à gauche, puis cliquez sur « Générer la proposition » pour obtenir une proposition commerciale complète en quelques secondes.
                  </p>
                </div>
              </div>
            )}

            {isGenerating && !proposal && (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 className="w-8 h-8 text-violet animate-spin" />
                  <p className="text-ink-muted text-sm">Claude rédige votre proposition...</p>
                </div>
              </div>
            )}

            {proposal && (
              isEditing ? (
                <textarea
                  ref={textareaRef}
                  value={proposal}
                  onChange={e => setProposal(e.target.value)}
                  className="w-full h-full bg-transparent text-ink text-sm font-mono px-8 py-6 resize-none outline-none"
                />
              ) : (
                <div className="px-8 py-6 prose-proposal">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {proposal}
                  </ReactMarkdown>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Send to Client modal */}
      <AnimatePresence>
        {showSendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget && sendStatus !== 'sending') setShowSendModal(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-surface border border-line rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet/20 border border-violet/30 flex items-center justify-center">
                    <Send className="w-3.5 h-3.5 text-violet-glow" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-ink">Envoyer la proposition</h2>
                    <p className="text-xs text-ink-muted">
                      {brief.clientName ? `à ${brief.clientName}` : 'par e-mail'}
                    </p>
                  </div>
                </div>
                {sendStatus !== 'sending' && (
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-high transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Success state */}
              {sendStatus === 'sent' ? (
                <div className="px-5 py-8 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-ink font-medium text-sm">Proposition envoyée !</p>
                    <p className="text-ink-muted text-xs mt-1">
                      La proposition pour <span className="text-ink">{brief.clientName}</span> a été envoyée à <span className="text-ink">{sendEmail}</span>.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="mt-2 px-4 py-2 rounded-lg bg-surface-high hover:bg-line text-ink text-sm font-medium transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                /* Form state */
                <form onSubmit={(e) => { void handleSendToClient(e) }} className="px-5 py-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-dim mb-1.5">
                      E-mail du client <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={sendEmail}
                      onChange={e => setSendEmail(e.target.value)}
                      placeholder="client@exemple.com"
                      disabled={sendStatus === 'sending'}
                      className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors disabled:opacity-50"
                    />
                  </div>

                  {sendStatus === 'error' && (
                    <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                      <p className="text-danger text-xs">{sendError}</p>
                    </div>
                  )}

                  <p className="text-xs text-ink-muted">
                    La proposition complète sera envoyée sous forme d’e-mail HTML au nom d’<span className="text-ink">Origin Studio</span>.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSendModal(false)}
                      disabled={sendStatus === 'sending'}
                      className="flex-1 px-4 py-2 rounded-lg border border-line text-ink-muted hover:text-ink hover:border-line/80 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={sendStatus === 'sending' || !sendEmail.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet hover:bg-violet-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {sendStatus === 'sending' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Envoi…
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Envoyer
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
