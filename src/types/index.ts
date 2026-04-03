export type Employee = {
  id: string
  name: string
  role: string
  avatar?: string
  createdAt: string
}

export type Task = {
  id: string
  text: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type DailyReport = {
  id: string
  employeeId: string
  date: string // YYYY-MM-DD
  tasks: Task[]
  createdAt: string
  updatedAt: string
}

export type GlobalAnalytics = {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  activeMembers: number
  averageProductivity: number
}

export type WeeklyPoint = {
  label: string
  date: string
  totalTasks: number
  completedTasks: number
  productivity: number
}

export type EmployeePerformance = {
  employeeId: string
  name: string
  role: string
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  completionRate: number
  lastActivityDate: string | null
}

export type StatusDistribution = {
  completed: number
  pending: number
}

export type ArchiveGroup = {
  label: string
  startDate: string
  endDate: string
  reports: DailyReport[]
}
