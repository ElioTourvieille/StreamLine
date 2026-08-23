import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://streamline-api-env.eba-pagqw7xn.eu-west-3.elasticbeanstalk.com/api/:path*',
      },
    ];
  },
}

// Wraps the build to upload source maps to Sentry so stack traces are
// readable — only actually uploads when SENTRY_AUTH_TOKEN is set (CI/prod),
// so a local `pnpm build` without it still succeeds, just without upload.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  webpack: { treeshake: { removeDebugLogging: true } },
})
