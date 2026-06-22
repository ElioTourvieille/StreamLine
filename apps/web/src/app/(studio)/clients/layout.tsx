import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clients — StreamLine',
  description: 'Manage your studio clients, contact details, and send secure portal links so they can review and approve deliverables.',
}

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children
}
