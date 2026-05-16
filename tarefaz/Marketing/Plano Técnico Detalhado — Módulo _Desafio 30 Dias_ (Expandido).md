# Plano Técnico Detalhado — Módulo "Desafio 30 Dias" (Expandido)

## 1. Visão Geral e Contexto

Este documento detalha a expansão do módulo "Desafio 30 Dias" para a plataforma PropostaCerta, integrando-o à arquitetura existente e fornecendo especificações para uma implementação completa. O objetivo é criar uma funcionalidade de gamificação de marketing que guie os usuários com tarefas diárias personalizadas, promovendo o crescimento de seus negócios. A arquitetura da aplicação PropostaCerta é baseada em Node.js (Fastify, Prisma ORM) para o backend e React (Vite, Tailwind CSS, Framer Motion) para o frontend, com empacotamento mobile via Capacitor.

## 2. Mapeamento de Perfis e Estratégia de Marketing

Para garantir a relevância das tarefas, os usuários serão categorizados em perfis de marketing com base no segmento de suas empresas. A jornada de 30 dias será estruturada em semanas temáticas para uma progressão lógica.

| Perfil (Slug) | Segmentos Associados (DB) | Foco de Marketing |
|---|---|---|
| **technical** | ELETRICA, HIDRAULICA, PINTURA, MARCENARIA, REFORMAS | Autoridade técnica, prova social (antes/depois), agilidade no orçamento, confiança e segurança. |
| **services** | BELEZA, ESTETICA, LIMPEZA, EVENTOS, CONSULTORIA | Estética visual, experiência do cliente, depoimentos, pacotes/recorrência, branding pessoal. |

### Jornada do Desafio (4 Semanas Temáticas)

- **Semana 1: Alicerce e Presença Digital:** Foco na configuração e otimização das ferramentas básicas de presença online (Google Meu Negócio, Bio do Instagram, WhatsApp Business).
- **Semana 2: Prova Social e Autoridade:** Geração de conteúdo que demonstre expertise e credibilidade (fotos de antes/depois, depoimentos, estudos de caso simples).
- **Semana 3: Ativação de Base e Networking:** Estratégias para engajar clientes existentes e expandir a rede de contatos (mensagens para ex-clientes, pedidos de indicação, parcerias).
- **Semana 4: Escala e Anúncios:** Introdução a conceitos de impulsionamento e prospecção ativa para aumentar o alcance e gerar novas propostas.

## 3. Estrutura de Dados (Prisma Schema)

Os modelos `MarketingProfile`, `MarketingChallenge` e `MarketingTask` serão adicionados ao schema Prisma, com as seguintes considerações:

```prisma
// Perfil de marketing do usuário — preenchido no onboarding, 1:1 com Company
model MarketingProfile {
  id                String             @id @default(uuid())
  companyId         String             @unique
  company           Company            @relation(fields: [companyId], references: [id])

  // Respostas do questionário de onboarding
  hasInstagram      Boolean            @default(false)
  hasWhatsappBiz    Boolean            @default(false)
  hasPaidAds        Boolean            @default(false)
  hasWebsite        Boolean            @default(false)
  hasGoogleBusiness Boolean            @default(false)
  dailyTimeMinutes  Int                @default(30)   // tempo disponível por dia para marketing
  monthlyGoalLeads  Int                @default(5)    // quantos clientes novos quer por mês

  // Perfil calculado após onboarding (usado para selecionar as tarefas)
  // 'technical' | 'services' (mapeado pelo segmento da Company)
  profileType       String             @default("technical")

  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  challenges        MarketingChallenge[]
}

// Um ciclo de 30 dias — pode haver vários ao longo do tempo (histórico)
model MarketingChallenge {
  id                String             @id @default(uuid())
  companyId         String
  company           Company            @relation(fields: [companyId], references: [id])
  marketingProfileId String
  marketingProfile  MarketingProfile   @relation(fields: [marketingProfileId], references: [id])

  startDate         DateTime           // dia 1 do desafio
  endDate           DateTime           // startDate + 29 dias
  status            ChallengeStatus    @default(ACTIVE)

  // Estatísticas do ciclo (calculadas na conclusão)
  totalDone         Int                @default(0)
  totalSkipped      Int                @default(0)
  completionPct     Float              @default(0)

  createdAt         DateTime           @default(now())

  tasks             MarketingTask[]

  @@index([companyId, status])
}

// Uma tarefa dentro do desafio
model MarketingTask {
  id          String      @id @default(uuid())
  challengeId String
  challenge   MarketingChallenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)

  day         Int         // 1 a 30
  taskSlug    String      // referência ao conteúdo curado (ex: "instagram-primeiro-post")
  status      TaskStatus  @default(PENDING)
  completedAt DateTime?
  skippedAt   DateTime?

  @@index([challengeId, day])
  @@unique([challengeId, day])
}

enum ChallengeStatus {
  ACTIVE
  COMPLETED
  ABANDONED
}

enum TaskStatus {
  PENDING
  DONE
  SKIPPED
}
```

