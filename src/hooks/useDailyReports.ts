import { useState, useEffect } from 'react'
import { DailyReport, Task } from '../types'
import {
  getReportByEmployeeAndDate,
  ensureDailyReport,
  addTask as addTaskStorage,
  updateTask as updateTaskStorage,
  removeTask as removeTaskStorage,
  toggleTask as toggleTaskStorage
} from '../storage/reportsStorage'

export function useDailyReports(selectedDate: string) {
  const [reports, setReports] = useState<Map<string, DailyReport>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  const getEmployeeReport = async (employeeId: string): Promise<DailyReport> => {
    const cached = reports.get(employeeId)
    if (cached) {
      return cached
    }

    setIsLoading(true)
    const report = await ensureDailyReport(employeeId, selectedDate)
    setReports(prev => new Map(prev).set(employeeId, report))
    setIsLoading(false)
    return report
  }

  const addTask = async (employeeId: string, text: string): Promise<Task> => {
    setIsLoading(true)
    const task = await addTaskStorage(employeeId, selectedDate, text)
    const report = await getReportByEmployeeAndDate(employeeId, selectedDate)
    if (report) {
      setReports(prev => new Map(prev).set(employeeId, report))
    }
    setIsLoading(false)
    return task
  }

  const updateTask = async (
    employeeId: string,
    taskId: string,
    updates: Partial<Task>
  ): Promise<void> => {
    setIsLoading(true)
    await updateTaskStorage(employeeId, selectedDate, taskId, updates)
    const report = await getReportByEmployeeAndDate(employeeId, selectedDate)
    if (report) {
      setReports(prev => new Map(prev).set(employeeId, report))
    }
    setIsLoading(false)
  }

  const removeTask = async (employeeId: string, taskId: string): Promise<void> => {
    setIsLoading(true)
    await removeTaskStorage(employeeId, selectedDate, taskId)
    const report = await getReportByEmployeeAndDate(employeeId, selectedDate)
    if (report) {
      setReports(prev => new Map(prev).set(employeeId, report))
    }
    setIsLoading(false)
  }

  const toggleTask = async (employeeId: string, taskId: string): Promise<void> => {
    setIsLoading(true)
    await toggleTaskStorage(employeeId, selectedDate, taskId)
    const report = await getReportByEmployeeAndDate(employeeId, selectedDate)
    if (report) {
      setReports(prev => new Map(prev).set(employeeId, report))
    }
    setIsLoading(false)
  }

  const refreshReport = async (employeeId: string): Promise<void> => {
    setIsLoading(true)
    const report = await getReportByEmployeeAndDate(employeeId, selectedDate)
    if (report) {
      setReports(prev => new Map(prev).set(employeeId, report))
    }
    setIsLoading(false)
  }

  const refreshAll = async (): Promise<void> => {
    setIsLoading(true)
    setReports(new Map())
    setIsLoading(false)
  }

  // Clear cache when date changes
  useEffect(() => {
    setReports(new Map())
  }, [selectedDate])

  return {
    getEmployeeReport,
    addTask,
    updateTask,
    removeTask,
    toggleTask,
    refreshReport,
    refreshAll,
    isLoading
  }
}
