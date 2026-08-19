import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portail client — StreamLine',
  description: 'Suivez l’avancement de votre projet et approuvez vos livrables en toute sécurité — sans compte requis.',
  robots: { index: false, follow: false },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children
}
