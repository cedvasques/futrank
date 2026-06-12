import { StatCard } from '../components/StatCard'
import { TeamCard } from '../components/TeamCard'
import { useFutRankStore } from '../store/useFutRankStore'
import { canEnterDraw } from '../utils/player'

export function DashboardPage({ onPageChange }) {
  const players = useFutRankStore((state) => state.players)
  const teams = useFutRankStore((state) => state.teams)
  const evaluationsOpen = useFutRankStore((state) => state.session.evaluationsOpen)
  const isAdmin = useFutRankStore((state) => state.auth.role === 'admin')

  const presentes = players.filter((player) => player.presenceConfirmed)
  const elegiveis = players.filter(canEnterDraw)
  const pendentes = players.filter((player) => player.pagamentoStatus === 'pending')
  const bloqueados = players.filter((player) => player.blocked)
  const averageOverall = players.length
    ? Math.round((players.reduce((sum, player) => sum + player.overall, 0) / players.length) * 10) / 10
    : 0

  return (
    <>
      <section className="rounded-lg border border-emerald-400/30 bg-[linear-gradient(135deg,#0b1811,#08100c)] p-5 shadow-xl shadow-black/30">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <p className="text-xs font-black uppercase text-emerald-300">Organizador de pelada</p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">FutRank</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Controle presenca, pagamento, avaliacoes coletivas e monte dois times equilibrados com base no overall.
            </p>
          </div>
          <div className={`grid gap-2 ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <button
              className="rounded-md border border-emerald-400 bg-emerald-400 px-3 py-3 text-sm font-black text-emerald-950"
              onClick={() => onPageChange('players')}
              type="button"
            >
              Confirmar presença
            </button>
            {isAdmin ? (
              <button
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm font-black text-zinc-100"
                onClick={() => onPageChange('admin')}
                type="button"
              >
                Painel Admin
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jogadores" value={players.length} detail={`Overall medio ${averageOverall}`} />
        <StatCard label="Presentes" value={presentes.length} detail={`${elegiveis.length} elegiveis`} tone="zinc" />
        <StatCard label="Pendentes" value={pendentes.length} detail="Fora do sorteio" tone="amber" />
        <StatCard label="Bloqueados" value={bloqueados.length} detail="Fora da presenca" tone="red" />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-lg border border-zinc-800 bg-zinc-950/85 p-4">
          <p className="text-xs font-black uppercase text-zinc-400">Avaliacoes</p>
          <strong className="mt-2 block text-2xl font-black text-white">{evaluationsOpen ? 'Abertas' : 'Fechadas'}</strong>
          <p className="mt-1 text-sm text-zinc-400">
            {evaluationsOpen ? 'Jogadores podem avaliar outros atletas.' : 'Abra pelo painel Admin quando quiser coletar notas.'}
          </p>
        </article>
        <article className="rounded-lg border border-zinc-800 bg-zinc-950/85 p-4">
          <p className="text-xs font-black uppercase text-zinc-400">Ultimo sorteio</p>
          <strong className="mt-2 block text-2xl font-black text-white">{teams ? `${teams.eligibleCount} atletas` : 'Nenhum'}</strong>
          <p className="mt-1 text-sm text-zinc-400">
            {teams ? `Time A ${teams.somaA} vs Time B ${teams.somaB}` : 'Gere os times quando a lista estiver pronta.'}
          </p>
        </article>
        <article className="rounded-lg border border-zinc-800 bg-zinc-950/85 p-4">
          <p className="text-xs font-black uppercase text-zinc-400">Regra do sorteio</p>
          <strong className="mt-2 block text-2xl font-black text-white">Pago + livre</strong>
          <p className="mt-1 text-sm text-zinc-400">Apenas presentes, pagos e nao bloqueados entram na geracao.</p>
        </article>
      </section>

      {teams ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <TeamCard title="Time A" players={teams.timeA} media={teams.mediaA} soma={teams.somaA} />
          <TeamCard title="Time B" players={teams.timeB} media={teams.mediaB} soma={teams.somaB} />
        </section>
      ) : null}
    </>
  )
}
