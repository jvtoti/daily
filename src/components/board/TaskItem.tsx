import { useState } from 'react'
import { Task } from '../../types'

interface TaskItemProps {
  task: Task
  onToggle: () => void
  onUpdate: (text: string) => void
  onDelete: () => void
}

export function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)

  const handleSave = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== task.text) {
      onUpdate(trimmed)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditText(task.text)
      setIsEditing(false)
    }
  }

  const handleBlur = () => {
    handleSave()
  }

  return (
    <div className="task-item">
      <button
        className={`task-checkbox ${task.completed ? 'completed' : ''}`}
        onClick={onToggle}
        aria-label={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
      >
        {task.completed ? '✓' : ''}
      </button>

      {isEditing ? (
        <input
          type="text"
          className="task-input-edit"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <span
          className={`task-text ${task.completed ? 'completed' : ''}`}
          onClick={() => setIsEditing(true)}
          title="Clique para editar"
        >
          {task.text}
        </span>
      )}

      <button
        className="task-delete"
        onClick={onDelete}
        aria-label="Excluir tarefa"
      >
        ✕
      </button>
    </div>
  )
}
