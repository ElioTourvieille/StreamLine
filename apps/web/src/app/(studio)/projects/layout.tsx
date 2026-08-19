import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projets — StreamLine',
  description: 'Suivez tous les projets du studio, leurs jalons, livrables et statut de validation client en un seul endroit.',
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
