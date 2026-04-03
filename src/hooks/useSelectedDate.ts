import { useState, useEffect } from 'react'
import { getSelectedDate, setSelectedDate as setSelectedDateStorage } from '../storage/reportsStorage'
import { addDays, subtractDays } from '../utils/date'

export function useSelectedDate() {
  const [selectedDate, setSelectedDateState] = useState<string>(() => {
    return getSelectedDate()
  })

  useEffect(() => {
    setSelectedDateStorage(selectedDate)
  }, [selectedDate])

  const setDate = (date: string) => {
    setSelectedDateState(date)
  }

  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0]
    setDate(today)
  }

  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate)
    const previousDay = subtractDays(currentDate, 1)
    setDate(previousDay.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate)
    const nextDay = addDays(currentDate, 1)
    setDate(nextDay.toISOString().split('T')[0])
  }

  return {
    selectedDate,
    setDate,
    goToToday,
    goToPreviousDay,
    goToNextDay
  }
}