### Adições ao modelo `Company` existente

O modelo `Company` será atualizado para incluir as relações com `MarketingProfile` e `MarketingChallenge`, garantindo a integridade referencial e o isolamento de dados por `companyId` (multi-tenancy).

```prisma
// Adicionar no model Company:
marketingProfile   MarketingProfile?
marketingChallenges MarketingChallenge[]
```

## 4. Conteúdo Curado (Estrutura JSON)

O conteúdo das tarefas será armazenado em arquivos JSON estáticos no backend, permitindo atualizações sem a necessidade de migrações de banco de dados. Serão dois arquivos principais, um para cada `profileType`.

### Localização

```
api/
  data/
    challenges/
      technical.json    ← 30 tarefas para perfil técnico
      services.json     ← 30 tarefas para perfil serviços/beleza
```

### Estrutura de cada tarefa no JSON

```json
{
  "slug": "instagram-primeiro-post",
  "day": 1,
  "category": "instagram",
  "title": "Publique sua primeira foto de serviço no Instagram",
  "subtitle": "Mostre o que você faz — a primeira impressão conta",
  "motivation": "Perfis com pelo menos 9 posts recebem 3x mais contatos do que perfis vazios. Hoje você dá o primeiro passo.",
  "estimatedMinutes": 20,
  "steps": [
    {
      "order": 1,
      "text": "Tire uma foto do seu serviço ou do resultado de um trabalho recente. Pode ser com o celular mesmo — boa luz natural é suficiente."
    },
    {
      "order": 2,
      "text": "Abra o Canva e use o template de post quadrado 1080x1080px.",
      "actionLabel": "Abrir Canva",
      "actionUrl": "https://www.canva.com/create/instagram-posts/"
    },
    {
      "order": 3,
      "text": "Adicione seu logo ou nome no canto. Escreva uma legenda curta: o que foi feito, onde, e como o cliente pode te contratar."
    },
    {
      "order": 4,
      "text": "Publique no Instagram e adicione 5 hashtags do seu segmento + cidade. Ex: #eletricistasaopaulo #instalacaoeletrica #eletricista"
    }
  ],
  "tip": "Não precisa ser perfeito. Post publicado vale mais do que post perfeito que nunca sai.",
  "actionLabel": "Abrir Canva",
  "actionUrl": "https://www.canva.com/create/instagram-posts/"
}
```

### Categorias de tarefas e Ícones (Lucide React)

| Categoria | Ícone (Lucide React) | Exemplos |
|---|---|---|
| `instagram` | `Camera` | Post de serviço, Reels, Stories, depoimento |
| `whatsapp` | `MessageSquare` | Status, mensagem para base, lista de transmissão |
| `prospeccao` | `Target` | Ligar para 5 ex-clientes, enviar proposta para leads frios |
| `google` | `Search` | Criar/atualizar Google Meu Negócio, pedir avaliação |
| `anuncio` | `Megaphone` | Impulsionar post, criar campanha básica no Meta Ads |
| `presenca` | `Globe` | Atualizar WhatsApp Business, bio do Instagram |
| `conteudo` | `Edit` | Gravar vídeo curto, escrever depoimento de cliente |
| `networking` | `Handshake` | Indicar parceiro, pedir indicação para cliente satisfeito |

## 5. Rotas de Backend (Fastify)

Todas as rotas devem estar sob o prefixo `/marketing` e seguir o padrão de resposta JSON `{ success: boolean, data: any, error: null|string }`. O `companyId` será extraído do token JWT via `preHandler` e usado para filtrar todas as consultas ao banco de dados, garantindo a segurança e o multi-tenancy. Erros devem ser tratados com `AppError(mensagem, statusCode)`.

