# Módulo: Tutorials (Tutoriais)

## Identidade
Sistema de tutoriais categorizados com passos interativos para aprendizado de marketing digital e gestão de redes sociais.

## Estrutura Interna
```
tutorials/
├── index.js                    # Exports públicos do módulo
├── TutorialsTab.jsx            # Componente principal (entry point)
└── data/
    └── tutorials.js            # Dados dos tutoriais e categorias
```

## Dependências Externas
- `react` (useState)
- `framer-motion` (motion, AnimatePresence)
- `lucide-react` (ícones)

## Conexões com o Sistema
| Arquivo | Importado por | Caminho |
|---------|--------------|---------|
| `TutorialsTab` | `GrowthPage.jsx` | `./tutorials/TutorialsTab` |
| `tutorials` | `TutorialsTab.jsx` | interno |

## Como Transplantar
1. Copiar pasta `tutorials/` inteira
2. Importar: `import { TutorialsTab } from './tutorials'`
3. Dependências npm necessárias: `framer-motion`, `lucide-react`

## Funcionalidades
- Tutoriais categorizados (Instagram, WhatsApp, etc.)
- Passos interativos com checkbox
- Filtro por categoria
- Animações de expansão/colapso
- Dados editáveis em `tutorials.js`
