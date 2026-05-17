# Módulo: Dashboard (Integração com Dashboard)

## Identidade
Componentes de integração que expõem funcionalidades do módulo Challenge no dashboard principal da aplicação. Serve como ponte entre o sistema de desafios e a visão geral do usuário.

## Estrutura Interna
```
dashboard/
├── index.js                        # Exports públicos do módulo
── DashboardChallengeBlock.jsx     # Bloco resumo do desafio no dashboard
└── ProgressCalendar.jsx            # Calendário de progresso compacto
```

## Dependências Externas
- `framer-motion` (motion)
- `lucide-react` (ícones)

## Dependências Internas (cross-module)
| Importa de | Caminho |
|-----------|---------|
| `useActiveChallenge` | `../challenge/hooks/useActiveChallenge` |
| `getDailyTip` | `../challenge/data/dailyTips` |
| `getWeekNumber`, `getWeekLabel` | `../challenge/utils/challengeUtils` |

## Conexões com o Sistema
| Arquivo | Importado por | Caminho |
|---------|--------------|---------|
| `DashboardChallengeBlock` | `Dashboard.jsx` | `../growth/dashboard/DashboardChallengeBlock` |
| `ProgressCalendar` | (nenhum externo atualmente) | módulo isolado |

## Como Transplantar
1. Copiar pasta `dashboard/` inteira
2. Copiar também `challenge/` (dependência cruzada)
3. Importar: `import { DashboardChallengeBlock } from './dashboard'`
4. Dependências npm necessárias: `framer-motion`, `lucide-react`

## Funcionalidades
- Bloco resumo com streak, dia atual e próxima tarefa
- Navegação rápida para o desafio completo
- Dica do dia integrada
- Calendário de progresso semanal compacto
