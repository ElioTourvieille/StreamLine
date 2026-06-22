import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Portal — StreamLine',
  description: 'Review your project progress and approve deliverables securely — no account required.',
  robots: { index: false, follow: false },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children
}
