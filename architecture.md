# 🧬 Impressão Digital da Aplicação - PropostaCerta

## 1. Visão Geral e Stack Tecnológica
- **Linguagem/Runtime:** Node.js (TypeScript/JavaScript).
- **Frontend:** React 19 (Vite), Tailwind CSS, Framer Motion, Lucide React.
- **Backend:** Fastify (Node.js), Prisma ORM (PostgreSQL).
- **Mobile:** Capacitor (Android/iOS) para empacotamento web-to-native.
- **Infra:** Vercel (Frontend e Serverless API).

## 2. Padrões de Design e Código (Regras de Ouro)
- **Nomenclatura:** camelCase para variáveis, PascalCase para classes e componentes.
- **Tratamento de Erros:** Sempre usar a classe customizada `AppError(mensagem, statusCode)`.
- **Estilização/Retorno:** Todas as APIs devem responder no formato JSON: `{ success: boolean, data: any, error: null|string }`.
- **UI/UX:** Design premium com dark mode, micro-animações (Framer Motion) e foco em visualização limpa de propostas.

## 3. Arquitetura do Banco de Dados (Schema Simplificado)
- **User:** `id` (UUID), `email`, `name`, `companyId` (Tenant).
- **Company (Tenant):** `id`, `name`, `cnpj`, `segment` (ELETRICA, HIDRAULICA, etc), `plan_type` (FREE, PRO, ENTERPRISE).
- **Client:** `id`, `companyId`, `name`, `email`, `phone`, `location`.
- **Proposal:** `id`, `companyId`, `clientId`, `number`, `status` (DRAFT, SENT, APPROVED), `total`.
- **ProposalItem:** `id`, `proposalId`, `label`, `quantity`, `unitPrice`, `subtotal`.
- **CatalogItem:** `id`, `companyId`, `description`, `category` (SERVICO, MATERIAL), `defaultPrice`.

## 4. Sistema de Autenticação e Multi-Tenancy
- **Auth:** JWT gerenciado pelo `@fastify/jwt`. Enviado no Header `Authorization: Bearer <token>`.
- **Multi-Tenancy:** A maioria das entidades possui `companyId`. O backend extrai o `companyId` do token JWT (via hook `preHandler`) e deve *sempre* filtrar as consultas ao banco por esse ID para garantir o isolamento entre empresas.

## 5. Estrutura de Pastas e Módulos
- `/src` (Frontend)
  - `/components`: UI kit e componentes reutilizáveis.
  - `/pages`: Telas da aplicação (Onboarding, Dashboard, Proposals).
  - `/shared/services`: Camada de comunicação com a API (`api.js`).
- `/api` (Backend)
  - `/routes`: Módulos da API (auth, companies, proposals, clients, catalog).
  - `/plugins`: Configurações de banco (Prisma), JWT e integrações (AI).
  - `/prisma`: Definição de esquema e migrações.
- `/android`: Código nativo para o app móvel.
