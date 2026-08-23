// Sentry must be initialized before any other module is imported — see the
// `import './instrument'` at the very top of main.ts. This file owns its own
// dotenv load so SENTRY_DSN is available even though this runs before
// main.ts's own env setup.
import 'dotenv/config'
import * as Sentry from '@sentry/nestjs'

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    // Trace a sample of requests for performance visibility without paying
    // to trace every single one in production.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
} else if (process.env.NODE_ENV === 'production') {
  // Not fatal — unlike JWT_SECRET this isn't a security requirement, just an
  // observability gap worth flagging loudly if it happens in prod.
  console.warn('[sentry] SENTRY_DSN non défini — monitoring d’erreurs désactivé.')
}
