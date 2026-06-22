import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects — StreamLine',
  description: 'Track every studio project, its milestones, deliverables and client validation status in one place.',
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
