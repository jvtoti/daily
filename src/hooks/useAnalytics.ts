import { useState, useEffect } from 'react'
import { DailyReport, Employee, GlobalAnalytics, WeeklyPoint, EmployeePerformance, StatusDistribution } from '../types'
import { getReports } from '../storage/reportsStorage'
import { getEmployees } from '../storage/employeesStorage'
import { getGlobalAnalytics, getWeeklyProductivity, getEmployeePerformance, getStatusDistribution } from '../utils/analytics'

export function useAnalytics(referenceDate: Date = new Date()) {
  const [reports, setReports] = useState<DailyReport[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [globalAnalytics, setGlobalAnalytics] = useState<GlobalAnalytics | null>(null)
  const [weeklyProductivity, setWeeklyProductivity] = useState<WeeklyPoint[]>([])
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([])
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [referenceDate])

  const loadData = async () => {
    setIsLoading(true)

    try {
      const allReports = await getReports()
      const allEmployees = await getEmployees()

      const reports = Array.isArray(allReports) ? allReports : []
      const employees = Array.isArray(allEmployees) ? allEmployees : []

      setReports(reports)
      setEmployees(employees)

      const analytics = getGlobalAnalytics(reports, employees)
      const weekly = getWeeklyProductivity(reports, referenceDate)
      const performance = getEmployeePerformance(reports, employees)
      const distribution = getStatusDistribution(reports)

      setGlobalAnalytics(analytics)
      setWeeklyProductivity(weekly)
      setEmployeePerformance(performance)
      setStatusDistribution(distribution)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      setReports([])
      setEmployees([])
      setGlobalAnalytics({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        activeMembers: 0,
        averageProductivity: 0
      })
      setWeeklyProductivity([])
      setEmployeePerformance([])
      setStatusDistribution({ completed: 0, pending: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = () => {
    loadData()
  }

  return {
    reports,
    employees,
    globalAnalytics,
    weeklyProductivity,
    employeePerformance,
    statusDistribution,
    isLoading,
    refresh
  }
}