### Rotas Existentes e Detalhamento

- `GET /marketing/profile`
  - **Descrição:** Retorna o `MarketingProfile` da empresa autenticada. Se não existir, retorna `null`.
  - **Lógica:** Busca `MarketingProfile` pelo `companyId` do JWT. Se não encontrar, retorna `{ success: true, data: null }`.

- `POST /marketing/profile`
  - **Descrição:** Cria ou atualiza o `MarketingProfile` da empresa (usado no onboarding).
  - **Lógica:**
    1. Recebe dados do questionário (e.g., `hasInstagram`, `dailyTimeMinutes`, `monthlyGoalLeads`).
    2. Mapeia o `Company.segment` para `profileType` (`technical` ou `services`).
    3. Cria ou atualiza o `MarketingProfile` associado ao `companyId` do JWT.
    4. Retorna o `MarketingProfile` criado/atualizado.
    5. **Erro:** Se `companyId` não for encontrado ou inválido, retorna `AppError('Company not found', 404)`.

- `GET /marketing/challenge/active`
  - **Descrição:** Retorna o desafio ativo da empresa com a tarefa do dia e o conteúdo completo.
  - **Lógica:**
    1. Busca `MarketingChallenge` com `status: ACTIVE` para o `companyId` do JWT.
    2. Se não houver desafio ativo, retorna `{ success: true, data: null }`.
    3. Calcula `dayNumber = differenceInDays(new Date(), challenge.startDate) + 1`.
    4. Se `dayNumber > 30`, atualiza o `challenge.status` para `COMPLETED` e retorna `{ success: true, data: null }` (desafio concluído automaticamente).
    5. Busca a `MarketingTask` correspondente ao `dayNumber`.
    6. Carrega o conteúdo detalhado da tarefa do JSON (`technical.json` ou `services.json`) usando `taskSlug` e `profileType`.
    7. Retorna o desafio ativo, a tarefa do dia com conteúdo completo e o `dayNumber`.
    8. **Erro:** Se o `MarketingProfile` não existir, retorna `AppError('Marketing profile not found. Please complete onboarding.', 400)`.

- `POST /marketing/challenge/start`
  - **Descrição:** Inicia um novo desafio de 30 dias para a empresa.
  - **Lógica:**
    1. Verifica se existe `MarketingProfile` para o `companyId` do JWT. Se não, retorna `AppError('Marketing profile not found. Please complete onboarding.', 400)`.
    2. Verifica se já existe um `MarketingChallenge` com `status: ACTIVE`. Se sim, retorna `AppError('An active challenge already exists.', 409)`.
    3. Carrega o JSON de conteúdo (`technical.json` ou `services.json`) baseado em `profile.profileType`.
    4. Cria um novo `MarketingChallenge` com `startDate = hoje` e `endDate = hoje + 29 dias`.
    5. Para cada dia (1 a 30), cria uma `MarketingTask` associada ao `challengeId` e ao `taskSlug` do JSON.
    6. Retorna o `MarketingChallenge` criado.

- `POST /marketing/challenge/:id/complete`
  - **Descrição:** Finaliza o ciclo do desafio manualmente.
  - **Lógica:**
    1. Busca `MarketingChallenge` pelo `:id` e `companyId` do JWT.
    2. Atualiza `challenge.status` para `COMPLETED`.
    3. Calcula `totalDone`, `totalSkipped` e `completionPct` com base nas `MarketingTask`s associadas.
    4. Retorna o `MarketingChallenge` atualizado.
    5. **Erro:** Se o desafio não for encontrado ou não pertencer à empresa, retorna `AppError('Challenge not found or unauthorized.', 404)`.

- `GET /marketing/challenge/:id/task/:day`
  - **Descrição:** Retorna a tarefa de um dia específico com conteúdo completo.
  - **Lógica:**
    1. Busca `MarketingChallenge` pelo `:id` e `companyId` do JWT.
    2. Busca `MarketingTask` pelo `challengeId` e `:day`.
    3. Carrega o conteúdo detalhado da tarefa do JSON usando `taskSlug` e `profileType`.
    4. Retorna a `MarketingTask` com o conteúdo completo.
    5. **Erro:** Se o desafio ou a tarefa não forem encontrados, retorna `AppError('Task not found.', 404)`.

