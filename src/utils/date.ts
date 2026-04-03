export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  d.setDate(diff)
  return d
}

export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return end
}

export function getWeekNumber(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return weekNo
}

export function getWeekLabel(date: Date): string {
  const start = getStartOfWeek(date)
  const end = getEndOfWeek(date)
  const weekNum = getWeekNumber(date)

  return `Semana ${weekNum}: ${formatDate(start)} a ${formatDate(end)}`
}

export function getDaysOfWeek(date: Date): Array<{ label: string; date: string }> {
  const days: Array<{ label: string; date: string }> = []
  const start = getStartOfWeek(date)

  const dayLabels = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push({
      label: dayLabels[i],
      date: d.toISOString().split('T')[0]
    })
  }

  return days
}

export function isToday(date: string): boolean {
  return date === new Date().toISOString().split('T')[0]
}

export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
