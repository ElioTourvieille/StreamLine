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

/** "2.4 Mo" — file size, French-labelled binary units. */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—'
  const units = ['o', 'Ko', 'Mo', 'Go']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value < 10 && i > 0 ? value.toFixed(1) : Math.round(value)} ${units[i]}`
}
