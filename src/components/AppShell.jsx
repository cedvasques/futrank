import { BarChart3, ClipboardList, LayoutDashboard, Shield, Star, Users } from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'players', label: 'Jogadores', icon: Users },
  { id: 'ratings', label: 'Avaliacoes', icon: Star },
  { id: 'teams', label: 'Times', icon: ClipboardList },
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'ranking', label: 'Ranking', icon: BarChart3 },
]

export function AppShell({ activePage, onPageChange, children }) {
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
          <span className="hidden rounded border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-200 sm:inline-flex">
            PWA MVP
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
