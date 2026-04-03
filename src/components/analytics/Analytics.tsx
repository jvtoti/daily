import { GlobalAnalytics, WeeklyPoint, EmployeePerformance } from '../../types'
import { formatDate } from '../../utils/date'

interface AnalyticsProps {
  globalAnalytics: GlobalAnalytics | null
  weeklyProductivity: WeeklyPoint[]
  employeePerformance: EmployeePerformance[]
  isLoading: boolean
}

export function Analytics({
  globalAnalytics,
  weeklyProductivity,
  employeePerformance,
  isLoading
}: AnalyticsProps) {
  if (isLoading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <p>Carregando análises...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-container">
      {/* Global Metrics */}
      <section className="analytics-section">
        <h2 className="section-title">Métricas Gerais</h2>
        <div className="metrics-grid">
          <MetricCard
            title="Total de Tarefas"
            value={globalAnalytics?.totalTasks || 0}
            icon="📋"
          />
          <MetricCard
            title="Concluídas"
            value={globalAnalytics?.completedTasks || 0}
            icon="✅"
          />
          <MetricCard
            title="Pendentes"
            value={globalAnalytics?.pendingTasks || 0}
            icon="⏳"
          />
          <MetricCard
            title="Membros Ativos"
            value={globalAnalytics?.activeMembers || 0}
            icon="👥"
          />
          <MetricCard
            title="Produtividade Média"
            value={`${(globalAnalytics?.averageProductivity || 0).toFixed(1)}%`}
            icon="📊"
            highlight
          />
        </div>
      </section>

      {/* Weekly Chart */}
      <section className="analytics-section">
        <h2 className="section-title">Produtividade Semanal</h2>
        <div className="weekly-chart">
          {weeklyProductivity && weeklyProductivity.length > 0 ? weeklyProductivity.map((point, index) => (
            <div key={point.date} className="chart-bar-container">
              <div className="chart-bar">
                <div
                  className="chart-bar-fill"
                  style={{ height: `${Math.max(point.productivity, 5)}%` }}
                >
                  <span className="chart-bar-label">
                    {point.productivity.toFixed(0)}%
                  </span>
                </div>
              </div>
              <span className="chart-day-label">{point.label}</span>
            </div>
          )) : (
            <div className="empty-state">
              <p>Nenhum dado de produtividade disponível</p>
            </div>
          )}
        </div>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color"></span>
            Produtividade diária
          </span>
        </div>
      </section>

      {/* Employee Performance */}
      <section className="analytics-section">
        <h2 className="section-title">Desempenho por Funcionário</h2>
        {employeePerformance.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum dado de desempenho disponível</p>
          </div>
        ) : (
          <div className="performance-table">
            <table>
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Cargo</th>
                  <th>Total</th>
                  <th>Concluídas</th>
                  <th>Pendentes</th>
                  <th>Taxa</th>
                  <th>Última Atividade</th>
                </tr>
              </thead>
              <tbody>
                {employeePerformance.map(emp => (
                  <tr key={emp.employeeId}>
                    <td className="employee-name-cell">{emp.name}</td>
                    <td className="employee-role-cell">{emp.role}</td>
                    <td className="metric-cell">{emp.totalTasks}</td>
                    <td className="metric-cell completed">{emp.completedTasks}</td>
                    <td className="metric-cell pending">{emp.pendingTasks}</td>
                    <td className="metric-cell rate">{emp.completionRate.toFixed(1)}%</td>
                    <td className="metric-cell date">
                      {emp.lastActivityDate
                        ? formatDate(new Date(emp.lastActivityDate))
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: string
  highlight?: boolean
}

function MetricCard({ title, value, icon, highlight }: MetricCardProps) {
  return (
    <div className={`metric-card ${highlight ? 'highlight' : ''}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <p className="metric-title">{title}</p>
        <p className="metric-value">{value}</p>
      </div>
    </div>
  )
}