- `PATCH /marketing/task/:id/done`
  - **Descrição:** Marca uma tarefa como concluída.
  - **Lógica:**
    1. Busca `MarketingTask` pelo `:id` e verifica se pertence ao `companyId` do JWT.
    2. Atualiza `task.status` para `DONE` e `completedAt = now()`.
    3. Verifica se todas as 30 tarefas do desafio (`challengeId`) estão `DONE` ou `SKIPPED`. Se sim, atualiza o `MarketingChallenge.status` para `COMPLETED` e calcula as estatísticas finais.
    4. Retorna a `MarketingTask` atualizada e o `streak` atual (calculado com base nas tarefas do desafio).
    5. **Erro:** Se a tarefa não for encontrada ou não pertencer à empresa, retorna `AppError('Task not found or unauthorized.', 404)`.

- `PATCH /marketing/task/:id/skip`
  - **Descrição:** Marca uma tarefa como pulada.
  - **Lógica:**
    1. Busca `MarketingTask` pelo `:id` e verifica se pertence ao `companyId` do JWT.
    2. Atualiza `task.status` para `SKIPPED` e `skippedAt = now()`.
    3. Verifica se todas as 30 tarefas do desafio (`challengeId`) estão `DONE` ou `SKIPPED`. Se sim, atualiza o `MarketingChallenge.status` para `COMPLETED` e calcula as estatísticas finais.
    4. Retorna a `MarketingTask` atualizada.
    5. **Erro:** Se a tarefa não for encontrada ou não pertencer à empresa, retorna `AppError('Task not found or unauthorized.', 404)`.

- `GET /marketing/challenge/history`
  - **Descrição:** Retorna o histórico de ciclos de desafios anteriores da empresa.
  - **Lógica:** Busca todos os `MarketingChallenge`s para o `companyId` do JWT, ordenados por `startDate` decrescente, excluindo o `ACTIVE`.

## 6. Componentes Frontend (React, Vite, Tailwind CSS, Framer Motion, Lucide React)

Os componentes frontend serão desenvolvidos com foco em uma experiência de usuário fluida e intuitiva, seguindo os padrões de design da PropostaCerta (UI/UX premium, dark mode, micro-animações).

### Estrutura de arquivos

```
app/src/features/
  growth/
    components/
      DashboardChallengeBlock.jsx   ← bloco do dashboard (4 estados)
      ChallengeOnboarding.jsx       ← questionário de perfil
      ChallengeStartScreen.jsx      ← tela "Iniciar Desafio"
      TaskDetailPage.jsx            ← página completa da tarefa do dia
      TaskStep.jsx                  ← componente de passo individual
      ProgressCalendar.jsx          ← visão dos 30 dias em grid
      StreakBadge.jsx               ← badge de dias consecutivos
    services/
      marketingApi.js               ← chamadas à API (axios/fetch wrapper)
    hooks/
      useActiveChallenge.js         ← estado do desafio ativo
```

### Detalhamento dos Componentes

- `DashboardChallengeBlock.jsx`
  - **Função:** Exibe o status atual do desafio no dashboard principal.
  - **Estados:**
    1. **Sem perfil:** Exibe botão "Começar agora" que leva ao `ChallengeOnboarding`.
    2. **Desafio ativo, tarefa pendente:** Mostra a tarefa do dia, categoria, tempo estimado, streak e botão "Ver tarefa" que leva ao `TaskDetailPage`.
    3. **Tarefa concluída:** Mensagem de sucesso, próxima tarefa (se houver), streak atual.
    4. **Desafio concluído:** Resumo do desempenho (X de 30 tarefas, % de conclusão) e botão "Iniciar próximo ciclo" que leva ao `ChallengeStartScreen`.
  - **Interação:** Utiliza `useActiveChallenge` para gerenciar o estado e as ações.
  - **UI/UX:** Animações leves com `Framer Motion` para transições entre estados e atualizações de streak.

- `ChallengeOnboarding.jsx`
  - **Função:** Questionário para coletar informações do perfil de marketing do usuário.
  - **Campos:** `hasInstagram`, `hasWhatsappBiz`, `hasPaidAds`, `hasWebsite`, `hasGoogleBusiness`, `dailyTimeMinutes`, `monthlyGoalLeads`.
  - **Lógica:** Envia dados para `POST /marketing/profile`. Após sucesso, redireciona para `ChallengeStartScreen`.

