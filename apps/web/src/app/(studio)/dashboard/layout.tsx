import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — StreamLine',
  description: 'Overview of your studio: active projects, pending client validations, completed milestones and recent activity.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
