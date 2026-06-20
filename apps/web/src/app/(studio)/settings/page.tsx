'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, User, LogOut, Save, AlertTriangle, Globe, Image } from 'lucide-react'
import { api, type Organization, type UserProfile } from '@/lib/api'

// ─── Shared input style ───────────────────────────────────────────────────────

const input =
  'w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors'
const inputDisabled =
  'w-full bg-bg/40 border border-line rounded-lg px-3 py-2.5 text-sm text-ink-muted cursor-not-allowed'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">
      {children}
    </label>
  )
}

function SaveButton({ saving, saved, disabled }: { saving: boolean; saved: boolean; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving || disabled}
      className="flex items-center gap-2 bg-violet hover:bg-violet-hover disabled:opacity-40 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
    >
      <Save className="w-4 h-4" />
      {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()

  // Remote state
  const [user, setUser]   = useState<UserProfile | null>(null)
  const [org, setOrg]     = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  // Account form
  const [userName, setUserName]         = useState('')
  const [savingUser, setSavingUser]     = useState(false)
  const [savedUser, setSavedUser]       = useState(false)

  // Studio form
  const [orgName, setOrgName]     = useState('')
  const [orgWebsite, setOrgWebsite] = useState('')
  const [orgLogoUrl, setOrgLogoUrl] = useState('')
  const [savingOrg, setSavingOrg]   = useState(false)
  const [savedOrg, setSavedOrg]     = useState(false)

  // Logout dialog
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const u = await api.users.me()
        setUser(u)
        setUserName(u.name ?? '')
        if (u.organizationId) {
          const o = await api.organizations.get(u.organizationId)
          setOrg(o)
          setOrgName(o.name ?? '')
          setOrgWebsite(o.website ?? '')
          setOrgLogoUrl(o.logoUrl ?? '')
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSaveUser(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSavingUser(true)
    try {
      const updated = await api.users.update({ name: userName.trim() })
      setUser(updated)
      setSavedUser(true)
      setTimeout(() => setSavedUser(false), 2500)
    } catch {
      // Silent fail
    } finally {
      setSavingUser(false)
    }
  }

  async function handleSaveOrg(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!org?.id) return
    setSavingOrg(true)
    try {
      const updated = await api.organizations.update(org.id, {
        name: orgName.trim(),
        website: orgWebsite.trim() || undefined,
        logoUrl: orgLogoUrl.trim() || undefined,
      })
      setOrg(updated)
      setSavedOrg(true)
      setTimeout(() => setSavedOrg(false), 2500)
    } catch {
      // Silent fail
    } finally {
      setSavingOrg(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('sl_token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 max-w-[800px] mx-auto animate-pulse space-y-6">
        <div className="h-10 bg-surface rounded-xl w-48" />
        <div className="h-48 bg-surface rounded-xl border border-line" />
        <div className="h-64 bg-surface rounded-xl border border-line" />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-[800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">Settings</h1>
        <p className="text-ink-muted text-sm mt-1">Manage your account and studio preferences.</p>
      </div>

      <div className="space-y-6">

        {/* ── My Account ─────────────────────────────────────────────────── */}
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
            <User className="w-4 h-4 text-ink-muted" />
            <h2 className="text-base font-semibold text-ink">My Account</h2>
          </div>
          <form onSubmit={handleSaveUser} className="p-6 space-y-4">
            <div>
              <Label>Full Name</Label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className={input}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className={inputDisabled}
              />
              <p className="text-[11px] text-ink-faint mt-1.5">Email cannot be changed.</p>
            </div>
            <SaveButton saving={savingUser} saved={savedUser} disabled={!userName.trim()} />
          </form>
        </div>

        {/* ── Studio ─────────────────────────────────────────────────────── */}
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
            <Building2 className="w-4 h-4 text-ink-muted" />
            <h2 className="text-base font-semibold text-ink">Studio</h2>
          </div>
          <form onSubmit={handleSaveOrg} className="p-6 space-y-4">
            <div>
              <Label>Studio Name</Label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className={input}
                placeholder="Origin Studio"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <input
                type="text"
                value={org?.slug ?? ''}
                disabled
                className={inputDisabled}
              />
              <p className="text-[11px] text-ink-faint mt-1.5">Slug is set at creation and cannot be changed.</p>
            </div>
            <div>
              <Label>
                <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Website</span>
              </Label>
              <input
                type="url"
                value={orgWebsite}
                onChange={e => setOrgWebsite(e.target.value)}
                className={input}
                placeholder="https://www.origin-studio.ch"
              />
            </div>
            <div>
              <Label>
                <span className="flex items-center gap-1.5"><Image className="w-3 h-3" /> Logo URL</span>
              </Label>
              <input
                type="url"
                value={orgLogoUrl}
                onChange={e => setOrgLogoUrl(e.target.value)}
                className={input}
                placeholder="https://…/logo.png"
              />
              {orgLogoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={orgLogoUrl} alt="Logo preview" className="w-8 h-8 rounded object-contain bg-surface-high border border-line" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <span className="text-[11px] text-ink-faint">Preview</span>
                </div>
              )}
            </div>
            <SaveButton saving={savingOrg} saved={savedOrg} disabled={!orgName.trim()} />
          </form>
        </div>

        {/* ── Danger Zone ────────────────────────────────────────────────── */}
        <div className="bg-surface border border-danger/30 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-danger/20">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <h2 className="text-base font-semibold text-danger">Danger Zone</h2>
          </div>
          <div className="p-6">
            {!showLogout ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">Sign out</p>
                  <p className="text-xs text-ink-muted mt-0.5">You will be redirected to the login page.</p>
                </div>
                <button
                  onClick={() => setShowLogout(true)}
                  className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="bg-danger/8 border border-danger/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-ink mb-1">Are you sure you want to sign out?</p>
                <p className="text-xs text-ink-muted mb-4">Your session will be cleared.</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-danger hover:bg-danger/80 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Yes, sign me out
                  </button>
                  <button
                    onClick={() => setShowLogout(false)}
                    className="text-sm text-ink-muted hover:text-ink transition-colors px-3 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
