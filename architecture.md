# 🧬 Impressão Digital da Aplicação - PropostaCerta

## 1. Visão Geral e Stack Tecnológica
- **Linguagem/Runtime:** Node.js (TypeScript/JavaScript).
- **Frontend:** React 19 (Vite), Tailwind CSS, Framer Motion, Lucide React.
- **Backend:** Fastify (Node.js), Prisma ORM (PostgreSQL).
- **Mobile:** Capacitor (Android/iOS) para empacotamento web-to-native.
- **Infra:** Vercel (Frontend e Serverless API).

## 2. Padrões de Design e Código (Regras de Ouro)
- **Nomenclatura:** camelCase para variáveis, PascalCase para classes e componentes.
- **Tratamento de Erros:** Sempre usar a classe customizada `AppError(mensagem, statusCode)`. Prevenir erros de parse de JSON vazio no Fastify (`FST_ERR_CTP_EMPTY_JSON_BODY`) nas exclusões e requisições HTTP.
- **Estilização/Retorno:** Todas as APIs devem responder no formato JSON: `{ success: boolean, data: any, error: null|string }`.
- **UI/UX:** Design premium e de altíssimo valor percebido com dark mode, micro-animações suaves (Framer Motion) e foco em visualização limpa de propostas e relatórios.

## 3. Arquitetura do Banco de Dados & Unificação
- **User:** `id` (UUID), `email`, `name`, `companyId` (Tenant).
- **Company (Tenant):** `id`, `name`, `cnpj`, `segment` (ELETRICA, HIDRAULICA, etc), `plan_type` (FREE, PRO, ENTERPRISE).
- **Unificação de Catálogo (Sem Segregação):** Eliminada a restrição/segregação de tipo de negócio ("Serviços" vs "Produtos"). Todos os inquilinos (tenants) possuem acesso simultâneo ao catálogo unificado de serviços, produtos e controle de estoque, promovendo uma plataforma White-Label flexível.
- **Client:** `id`, `companyId`, `name`, `email`, `phone`, `location`.
- **Proposal:** `id`, `companyId`, `clientId`, `number`, `status` (DRAFT, SENT, APPROVED), `total`.
- **ProposalItem:** `id`, `proposalId`, `label`, `quantity`, `unitPrice`, `subtotal`.
- **CatalogItem:** `id`, `companyId`, `description`, `category` (SERVICO, MATERIAL), `defaultPrice`.
- **Growth Challenges:** Mapeado no banco de dados JSON unificado [challenges.json](file:///c:/Users/marco/OneDrive/Documentos/BerithCode/propostaerta_final_v2/api/data/challenges/challenges.json).

## 4. Módulos Estratégicos & Funcionalidades Recentes

### A. Módulo de Crescimento Comercial (Desafio 30 Dias)
- **Frontend ([TaskDetailPage.jsx](file:///c:/Users/marco/OneDrive/Documentos/BerithCode/propostaerta_final_v2/src/features/growth/challenge/components/TaskDetailPage.jsx)):** Dashboard premium de duas colunas simulando uma sala de aula interativa:
  - *Coluna Esquerda (Conceito Acadêmico):* Exibe Objetivo Estratégico, Citação de Conceito Chave, Por que Importa e Alertas com cores de Erros Comuns.
  - *Coluna Direita (Execução Prática):* Stepper vertical interativo que guia os passos de execução do dia, Métricas de Evolução, Desafio Bônus e Reflexão do Dia.
- **Backend (`/api/routes/marketing/index.js`):** Serve o currículo unificado do arquivo centralizado de desafios. Trata com expressões regulares (regex) rotas legadas e slugs históricos (ex: `/tarefa-servicos-dia-X` ou `/desafio-dia-X`) direcionando dinamicamente para o dia correspondente do currículo unificado (Days 1-30).

### B. Módulo de Compartilhamento via WhatsApp
- Geração automatizada de mensagens comerciais personalizadas com links de acesso rápido e seguro às propostas comerciais.
- Painel de visualização (preview modal) realista do WhatsApp integrado no dashboard para validar a estética da mensagem antes do envio direto.

### C. Sanitização de Condições Comerciais
- Limpeza e remoção de restrições de impostos locais, multas e juros legados nas propostas, simplificando os cálculos de margem e precificação de serviços, voltando a usabilidade para a lucratividade limpa e de alta performance.

## 5. Sistema de Autenticação e Multi-Tenancy
- **Auth:** JWT gerenciado pelo `@fastify/jwt`. Enviado no Header `Authorization: Bearer <token>`.
- **Multi-Tenancy:** A maioria das entidades possui `companyId`. O backend extrai o `companyId` do token JWT (via hook `preHandler`) e deve *sempre* filtrar as consultas ao banco por esse ID para garantir o isolamento entre empresas.

## 6. Estrutura de Pastas e Módulos
- `/src` (Frontend)
  - `/components`: UI kit e componentes reutilizáveis.
  - `/features`: Módulos de regras de negócio (ex: `/growth/challenge` para o Desafio 30 Dias).
  - `/pages`: Telas globais da aplicação (Onboarding Conversacional simplificado por segmento, Dashboard de Vendas, Propostas).
  - `/shared/services`: Camada de comunicação com a API (`api.js`).
- `/api` (Backend)
  - `/data/challenges`: Banco de dados do Desafio 30 Dias de Crescimento Comercial (`challenges.json`).
  - `/routes`: Módulos da API (auth, companies, proposals, clients, catalog, marketing).
  - `/plugins`: Configurações de banco (Prisma), JWT e plugins de CORS e tratamento de corpos vazios.
  - `/prisma`: Definição de esquema e migrações.
- `/android`: Código nativo do empacotamento móvel Capacitor.
