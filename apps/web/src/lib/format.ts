// Shared formatting helpers — English (en-US) so dates render consistently
// regardless of the visitor's machine locale.

/** "Jun 19, 2026" — short, unambiguous English date. */
export function formatDate(input?: string | number | Date | null): string {
  if (!input) return '—'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** "June 19, 2026" — long form for headers / detail views. */
export function formatDateLong(input?: string | number | Date | null): string {
  if (!input) return '—'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
