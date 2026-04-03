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

    const allReports = await getReports()
    const allEmployees = await getEmployees()

    setReports(allReports)
    setEmployees(allEmployees)

    setGlobalAnalytics(getGlobalAnalytics(allReports, allEmployees))
    setWeeklyProductivity(getWeeklyProductivity(allReports, referenceDate))
    setEmployeePerformance(getEmployeePerformance(allReports, allEmployees))
    setStatusDistribution(getStatusDistribution(allReports))

    setIsLoading(false)
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