- `ChallengeStartScreen.jsx`
  - **Função:** Tela para iniciar um novo ciclo de desafio.
  - **Conteúdo:** Breve explicação do desafio, botão "Iniciar Desafio".
  - **Lógica:** Chama `POST /marketing/challenge/start`. Após sucesso, redireciona para o dashboard.

- `TaskDetailPage.jsx`
  - **Função:** Exibe os detalhes de uma tarefa diária.
  - **Conteúdo:** Título, subtítulo, motivação, passos (`TaskStep`), dica, botões "Pular por hoje" e "Marcar como feito".
  - **Lógica:** Obtém dados da tarefa via `GET /marketing/challenge/:id/task/:day`. Botões chamam `PATCH /marketing/task/:id/skip` e `PATCH /marketing/task/:id/done`.
  - **UI/UX:** Micro-animação de confete ou check animado ao marcar como feito, usando `Framer Motion`.

- `TaskStep.jsx`
  - **Função:** Componente reutilizável para exibir um passo individual da tarefa.
  - **Conteúdo:** Número do passo, texto, `actionLabel` e `actionUrl` (se existirem).
  - **UI/UX:** Ícone de checkbox ou círculo para indicar o passo, com transição de estado.

- `ProgressCalendar.jsx`
  - **Função:** Visualização em grid do progresso dos 30 dias do desafio.
  - **Conteúdo:** Grid de 30 células, cada uma representando um dia, com ícones ou cores indicando `PENDING`, `DONE`, `SKIPPED`.
  - **Lógica:** Recebe o array de `MarketingTask`s do desafio ativo.

- `StreakBadge.jsx`
  - **Função:** Exibe o número de dias consecutivos de tarefas concluídas.
  - **Conteúdo:** Ícone de fogo (`Fire`) e o número do streak.
  - **Lógica:** Recebe o valor do streak do `useActiveChallenge`.

### `marketingApi.js`

Este arquivo encapsulará as chamadas à API de marketing, utilizando a camada de comunicação existente (`api.js` em `/src/shared/services`).

```javascript
// app/src/features/growth/services/marketingApi.js
import api from '../../../shared/services/api'; // Assumindo que api.js é um wrapper para axios/fetch

export const getMarketingProfile = () => api.get('/marketing/profile');
export const createOrUpdateMarketingProfile = (data) => api.post('/marketing/profile', data);
export const getActiveChallenge = () => api.get('/marketing/challenge/active');
export const startNewChallenge = () => api.post('/marketing/challenge/start');
export const completeChallenge = (challengeId) => api.post(`/marketing/challenge/${challengeId}/complete`);
export const getTaskDetail = (challengeId, day) => api.get(`/marketing/challenge/${challengeId}/task/${day}`);
export const markTaskAsDone = (taskId) => api.patch(`/marketing/task/${taskId}/done`);
export const markTaskAsSkipped = (taskId) => api.patch(`/marketing/task/${taskId}/skip`);
export const getChallengeHistory = () => api.get('/marketing/challenge/history');
```

### `useActiveChallenge.js` Hook

Este hook centralizará a lógica de estado e interação com a API para o desafio, sendo utilizado por `DashboardChallengeBlock` e `TaskDetailPage`.

```javascript
// app/src/features/growth/hooks/useActiveChallenge.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import * as marketingApi from '../services/marketingApi';
import { calculateStreak } from '../utils/challengeUtils'; // Função utilitária para calcular streak

export function useActiveChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [todayTask, setTodayTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveChallenge = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await marketingApi.getActiveChallenge();
      if (response.success) {
        setChallenge(response.data.challenge);
        setTodayTask(response.data.todayTask);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveChallenge();
  }, [fetchActiveChallenge]);

  const streak = useMemo(() => calculateStreak(challenge?.tasks), [challenge]);

  const markDone = async (taskId) => {
    try {
      const response = await marketingApi.markTaskAsDone(taskId);
      if (response.success) {
        // Atualizar o estado local ou refetch para refletir a mudança
        fetchActiveChallenge(); 
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const markSkipped = async (taskId) => {
    try {
      const response = await marketingApi.markTaskAsSkipped(taskId);
      if (response.success) {
        fetchActiveChallenge();
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const startChallenge = async () => {
    try {
      const response = await marketingApi.startNewChallenge();
      if (response.success) {
        fetchActiveChallenge();
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { challenge, todayTask, streak, loading, error, markDone, markSkipped, startChallenge, fetchActiveChallenge };
}
```

