import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PlayerCard } from '../components/PlayerCard'
import { useFutRankStore } from '../store/useFutRankStore'

export function PlayersPage() {
  const players = useFutRankStore((state) => state.players)
  const togglePresence = useFutRankStore((state) => state.togglePresence)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('TODOS')

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch = player.nome.toLowerCase().includes(search.toLowerCase())
      const matchesPosition = position === 'TODOS' || player.position === position

      return matchesSearch && matchesPosition
    })
  }, [players, position, search])

  return (
    <>
      <section className="grid gap-3">
        <div>
          <p className="text-xs font-black uppercase text-emerald-300">Lista da pelada</p>
          <h1 className="mt-1 text-3xl font-black text-white">Jogadores</h1>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
            <Search className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar jogador"
              type="search"
              value={search}
            />
          </label>
          <select
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-bold text-white outline-none"
            onChange={(event) => setPosition(event.target.value)}
            value={position}
          >
            <option value="TODOS">Todas posicoes</option>
            <option value="GOL">GOL</option>
            <option value="ZAG">ZAG</option>
            <option value="MEI">MEI</option>
            <option value="ATA">ATA</option>
          </select>
        </div>
      </section>

      {filteredPlayers.length === 0 ? (
        <section className="rounded-lg border border-zinc-800 bg-zinc-950/85 p-6 text-center text-zinc-400">
          Nenhum jogador encontrado.
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {filteredPlayers.map((player) => (
            <PlayerCard
              actions={({ canConfirm }) => (
                <button
                  className="rounded-md border border-emerald-400 bg-emerald-400 px-3 py-2 text-sm font-black text-emerald-950 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
                  disabled={!canConfirm}
                  onClick={() => togglePresence(player.id)}
                  type="button"
                >
                  {player.presenceConfirmed ? 'Cancelar presença' : 'Confirmar presença'}
                </button>
              )}
              key={player.id}
              player={player}
            />
          ))}
        </section>
      )}
    </>
  )
}
