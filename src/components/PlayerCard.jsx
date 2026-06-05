import { Ban, CheckCircle, CircleDollarSign, Lock, ShieldCheck, Trophy } from 'lucide-react'
import { AttributeBars } from './AttributeBars'
import { canConfirmPresence, playerStatusLabel } from '../utils/player'

const positionColors = {
  GOL: 'bg-cyan-400 text-cyan-950',
  ZAG: 'bg-lime-400 text-lime-950',
  MEI: 'bg-amber-300 text-amber-950',
  ATA: 'bg-rose-400 text-rose-950',
}

export function PlayerCard({ player, actions, compact = false }) {
  const status = playerStatusLabel(player)
  const canConfirm = canConfirmPresence(player)

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-950/85 p-4 shadow-xl shadow-black/25">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-lg font-black text-white">{player.nome}</h3>
            <span className={`rounded px-2 py-1 text-xs font-black ${positionColors[player.position]}`}>
              {player.position}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-zinc-300">
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {player.presenceConfirmed ? 'Presente' : 'Ausente'}
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-zinc-300">
              <CircleDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
              {player.pagamentoStatus === 'paid' ? 'Pago' : 'Pendente'}
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-zinc-300">
              {player.blocked ? <Lock className="h-3.5 w-3.5" aria-hidden="true" /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}
              {status}
            </span>
          </div>
        </div>

        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-emerald-400/40 bg-emerald-400/15">
          <span className="text-[10px] font-black uppercase text-emerald-200">OVR</span>
          <strong className="-mt-4 text-3xl font-black text-white">{player.overall}</strong>
        </div>
      </div>

      {!compact ? (
        <div className="mt-4">
          <AttributeBars attributes={player.attributes} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <Trophy className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
          {player.stats.vitorias}V / {player.stats.derrotas}D / {player.stats.mvps} MVP
        </span>
        <span>{player.avaliacoesRecebidas} avaliacoes</span>
      </div>

      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions({ canConfirm })}</div> : null}

      {!canConfirm ? (
        <p className="mt-3 flex items-center gap-2 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          <Ban className="h-4 w-4 shrink-0" aria-hidden="true" />
          Nao entra no sorteio enquanto estiver bloqueado ou pendente.
        </p>
      ) : null}
    </article>
  )
}