## 7. Integração no Dashboard Existente

O `DashboardChallengeBlock` será o primeiro componente na página do dashboard (`Dashboard.jsx`), garantindo visibilidade e prioridade. Ele será autossuficiente, gerenciando seu próprio estado via `useActiveChallenge`.

```jsx
// Dashboard.jsx — adicionar no topo do JSX:
import DashboardChallengeBlock from '../growth/components/DashboardChallengeBlock';

// Dentro do return, antes de qualquer outro bloco:
<DashboardChallengeBlock />
```

## 8. Lógica do Próximo Ciclo (Pós-30 Dias) - Versão Futura

Esta funcionalidade será implementada em uma versão futura, após a estabilização do primeiro ciclo. A lógica envolverá a análise do desempenho do usuário no ciclo anterior para personalizar as tarefas do próximo.

- **Análise de Conclusão por Categoria:**
  - Categorias com `< 50%` de conclusão: Receberão mais tarefas focadas nessas áreas no próximo ciclo.
  - Categorias com `> 80%` de conclusão: Avançarão para tarefas de nível 2 nessas categorias.
- **Conteúdo de Nível 2:** O JSON de conteúdo será expandido para incluir duas camadas: `básico` (dias 1-30) e `avançado` (dias 31-60). O sistema selecionará as tarefas da camada apropriada para cada categoria, incentivando o aprendizado contínuo.

## 9. Migrations Necessárias (Prisma)

Será necessária uma migração para adicionar os novos modelos e as relações ao banco de dados.

```bash
npx prisma migrate dev --name add_marketing_challenge_module
```

Esta migração criará as tabelas para `MarketingProfile`, `MarketingChallenge`, `MarketingTask` e alterará a tabela `Company` para adicionar as relações.

## 10. Ordem de Implementação (Refinada)

| Etapa | O que fazer | Depende de |
|---|---|---|
| 1 | Escrever o conteúdo (30 tarefas × 2 perfis) | — |
| 2 | Migration do schema Prisma | — |
| 3 | Rotas de backend (Fastify) | Schema + conteúdo |
| 4 | `marketingApi.js` (Frontend Service) | Rotas |
| 5 | `useActiveChallenge` (React Hook) | `marketingApi.js` |
| 6 | `ChallengeOnboarding.jsx` (Componente) | Hook |
| 7 | `ChallengeStartScreen.jsx` (Componente) | Hook |
| 8 | `DashboardChallengeBlock.jsx` (Componente - 4 estados) | Hook |
| 9 | `TaskStep.jsx` (Componente) | — |
| 10 | `TaskDetailPage.jsx` (Componente) | Hook + `TaskStep.jsx` |
| 11 | Integrar `DashboardChallengeBlock` no `Dashboard.jsx` | `DashboardChallengeBlock` pronto |
| 12 | `ProgressCalendar.jsx` (Componente) | Hook |
| 13 | `StreakBadge.jsx` (Componente) | Hook |
| 14 | Testes de Integração e E2E | Todas as etapas anteriores |

**Caminho Crítico:** A criação do conteúdo das tarefas (Etapa 1) é fundamental, pois sem ele, as funcionalidades de backend e frontend não podem ser testadas de ponta a ponta.

## 11. Considerações Adicionais

- **Notificações Push Diárias (Futuro):** Em versões futuras, será implementado um sistema de notificações push para lembrar os usuários da tarefa do dia, aumentando o engajamento.
- **A/B Testing:** Possibilidade de implementar A/B testing para diferentes sequências de tarefas ou mensagens motivacionais, otimizando a eficácia do desafio.
- **Feedback do Usuário:** Adicionar um mecanismo de feedback rápido para as tarefas, permitindo que os usuários avaliem a utilidade e a dificuldade, informando futuras iterações do conteúdo.
- **Internacionalização (i18n):** Garantir que todo o conteúdo e textos da interface sejam preparados para fácil internacionalização, caso a plataforma expanda para outros idiomas.

Este plano detalhado fornece uma base sólida para a implementação do módulo "Desafio 30 Dias", alinhado com as melhores práticas de marketing digital e a arquitetura robusta da PropostaCerta.
