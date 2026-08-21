'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Compass, Loader2, Users } from 'lucide-react'
import { api, type InvitePreview } from '@/lib/api'

const INPUT = 'w-full bg-bg border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')

  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [invite, setInvite] = useState<InvitePreview | null>(null)
  const [inviteError, setInviteError] = useState('')
  const [checkingInvite, setCheckingInvite] = useState(!!inviteToken)

  useEffect(() => {
    if (!inviteToken) return
    api.auth.previewInvite(inviteToken)
      .then(preview => {
        setInvite(preview)
        setForm(f => ({ ...f, email: preview.email }))
      })
      .catch(() => setInviteError('Ce lien d’invitation est invalide ou a expiré.'))
      .finally(() => setCheckingInvite(false))
  }, [inviteToken])

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { accessToken } = await api.auth.register(
        invite
          ? { name: form.name, email: form.email, password: form.password, inviteToken: inviteToken! }
          : { name: form.name, email: form.email, password: form.password, organizationName: form.organizationName },
      )
      localStorage.setItem('sl_token', accessToken)
      router.push('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Échec de la création du compte'
      try { setError(JSON.parse(msg)?.message ?? msg) } catch { setError(msg) }
    } finally {
      setLoading(false)
    }
  }

  const fields = invite
    ? [
        { label: 'Nom complet', key: 'name' as const, type: 'text', placeholder: 'Elio Rossi', required: true },
        { label: 'Mot de passe', key: 'password' as const, type: 'password', placeholder: '8 caractères min.', required: true },
      ]
    : [
        { label: 'Nom complet',   key: 'name' as const,             type: 'text',     placeholder: 'Elio Rossi',      required: true },
        { label: 'E-mail',        key: 'email' as const,            type: 'email',    placeholder: 'vous@studio.com', required: true },
        { label: 'Mot de passe',  key: 'password' as const,         type: 'password', placeholder: '8 caractères min.', required: true },
        { label: 'Nom du studio', key: 'organizationName' as const, type: 'text',     placeholder: 'Origin Studio',    required: false },
      ]

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #ece3fb 0%, #f7f7fb 60%)' }}>
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-line rounded-xl p-8"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-violet flex items-center justify-center mb-4">
              {invite ? <Users className="w-6 h-6 text-white" /> : <Compass className="w-6 h-6 text-white" />}
            </div>
            {checkingInvite ? (
              <>
                <h1 className="text-xl font-semibold text-ink">Vérification de l’invitation…</h1>
                <p className="text-ink-muted text-sm mt-1">Un instant</p>
              </>
            ) : invite ? (
              <>
                <h1 className="text-xl font-semibold text-ink text-center">Rejoignez {invite.organizationName}</h1>
                <p className="text-ink-muted text-sm mt-1">Créez votre compte StreamLine</p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-ink">Créez votre studio</h1>
                <p className="text-ink-muted text-sm mt-1">Créez votre compte StreamLine</p>
              </>
            )}
          </div>

          {inviteError && (
            <p className="text-warning text-xs text-center mb-4 -mt-4">{inviteError} Vous pouvez créer un nouveau studio ci-dessous.</p>
          )}

          {!checkingInvite && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">
                    {label} {required && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={set(key)}
                    minLength={key === 'password' ? 8 : undefined}
                    className={INPUT}
                  />
                </div>
              ))}

              {invite && (
                <p className="text-[11px] text-ink-faint -mt-2">
                  Invitation envoyée à <span className="text-ink-dim">{invite.email}</span>
                </p>
              )}

              {error && <p className="text-danger text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet hover:bg-violet-hover text-white font-semibold py-2.5 rounded-md text-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {invite ? `Rejoindre ${invite.organizationName}` : 'Créer le compte'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-ink-muted mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-violet-glow hover:underline">Se connecter</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <RegisterForm />
    </Suspense>
  )
}
