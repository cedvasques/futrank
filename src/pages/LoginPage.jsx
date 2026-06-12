import { KeyRound, LogIn, PlusCircle, Shield } from 'lucide-react'
import { useState } from 'react'
import { useFutRankStore } from '../store/useFutRankStore'

export function LoginPage() {
  const authError = useFutRankStore((state) => state.auth.error)
  const sync = useFutRankStore((state) => state.sync)
  const createGroup = useFutRankStore((state) => state.createGroup)
  const joinGroup = useFutRankStore((state) => state.joinGroup)
  const [mode, setMode] = useState('join')
  const [accessCode, setAccessCode] = useState('')
  const [groupName, setGroupName] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [message, setMessage] = useState(authError ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleJoin(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    const result = await joinGroup(accessCode)

    if (!result.ok) {
      setMessage(result.message)
    }

    setIsSubmitting(false)
  }

  async function handleCreate(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    const result = await createGroup({ groupName, leaderName })

    if (!result.ok) {
      setMessage(result.message)
    }

    setIsSubmitting(false)
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#060807] px-4 py-6 text-zinc-100">
      <section className="grid w-full max-w-md gap-5 rounded-lg border border-zinc-800 bg-zinc-950/90 p-5 shadow-2xl shadow-black/40">
        <div className="grid gap-2">
          <span className="grid h-12 w-12 place-items-center rounded-lg border border-emerald-400/40 bg-emerald-400 text-xl font-black text-emerald-950">
            FR
          </span>
          <div>
            <p className="text-xs font-black uppercase text-emerald-300">Acesso ao grupo</p>
            <h1 className="mt-1 text-3xl font-black text-white">FutRank</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-black ${
              mode === 'join' ? 'bg-emerald-400 text-emerald-950' : 'text-zinc-300'
            }`}
            onClick={() => {
              setMode('join')
              setMessage('')
            }}
            type="button"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Entrar
          </button>
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-black ${
              mode === 'create' ? 'bg-emerald-400 text-emerald-950' : 'text-zinc-300'
            }`}
            onClick={() => {
              setMode('create')
              setMessage('')
            }}
            type="button"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Criar
          </button>
        </div>

        {mode === 'join' ? (
          <form className="grid gap-4" onSubmit={handleJoin}>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Codigo do grupo
              <input
                autoComplete="one-time-code"
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-3 text-white outline-none placeholder:text-zinc-500"
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="FR-ABC123"
                type="text"
                value={accessCode}
              />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-400 bg-emerald-400 px-4 py-3 text-sm font-black text-emerald-950 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
              disabled={isSubmitting}
              type="submit"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Entrar no grupo
            </button>
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={handleCreate}>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Nome do grupo
              <input
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-3 text-white outline-none placeholder:text-zinc-500"
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="Pelada de quinta"
                type="text"
                value={groupName}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Nome do lider
              <input
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-3 text-white outline-none placeholder:text-zinc-500"
                onChange={(event) => setLeaderName(event.target.value)}
                placeholder="Carlos"
                type="text"
                value={leaderName}
              />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-400 bg-emerald-400 px-4 py-3 text-sm font-black text-emerald-950 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
              disabled={isSubmitting}
              type="submit"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              Criar como lider
            </button>
          </form>
        )}

        {message ? <p className="rounded border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-100">{message}</p> : null}
        {sync.error ? <p className="text-xs text-zinc-500">{sync.error}</p> : null}
      </section>
    </main>
  )
}
