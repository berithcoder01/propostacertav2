# Mapeamento de Perfis e Estratégia de Marketing

## 1. Segmentação de Perfis (Mapping)
Com base no `architecture.md` e no plano inicial:

| Perfil (Slug) | Segmentos Associados (DB) | Foco de Marketing |
|---|---|---|
| **technical** | ELETRICA, HIDRAULICA, PINTURA, MARCENARIA, REFORMAS | Autoridade técnica, prova social (antes/depois), agilidade no orçamento, confiança e segurança. |
| **services** | BELEZA, ESTETICA, LIMPEZA, EVENTOS, CONSULTORIA | Estética visual, experiência do cliente, depoimentos, pacotes/recorrência, branding pessoal. |

## 2. Jornada do Desafio (30 Dias)
O desafio será dividido em 4 semanas temáticas:

- **Semana 1: Alicerce e Presença Digital** (Arrumar a casa: Google, Bio, WhatsApp Business).
- **Semana 2: Prova Social e Autoridade** (Mostrar o trabalho, coletar depoimentos, antes/depois).
- **Semana 3: Ativação de Base e Networking** (Reativar ex-clientes, parcerias, indicações).
- **Semana 4: Escala e Anúncios** (Impulsionamento, prospecção ativa, fechamento de propostas).

## 3. Diretrizes para a LLM de Implementação
- **Estilo de Escrita:** Linguagem motivadora, mas prática ("Mão na massa").
- **UX:** Uso de `framer-motion` para transições de tarefas.
- **Ícones:** Padronização com `lucide-react`.
- **Erro:** Uso obrigatório de `AppError` no backend.
- **Tenant:** Filtro obrigatório por `companyId` em todas as queries.
