// Shared formatting helpers — French (fr-CH) so dates render consistently
// regardless of the visitor's machine locale.

/** "19 juin 2026" — short, unambiguous French date. */
export function formatDate(input?: string | number | Date | null): string {
  if (!input) return '—'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-CH', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** "19 juin 2026" — long form for headers / detail views. */
export function formatDateLong(input?: string | number | Date | null): string {
  if (!input) return '—'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-CH', { year: 'numeric', month: 'long', day: 'numeric' })
}
