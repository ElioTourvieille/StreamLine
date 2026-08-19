'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Compass, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { accessToken } = await api.auth.login(email, password)
      localStorage.setItem('sl_token', accessToken)
      router.push('/dashboard')
    } catch {
      setError('E-mail ou mot de passe invalide')
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
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-violet flex items-center justify-center mb-4">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-ink">StreamLine</h1>
            <p className="text-ink-muted text-sm mt-1">Connectez-vous à votre studio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@studio.com"
                required
                className="w-full bg-bg border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-wide">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-bg border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-violet transition-colors"
              />
            </div>

            {error && (
              <p className="text-danger text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet hover:bg-violet-hover text-white font-semibold py-2.5 rounded-md text-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Se connecter
            </button>
          </form>

          <p className="text-center text-xs text-ink-muted mt-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-violet-glow hover:underline">Créer un compte</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
