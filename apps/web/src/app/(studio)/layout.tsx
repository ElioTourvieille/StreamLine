import Sidebar from './_components/sidebar'

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
