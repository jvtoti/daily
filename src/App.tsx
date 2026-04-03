import { useState } from 'react'
import { BoardPage } from './pages/BoardPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ArchivePage } from './pages/ArchivePage'

type Page = 'board' | 'analytics' | 'archive'

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('board')

  return (
    <div className="app">
      <nav className="main-nav">
        <button
          className={`nav-item ${currentPage === 'board' ? 'active' : ''}`}
          onClick={() => setCurrentPage('board')}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Quadro</span>
        </button>
        <button
          className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentPage('analytics')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Análises</span>
        </button>
        <button
          className={`nav-item ${currentPage === 'archive' ? 'active' : ''}`}
          onClick={() => setCurrentPage('archive')}
        >
          <span className="nav-icon">📁</span>
          <span className="nav-label">Arquivo</span>
        </button>
      </nav>

      <main className="main-content">
        {currentPage === 'board' && <BoardPage />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'archive' && <ArchivePage />}
      </main>
    </div>
  )
}
