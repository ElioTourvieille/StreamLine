'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, FolderOpen, Users, FileText,
  Mail, Settings, LogOut, Compass, Sparkles, Bell,
} from 'lucide-react'
import { api } from '@/lib/api'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/projects', icon: FolderOpen, label: 'Projets' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/ai-generator', icon: Sparkles, label: 'Propositions IA' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/messages', icon: Mail, label: 'Messages' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/settings', icon: Settings, label: 'Paramètres' },
]

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ name: string; orgName: string } | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const user = await api.users.me()
        let orgName = ''
        if (user.organizationId) {
          const org = await api.organizations.get(user.organizationId)
          orgName = org.name
        }
        setUserInfo({ name: user.name, orgName })
      } catch {
        // Silent fail — sidebar still works without user info
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function fetchUnread() {
      try {
        const notifs = await api.notifications.list()
        setUnreadCount(notifs.filter(n => !n.isRead).length)
      } catch {
        // Silent fail
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  function handleLogout() {
    localStorage.removeItem('sl_token')
    router.push('/login')
  }

  const displayName = userInfo?.name ?? '—'
  const displayOrg = userInfo?.orgName ?? '—'
  const initials = userInfo ? getInitials(userInfo.name) : '?'

  return (
    <aside className="w-[220px] h-screen bg-surface-dim border-r border-line flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-ink text-sm leading-tight">StreamLine</div>
            <div className="font-semibold text-ink text-sm leading-tight">Studio</div>
            <div className="text-ink-muted text-[11px] mt-0.5">Espace admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto shrink-0 ">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const isNotif = href === '/notifications'
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-surface-high text-violet-glow'
                  : 'text-ink-muted hover:bg-surface-high hover:text-ink',
              ].join(' ')}
            >
              <span className="relative shrink-0">
                <Icon className={`w-4 h-4 ${active ? 'text-violet' : ''}`} />
                {isNotif && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet rounded-full flex items-center justify-center text-[9px] font-bold text-white leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-violet/20 border border-violet/40 flex items-center justify-center text-xs font-semibold text-violet-glow shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-ink text-sm font-medium truncate">{displayName}</div>
            <div className="text-ink-muted text-[11px] truncate">{displayOrg}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-ink-muted hover:text-ink transition-colors p-1 rounded"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
