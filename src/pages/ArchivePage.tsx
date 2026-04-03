import { useState } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import { Archive } from '../components/archive/Archive'

export function ArchivePage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const { reports, employees, isLoading } = useAnalytics()

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="archive-page">
      <header className="page-header">
        <div className="header-left">
          <h1 className="page-title">Arquivo</h1>
          <p className="page-subtitle">Histórico de relatórios e exportação</p>
        </div>

        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : '🔄 Atualizar'}
          </button>
        </div>
      </header>

      <Archive reports={reports} employees={employees} />
    </div>
  )
}
