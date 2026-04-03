import { DailyReport, Task } from '../types'
import { getFromLocalStorage, setToLocalStorage } from './localStorage'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// ============================================
// LOCAL STORAGE FUNCTIONS (fallback)
// ============================================

const REPORTS_KEY = 'statusflow:reports'
const SELECTED_DATE_KEY = 'statusflow:selectedDate'

function getLocalStorageReports(): DailyReport[] {
  return getFromLocalStorage<DailyReport[]>(REPORTS_KEY) || []
}

function setLocalStorageReports(reports: DailyReport[]): void {
  setToLocalStorage(REPORTS_KEY, reports)
}

// ============================================
// SUPABASE FUNCTIONS
// ============================================

async function getSupabaseReports(): Promise<DailyReport[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      tasks (
        id,
        text,
        completed,
        created_at,
        updated_at
      )
    `)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching reports from Supabase:', error)
    return []
  }

  return (data || []).map(report => ({
    id: report.id,
    employeeId: report.employee_id,
    date: report.date,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
    tasks: (report.tasks || []).map(task => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }))
  }))
}

async function getSupabaseReportByEmployeeAndDate(
  employeeId: string,
  date: string
): Promise<DailyReport | null> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      tasks (
        id,
        text,
        completed,
        created_at,
        updated_at
      )
    `)
    .eq('employee_id', employeeId)
    .eq('date', date)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    employeeId: data.employee_id,
    date: data.date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    tasks: (data.tasks || []).map(task => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }))
  }
}

async function ensureSupabaseDailyReport(
  employeeId: string,
  date: string
): Promise<DailyReport> {
  // Try to get existing report first
  const existing = await getSupabaseReportByEmployeeAndDate(employeeId, date)
  if (existing) {
    return existing
  }

  // Create new report
  const { data, error } = await supabase
    .from('reports')
    .insert([{ employee_id: employeeId, date }])
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating daily report in Supabase:', error)
    throw error || new Error('Failed to create report')
  }

  return {
    id: data.id,
    employeeId: data.employee_id,
    date: data.date,
    tasks: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

async function saveSupabaseReport(report: DailyReport): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', report.id)

  if (error) {
    console.error('Error saving report to Supabase:', error)
    throw error
  }
}

