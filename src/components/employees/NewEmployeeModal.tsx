import { useState } from 'react'

interface NewEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, role: string) => void
}

export function NewEmployeeModal({ isOpen, onClose, onSubmit }: NewEmployeeModalProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    const trimmedRole = role.trim()

    if (!trimmedName) {
      setError('O nome é obrigatório')
      return
    }

    if (!trimmedRole) {
      setError('O cargo é obrigatório')
      return
    }

    onSubmit(trimmedName, trimmedRole)
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setRole('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Novo Funcionário</h2>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="employee-name" className="form-label">
              Nome completo *
            </label>
            <input
              id="employee-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="Ex: João Silva"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="employee-role" className="form-label">
              Cargo / Função *
            </label>
            <input
              id="employee-role"
              type="text"
              className="form-input"
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                setError('')
              }}
              placeholder="Ex: Desenvolvedor Frontend"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
