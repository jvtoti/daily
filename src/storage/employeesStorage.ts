import { Employee } from '../types'
import { getFromLocalStorage, setToLocalStorage } from './localStorage'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// ============================================
// LOCAL STORAGE FUNCTIONS (fallback)
// ============================================

const STORAGE_KEY = 'statusflow:employees'

function getLocalStorageEmployees(): Employee[] {
  return getFromLocalStorage<Employee[]>(STORAGE_KEY) || []
}

function setLocalStorageEmployees(employees: Employee[]): void {
  setToLocalStorage(STORAGE_KEY, employees)
}

// ============================================
// SUPABASE FUNCTIONS
// ============================================

async function getSupabaseEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching employees from Supabase:', error)
    return []
  }

  return (data || []).map(emp => ({
    id: emp.id,
    name: emp.name,
    role: emp.role,
    avatar: emp.avatar,
    createdAt: emp.created_at
  }))
}

async function createSupabaseEmployee(name: string, role: string, avatar?: string): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert([{ name, role, avatar }])
    .select()
    .single()

  if (error) {
    console.error('Error creating employee in Supabase:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    role: data.role,
    avatar: data.avatar,
    createdAt: data.created_at
  }
}

// ============================================
// PUBLIC API (supports both localStorage and Supabase)
// ============================================

export async function getEmployees(): Promise<Employee[]> {
  if (isSupabaseConfigured()) {
    return await getSupabaseEmployees()
  }
  return getLocalStorageEmployees()
}

export async function setEmployees(employees: Employee[]): Promise<void> {
  if (isSupabaseConfigured()) {
    // Supabase doesn't need a "set all" operation
    // Each operation handles individual items
    return
  }
  setLocalStorageEmployees(employees)
}

export async function createEmployee(name: string, role: string): Promise<Employee> {
  const avatar = generateAvatarPlaceholder(name.trim())
  const trimmedName = name.trim()
  const trimmedRole = role.trim()

  if (isSupabaseConfigured()) {
    return await createSupabaseEmployee(trimmedName, trimmedRole, avatar)
  }

  // Fallback to localStorage
  const employees = getLocalStorageEmployees()
  const newEmployee: Employee = {
    id: generateId(),
    name: trimmedName,
    role: trimmedRole,
    avatar,
    createdAt: new Date().toISOString()
  }
  setLocalStorageEmployees([...employees, newEmployee])
  return newEmployee
}

export async function getEmployeeById(id: string): Promise<Employee | undefined> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return undefined
    }

    return {
      id: data.id,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      createdAt: data.created_at
    }
  }

  const employees = getLocalStorageEmployees()
  return employees.find(emp => emp.id === id)
}

export async function refreshEmployees(): Promise<void> {
  // Force refresh from Supabase or localStorage
  if (isSupabaseConfigured()) {
    // This will fetch fresh data
    await getSupabaseEmployees()
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function generateAvatarPlaceholder(name: string): string {
  const initials = name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  return initials
}
