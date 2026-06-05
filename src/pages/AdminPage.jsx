import { Ban, CircleDollarSign, LockOpen, Plus, RefreshCcw, Trash2, Unlock, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useFutRankStore } from '../store/useFutRankStore'
import { ATTRIBUTES, DEFAULT_ATTRIBUTES, POSITIONS } from '../utils/player'

function emptyForm() {
  return {
    nome: '',
    position: 'MEI',
    pagamentoStatus: 'pending',
    attributes: { ...DEFAULT_ATTRIBUTES },
  }
}

export function AdminPage({ onPageChange }) {
  const players = useFutRankStore((state) => state.players)
  const evaluationsOpen = useFutRankStore((state) => state.session.evaluationsOpen)
  const addPlayer = useFutRankStore((state) => state.addPlayer)
  const deletePlayer = useFutRankStore((state) => state.deletePlayer)
  const setPaymentStatus = useFutRankStore((state) => state.setPaymentStatus)
  const toggleBlocked = useFutRankStore((state) => state.toggleBlocked)
  const setEvaluationsOpen = useFutRankStore((state) => state.setEvaluationsOpen)
  const generateTeams = useFutRankStore((state) => state.generateTeams)
  const rebalanceTeams = useFutRankStore((state) => state.rebalanceTeams)
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const result = addPlayer(form)

    setMessage(result.message ?? (result.ok ? 'Jogador adicionado.' : 'Nao foi possivel adicionar.'))

    if (result.ok) {
      setForm(emptyForm())
    }
  }

  function handleDelete(playerId) {
    if (window.confirm('Excluir jogador e avaliacoes relacionadas?')) {
      deletePlayer(playerId)
    }
  }

  function handleGenerateTeams(action) {
    action()
    onPageChange('teams')
  }

  return (
    <>
      <section>
        <p className="text-xs font-black uppercase text-emerald-300">Controle do lider</p>
        <h1 className="mt-1 text-3xl font-black text-white">Admin</h1>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <button
          className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-black ${
            evaluationsOpen
              ? 'border-amber-400 bg-amber-400 text-amber-950'
              : 'border-emerald-400 bg-emerald-400 text-emerald-950'
          }`}
          onClick={() => setEvaluationsOpen(!evaluationsOpen)}
          type="button"
        >
          {evaluationsOpen ? <Ban className="h-4 w-4" aria-hidden="true" /> : <Unlock className="h-4 w-4" aria-hidden="true" />}
          {evaluationsOpen ? 'Fechar avaliacoes' : 'Abrir avaliacoes'}
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-400 bg-emerald-400 px-3 py-3 text-sm font-black text-emerald-950"
          onClick={() => handleGenerateTeams(generateTeams)}
          type="button"
        >
          <UsersRound className="h-4 w-4" aria-hidden="true" />
          Gerar times
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm font-black text-zinc-100"
          onClick={() => handleGenerateTeams(rebalanceTeams)}
          type="button"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Rebalancear
        </button>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-300">
          {players.length} jogadores cadastrados
        </div>
      </section>

      <form className="grid gap-4 rounded-lg border border-zinc-800 bg-zinc-950/85 p-4" onSubmit={handleSubmit}>
        <h2 className="text-xl font-black text-white">Adicionar jogador</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_140px_170px]">
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Nome
            <input
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none"
              onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
              placeholder="Ex: Carlos"
              type="text"
              value={form.nome}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Posicao
            <select
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none"
              onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))}
              value={form.position}
            >
              {POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-zinc-300">
            Pagamento
            <select
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none"
              onChange={(event) => setForm((current) => ({ ...current, pagamentoStatus: event.target.value }))}
              value={form.pagamentoStatus}
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {ATTRIBUTES.map((attribute) => (
            <label className="grid gap-2 text-sm font-bold text-zinc-300" key={attribute.key}>
              {attribute.label}
              <input
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none"
                max="99"
                min="0"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    attributes: { ...current.attributes, [attribute.key]: event.target.value },
                  }))
                }
                type="number"
                value={form.attributes[attribute.key]}
              />
            </label>
          ))}
        </div>

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-emerald-400 bg-emerald-400 px-4 py-3 text-sm font-black text-emerald-950 sm:w-max"
          type="submit"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Adicionar
        </button>
        {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
      </form>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950/85 p-4">
        <h2 className="text-xl font-black text-white">Gestao dos jogadores</h2>
        <div className="mt-4 grid gap-3">
          {players.length === 0 ? (
            <p className="text-sm text-zinc-400">Nenhum jogador cadastrado.</p>
          ) : (
            players.map((player) => (
              <div className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 md:grid-cols-[1fr_auto]" key={player.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="break-words text-white">{player.nome}</strong>
                    <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-black text-zinc-300">{player.position}</span>
                    <span className="rounded bg-emerald-400 px-2 py-1 text-xs font-black text-emerald-950">OVR {player.overall}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {player.presenceConfirmed ? 'Presente' : 'Ausente'} |{' '}
                    {player.pagamentoStatus === 'paid' ? 'Pago' : 'Pendente'} | {player.blocked ? 'Bloqueado' : 'Liberado'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-black text-zinc-100"
                    onClick={() => setPaymentStatus(player.id, player.pagamentoStatus === 'paid' ? 'pending' : 'paid')}
                    type="button"
                  >
                    <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
                    {player.pagamentoStatus === 'paid' ? 'Marcar pendente' : 'Marcar pago'}
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-black text-zinc-100"
                    onClick={() => toggleBlocked(player.id)}
                    type="button"
                  >
                    {player.blocked ? <LockOpen className="h-4 w-4" aria-hidden="true" /> : <Ban className="h-4 w-4" aria-hidden="true" />}
                    {player.blocked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100"
                    onClick={() => handleDelete(player.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}
