import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { AdminPage } from './pages/AdminPage'
import { DashboardPage } from './pages/DashboardPage'
import { EvaluationsPage } from './pages/EvaluationsPage'
import { LoginPage } from './pages/LoginPage'
import { PlayersPage } from './pages/PlayersPage'
import { RankingPage } from './pages/RankingPage'
import { TeamsPage } from './pages/TeamsPage'
import { useFutRankStore } from './store/useFutRankStore'

const pages = {
  dashboard: DashboardPage,
  players: PlayersPage,
  ratings: EvaluationsPage,
  teams: TeamsPage,
  admin: AdminPage,
  ranking: RankingPage,
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const initializeCloudSync = useFutRankStore((state) => state.initializeCloudSync)
  const authStatus = useFutRankStore((state) => state.auth.status)
  const authRole = useFutRankStore((state) => state.auth.role)

  useEffect(() => {
    initializeCloudSync()
  }, [initializeCloudSync])

  if (authStatus === 'checking') {
    return (
      <main className="grid min-h-screen place-items-center bg-[#060807] px-4 text-zinc-100">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-5 py-4 text-sm font-bold text-zinc-300">
          Carregando grupo...
        </div>
      </main>
    )
  }

  if (authStatus !== 'authenticated') {
    return <LoginPage />
  }

  const effectivePage = authRole === 'admin' || activePage !== 'admin' ? activePage : 'dashboard'
  const Page = pages[effectivePage] ?? DashboardPage

  return (
    <AppShell activePage={effectivePage} onPageChange={setActivePage}>
      <Page onPageChange={setActivePage} />
    </AppShell>
  )
}

export default App
