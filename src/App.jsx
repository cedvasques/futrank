import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { AdminPage } from './pages/AdminPage'
import { DashboardPage } from './pages/DashboardPage'
import { EvaluationsPage } from './pages/EvaluationsPage'
import { PlayersPage } from './pages/PlayersPage'
import { RankingPage } from './pages/RankingPage'
import { TeamsPage } from './pages/TeamsPage'

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
  const Page = pages[activePage]

  return (
    <AppShell activePage={activePage} onPageChange={setActivePage}>
      <Page onPageChange={setActivePage} />
    </AppShell>
  )
}

export default App
