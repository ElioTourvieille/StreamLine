'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageSquare, Loader2, FolderOpen } from 'lucide-react'
import { api, type Message, type ProjectThread, type UserProfile } from '@/lib/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs} h`
  return Math.floor(hrs / 24) === 1 ? 'Hier' : `il y a ${Math.floor(hrs / 24)} j`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })
}

const AVATAR_COLORS = [
  'bg-violet-600', 'bg-blue-600', 'bg-emerald-600',
  'bg-orange-600', 'bg-pink-600', 'bg-teal-600',
]
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  return (
    <div className={`w-8 h-8 ${avatarColor(name)} rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
      {initials(name)}
    </div>
  )
}

function ThreadItem({
  thread,
  selected,
  onClick,
}: {
  thread: ProjectThread
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-line transition-colors hover:bg-surface-high ${
        selected ? 'bg-surface-high border-l-2 border-l-violet' : 'border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-ink truncate">{thread.projectName}</span>
        {thread.lastMessage && (
          <span className="text-[10px] text-ink-faint shrink-0 mt-0.5">
            {formatRelative(thread.lastMessage.createdAt)}
          </span>
        )}
      </div>
      {thread.lastMessage ? (
        <p className="text-xs text-ink-muted truncate">
          <span className="font-medium">{thread.lastMessage.authorName}:</span>{' '}
          {thread.lastMessage.text}
        </p>
      ) : (
        <p className="text-xs text-ink-faint italic">Aucun message pour l’instant</p>
      )}
    </button>
  )
}

function Bubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  return (
    <div className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar name={msg.authorName} />
      <div className={`max-w-[70%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-baseline gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs font-semibold text-ink">{msg.authorName}</span>
          <span className="text-[10px] text-ink-faint">{formatTime(msg.createdAt)}</span>
        </div>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? 'bg-violet text-white rounded-tr-sm'
              : 'bg-surface-high border border-line text-ink rounded-tl-sm'
          }`}
        >
          {msg.text}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [threads, setThreads] = useState<ProjectThread[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingInit, setLoadingInit] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const u = await api.users.me()
        setUser(u)
        if (u.organizationId) {
          const t = await api.organizations.messages(u.organizationId)
          setThreads(t)
        }
      } catch {
        // silent
      } finally {
        setLoadingInit(false)
      }
    }
    init()
  }, [])

  const loadMessages = useCallback(async (pid: string, silent = false) => {
    if (!silent) setLoadingMsgs(true)
    try {
      const msgs = await api.messages.listByProject(pid)
      setMessages(msgs)
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
    } catch {
      // silent
    } finally {
      if (!silent) setLoadingMsgs(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedId) { setMessages([]); return }

    setLoadingMsgs(true)
    loadMessages(selectedId)

    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => loadMessages(selectedId, true), 5000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [selectedId, loadMessages])

  async function handleSend(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!text.trim() || !selectedId || sending || !user) return
    setSending(true)
    try {
      const msg = await api.messages.send(selectedId, { text: text.trim(), authorName: user.name })
      setMessages(prev => [...prev, msg])
      setText('')
      setThreads(prev => prev.map(t => t.projectId === selectedId ? { ...t, lastMessage: msg } : t))
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  const selectedThread = threads.find(t => t.projectId === selectedId)

  if (loadingInit) {
    return (
      <div className="h-[calc(100vh-64px)] flex animate-pulse">
        <div className="w-72 border-r border-line bg-surface shrink-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-3.5 border-b border-line space-y-2">
              <div className="h-3.5 bg-surface-high rounded w-3/4" />
              <div className="h-3 bg-surface-high rounded w-full" />
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-ink-faint animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">

      {/* ── Thread list ──────────────────────────────────────────────────── */}
      <div className="w-72 border-r border-line bg-surface shrink-0 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-line shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-ink-muted" />
            <h1 className="text-base font-semibold text-ink">Messages</h1>
          </div>
          <p className="text-xs text-ink-faint mt-0.5">
            {threads.length} projet{threads.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <FolderOpen className="w-8 h-8 text-ink-faint mx-auto mb-2" />
              <p className="text-xs text-ink-muted">Aucun projet pour l’instant.</p>
              <p className="text-xs text-ink-faint mt-1">Créez un projet pour commencer à échanger des messages.</p>
            </div>
          ) : (
            threads.map(t => (
              <ThreadItem
                key={t.projectId}
                thread={t}
                selected={selectedId === t.projectId}
                onClick={() => setSelectedId(t.projectId)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Conversation ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-bg">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-ink-faint" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Ouvrez un projet pour démarrer une conversation</p>
              <p className="text-xs text-ink-muted mt-1">Sélectionnez un projet dans le panneau de gauche</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-line bg-surface shrink-0 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-violet" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{selectedThread?.projectName ?? '—'}</p>
                <p className="text-xs text-ink-faint">Conversation du projet · actualisation toutes les 5 s</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-5 h-5 text-ink-faint animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                  <MessageSquare className="w-8 h-8 text-ink-faint" />
                  <p className="text-sm text-ink-muted">Aucun message pour l’instant. Démarrez la conversation ci-dessous.</p>
                </div>
              ) : (
                messages.map(msg => (
                  <Bubble key={msg.id} msg={msg} isOwn={msg.authorId === user?.id} />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-line bg-surface shrink-0">
              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Écrire un message…"
                  className="flex-1 bg-bg border border-line rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="flex items-center gap-2 bg-violet hover:bg-violet-hover disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  {sending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
