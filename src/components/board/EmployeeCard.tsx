import { Employee, DailyReport, Task } from '../../types'
import { TaskItem } from './TaskItem'
import { AddTaskInput } from './AddTaskInput'

interface EmployeeCardProps {
  employee: Employee
  report: DailyReport
  onAddTask: (text: string) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

export function EmployeeCard({
  employee,
  report,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask
}: EmployeeCardProps) {
  const completedCount = report.tasks.filter(t => t.completed).length
  const totalCount = report.tasks.length
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="employee-card">
      <div className="employee-header">
        <div className="employee-avatar">
          {employee.avatar || employee.name.charAt(0).toUpperCase()}
        </div>
        <div className="employee-info">
          <h3 className="employee-name">{employee.name}</h3>
          <p className="employee-role">{employee.role}</p>
        </div>
        <div className="employee-stats">
          <span className="completion-rate">
            {completionRate.toFixed(0)}%
          </span>
          <span className="task-count">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      <div className="tasks-list">
        {report.tasks.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma tarefa registrada</p>
          </div>
        ) : (
          report.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggleTask(task.id)}
              onUpdate={(text) => onUpdateTask(task.id, { text })}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))
        )}
      </div>

      <div className="add-task-section">
        <AddTaskInput
          onAdd={onAddTask}
          placeholder="Adicionar tarefa..."
        />
      </div>
    </div>
  )
}
