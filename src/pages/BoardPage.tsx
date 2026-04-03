import { useState } from 'react'
import { useEmployees } from '../hooks/useEmployees'
import { useSelectedDate } from '../hooks/useSelectedDate'
import { useDailyReports } from '../hooks/useDailyReports'
import { EmployeeCard } from '../components/board/EmployeeCard'
import { NewEmployeeModal } from '../components/employees/NewEmployeeModal'
import { formatDate, isToday } from '../utils/date'

export function BoardPage() {
  const { employees, isLoading: employeesLoading, createEmployee, refreshEmployees } = useEmployees()
  const { selectedDate, goToToday, goToPreviousDay, goToNextDay } = useSelectedDate()
  const { getEmployeeReport, addTask, updateTask, toggleTask, removeTask, isLoading: reportsLoading } = useDailyReports(selectedDate)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateEmployee = async (name: string, role: string) => {
    await createEmployee(name, role)
    await refreshEmployees()
  }

  const handleAddTask = async (employeeId: string, text: string) => {
    await addTask(employeeId, text)
  }

  const handleUpdateTask = async (employeeId: string, taskId: string, updates: any) => {
    await updateTask(employeeId, taskId, updates)
  }

  const handleToggleTask = async (employeeId: string, taskId: string) => {
    await toggleTask(employeeId, taskId)
  }

  const handleDeleteTask = async (employeeId: string, taskId: string) => {
    await removeTask(employeeId, taskId)
  }

  const isLoading = employeesLoading || reportsLoading

  return (
    <div className="board-page">
      <header className="board-header">
        <div className="header-left">
          <h1 className="app-title">StatusFlow</h1>
          <p className="app-subtitle">Relatório Diário da Equipe</p>
        </div>

        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : '+ Novo Funcionário'}
          </button>
        </div>
      </header>

      <div className="date-navigation">
        <button className="nav-button" onClick={goToPreviousDay} aria-label="Dia anterior" disabled={isLoading}>
          ‹
        </button>
        <button
          className={`date-button ${isToday(selectedDate) ? 'today' : ''}`}
          onClick={goToToday}
          disabled={isLoading}
        >
          {formatDate(selectedDate)}
          {isToday(selectedDate) && <span className="today-badge">Hoje</span>}
        </button>
        <button className="nav-button" onClick={goToNextDay} aria-label="Próximo dia" disabled={isLoading}>
          ›
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar funcionário..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {isLoading ? (
        <div className="loading-state">
          <p>Carregando dados...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="empty-board">
          {searchQuery ? (
            <>
              <p className="empty-title">Nenhum funcionário encontrado</p>
              <p className="empty-description">
                Tente buscar com outro termo
              </p>
            </>
          ) : (
            <>
              <p className="empty-title">Nenhum funcionário cadastrado</p>
              <p className="empty-description">
                Clique em "Novo Funcionário" para começar
              </p>
              <button
                className="btn-secondary"
                onClick={() => setIsModalOpen(true)}
              >
                Adicionar Funcionário
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="employee-cards-grid">
          {filteredEmployees.map(employee => {
            const reportPromise = getEmployeeReport(employee.id)

            return (
              <EmployeeCardWrapper
                key={employee.id}
                employee={employee}
                reportPromise={reportPromise}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            )
          })}
        </div>
      )}

      <NewEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEmployee}
      />
    </div>
  )
}

interface EmployeeCardWrapperProps {
  employee: any
  reportPromise: Promise<any>
  onAddTask: (employeeId: string, text: string) => Promise<void>
  onUpdateTask: (employeeId: string, taskId: string, updates: any) => Promise<void>
  onToggleTask: (employeeId: string, taskId: string) => Promise<void>
  onDeleteTask: (employeeId: string, taskId: string) => Promise<void>
}

function EmployeeCardWrapper({
  employee,
  reportPromise,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask
}: EmployeeCardWrapperProps) {
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    reportPromise.then(setReport)
  }, [reportPromise])

  if (!report) {
    return (
      <div className="employee-card">
        <div className="loading-state">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <EmployeeCard
      employee={employee}
      report={report}
      onAddTask={(text) => onAddTask(employee.id, text)}
      onUpdateTask={(taskId, updates) => onUpdateTask(employee.id, taskId, updates)}
      onToggleTask={(taskId) => onToggleTask(employee.id, taskId)}
      onDeleteTask={(taskId) => onDeleteTask(employee.id, taskId)}
    />
  )
}
