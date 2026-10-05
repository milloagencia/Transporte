/** Read-only star rating, e.g. ★ 4.8 (12). */
export function RatingBadge({ avg, count, empty = "—" }: { avg?: number; count?: number; empty?: string }) {
  if (!count) return <span className="text-slate-400">{empty}</span>
  return (
    <span className="whitespace-nowrap text-amber-600" title={`${avg} / 5 · ${count}`}>
      ★ {avg?.toFixed(1)} <span className="text-slate-500">({count})</span>
    </span>
  )
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-500" aria-label={`${value}/5`}>
      {"★".repeat(value)}<span className="text-slate-300">{"★".repeat(5 - value)}</span>
    </span>
  )
}
