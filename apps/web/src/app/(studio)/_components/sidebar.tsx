'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, FolderOpen, Users, FileText,
  Mail, Settings, LogOut, Compass, Sparkles,
} from 'lucide-react'
import { api } from '@/lib/api'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/ai-generator', icon: Sparkles, label: 'AI Proposals' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/messages', icon: Mail, label: 'Messages' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ name: string; orgName: string } | null>(null)

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
            <div className="text-ink-muted text-[11px] mt-0.5">Admin Dashboard</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto shrink-0 ">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-surface-high text-ink border-l-2 border-violet'
                  : 'text-ink-muted hover:bg-surface-high hover:text-ink border-l-2 border-transparent',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 shrink-0" />
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
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
