'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FolderOpen, Users, FileText,
  Mail, Settings, LogOut, Compass, Sparkles,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/ai-generator', icon: Sparkles, label: 'AI Proposals' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/messages', icon: Mail, label: 'Messages' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem('sl_token')
    router.push('/login')
  }

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
            ER
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-ink text-sm font-medium truncate">Elio Rossi</div>
            <div className="text-ink-muted text-[11px] truncate">Origin Studio</div>
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
