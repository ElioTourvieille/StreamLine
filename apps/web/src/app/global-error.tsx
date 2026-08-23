'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

/**
 * Next.js only shows this boundary for errors thrown in the root layout
 * itself — everywhere else, per-route error.tsx files would be a better fit
 * (none exist yet). It replaces the whole <html>, so it needs its own shell.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="fr">
      <body className="bg-bg text-ink font-sans antialiased">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="max-w-sm text-center space-y-4">
            <h1 className="text-lg font-semibold text-ink">Une erreur inattendue est survenue</h1>
            <p className="text-sm text-ink-muted">
              L’équipe a été notifiée automatiquement. Vous pouvez réessayer ou revenir plus tard.
            </p>
            <button
              onClick={() => reset()}
              className="inline-flex items-center bg-violet hover:bg-violet-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
