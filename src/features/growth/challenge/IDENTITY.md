# Módulo: Challenge (Desafio 30 Dias)

## Identidade
Sistema de gamificação com desafio de 30 dias para crescimento de negócio nas redes sociais. Inclui onboarding, tarefas diárias, calendário de progresso e streaks.

## Estrutura Interna
```
challenge/
├── index.js                    # Exports públicos do módulo
├── ChallengeTab.jsx            # Componente principal (entry point)
├── components/
│   ├── ChallengeOnboarding.jsx # Fluxo de configuração inicial
│   ├── ChallengeStartScreen.jsx# Tela de início do desafio
│   ├── TaskDetailPage.jsx      # Página de detalhe da tarefa
│   ├── ChallengeCalendar.jsx   # Calendário visual de progresso
│   ├── ChallengeProgressCard.jsx# Card de progresso/resumo
│   ├── DailyTipCard.jsx        # Card de dica diária
│   ├── TaskStep.jsx            # Passo individual da tarefa
│   └── StreakBadge.jsx         # Badge de sequência (streak)
├── hooks/
│   └── useActiveChallenge.js   # Hook principal (estado + API)
├── services/
│   └── marketingApi.js         # Chamadas à API backend
├── utils/
│   └── challengeUtils.js       # Funções utilitárias puras
└── data/
    └── dailyTips.js            # Dados das dicas diárias
```

## Dependências Externas
- `react` (useState, useEffect, useMemo, useCallback)
- `framer-motion` (motion, AnimatePresence)
- `lucide-react` (ícones)
- `../../../shared/services/api` (URL base da API)

## Conexões com o Sistema
| Arquivo | Importado por | Caminho |
|---------|--------------|---------|
| `ChallengeTab` | `GrowthPage.jsx` | `./challenge/ChallengeTab` |
| `useActiveChallenge` | `DashboardChallengeBlock` | `../challenge/hooks/useActiveChallenge` |
| `getDailyTip` | `DashboardChallengeBlock` | `../challenge/data/dailyTips` |
| `marketingApi` | `ChallengeOnboarding`, `useActiveChallenge` | interno |
| `challengeUtils` | `TaskDetailPage`, `ProgressCalendar`, `useActiveChallenge` | interno/externo |

## Como Transplantar
1. Copiar pasta `challenge/` inteira
2. Criar/adaptar `marketingApi.js` para seu backend
3. Importar: `import { ChallengeTab, useActiveChallenge } from './challenge'`
4. Dependências npm necessárias: `framer-motion`, `lucide-react`

## Funcionalidades
- Onboarding com configuração de redes sociais
- 30 tarefas diárias categorizadas
- Calendário visual de progresso semanal
- Sistema de streak (sequência de dias)
- Dicas diárias contextuais
- Integração com API para persistência
- Dashboard block para integração externa
