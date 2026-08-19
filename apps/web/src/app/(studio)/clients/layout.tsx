import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clients — StreamLine',
  description: 'Gérez les clients de votre studio, leurs coordonnées, et envoyez des liens de portail sécurisés pour qu’ils consultent et approuvent leurs livrables.',
}

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children
}
