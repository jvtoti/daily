import { useState, useEffect } from 'react'
import { Employee } from '../types'
import { getEmployees, createEmployee as createEmployeeStorage } from '../storage/employeesStorage'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    setIsLoading(true)
    const loaded = await getEmployees()
    setEmployees(loaded)
    setIsLoading(false)
  }

  const createEmployee = async (name: string, role: string): Promise<Employee> => {
    const newEmployee = await createEmployeeStorage(name, role)
    setEmployees(prev => [...prev, newEmployee])
    return newEmployee
  }

  const refreshEmployees = async () => {
    await loadEmployees()
  }

  return {
    employees,
    isLoading,
    createEmployee,
    refreshEmployees
  }
}
