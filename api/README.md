# OrcaPro API v2.0

> Motor de orçamentos multi-segmento para prestadores de serviço.
> Stack: **Fastify 5** · **Prisma 6** · **Neon (PostgreSQL)** · **Vercel**

---

## Setup local

```bash
cp .env.example .env
# preencha DATABASE_URL com sua string do Neon

npm install
npm run db:push   # aplica schema no Neon
npm run db:seed   # popula dados de demo
npm run dev
```

---

## Estrutura de rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cria conta |
| POST | `/auth/login` | Login → JWT |
| GET  | `/auth/me` | Usuário atual |
| GET  | `/company` | Empresa do usuário |
| POST | `/company` | Onboarding — cria empresa |
| PUT  | `/company` | Atualiza empresa |
| GET  | `/catalog` | Catálogo de itens |
| POST | `/catalog` | Cria item |
| PUT  | `/catalog/:id` | Atualiza item |
| DELETE | `/catalog/:id` | Inativa item |
| POST | `/catalog/seed` | Seed do catálogo por segmento |
| GET  | `/clients` | Lista clientes |
| POST | `/clients` | Cria cliente |
| PUT  | `/clients/:id` | Atualiza cliente |
| DELETE | `/clients/:id` | Remove cliente |
| GET  | `/proposals` | Lista propostas (paginado) |
| GET  | `/proposals/:id` | Detalhe da proposta |
| POST | `/proposals` | Cria proposta |
| PUT  | `/proposals/:id` | Atualiza proposta |
| PATCH | `/proposals/:id/status` | Muda status |
| DELETE | `/proposals/:id` | Remove proposta |
| GET  | `/dashboard/stats` | Estatísticas |
| GET  | `/dashboard/recent` | Últimas propostas |

---

## Segmentos suportados

```
GEOMEMBRANA · ELETRICA · CONSTRUCAO_CIVIL
HIDRAULICA · PINTURA · AR_CONDICIONADO · OUTRO
```

Cada segmento tem catálogo padrão pré-carregado via `POST /catalog/seed`.

---

## Fluxo de onboarding

1. `POST /auth/register` — cria conta
2. `POST /company` — cria empresa com segmento
3. `POST /catalog/seed` — popula catálogo do segmento
4. Criar clientes e propostas

---

## Diferenças v1 → v2

| v1 (Onix Soluções) | v2 (OrcaPro) |
|---|---|
| Dados hardcoded Onix Soluções | Empresa multi-tenant por usuário |
| Catálogo estático (array JS) | `CatalogItem` no banco, por empresa |
| `CompanySettings` singleton | `Company` vinculada ao `User` |
| Proposals sem `companyId` | Todas as entidades filtradas por empresa |
| Sem numeração automática | Numeração `YYYY-NNN` automática por empresa |
| Status sem `EXPIRED` | 5 status: DRAFT/SENT/APPROVED/REJECTED/EXPIRED |
| Catálogo único (geomembrana) | Catálogos por segmento com seed automático |

---

## Deploy Vercel

```bash
vercel --prod
```

Variáveis de ambiente no painel Vercel:
- `DATABASE_URL` — string de conexão Neon
- `JWT_SECRET` — string segura aleatória
