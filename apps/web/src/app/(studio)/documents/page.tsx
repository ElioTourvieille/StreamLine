import { FileText } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">Documents</h1>
        <p className="text-ink-muted text-sm mt-1">Fichiers et livrables partagés sur tous les projets.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-line flex items-center justify-center">
          <FileText className="w-8 h-8 text-ink-muted" />
        </div>
        <h2 className="text-lg font-semibold text-ink">Documents bientôt disponibles</h2>
        <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
          Un espace documentaire unifié pour tous vos fichiers de projet est au programme.
        </p>
      </div>
    </div>
  )
}
