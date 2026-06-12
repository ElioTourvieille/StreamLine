'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles, X, Loader2, Download, Send } from 'lucide-react'
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
  '< 5 000 €',
  '5 000 – 10 000 €',
  '10 000 – 25 000 €',
  '25 000 – 50 000 €',
  '50 000 – 100 000 €',
  '> 100 000 €',
]

const TIMELINES = [
  '2 semaines',
  '1 mois',
  '2 mois',
  '3 mois',
  '6 mois',
  '+ 6 mois',
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
          <h1 className="text-ink font-semibold text-sm">AI Proposal Generator</h1>
          <p className="text-ink-muted text-xs">Génère une proposition commerciale professionnelle en quelques secondes</p>
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
                placeholder="Ex: Boutique Maison Dupont"
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
                  <option value="">Choisir...</option>
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
                  <option value="">Choisir...</option>
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
                  placeholder={brief.deliverables.length === 0 ? 'Ajouter un livrable, Entrée pour valider...' : ''}
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
                placeholder="Ex: Next.js, Stripe, hébergement Vercel, RGPD, responsive mobile..."
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
                  Génération en cours...
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
                Éditer
              </button>
              <div className="flex-1" />
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs text-ink-muted hover:text-ink hover:bg-surface-high transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .md
              </button>
              <button
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
                  <p className="text-ink-dim text-sm font-medium">Remplissez le formulaire</p>
                  <p className="text-ink-muted text-xs mt-1 max-w-xs">
                    Complétez les informations à gauche, puis cliquez sur &ldquo;Générer la proposition&rdquo; pour obtenir une proposition commerciale complète en quelques secondes.
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
    </div>
  )
}
