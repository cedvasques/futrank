export function StatCard({ label, value, detail, tone = 'green' }) {
  const tones = {
    green: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
    zinc: 'border-zinc-700 bg-zinc-900/80 text-zinc-100',
    amber: 'border-amber-400/35 bg-amber-400/10 text-amber-100',
    red: 'border-red-400/35 bg-red-400/10 text-red-100',
  }

  return (
    <article className={`rounded-lg border p-4 shadow-lg shadow-black/20 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase text-zinc-400">{label}</p>
      <strong className="mt-2 block text-3xl font-black text-white">{value}</strong>
      {detail ? <span className="mt-1 block text-xs text-zinc-400">{detail}</span> : null}
    </article>
  )
}
