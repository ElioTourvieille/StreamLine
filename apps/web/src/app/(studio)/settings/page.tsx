'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, User, LogOut, Save, AlertTriangle, Globe, Image,
  Users, UserPlus, X, Loader2, Copy, Check, Crown,
} from 'lucide-react'
import { api, type Organization, type UserProfile, type OrgMember } from '@/lib/api'

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
      {saved ? 'Enregistré !' : saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
    </button>
  )
}

// ─── Invite teammate modal ──────────────────────────────────────────────────

function InviteMemberModal({
  orgId,
  onClose,
  onInvited,
}: {
  orgId: string
  onClose: () => void
  onInvited: () => void
}) {
  const [form, setForm] = useState({ email: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.organizations.inviteMember(orgId, {
        email: form.email,
        name: form.name || undefined,
      })
      setInviteUrl(res.inviteUrl)
      onInvited()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’envoi de l’invitation')
    } finally {
      setLoading(false)
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-surface border border-line rounded-t-2xl sm:rounded-xl w-full sm:max-w-md">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
          <h2 className="text-base font-semibold text-ink">Inviter un coéquipier</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 sm:p-6">
          {!inviteUrl ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">E-mail <span className="text-danger">*</span></label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="collegue@origin-studio.ch"
                  className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">Nom (optionnel)</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Jean Dupont"
                  className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors" />
              </div>
              {error && <p className="text-danger text-sm">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 bg-surface-high border border-line text-ink-dim text-sm font-medium py-2.5 rounded-lg transition-colors">Annuler</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-violet hover:bg-violet-hover text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  Envoyer l’invitation
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-success/8 border border-success/30 rounded-lg">
                <Check className="w-4 h-4 text-success shrink-0" />
                <p className="text-sm text-success font-medium">Invitation envoyée !</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted mb-2">Si l’e-mail n’arrive pas, partagez ce lien directement :</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-bg border border-line rounded-lg px-3 py-2 text-xs text-violet-glow truncate">
                    {inviteUrl}
                  </code>
                  <button onClick={copyUrl}
                    className="shrink-0 bg-surface-high hover:bg-surface-higher border border-line px-3 py-2 rounded-lg text-ink-muted hover:text-ink transition-colors">
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-ink-faint">Lien valable 7 jours.</p>
              <button onClick={onClose}
                className="w-full bg-surface-high hover:bg-surface border border-line text-ink text-sm font-medium py-2.5 rounded-lg transition-colors">Terminé</button>
            </div>
          )}
        </div>
      </div>
    </div>
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

  // Team
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Logout dialog
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const u = await api.users.me()
        setUser(u)
        setUserName(u.name ?? '')
        if (u.organizationId) {
          const [o, m] = await Promise.all([
            api.organizations.get(u.organizationId),
            api.organizations.listMembers(u.organizationId).catch(() => []),
          ])
          setOrg(o)
          setOrgName(o.name ?? '')
          setOrgWebsite(o.website ?? '')
          setOrgLogoUrl(o.logoUrl ?? '')
          setMembers(m)
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
        setLoadingMembers(false)
      }
    }
    load()
  }, [])

  async function reloadMembers() {
    if (!org?.id) return
    try {
      setMembers(await api.organizations.listMembers(org.id))
    } catch {
      // Silent fail — the list just won't refresh
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!org?.id) return
    setRemovingId(userId)
    try {
      await api.organizations.removeMember(org.id, userId)
      setMembers(prev => prev.filter(m => m.id !== userId))
    } catch {
      // Silent fail — member stays in the list, user can retry
    } finally {
      setRemovingId(null)
    }
  }

  const isOwner = members.some(m => m.id === user?.id && m.orgRole === 'OWNER')

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
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">Paramètres</h1>
        <p className="text-ink-muted text-sm mt-1">Gérez votre compte et les préférences du studio.</p>
      </div>

      <div className="space-y-6">

        {/* ── My Account ─────────────────────────────────────────────────── */}
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
            <User className="w-4 h-4 text-ink-muted" />
            <h2 className="text-base font-semibold text-ink">Mon compte</h2>
          </div>
          <form onSubmit={handleSaveUser} className="p-6 space-y-4">
            <div>
              <Label>Nom complet</Label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className={input}
                placeholder="Votre nom complet"
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className={inputDisabled}
              />
              <p className="text-[11px] text-ink-faint mt-1.5">L’e-mail ne peut pas être modifié.</p>
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
              <Label>Nom du studio</Label>
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
              <p className="text-[11px] text-ink-faint mt-1.5">Le slug est défini à la création et ne peut pas être modifié.</p>
            </div>
            <div>
              <Label>
                <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Site web</span>
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
                <span className="flex items-center gap-1.5"><Image className="w-3 h-3" /> URL du logo</span>
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
                  <img src={orgLogoUrl} alt="Aperçu du logo" className="w-8 h-8 rounded object-contain bg-surface-high border border-line" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <span className="text-[11px] text-ink-faint">Aperçu</span>
                </div>
              )}
            </div>
            <SaveButton saving={savingOrg} saved={savedOrg} disabled={!orgName.trim()} />
          </form>
        </div>

        {/* ── Team ───────────────────────────────────────────────────────── */}
        {org?.id && (
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-ink-muted" />
                <h2 className="text-base font-semibold text-ink">Équipe</h2>
              </div>
              <button onClick={() => setShowInvite(true)}
                className="flex items-center gap-1.5 bg-violet hover:bg-violet-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <UserPlus className="w-3.5 h-3.5" />
                Inviter
              </button>
            </div>

            {loadingMembers ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
              </div>
            ) : (
              <div className="divide-y divide-line">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 px-6 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-xs font-bold text-violet-glow shrink-0">
                      {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{m.name}{m.id === user?.id && <span className="text-ink-faint font-normal"> (vous)</span>}</p>
                      <p className="text-xs text-ink-muted truncate">{m.email}</p>
                    </div>
                    {m.orgRole === 'OWNER' && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-violet-glow bg-violet/8 border border-violet/30 px-2 py-0.5 rounded-full shrink-0">
                        <Crown className="w-3 h-3" />Propriétaire
                      </span>
                    )}
                    {isOwner && m.orgRole !== 'OWNER' && (
                      <button onClick={() => handleRemoveMember(m.id)} disabled={removingId === m.id}
                        title="Retirer de l’équipe"
                        className="text-ink-faint hover:text-danger transition-colors p-1.5 rounded shrink-0 disabled:opacity-40">
                        {removingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showInvite && org?.id && (
          <InviteMemberModal
            orgId={org.id}
            onClose={() => setShowInvite(false)}
            onInvited={() => { void reloadMembers() }}
          />
        )}

        {/* ── Danger Zone ────────────────────────────────────────────────── */}
        <div className="bg-surface border border-danger/30 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-danger/20">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <h2 className="text-base font-semibold text-danger">Zone à risque</h2>
          </div>
          <div className="p-6">
            {!showLogout ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">Se déconnecter</p>
                  <p className="text-xs text-ink-muted mt-0.5">Vous serez redirigé vers la page de connexion.</p>
                </div>
                <button
                  onClick={() => setShowLogout(true)}
                  className="flex items-center gap-2 bg-danger/8 hover:bg-danger/15 border border-danger/30 text-danger px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="bg-danger/8 border border-danger/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-ink mb-1">Confirmer la déconnexion ?</p>
                <p className="text-xs text-ink-muted mb-4">Votre session sera effacée.</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-danger hover:bg-danger/80 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Oui, me déconnecter
                  </button>
                  <button
                    onClick={() => setShowLogout(false)}
                    className="text-sm text-ink-muted hover:text-ink transition-colors px-3 py-2"
                  >
                    Annuler
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
