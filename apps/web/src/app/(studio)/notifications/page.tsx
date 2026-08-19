'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCircle2, ThumbsUp, AlertCircle, UserCheck, Loader2 } from 'lucide-react'
import { api, type Notification } from '@/lib/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs} h`
  return Math.floor(hrs / 24) === 1 ? 'Hier' : `il y a ${Math.floor(hrs / 24)} j`
}

type Tab = 'all' | 'validations' | 'documents' | 'system'

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'validations', label: 'Validations' },
  { key: 'documents', label: 'Documents' },
  { key: 'system', label: 'Système' },
]

function filterByTab(notifs: Notification[], tab: Tab): Notification[] {
  if (tab === 'all') return notifs
  if (tab === 'validations') return notifs.filter(n => n.type === 'deliverable_approved' || n.type === 'deliverable_changes')
  if (tab === 'documents') return notifs.filter(n => n.type === 'system' && n.title.toLowerCase().includes('document'))
  if (tab === 'system') return notifs.filter(n => n.type === 'system' || n.type === 'invite_accepted')
  return notifs
}

const TYPE_CONFIG: Record<Notification['type'], { border: string; icon: React.ElementType; iconColor: string }> = {
  deliverable_approved: { border: 'border-l-success', icon: ThumbsUp, iconColor: 'text-success' },
  deliverable_changes: { border: 'border-l-warning', icon: AlertCircle, iconColor: 'text-warning' },
  invite_accepted: { border: 'border-l-blue-500', icon: UserCheck, iconColor: 'text-blue-400' },
  system: { border: 'border-l-ink-muted', icon: Bell, iconColor: 'text-ink-muted' },
}

// ─── NotifItem ────────────────────────────────────────────────────────────────

function NotifItem({
  notif,
  onRead,
}: {
  notif: Notification
  onRead: (id: string, projectId?: string) => void
}) {
  const { border, icon: Icon, iconColor } = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system

  return (
    <button
      onClick={() => onRead(notif.id, notif.projectId)}
      className={`w-full text-left flex items-start gap-4 px-5 py-4 border-b border-line border-l-4 ${border} transition-colors hover:bg-surface-high ${
        notif.isRead ? 'opacity-60' : ''
      }`}
    >
      {/* Type icon */}
      <div className={`mt-0.5 ${iconColor} shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm leading-snug ${notif.isRead ? 'font-normal text-ink-muted' : 'font-semibold text-ink'}`}>
            {notif.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-ink-faint whitespace-nowrap">
              {formatRelative(notif.createdAt)}
            </span>
            {!notif.isRead && (
              <span className="w-2 h-2 rounded-full bg-violet shrink-0" />
            )}
          </div>
        </div>
        {notif.description && (
          <p className="text-xs text-ink-muted mt-1 line-clamp-2">{notif.description}</p>
        )}
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter()
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('all')
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.notifications.list()
        setNotifs(data)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleRead(id: string, projectId?: string) {
    // Optimistic update
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))

    try {
      await api.notifications.markRead(id)
    } catch {
      // revert on error
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n))
      return
    }

    if (projectId) {
      router.push(`/projects/${projectId}`)
    }
  }

  async function handleMarkAllRead() {
    const unread = notifs.filter(n => !n.isRead)
    if (unread.length === 0) return
    setMarkingAll(true)
    try {
      await Promise.all(unread.map(n => api.notifications.markRead(n.id)))
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {
      // silent
    } finally {
      setMarkingAll(false)
    }
  }

  const filtered = filterByTab(notifs, tab)
  const unreadCount = notifs.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="p-6 sm:p-8 max-w-[800px] mx-auto animate-pulse space-y-4">
        <div className="h-10 bg-surface rounded-xl w-56" />
        <div className="h-10 bg-surface rounded-xl border border-line" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-xl border border-line" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">Notifications</h1>
          <p className="text-ink-muted text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount !== 1 ? 's' : ''}` : 'Tout est à jour'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors disabled:opacity-40"
          >
            {markingAll
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CheckCircle2 className="w-4 h-4" />
            }
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 mb-4">
        {TABS.map(t => {
          const count = t.key === 'all' ? unreadCount : filterByTab(notifs, t.key).filter(n => !n.isRead).length
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-surface-high text-ink'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t.label}
              {count > 0 && (
                <span className="w-4 h-4 rounded-full bg-violet text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle2 className="w-10 h-10 text-success/60" />
            <p className="text-sm font-semibold text-ink">Tout est à jour ✓</p>
            <p className="text-xs text-ink-muted">Aucune notification dans cette catégorie.</p>
          </div>
        ) : (
          filtered.map(n => (
            <NotifItem key={n.id} notif={n} onRead={handleRead} />
          ))
        )}
      </div>
    </div>
  )
}
