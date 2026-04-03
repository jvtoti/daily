import { useState } from 'react'
import { DailyReport, Employee } from '../../types'
import { formatDate, getWeekLabel, getStartOfWeek, getEndOfWeek } from '../../utils/date'
import { exportDailyReportPdf } from '../../pdf/exportDailyReportPdf'
import { exportConsolidatedDailyPdf } from '../../pdf/exportConsolidatedDailyPdf'

interface ArchiveProps {
  reports: DailyReport[]
  employees: Employee[]
}

export function Archive({ reports, employees }: ArchiveProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  if (reports.length === 0) {
    return (
      <div className="archive-container">
        <div className="empty-state">
          <p>Nenhum relatório histórico disponível</p>
          <p className="empty-hint">Comece a adicionar tarefas para gerar histórico</p>
        </div>
      </div>
    )
  }

  // Group reports by week
  const groupedByWeek = groupReportsByWeek(reports)

  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev)
      if (next.has(date)) {
        next.delete(date)
      } else {
        next.add(date)
      }
      return next
    })
  }

  const handleExportIndividual = async (report: DailyReport) => {
    const employee = employees.find(emp => emp.id === report.employeeId)
    if (!employee) return

    try {
      await exportDailyReportPdf(report, employee)
    } catch (error) {
      alert('Erro ao exportar PDF individual. Verifique o console para mais detalhes.')
    }
  }

  const handleExportConsolidated = async (date: string) => {
    const dailyReports = reports.filter(r => r.date === date)
    try {
      await exportConsolidatedDailyPdf(date, dailyReports, employees)
    } catch (error) {
      alert('Erro ao exportar PDF consolidado. Verifique o console para mais detalhes.')
    }
  }

  return (
    <div className="archive-container">
      <div className="archive-header">
        <h1>Histórico de Relatórios</h1>
        <p className="archive-subtitle">Visualize e exporte relatórios por período</p>
      </div>

      <div className="archive-list">
        {Object.entries(groupedByWeek).map(([weekKey, weekData]) => (
          <WeekGroup
            key={weekKey}
            weekLabel={weekData.label}
            startDate={weekData.startDate}
            endDate={weekData.endDate}
            reports={weekData.reports}
            employees={employees}
            expandedDates={expandedDates}
            onToggleDate={toggleDate}
            onExportIndividual={handleExportIndividual}
            onExportConsolidated={handleExportConsolidated}
          />
        ))}
      </div>
    </div>
  )
}

interface WeekGroupProps {
  weekLabel: string
  startDate: string
  endDate: string
  reports: DailyReport[]
  employees: Employee[]
  expandedDates: Set<string>
  onToggleDate: (date: string) => void
  onExportIndividual: (report: DailyReport) => Promise<void>
  onExportConsolidated: (date: string) => Promise<void>
}

function WeekGroup({
  weekLabel,
  startDate,
  endDate,
  reports,
  employees,
  expandedDates,
  onToggleDate,
  onExportIndividual,
  onExportConsolidated
}: WeekGroupProps) {
  // Group reports by date within this week
  const reportsByDate = new Map<string, DailyReport[]>()
  reports.forEach(report => {
    const existing = reportsByDate.get(report.date) || []
    existing.push(report)
    reportsByDate.set(report.date, existing)
  })

  const dates = Array.from(reportsByDate.entries()).sort((a, b) =>
    b[0].localeCompare(a[0])
  )

  return (
    <div className="week-group">
      <div className="week-header">
        <h3 className="week-title">{weekLabel}</h3>
        <p className="week-dates">
          {formatDate(startDate)} - {formatDate(endDate)}
        </p>
      </div>

      <div className="week-reports">
        {dates.map(([date, dateReports]) => {
          const isExpanded = expandedDates.has(date)
          const totalTasks = dateReports.reduce((sum, r) => sum + r.tasks.length, 0)
          const completedTasks = dateReports.reduce(
            (sum, r) => sum + r.tasks.filter(t => t.completed).length,
            0
          )

          return (
            <DateGroup
              key={date}
              date={date}
              reports={dateReports}
              employees={employees}
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              isExpanded={isExpanded}
              onToggle={() => onToggleDate(date)}
              onExportIndividual={onExportIndividual}
              onExportConsolidated={onExportConsolidated}
            />
          )
        })}
      </div>
    </div>
  )
}

interface DateGroupProps {
  date: string
  reports: DailyReport[]
  employees: Employee[]
  totalTasks: number
  completedTasks: number
  isExpanded: boolean
  onToggle: () => void
  onExportIndividual: (report: DailyReport) => Promise<void>
  onExportConsolidated: (date: string) => Promise<void>
}

function DateGroup({
  date,
  reports,
  employees,
  totalTasks,
  completedTasks,
  isExpanded,
  onToggle,
  onExportIndividual,
  onExportConsolidated
}: DateGroupProps) {
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="date-group">
      <div className="date-header" onClick={onToggle}>
        <div className="date-info">
          <span className="date-badge">{formatDate(date)}</span>
          <span className="date-summary">
            {reports.length} funcionário(s) • {totalTasks} tarefas •{' '}
            {completionRate.toFixed(0)}% concluídas
          </span>
        </div>
        <button className="expand-toggle" aria-label="Expandir/Recolher">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="date-details">
          <div className="export-actions">
            <button
              className="btn-secondary btn-sm"
              onClick={() => onExportConsolidated(date)}
            >
              📄 Exportar Consolidado
            </button>
          </div>

          <div className="employee-reports-list">
            {reports.map(report => {
              const employee = employees.find(emp => emp.id === report.employeeId)
              if (!employee) return null

              const empCompleted = report.tasks.filter(t => t.completed).length
              const empTotal = report.tasks.length

              return (
                <div key={report.id} className="employee-report-row">
                  <div className="employee-report-info">
                    <span className="employee-name">{employee.name}</span>
                    <span className="employee-role">{employee.role}</span>
                  </div>
                  <div className="employee-report-stats">
                    <span>{empCompleted}/{empTotal} tarefas</span>
                    <button
                      className="btn-link"
                      onClick={() => onExportIndividual(report)}
                    >
                      Exportar PDF
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function groupReportsByWeek(reports: DailyReport[]): Record<string, any> {
  const grouped: Record<string, any> = {}

  reports.forEach(report => {
    const reportDate = new Date(report.date)
    const startOfWeek = getStartOfWeek(reportDate)
    const weekKey = startOfWeek.toISOString().split('T')[0]
    const endOfWeek = getEndOfWeek(reportDate)

    if (!grouped[weekKey]) {
      grouped[weekKey] = {
        label: getWeekLabel(reportDate),
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
        reports: []
      }
    }

    grouped[weekKey].reports.push(report)
  })

  // Sort weeks in descending order
  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
  const sortedGrouped: Record<string, any> = {}
  sortedKeys.forEach(key => {
    sortedGrouped[key] = grouped[key]
  })

  return sortedGrouped
}
