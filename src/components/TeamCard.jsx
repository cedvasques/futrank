export function TeamCard({ title, players, media, soma }) {
  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-950/85 p-4 shadow-xl shadow-black/25">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className="text-xs text-zinc-400">Media {media} | Soma {soma}</p>
        </div>
        <span className="rounded border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-200">
          {players.length}
        </span>
      </div>

      <ol className="mt-4 grid gap-2">
        {players.length === 0 ? (
          <li className="rounded border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-400">Sem jogadores</li>
        ) : (
          players.map((player) => (
            <li
              className="grid grid-cols-[1fr_auto] items-center gap-3 rounded border border-zinc-800 bg-zinc-900 px-3 py-3"
              key={player.id}
            >
              <span className="min-w-0">
                <strong className="block break-words text-sm text-white">{player.nome}</strong>
                <small className="text-xs text-zinc-400">{player.position}</small>
              </span>
              <strong className="rounded bg-emerald-400 px-2 py-1 text-sm text-emerald-950">{player.overall}</strong>
            </li>
          ))
        )}
      </ol>
    </article>
  )
}
