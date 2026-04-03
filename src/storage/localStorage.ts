export const STORAGE_KEYS = {
  employees: 'statusflow:employees',
  reports: 'statusflow:reports',
  selectedDate: 'statusflow:selectedDate'
} as const

export function getFromLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return null
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
  }
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error)
  }
}
