import { Mail } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">Messages</h1>
        <p className="text-ink-muted text-sm mt-1">Direct communication with your clients.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-line flex items-center justify-center">
          <Mail className="w-8 h-8 text-ink-muted" />
        </div>
        <h2 className="text-lg font-semibold text-ink">Messaging coming soon</h2>
        <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
          In-app messaging with clients will be available in the next release.
        </p>
      </div>
    </div>
  )
}
