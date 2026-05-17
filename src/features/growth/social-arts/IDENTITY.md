# Módulo: Social Arts (Artes para Redes Sociais)

## Identidade
Editor visual de artes para redes sociais com presets configuráveis. Gera imagens PNG em alta resolução diretamente no navegador.

## Estrutura Interna
```
social-arts/
├── index.js                    # Exports públicos do módulo
├── SocialArtsTab.jsx           # Componente principal (entry point)
├── BannerComponents.jsx        # Componentes UI reutilizáveis (cards, badges, etc.)
└── data/
    ├── bannerPresets.js        # Definição dos presets de arte
    ├── fontPairs.js            # Pares de fontes por segmento
    ├── gradientPresets.js      # Presets de gradientes
    └── patternLibrary.js       # Biblioteca de padrões SVG
```

## Dependências Externas
- `react` (useState, useRef)
- `framer-motion` (motion, AnimatePresence)
- `lucide-react` (ícones)
- `html2canvas` (exportação PNG)
- `../../../shared/context/AuthContext` (dados da empresa)

## Conexões com o Sistema
| Arquivo | Importado por | Caminho |
|---------|--------------|---------|
| `SocialArtsTab` | `GrowthPage.jsx` | `./social-arts/SocialArtsTab` |
| `bannerPresets` | `SocialArtsTab.jsx` | interno |
| `BannerComponents` | (nenhum externo) | módulo isolado |

## Como Transplantar
1. Copiar pasta `social-arts/` inteira
2. Atualizar import do `AuthContext` se necessário
3. Importar: `import { SocialArtsTab } from './social-arts'`
4. Dependências npm necessárias: `framer-motion`, `lucide-react`, `html2canvas`

## Funcionalidades
- Presets configuráveis (foto-status, story-promo, promocao, etc.)
- Editor com painel colapsável (conteúdo, estilo, decoração, foto)
- Elementos compartilhados padronizados (logo, CTA, telefone)
- Exportação PNG 2x resolução
- Controles de espaçamento, posição, blocos retangulares, formas decorativas
