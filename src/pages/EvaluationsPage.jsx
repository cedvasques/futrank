import { Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { useFutRankStore } from '../store/useFutRankStore'
import { ATTRIBUTES, DEFAULT_ATTRIBUTES } from '../utils/player'

function initialRatings() {
  return { ...DEFAULT_ATTRIBUTES }
}

export function EvaluationsPage() {
  const players = useFutRankStore((state) => state.players)
  const evaluations = useFutRankStore((state) => state.evaluations)
  const evaluationsOpen = useFutRankStore((state) => state.session.evaluationsOpen)
  const submitEvaluation = useFutRankStore((state) => state.submitEvaluation)
  const [reviewerId, setReviewerId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [ratings, setRatings] = useState(initialRatings)
  const [message, setMessage] = useState('')

  const targetOptions = useMemo(() => {
    return players.filter((player) => {
      if (player.id === reviewerId) {
        return false
      }

      return !evaluations.some((evaluation) => evaluation.reviewerId === reviewerId && evaluation.targetId === player.id)
    })
  }, [evaluations, players, reviewerId])

  function handleSubmit(event) {
    event.preventDefault()
    const result = submitEvaluation(reviewerId, targetId, ratings)

    setMessage(result.message ?? (result.ok ? 'Avaliacao registrada.' : 'Nao foi possivel registrar.'))

    if (result.ok) {
      setTargetId('')
      setRatings(initialRatings())
    }
  }

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-black uppercase text-emerald-300">Coleta coletiva</p>
          <h1 className="mt-1 text-3xl font-black text-white">Avaliacoes</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Cada jogador avalia outro apenas uma vez. As notas ajustam os atributos de forma progressiva.
          </p>
        </div>
        <StatCard label="Status" value={evaluationsOpen ? 'Aberta' : 'Fechada'} detail={`${evaluations.length} registros`} />
      </section>

      <form className="grid gap-4 rounded-lg border border-zinc-800 bg-zinc-950/85 p-4" onSubmit={handleSubmit}>
        {!evaluationsOpen ? (
          <p className="rounded border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            Avaliacoes fechadas. Abra pelo painel Admin para liberar o formulario.
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Avaliador
            <select
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none"
              disabled={!evaluationsOpen}
              onChange={(event) => {
                setReviewerId(event.target.value)
                setTargetId('')
              }}
              value={reviewerId}
            >
              <option value="">Selecione</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Avaliado
            <select
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none"
              disabled={!evaluationsOpen || !reviewerId}
              onChange={(event) => setTargetId(event.target.value)}
              value={targetId}
            >
              <option value="">Selecione</option>
              {targetOptions.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {ATTRIBUTES.map((attribute) => (
            <label className="grid gap-2 text-sm font-bold text-zinc-300" key={attribute.key}>
              {attribute.label}
              <input
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none"
                disabled={!evaluationsOpen}
                max="99"
                min="0"
                onChange={(event) => setRatings((current) => ({ ...current, [attribute.key]: event.target.value }))}
                type="number"
                value={ratings[attribute.key]}
              />
            </label>
          ))}
        </div>

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-emerald-400 bg-emerald-400 px-4 py-3 text-sm font-black text-emerald-950 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 sm:w-max"
          disabled={!evaluationsOpen}
          type="submit"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Registrar avaliacao
        </button>

        {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
      </form>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950/85 p-4">
        <h2 className="text-xl font-black text-white">Registros recentes</h2>
        <div className="mt-3 grid gap-2">
          {evaluations.length === 0 ? (
            <p className="text-sm text-zinc-400">Nenhuma avaliacao registrada.</p>
          ) : (
            evaluations
              .slice()
              .reverse()
              .slice(0, 8)
              .map((evaluation) => {
                const reviewer = players.find((player) => player.id === evaluation.reviewerId)
                const target = players.find((player) => player.id === evaluation.targetId)

                return (
                  <div className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300" key={evaluation.id}>
                    <strong className="text-white">{reviewer?.nome ?? 'Jogador removido'}</strong> avaliou{' '}
                    <strong className="text-white">{target?.nome ?? 'Jogador removido'}</strong>
                  </div>
                )
              })
          )}
        </div>
      </section>
    </>
  )
}
