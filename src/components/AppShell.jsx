import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  CloudOff,
  Database,
  LayoutDashboard,
  LoaderCircle,
  Shield,
  Star,
  Users,
} from 'lucide-react'
import { useFutRankStore } from '../store/useFutRankStore'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'players', label: 'Jogadores', icon: Users },
  { id: 'ratings', label: 'Avaliacoes', icon: Star },
  { id: 'teams', label: 'Times', icon: ClipboardList },
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'ranking', label: 'Ranking', icon: BarChart3 },
]

const syncStatusConfig = {
  error: {
    icon: AlertTriangle,
    label: 'Erro no banco',
    className: 'border-red-400/40 text-red-200',
  },
  idle: {
    icon: Database,
    label: 'Supabase',
    className: 'border-emerald-400/30 text-emerald-200',
  },
  loading: {
    icon: LoaderCircle,
    label: 'Conectando',
    className: 'border-sky-400/40 text-sky-200',
  },
  local: {
    icon: CloudOff,
    label: 'Somente local',
    className: 'border-zinc-700 text-zinc-300',
  },
  pending: {
    icon: LoaderCircle,
    label: 'Pendente',
    className: 'border-amber-400/40 text-amber-200',
  },
  saving: {
    icon: LoaderCircle,
    label: 'Salvando',
    className: 'border-amber-400/40 text-amber-200',
  },
  synced: {
    icon: Database,
    label: 'Supabase',
    className: 'border-emerald-400/30 text-emerald-200',
  },
}

export function AppShell({ activePage, onPageChange, children }) {
  const sync = useFutRankStore((state) => state.sync)
  const status = syncStatusConfig[sync.status] ?? syncStatusConfig.local
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-[#060807] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-[#060807]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button className="flex items-center gap-3 text-left" onClick={() => onPageChange('dashboard')} type="button">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-400/40 bg-emerald-400 text-xl font-black text-emerald-950">
              FR
            </span>
            <span>
              <strong className="block text-lg font-black text-white">FutRank</strong>
              <small className="block text-xs text-zinc-400">Pelada equilibrada</small>
            </span>
          </button>
          <span
            className={`hidden items-center gap-2 rounded border px-3 py-1 text-xs font-bold sm:inline-flex ${status.className}`}
            title={sync.error ?? sync.message}
          >
            <StatusIcon
              className={`h-3.5 w-3.5 ${sync.status === 'loading' || sync.status === 'pending' || sync.status === 'saving' ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {status.label}
          </span>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id

            return (
              <button
                className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-bold transition ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-400 text-emerald-950'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-emerald-400/60 hover:text-white'
                }`}
                key={item.id}
                onClick={() => onPageChange(item.id)}
                type="button"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-5">{children}</main>
    </div>
  )
}
