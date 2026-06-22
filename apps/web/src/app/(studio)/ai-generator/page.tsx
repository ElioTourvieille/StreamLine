'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X, Loader2, Download, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import type { ProposalBrief } from '@/app/api/proposals/generate/route'

const PROJECT_TYPES = [
  'Brochure Website',
  'E-commerce',
  'Web Application',
  'Mobile Application',
  'UX/UI Redesign',
  'Visual Identity',
  'SEO / Digital Marketing',
  'Maintenance & Support',
]

const BUDGET_RANGES = [
  '< $5,000',
  '$5,000 – $10,000',
  '$10,000 – $25,000',
  '$25,000 – $50,000',
  '$50,000 – $100,000',
  '> $100,000',
]

const TIMELINES = [
  '2 weeks',
  '1 month',
  '2 months',
  '3 months',
  '6 months',
  '6+ months',
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
      setError(err instanceof Error ? err.message : 'An error occurred')
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
      setSendError(err instanceof Error ? err.message : 'Failed to send')
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
    a.download = `proposal-${brief.clientName.toLowerCase().replace(/\s+/g, '-') || 'client'}.md`
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
          <h1 className="text-ink font-semibold text-sm">AI Proposal Generator</h1>
          <p className="text-ink-muted text-xs">Generate a professional project proposal in seconds</p>
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
                Client Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={brief.clientName}
                onChange={e => set('clientName', e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
              />
            </div>

            {/* Project type */}
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">
                Project Type <span className="text-danger">*</span>
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
                  <option value="">Select...</option>
                  {BUDGET_RANGES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-dim mb-1.5">
                  Timeline <span className="text-danger">*</span>
                </label>
                <select
                  value={brief.timeline}
                  onChange={e => set('timeline', e.target.value)}
                  className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-violet transition-colors appearance-none"
                >
                  <option value="">Select...</option>
                  {TIMELINES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">Project Description</label>
              <textarea
                value={brief.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe the context, goals, and challenges of the project..."
                rows={4}
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors resize-none"
              />
            </div>

            {/* Deliverables (tag input) */}
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">Key Deliverables</label>
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
                  placeholder={brief.deliverables.length === 0 ? 'Add a deliverable, press Enter...' : ''}
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
                />
              </div>
            </div>

            {/* Tech requirements */}
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5">Tech Stack & Requirements</label>
              <textarea
                value={brief.requirements}
                onChange={e => set('requirements', e.target.value)}
                placeholder="e.g. Next.js, Stripe, Vercel hosting, GDPR compliance, mobile responsive..."
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
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Proposal
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
                Preview
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
                Edit
              </button>
              <div className="flex-1" />
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs text-ink-muted hover:text-ink hover:bg-surface-high transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download .md
              </button>
              <button
                onClick={openSendModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-violet hover:bg-violet-hover text-white font-medium transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Send to Client
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
                  <p className="text-ink-dim text-sm font-medium">Fill in the brief</p>
                  <p className="text-ink-muted text-xs mt-1 max-w-xs">
                    Complete the form on the left, then click &ldquo;Generate Proposal&rdquo; to get a full commercial proposal in seconds.
                  </p>
                </div>
              </div>
            )}

            {isGenerating && !proposal && (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 className="w-8 h-8 text-violet animate-spin" />
                  <p className="text-ink-muted text-sm">Claude is writing your proposal...</p>
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
                    <h2 className="text-sm font-semibold text-ink">Send Proposal</h2>
                    <p className="text-xs text-ink-muted">
                      {brief.clientName ? `to ${brief.clientName}` : 'by email'}
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
                    <p className="text-ink font-medium text-sm">Proposal sent!</p>
                    <p className="text-ink-muted text-xs mt-1">
                      The proposal for <span className="text-ink">{brief.clientName}</span> has been sent to <span className="text-ink">{sendEmail}</span>.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="mt-2 px-4 py-2 rounded-lg bg-surface-high hover:bg-line text-ink text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                /* Form state */
                <form onSubmit={(e) => { void handleSendToClient(e) }} className="px-5 py-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-dim mb-1.5">
                      Client email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={sendEmail}
                      onChange={e => setSendEmail(e.target.value)}
                      placeholder="client@example.com"
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
                    The full proposal will be sent as a styled HTML email on behalf of <span className="text-ink">Origin Studio</span>.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSendModal(false)}
                      disabled={sendStatus === 'sending'}
                      className="flex-1 px-4 py-2 rounded-lg border border-line text-ink-muted hover:text-ink hover:border-line/80 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendStatus === 'sending' || !sendEmail.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet hover:bg-violet-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {sendStatus === 'sending' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Send
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
