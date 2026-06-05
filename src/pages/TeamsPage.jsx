import { ClipboardCopy, RefreshCcw, Shuffle } from 'lucide-react'
import { TeamCard } from '../components/TeamCard'
import { useClipboard } from '../hooks/useClipboard'
import { useFutRankStore } from '../store/useFutRankStore'
import { formatTeamsForWhatsApp } from '../utils/whatsapp'

export function TeamsPage() {
  const teams = useFutRankStore((state) => state.teams)
  const generateTeams = useFutRankStore((state) => state.generateTeams)
  const rebalanceTeams = useFutRankStore((state) => state.rebalanceTeams)
  const { copied, copy } = useClipboard()

  const currentTeams = teams ?? { timeA: [], timeB: [], mediaA: 0, mediaB: 0, somaA: 0, somaB: 0, eligibleCount: 0 }

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-black uppercase text-emerald-300">Sorteio equilibrado</p>
          <h1 className="mt-1 text-3xl font-black text-white">Times</h1>
          <p className="mt-2 text-sm text-zinc-400">Entram apenas jogadores presentes, pagos e liberados.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-400 bg-emerald-400 px-3 py-3 text-sm font-black text-emerald-950"
            onClick={generateTeams}
            type="button"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Gerar
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm font-black text-zinc-100"
            onClick={rebalanceTeams}
            type="button"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Rebalancear
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <TeamCard title="Time A" players={currentTeams.timeA} media={currentTeams.mediaA} soma={currentTeams.somaA} />
        <TeamCard title="Time B" players={currentTeams.timeB} media={currentTeams.mediaB} soma={currentTeams.somaB} />
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950/85 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="text-xl font-black text-white">WhatsApp</h2>
            <p className="mt-1 text-sm text-zinc-400">Copia a lista formatada com nome, posicao e overall.</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-400 bg-emerald-400 px-3 py-3 text-sm font-black text-emerald-950"
            onClick={() => copy(formatTeamsForWhatsApp(currentTeams))}
            type="button"
          >
            <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
            {copied ? 'Copiado' : 'Copiar times'}
          </button>
        </div>
      </section>
    </>
  )
}
