import {
  DailyReport,
  Employee,
  GlobalAnalytics,
  WeeklyPoint,
  EmployeePerformance,
  StatusDistribution
} from '../types'
import { getDaysOfWeek } from './date'

export function getGlobalAnalytics(
  reports: DailyReport[],
  employees: Employee[]
): GlobalAnalytics {
  const totalTasks = reports.reduce((sum, report) => sum + report.tasks.length, 0)
  const completedTasks = reports.reduce(
    (sum, report) =>
      sum + report.tasks.filter(task => task.completed).length,
    0
  )
  const pendingTasks = totalTasks - completedTasks

  const employeeIdsWithTasks = new Set(reports.map(r => r.employeeId))
  const activeMembers = employeeIdsWithTasks.size

  const averageProductivity =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    activeMembers,
    averageProductivity
  }
}

export function getWeeklyProductivity(
  reports: DailyReport[],
  referenceDate: Date
): WeeklyPoint[] {
  const weekDays = getDaysOfWeek(referenceDate)
  const reportByDate = new Map<string, DailyReport[]>()

  // Group reports by date
  reports.forEach(report => {
    const existing = reportByDate.get(report.date) || []
    existing.push(report)
    reportByDate.set(report.date, existing)
  })

  return weekDays.map(day => {
    const dayReports = reportByDate.get(day.date) || []
    const totalTasks = dayReports.reduce(
      (sum, report) => sum + report.tasks.length,
      0
    )
    const completedTasks = dayReports.reduce(
      (sum, report) =>
        sum + report.tasks.filter(task => task.completed).length,
      0
    )
    const productivity = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return {
      label: day.label,
      date: day.date,
      totalTasks,
      completedTasks,
      productivity
    }
  })
}

export function getStatusDistribution(reports: DailyReport[]): StatusDistribution {
  const completed = reports.reduce(
    (sum, report) =>
      sum + report.tasks.filter(task => task.completed).length,
    0
  )
  const pending = reports.reduce(
    (sum, report) =>
      sum + report.tasks.filter(task => !task.completed).length,
    0
  )

  return { completed, pending }
}

export function getEmployeePerformance(
  reports: DailyReport[],
  employees: Employee[]
): EmployeePerformance[] {
  const employeeReports = new Map<string, DailyReport[]>()

  reports.forEach(report => {
    const existing = employeeReports.get(report.employeeId) || []
    existing.push(report)
    employeeReports.set(report.employeeId, existing)
  })

  return employees.map(employee => {
    const empReports = employeeReports.get(employee.id) || []
    const totalTasks = empReports.reduce(
      (sum, report) => sum + report.tasks.length,
      0
    )
    const completedTasks = empReports.reduce(
      (sum, report) =>
        sum + report.tasks.filter(task => task.completed).length,
      0
    )
    const pendingTasks = totalTasks - completedTasks
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Find last activity date
    const lastActivityDate = empReports
      .filter(r => r.tasks.length > 0)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.updatedAt || null

    return {
      employeeId: employee.id,
      name: employee.name,
      role: employee.role,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      lastActivityDate
    }
  })
}
