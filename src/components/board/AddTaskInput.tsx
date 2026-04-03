import { useState, useRef } from 'react'

interface AddTaskInputProps {
  onAdd: (text: string) => void
  placeholder?: string
}

export function AddTaskInput({ onAdd, placeholder = 'Adicionar tarefa...' }: AddTaskInputProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = text.trim()
    if (trimmed) {
      onAdd(trimmed)
      setText('')
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <input
        ref={inputRef}
        type="text"
        className="add-task-input"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" className="add-task-button" aria-label="Adicionar tarefa">
        +
      </button>
    </form>
  )
}
