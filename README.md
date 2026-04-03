# StatusFlow - Relatório Diário da Equipe

## Descrição

StatusFlow é um aplicativo interno para registrar e acompanhar relatórios diários de tarefas da equipe. Permite criar funcionários, adicionar tarefas diárias, acompanhar desempenho e exportar relatórios em PDF.

**Suporta两种存储方式:**
- 📱 **localStorage** (padrão - funciona localmente sem configuração)
- ☁️ **Supabase** (opcional - sincronização na nuvem)

## Design System

O app utiliza o design system **Kinetic Darkness** (Neon-Noir Dashboard), com:
- Paleta de cores vibrantes (Pink, Purple) sobre fundo escuro
- Tipografia Manrope para títulos e Inter para corpo
- Bordas arredondadas e sombras suaves
- Interface sem linhas de borda tradicionais

## Funcionalidades

### Quadro Diário
- Listar todos os funcionários em cards
- Adicionar, editar, concluir e excluir tarefas
- Navegar por data
- Salvar automaticamente todas as alterações

### Modal Novo Funcionário
- Criar novos funcionários com nome e cargo
- Validação de campos obrigatórios
- Geração automática de avatar com iniciais

### Análises
- Métricas globais (total, concluídas, pendentes, produtividade)
- Gráfico de produtividade semanal
- Tabela de desempenho por funcionário
- Cálculos baseados em dados reais

### Arquivo / Histórico
- Listagem de relatórios agrupados por semana
- Expansão de detalhes por data
- Exportação de PDF individual por funcionário
- Exportação de PDF consolidado por data

## Estrutura do Projeto

```
statusflow/
├── src/
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── storage/            # localStorage e Supabase
│   │   ├── localStorage.ts
│   │   ├── employeesStorage.ts
│   │   └── reportsStorage.ts
│   ├── hooks/              # React hooks
│   │   ├── useEmployees.ts
│   │   ├── useSelectedDate.ts
│   │   ├── useDailyReports.ts
│   │   └── useAnalytics.ts
│   ├── utils/              # Utility functions
│   │   ├── date.ts
│   │   └── analytics.ts
│   ├── lib/               # Supabase client
│   │   └── supabase.ts
│   ├── pdf/                # PDF export functions
│   │   ├── exportDailyReportPdf.ts
│   │   └── exportConsolidatedDailyPdf.ts
│   ├── components/          # React components
│   │   ├── board/
│   │   ├── employees/
│   │   ├── analytics/
│   │   └── archive/
│   ├── pages/              # Page components
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── sql/
│       └── setup.sql        # SQL para configurar banco
├── public/
├── index.html
├── .env.example              # Template para variáveis de ambiente
├── package.json
├── tsconfig.json
├── vite.config.ts
├── DEPLOY_GUIDE.md         # Guia completo de deploy
└── README.md
```

## Instalação e Execução

### Modo Local (localStorage)

**Para desenvolvimento local sem configurar Supabase:**

```bash
npm install
npm run dev
```

O app estará disponível em `http://localhost:3000`

### Modo Online (Supabase)

**Para produção ou sincronização na nuvem:**

**1. Configurar Supabase**

Acesse https://supabase.com, crie um projeto e execute o SQL:

```bash
# No Supabase SQL Editor, execute:
cat supabase/sql/setup.sql
```

**2. Configurar variáveis de ambiente**

```bash
cp .env.example .env
# Edite .env com suas credenciais do Supabase
```

**3. Executar localmente**

```bash
npm install
npm run dev
```

Para deploy online, siga o [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md).

## Modelo de Dados

### Employee
```typescript
{
  id: string (UUID no Supabase)
  name: string
  role: string
  avatar?: string
  createdAt: string
}
```

### Task
```typescript
{
  id: string (UUID no Supabase)
  text: string
  completed: boolean
  createdAt: string
  updatedAt: string
}
```

### DailyReport
```typescript
{
  id: string (UUID no Supabase)
  employeeId: string (UUID no Supabase)
  date: string // YYYY-MM-DD
  tasks: Task[]
  createdAt: string
  updatedAt: string
}
```

## Regras de Negócio

### Regra Principal
**1 funcionário + 1 data = 1 relatório diário**

Se o relatório já existir para aquele funcionário naquela data, ele é editado. Se não existir, é criado automaticamente.

### Salvamento Automático
Todas as alterações são salvas automaticamente:
- **localStorage:** Salvo no navegador do usuário
- **Supabase:** Salvo no banco na nuvem, acessível por qualquer dispositivo

## Tecnologias

- React 18
- TypeScript 5
- Vite 5
- jsPDF (geração de PDF)
- Supabase (banco de dados PostgreSQL na nuvem) [opcional]
- localStorage (persistência local) [padrão]

## Suporte a localStorage e Supabase

O app funciona em dois modos:

### Modo localStorage (Padrão)
- Funciona imediatamente após `npm install`
- Dados salvos localmente no navegador
- Não precisa de configuração externa
- Ideal para desenvolvimento e testes

### Modo Supabase (Produção)
- Dados sincronizados na nuvem
- Acessíveis de qualquer dispositivo
- Múltiplos usuários podem acessar
- Requer configuração de variáveis de ambiente

**Mudança automática:** O app detecta automaticamente se Supabase está configurado (variáveis de ambiente presentes) e usa o método apropriado.

## Deploy Online

### Vercel + Supabase (Recomendado)

100% gratuito e completo:

- [Guia Completo de Deploy](DEPLOY_GUIDE.md)

**Resumo rápido:**
1. Criar projeto no Supabase
2. Executar SQL `supabase/sql/setup.sql`
3. Criar repo no GitHub
4. Conectar GitHub ao Vercel
5. Configurar variáveis de ambiente
6. Deploy automático!

### Outras Opções

- **Netlify + Firebase:** Alternativa gratuita
- **Render + PostgreSQL:** Mais customizável (pago após 90 dias)
- **GitHub Pages:** Apenas frontend, sem backend

## Browser Support

Funciona em todos os browsers modernos que suportam:
- ES2020
- localStorage
- CSS Grid e Flexbox
- Fetch API

## Notas

- O app funciona sem autenticação
- **localStorage:** Dados salvos localmente
- **Supabase:** Dados salvos na nuvem
- Design baseado nas telas conectadas via Stitch MCP
- Deploy automático com Vercel (quando usando GitHub)
- SQL otimizado com índices para performance

## Documentação Adicional

- [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) - Guia completo para colocar online
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Detalhes da implementação

## License

Projeto interno da equipe.
# statusflow
