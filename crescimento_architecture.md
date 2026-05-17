# 🧬 Impressão Digital da Aplicação - Módulo de Crescimento (Marketing/Desafio 30 Dias)

## 1. Visão Geral e Stack Tecnológica
- **Linguagem/Runtime:** JavaScript (Node.js no backend e React no frontend).
- **Framework Principal:** React + Vite (Frontend) / Fastify (Backend).
- **Arquitetura:** Arquitetura Modular por Features. O módulo é dividido entre o Front-end (`src/features/growth`) que consome a API do Back-end (`api/routes/marketing`).

## 2. Padrões de Design e Código (Regras de Ouro)
- **Nomenclatura:** CamelCase para variáveis, funções e hooks (ex: `useActiveChallenge`), PascalCase para Componentes React (ex: `DashboardChallengeBlock`, `ChallengeOnboarding`).
- **Tratamento de Erros:** O backend sempre utiliza a classe customizada `AppError(mensagem, statusCode)` para exceções controladas.
- **Estilização/Retorno:** Todas as APIs (Fastify) respondem no padrão unificado JSON:
  `{ success: boolean, data: explicit, error: null|string }`.

## 3. Arquitetura do Banco de Dados (Schema Simplificado)
*Abaixo as tabelas core exclusivas do módulo de Crescimento (Marketing Challenges).*

- **MarketingProfile:** 
  - `id` (UUID), `companyId`, `profileType` (technical/services)
  - Estratégia atual: `hasInstagram`, `hasWhatsappBiz`, `hasPaidAds`, `hasWebsite`, `hasGoogleBusiness`
  - Metas: `dailyTimeMinutes`, `monthlyGoalLeads`
- **MarketingChallenge:**
  - `id` (UUID), `companyId`, `marketingProfileId`, `startDate`, `endDate`
  - Acompanhamento: `status` (ACTIVE/COMPLETED/ABANDONED), `totalDone`, `totalSkipped`, `completionPct`
- **MarketingTask:**
  - `id` (UUID), `challengeId`, `day` (Int), `taskSlug` (String - referência ao conteúdo em JSON)
  - Status: `status` (PENDING/DONE/SKIPPED), `completedAt`, `skippedAt`

## 4. Sistema de Autenticação e Multi-Tenancy
- **Auth:** O frontend envia um Token JWT no Header da requisição.
- **Multi-Tenancy:** Toda requisição no backend do módulo `marketing` extrai o `companyId` do `request.user` (previamente validado por middleware) e *precisa* filtrar/garantir que qualquer operação de banco (Profile, Challenge, Task) seja isolada no respectivo `companyId`.

## 5. Estrutura de Pastas e Módulos

**Frontend (Client-side):**
- `/src/features/growth`
  - `/components` (Componentes Visuais HTTP ex: `ChallengeOnboarding.jsx`, `TaskDetailPage.jsx`, `TutorialsTab.jsx`)
  - `/hooks` (Regras de UI e estados, ex: `useActiveChallenge.js`)
  - `/services` (Chamadas de rede, ex: `marketingApi.js`)
  - `/data` e `/utils` (Utilitários e JSONs locais)

**Backend (Server-side):**
- `/api/routes/marketing`
  - `index.js` (Concentra Controladores e Serviços - lida com as rotas HTTP, progressão de streak e injeção do conteúdo diário via JSON estático da pasta `/api/data/challenges/`)
- `/api/prisma`
  - `schema.prisma` (Repositório e modelagem ORM de todos os dados do SaaS)

## 6. Mapeamento de Rotas (Frontend ➔ Backend)
A comunicação é centralizada no arquivo `/src/features/growth/services/marketingApi.js`, que faz o fetch com o token JWT e conecta-se aos endpoints em `/api/routes/marketing/index.js`.

### 🔄 Fluxo de Perfil (Onboarding de Crescimento)
- **Frontend:** `getMarketingProfile()` 
  ➔ **Backend:** `GET /api/marketing/profile` *(Retorna o perfil de metas e estratégias)*
- **Frontend:** `createOrUpdateMarketingProfile(data)` 
  ➔ **Backend:** `POST /api/marketing/profile` *(Cria/Atualiza o perfil técnico ou de serviços)*

### 🚀 Fluxo do Desafio 30 Dias (Core)
- **Frontend:** `getActiveChallenge()` 
  ➔ **Backend:** `GET /api/marketing/challenge/active` *(Verifica se há um desafio ativo e retorna a tarefa de hoje)*
- **Frontend:** `startNewChallenge()` 
  ➔ **Backend:** `POST /api/marketing/challenge/start` *(Inicia um ciclo de 30 dias gerando as tarefas pendentes)*
- **Frontend:** `getTaskDetail(challengeId, day)` 
  ➔ **Backend:** `GET /api/marketing/challenge/:id/task/:day` *(Retorna os detalhes estáticos e dicas da tarefa)*
- **Frontend:** `completeChallenge(challengeId)` 
  ➔ **Backend:** `POST /api/marketing/challenge/:id/complete` *(Finaliza o desafio de 30 dias)*

### ✅ Fluxo de Tarefas (Ações Diárias)
- **Frontend:** `markTaskAsDone(taskId)` 
  ➔ **Backend:** `PATCH /api/marketing/task/:id/done` *(Marca tarefa como concluída, avança progresso e checa fim de ciclo)*
- **Frontend:** `markTaskAsSkipped(taskId)` 
  ➔ **Backend:** `PATCH /api/marketing/task/:id/skip` *(Pula a tarefa do dia, avança progresso e checa fim de ciclo)*

### 📊 Histórico
- **Frontend:** `getChallengeHistory()` 
  ➔ **Backend:** `GET /api/marketing/challenge/history` *(Lista desafios antigos concluídos ou abandonados)*
