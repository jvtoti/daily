# 🚀 Guia de Deploy - Vercel + Supabase

Este guia mostra como colocar o StatusFlow online gratuitamente usando Vercel e Supabase.

---

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com) (grátis)
- Conta no [Vercel](https://vercel.com) (grátis)
- Conta no [Supabase](https://supabase.com) (grátis)

---

## 🗄️ Passo 1: Configurar Supabase

### 1.1 Criar Projeto

1. Acesse: https://supabase.com
2. Clique em "New Project"
3. Preencha:
   - **Name:** `statusflow`
   - **Database Password:** (crie uma senha segura e guarde!)
   - **Region:** Escolha "South East Asia (Singapore)" ou o mais próximo
4. Clique em "Create new project"
5. Aguarde ~2 minutos para o projeto ser criado

### 1.2 Configurar o Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor**
2. Copie o conteúdo de: `supabase/sql/setup.sql`
3. Cole no SQL Editor
4. Clique em **Run** (▶️)
5. Verifique se aparece "Success" na tabela inferior

O que será criado:
- ✅ Tabela `employees`
- ✅ Tabela `reports`
- ✅ Tabela `tasks`
- ✅ Índices para performance
- ✅ Triggers para timestamps automáticos
- ✅ Row Level Security (RLS)

### 1.3 Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** (ícone de engrenagem ⚙️)
2. No menu lateral, vá em **API**
3. Copie os valores:
   - **Project URL:** (ex: `https://xyz.supabase.co`)
   - **anon / public key:** (começa com `eyJ...`)

---

## 📦 Passo 2: Configurar Projeto Local

### 2.1 Criar arquivo .env

No terminal, dentro da pasta do projeto:

```bash
cp .env.example .env
```

### 2.2 Editar .env

Abra o arquivo `.env` e preencha:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Importante:** Use as credenciais que você copiou do Supabase!

### 2.3 Testar Localmente

```bash
cd /home/user/daily/statusflow
npm run dev
```

O app deve funcionar normalmente. Se funcionar, a integração está correta!

---

## 🔗 Passo 3: Preparar GitHub

### 3.1 Inicializar Git (se ainda não tiver)

```bash
cd /home/user/daily/statusflow
git init
git add .
git commit -m "feat: StatusFlow com Supabase integration"
```

### 3.2 Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. **Repository name:** `statusflow`
3. Marque: **Public** (ou Private, sua preferência)
4. Clique em "Create repository"

### 3.3 Fazer Push

```bash
git remote add origin https://github.com/SEU_USUARIO/statusflow.git
git branch -M main
git push -u origin main
```

---

## 🚀 Passo 4: Deploy no Vercel

### 4.1 Conectar GitHub ao Vercel

1. Acesse: https://vercel.com
2. Clique em "Sign Up" ou "Login"
3. Escolha "Continue with GitHub"
4. Autorize o Vercel a acessar seu GitHub

### 4.2 Criar Novo Projeto no Vercel

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Vercel vai listar seus repositórios GitHub
3. Encontre e clique em **statusflow**
4. Clique em **Import**

### 4.3 Configurar Variáveis de Ambiente

Vercel vai detectar que é um projeto Vite. Configure:

**Framework Preset:** Vite

**Environment Variables** (adicione as duas):

| Nome | Valor | Ambiente |
|------|--------|-----------|
| `VITE_SUPABASE_URL` | Sua URL do Supabase | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Sua chave anon do Supabase | Production, Preview, Development |

### 4.4 Deploy

1. Clique em **Deploy**
2. Aguarde ~1-2 minutos
3. Quando aparecer **Congratulations!**, o deploy foi bem-sucedido!

### 4.5 Acessar App Online

Vercel vai fornecer uma URL como:
- `https://statusflow.vercel.app`
- Ou `https://statusflow-seu-usuario.vercel.app`

Clique para acessar seu app online! 🎉

---

## 🔄 Passo 5: Atualizações Automáticas

### Funcionalidade

A partir de agora, toda vez que você fazer `push` no GitHub, o Vercel vai automaticamente:

1. Detectar as mudanças
2. Fazer build do projeto
3. Fazer deploy automático
4. Atualizar a URL online

### Fluxo de Trabalho

```bash
# Fazer mudanças no código
vim src/App.tsx

# Commit e push
git add .
git commit -m "fix: corrigiu bug no modal"
git push

# Vercel faz deploy automático! 🚀
```

---

## 🧪 Passo 6: Testar Deploy

### 6.1 Verificar no Vercel

1. Acesse: https://vercel.com/dashboard
2. Entre no projeto `statusflow`
3. Verifique se o status está **Ready**

### 6.2 Abrir Deploy Logs

1. No dashboard do Vercel, clique no projeto
2. Clique na aba **Deployments**
3. Clique no deploy mais recente
4. Verifique os logs para erros

### 6.3 Verificar no Supabase

1. Acesse: https://supabase.com/dashboard
2. Entre no projeto `statusflow`
3. Vá em **Table Editor**
4. Veja se os dados estão aparecendo quando você usa o app

---

## 🐛 Troubleshooting

### Problema: "Error fetching data from Supabase"

**Solução:**
1. Verifique se as variáveis de ambiente estão configuradas
2. No Vercel, vá em **Settings** → **Environment Variables**
3. Confirme que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` existem

### Problema: "Deploy falhou"

**Solução:**
1. Verifique os logs no Vercel
2. Geralmente é erro de build
3. Rode `npm run build` localmente para ver o erro
4. Corrija e faça novo push

### Problema: "Dados não persistem"

**Solução:**
1. Verifique se a API URL está correta
2. No Supabase, verifique se as RLS policies permitem INSERT/UPDATE
3. O arquivo `setup.sql` já configura as policies corretas

### Problema: "CORS error no navegador"

**Solução:**
1. No Supabase, vá em **Settings** → **API**
2. Seção **Project URL** deve estar como `https://...`
3. Se estiver usando localhost, pode precisar configurar no `.env.local`

---

## 📊 Monitoramento

### Vercel Analytics

Vercel fornece analytics gratuitos:
- Visitas
- Taxa de clique
- Performance
- Geolocalização

Acesse: https://vercel.com/analytics

### Supabase Logs

No Supabase, você pode ver:
- Queries executadas
- Latência
- Erros
- Uso do banco

Acesse: https://supabase.com/dashboard/project/_/logs

---

## 💰 Custos

| Serviço | Plano Gratuito | Limites | Upgrade |
|----------|----------------|----------|---------|
| **Vercel** | ✅ Sim | 100GB bandwidth/mês | $20/mês |
| **Supabase** | ✅ Sim | 500MB DB, 2GB storage | $25/mês |
| **GitHub** | ✅ Sim | Ilimitado público | $4/mês (private) |

**Total:** $0/mês para equipe pequena! 🎉

---

## 📚 Referências Úteis

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)

---

## 🎉 Parabéns!

Seu StatusFlow está agora online! 🚀

Para verificar:
1. Acesse sua URL do Vercel
2. Crie um funcionário
3. Adicione tarefas
4. Acesse o Supabase e veja os dados salvos

Tudo funcionando com banco de dados real na nuvem! ☁️
