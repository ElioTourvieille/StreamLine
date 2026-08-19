import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tableau de bord — StreamLine',
  description: 'Vue d’ensemble de votre studio : projets actifs, validations clients en attente, jalons terminés et activité récente.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
