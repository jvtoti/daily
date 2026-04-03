-- ============================================
-- StatusFlow - Database Setup for Supabase
-- ============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: employees
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: reports
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- Formato: YYYY-MM-DD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date) -- Garante 1 relatório por funcionário por data
);

-- ============================================
-- TABELA: tasks
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para performance
-- ============================================

-- Índice para buscar relatórios por data
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);

-- Índice para buscar relatórios por funcionário
CREATE INDEX IF NOT EXISTS idx_reports_employee_id ON reports(employee_id);

-- Índice para buscar tarefas por relatório
CREATE INDEX IF NOT EXISTS idx_tasks_report_id ON tasks(report_id);

-- Índice para buscar tarefas concluídas
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

-- ============================================
-- TRIGGER para atualizar updated_at automaticamente
-- ============================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para reports
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Políticas para employees (público - app sem login)
CREATE POLICY "Employees are viewable by everyone"
  ON employees
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert employees"
  ON employees
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update employees"
  ON employees
  FOR UPDATE
  USING (true);

-- Políticas para reports (público)
CREATE POLICY "Reports are viewable by everyone"
  ON reports
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert reports"
  ON reports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update reports"
  ON reports
  FOR UPDATE
  USING (true);

-- Políticas para tasks (público)
CREATE POLICY "Tasks are viewable by everyone"
  ON tasks
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete tasks"
  ON tasks
  FOR DELETE
  USING (true);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para relatórios com contagem de tarefas
CREATE OR REPLACE VIEW reports_with_task_counts AS
SELECT
  r.id,
  r.employee_id,
  r.date,
  r.created_at,
  r.updated_at,
  COUNT(t.id) FILTER (WHERE NOT t.completed) as pending_tasks,
  COUNT(t.id) FILTER (WHERE t.completed) as completed_tasks,
  COUNT(t.id) as total_tasks
FROM reports r
LEFT JOIN tasks t ON t.report_id = r.id
GROUP BY r.id, r.employee_id, r.date, r.created_at, r.updated_at;

-- ============================================
-- DADOS DE EXEMPLO (opcional - comentar em produção)
-- ============================================

-- INSERT INTO employees (name, role, avatar) VALUES
-- ('João Silva', 'Desenvolvedor Frontend', 'JS'),
-- ('Maria Santos', 'Product Designer', 'MS'),
-- ('Pedro Oliveira', 'Engenheiro de Software', 'PO');

-- ============================================
-- NOTAS
-- ============================================
-- 1. Todas as tabelas usam UUID como chave primária
-- 2. reports tem constraint UNIQUE para garantir 1 por funcionário/data
-- 3. RLS habilitado mas com acesso público (app sem login)
-- 4. Triggers atualizam updated_at automaticamente
-- 5. Índices para melhorar performance das queries
-- 6. CASCADE DELETE garante integridade referencial
