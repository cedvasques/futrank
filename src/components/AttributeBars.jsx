import { ATTRIBUTES } from '../utils/player'

export function AttributeBars({ attributes }) {
  return (
    <div className="grid gap-2">
      {ATTRIBUTES.map((attribute) => {
        const value = attributes?.[attribute.key] ?? 0

        return (
          <div className="grid grid-cols-[34px_1fr_28px] items-center gap-2 text-xs" key={attribute.key}>
            <span className="font-bold text-zinc-400">{attribute.label}</span>
            <div className="h-2 overflow-hidden rounded bg-zinc-800">
              <div
                className="h-full rounded bg-emerald-400"
                style={{ width: `${Math.min(99, Math.max(0, value))}%` }}
              />
            </div>
            <span className="text-right font-bold text-zinc-200">{value}</span>
          </div>
        )
      })}
    </div>
  )
}
