import { Medal } from 'lucide-react'
import { PlayerCard } from '../components/PlayerCard'
import { useFutRankStore } from '../store/useFutRankStore'

export function RankingPage() {
  const players = useFutRankStore((state) => state.players)
  const rankedPlayers = [...players].sort((a, b) => {
    const overallDiff = b.overall - a.overall

    if (overallDiff !== 0) {
      return overallDiff
    }

    return b.stats.mvps - a.stats.mvps
  })

  return (
    <>
      <section>
        <p className="text-xs font-black uppercase text-emerald-300">Ranking simples</p>
        <h1 className="mt-1 text-3xl font-black text-white">Ranking</h1>
      </section>

      {rankedPlayers.length === 0 ? (
        <section className="rounded-lg border border-zinc-800 bg-zinc-950/85 p-6 text-center text-zinc-400">
          Nenhum jogador cadastrado.
        </section>
      ) : (
        <section className="grid gap-4">
          {rankedPlayers.map((player, index) => (
            <div className="grid gap-3 md:grid-cols-[72px_1fr]" key={player.id}>
              <div className="grid h-16 place-items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10">
                <Medal className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                <strong className="-mt-3 text-xl font-black text-white">#{index + 1}</strong>
              </div>
              <PlayerCard compact player={player} />
            </div>
          ))}
        </section>
      )}
    </>
  )
}
