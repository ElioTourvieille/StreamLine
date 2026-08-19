'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Compass, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

const INPUT = 'w-full bg-bg border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { accessToken } = await api.auth.register(form)
      localStorage.setItem('sl_token', accessToken)
      router.push('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Échec de la création du compte'
      try { setError(JSON.parse(msg)?.message ?? msg) } catch { setError(msg) }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #2a1a4e 0%, #131317 60%)' }}>
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-line rounded-xl p-8"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-violet flex items-center justify-center mb-4">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-ink">Créez votre studio</h1>
            <p className="text-ink-muted text-sm mt-1">Créez votre compte StreamLine</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Nom complet',   key: 'name',             type: 'text',     placeholder: 'Elio Rossi',         required: true },
              { label: 'E-mail',        key: 'email',            type: 'email',    placeholder: 'vous@studio.com',    required: true },
              { label: 'Mot de passe',  key: 'password',         type: 'password', placeholder: '8 caractères min.',  required: true },
              { label: 'Nom du studio', key: 'organizationName', type: 'text',     placeholder: 'Origin Studio',      required: false },
            ].map(({ label, key, type, placeholder, required }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">
                  {label} {required && <span className="text-danger">*</span>}
                </label>
                <input
                  type={type}
                  required={required}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={set(key as keyof typeof form)}
                  minLength={key === 'password' ? 8 : undefined}
                  className={INPUT}
                />
              </div>
            ))}

            {error && <p className="text-danger text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet hover:bg-violet-hover text-white font-semibold py-2.5 rounded-md text-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer le compte
            </button>
          </form>

          <p className="text-center text-xs text-ink-muted mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-violet-glow hover:underline">Se connecter</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