async function addSupabaseTask(
  employeeId: string,
  date: string,
  text: string
): Promise<Task> {
  // Get or create report
  const report = await ensureSupabaseDailyReport(employeeId, date)

  // Add task
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ report_id: report.id, text }])
    .select()
    .single()

  if (error || !data) {
    console.error('Error adding task to Supabase:', error)
    throw error || new Error('Failed to add task')
  }

  // Update report timestamp
  await saveSupabaseReport(report)

  return {
    id: data.id,
    text: data.text,
    completed: data.completed,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

async function updateSupabaseTask(
  employeeId: string,
  date: string,
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<void> {
  const report = await getSupabaseReportByEmployeeAndDate(employeeId, date)
  if (!report) return

  // Update task
  const { error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task in Supabase:', error)
    throw error
  }

  // Update report timestamp
  await saveSupabaseReport(report)
}

async function removeSupabaseTask(
  employeeId: string,
  date: string,
  taskId: string
): Promise<void> {
  const report = await getSupabaseReportByEmployeeAndDate(employeeId, date)
  if (!report) return

  // Delete task
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Error removing task from Supabase:', error)
    throw error
  }

  // Update report timestamp
  await saveSupabaseReport(report)
}

async function toggleSupabaseTask(
  employeeId: string,
  date: string,
  taskId: string
): Promise<void> {
  const report = await getSupabaseReportByEmployeeAndDate(employeeId, date)
  if (!report) return

  const task = report.tasks.find(t => t.id === taskId)
  if (!task) return

  // Toggle task
  const { error } = await supabase
    .from('tasks')
    .update({ completed: !task.completed, updated_at: new Date().toISOString() })
    .eq('id', taskId)

  if (error) {
    console.error('Error toggling task in Supabase:', error)
    throw error
  }

  // Update report timestamp
  await saveSupabaseReport(report)
}

function getSupabaseSelectedDate(): string {
  const stored = localStorage.getItem(SELECTED_DATE_KEY)
  return stored || new Date().toISOString().split('T')[0]
}

function setSupabaseSelectedDate(date: string): void {
  localStorage.setItem(SELECTED_DATE_KEY, date)
}

// ============================================
// PUBLIC API (supports both localStorage and Supabase)
// ============================================

export async function getReports(): Promise<DailyReport[]> {
  if (isSupabaseConfigured()) {
    return await getSupabaseReports()
  }
  return getLocalStorageReports()
}

export async function getReportByEmployeeAndDate(
  employeeId: string,
  date: string
): Promise<DailyReport | null> {
  if (isSupabaseConfigured()) {
    return await getSupabaseReportByEmployeeAndDate(employeeId, date)
  }

  const reports = getLocalStorageReports()
  return (
    reports.find(
      report => report.employeeId === employeeId && report.date === date
    ) || null
  )
}

export async function ensureDailyReport(
  employeeId: string,
  date: string
): Promise<DailyReport> {
  if (isSupabaseConfigured()) {
    return await ensureSupabaseDailyReport(employeeId, date)
  }

  const reports = getLocalStorageReports()
  const existing = reports.find(
    report => report.employeeId === employeeId && report.date === date
  )

  if (existing) {
    return existing
  }

  const newReport: DailyReport = {
    id: generateReportId(),
    employeeId,
    date,
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  setLocalStorageReports([...reports, newReport])
  return newReport
}

export async function saveReport(report: DailyReport): Promise<void> {
  if (isSupabaseConfigured()) {
    return await saveSupabaseReport(report)
  }

  const reports = getLocalStorageReports()
  const index = reports.findIndex(r => r.id === report.id)

  if (index >= 0) {
    const updatedReports = [...reports]
    updatedReports[index] = {
      ...report,
      updatedAt: new Date().toISOString()
    }
    setLocalStorageReports(updatedReports)
  } else {
    setLocalStorageReports([...reports, report])
  }
}

export async function addTask(
  employeeId: string,
  date: string,
  text: string
): Promise<Task> {
  if (isSupabaseConfigured()) {
    return await addSupabaseTask(employeeId, date, text)
  }

  const report = await ensureDailyReport(employeeId, date)

  const newTask: Task = {
    id: generateTaskId(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  report.tasks.push(newTask)
  await saveReport(report)

  return newTask
}

export async function updateTask(
  employeeId: string,
  date: string,
  taskId: string,
  updates: Partial<Pick<Task, 'id' | 'createdAt'>>
): Promise<void> {
  if (isSupabaseConfigured()) {
    await updateSupabaseTask(employeeId, date, taskId, updates)
    return
  }

  const report = await getReportByEmployeeAndDate(employeeId, date)
  if (!report) return

  const taskIndex = report.tasks.findIndex(task => task.id === taskId)
  if (taskIndex < 0) return

  report.tasks[taskIndex] = {
    ...report.tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  await saveReport(report)
}

export async function removeTask(
  employeeId: string,
  date: string,
  taskId: string
): Promise<void> {
  if (isSupabaseConfigured()) {
    await removeSupabaseTask(employeeId, date, taskId)
    return
  }

  const report = await getReportByEmployeeAndDate(employeeId, date)
  if (!report) return

  report.tasks = report.tasks.filter(task => task.id !== taskId)
  await saveReport(report)
}

export async function toggleTask(
  employeeId: string,
  date: string,
  taskId: string
): Promise<void> {
  if (isSupabaseConfigured()) {
    await toggleSupabaseTask(employeeId, date, taskId)
    return
  }

  const report = await getReportByEmployeeAndDate(employeeId, date)
  if (!report) return

  const task = report.tasks.find(task => task.id === taskId)
  if (!task) return

  task.completed = !task.completed
  task.updatedAt = new Date().toISOString()

  await saveReport(report)
}

export function getSelectedDate(): string {
  if (isSupabaseConfigured()) {
    return getSupabaseSelectedDate()
  }
  const storedDate = localStorage.getItem(SELECTED_DATE_KEY)
  return storedDate || new Date().toISOString().split('T')[0]
}

export function setSelectedDate(date: string): void {
  if (isSupabaseConfigured()) {
    setSupabaseSelectedDate(date)
    return
  }
  localStorage.setItem(SELECTED_DATE_KEY, date)
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateReportId(): string {
  return `report_${Date.now().toString(36)}_${Math.random().toString(36).substr(2)}`
}

function generateTaskId(): string {
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).substr(2)}`
}
