'use client'

import { useState, useEffect } from 'react'
import { Settings, Building2, Palette, Save } from 'lucide-react'
import { api, type Organization, type UserProfile } from '@/lib/api'

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [org, setOrg] = useState<Organization | null>(null)
  const [orgName, setOrgName] = useState('')
  const [userName, setUserName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const u = await api.users.me()
        setUser(u)
        setUserName(u.name)
        if (u.organizationId) {
          const o = await api.organizations.get(u.organizationId)
          setOrg(o)
          setOrgName(o.name)
        }
      } catch {
        // Silent fail
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.users.update({ name: userName })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // Silent fail
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-[800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">Settings</h1>
        <p className="text-ink-muted text-sm mt-1">Manage your account and studio preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
            <Settings className="w-4 h-4 text-ink-muted" />
            <h2 className="text-base font-semibold text-ink">Profile</h2>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full bg-bg/50 border border-line rounded-lg px-3 py-2.5 text-sm text-ink-muted cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !userName.trim()}
              className="flex items-center gap-2 bg-violet hover:bg-violet-hover disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Organization */}
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
            <Building2 className="w-4 h-4 text-ink-muted" />
            <h2 className="text-base font-semibold text-ink">Organization</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">
                Studio Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                disabled
                className="w-full bg-bg/50 border border-line rounded-lg px-3 py-2.5 text-sm text-ink-muted cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">
                Slug
              </label>
              <input
                type="text"
                value={org?.slug ?? ''}
                disabled
                className="w-full bg-bg/50 border border-line rounded-lg px-3 py-2.5 text-sm text-ink-muted cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-ink-faint">Organization settings can be updated from the API.</p>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
            <Palette className="w-4 h-4 text-ink-muted" />
            <h2 className="text-base font-semibold text-ink">Appearance</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Dark Mode</p>
                <p className="text-xs text-ink-muted mt-0.5">StreamLine always uses the dark theme.</p>
              </div>
              <div className="w-10 h-5 rounded-full bg-violet relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
