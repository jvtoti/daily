import { useAnalytics } from '../hooks/useAnalytics'
import { Analytics } from '../components/analytics/Analytics'

export function AnalyticsPage() {
  const {
    globalAnalytics,
    weeklyProductivity,
    employeePerformance,
    isLoading,
    refresh
  } = useAnalytics(new Date())

  return (
    <div className="analytics-page">
      <header className="page-header">
        <div className="header-left">
          <h1 className="page-title">Análises</h1>
          <p className="page-subtitle">Desempenho e produtividade da equipe</p>
        </div>

        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={refresh}
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : '🔄 Atualizar'}
          </button>
        </div>
      </header>

      <Analytics
        globalAnalytics={globalAnalytics}
        weeklyProductivity={weeklyProductivity}
        employeePerformance={employeePerformance}
        isLoading={isLoading}
      />
    </div>
  )
}
