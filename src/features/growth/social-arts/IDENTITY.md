# Módulo: Social Arts (Artes para Redes Sociais)

## Identidade
Editor visual de artes para redes sociais com presets configuráveis. Gera imagens PNG em alta resolução diretamente no navegador. Layout 3 colunas inspirado no modelo Adobe (Tools → Canvas → Properties).

## Estrutura Interna
```
social-arts/
├── index.js                      # Exports públicos do módulo
├── SocialArtsTab.jsx             # Entry point — wrapper com EditorProvider
├── SocialArtsEditor.jsx          # Layout 3 zonas (Tools, Canvas, Properties)
│
├── context/
│   └── EditorContext.jsx         # useReducer — estado global do editor
│
├── hooks/
│   └── useExport.js              # Lógica html2canvas isolada
│
├── layout/
│   ├── EditorHeader.jsx          # Topo: voltar + nome + formato
│   ├── ToolsPanel.jsx            # Coluna esquerda, ícone + label (80px)
│   ├── CanvasPanel.jsx           # Painel central, container da arte
│   └── PropertiesPanel.jsx       # Painel direito contextual
│
├── panels/
│   ├── ContentPanel.jsx          # Campos de texto do preset
│   ├── PhotoPanel.jsx            # Upload de foto
│   ├── LayoutPanel.jsx           # Espaçamento, posição, rectBlocks
│   ├── DecorationPanel.jsx       # Formas decorativas
│   └── CTAPanel.jsx              # Botão CTA completo
│
├── renderers/
│   ├── index.js                  # Map: preset.id → componente
│   ├── FotoStatus.jsx
│   ├── StoryPromo.jsx
│   ├── MinimalGlass.jsx
│   ├── NeoBrutalism.jsx
│   ├── ServiceGrid.jsx
│   ├── ExpertProfile.jsx
│   ├── PostAntesDepois.jsx
│   ├── Promocao.jsx
│   ├── Depoimento.jsx
│   ├── Dica.jsx
│   ├── Servicos.jsx
│   └── Urgencia.jsx
│
├── components/
│   ├── shared/
│   │   ├── LogoOrInitial.jsx
│   │   ├── CTAButton.jsx
│   │   ├── PhoneDisplay.jsx
│   │   ├── DecorativeShapes.jsx
│   │   ├── RectBlocks.jsx
│   │   └── PhotoBackground.jsx
│   └── ui/
│       ├── ColorPickerRow.jsx
│       ├── SliderControl.jsx
│       ├── ToggleSwitch.jsx
│       └── AlignmentButtons.jsx
│
├── gallery/
│   ├── PresetGallery.jsx         # Grid de presets com filtro por vibe
│   └── PresetCard.jsx            # Card individual de preset
│
├── data/
│   └── bannerPresets.js          # Definição dos presets de arte
│
└── utils/
    └── color.js                  # getContrastColor + lightenColor
```

## Dependências Externas
- `react` (useState, useRef, useReducer, useContext, useCallback)
- `framer-motion` (motion, AnimatePresence)
- `lucide-react` (ícones)
- `html2canvas` (exportação PNG)
- `../../../shared/context/AuthContext` (dados da empresa)

## Conexões com o Sistema
| Arquivo | Importado por | Caminho |
|---------|--------------|---------|
| `SocialArtsTab` | `GrowthPage.jsx` | `./social-arts/SocialArtsTab` |
| `bannerPresets` | `PresetGallery.jsx`, `EditorContext.jsx` | interno |

## Como Transplantar
1. Copiar pasta `social-arts/` inteira
2. Atualizar import do `AuthContext` se necessário
3. Importar: `import { SocialArtsTab } from './social-arts'`
4. Dependências npm necessárias: `framer-motion`, `lucide-react`, `html2canvas`

## Funcionalidades
- 12 presets configuráveis (foto-status, story-promo, promocao, etc.)
- Layout 3 colunas: Tools Panel (80px) → Canvas → Properties Panel (280px)
- Estado global via EditorContext + useReducer (zero prop drilling)
- Painéis contextuais conforme tool selecionada (Conteúdo, Foto, Layout, Decoração, CTA)
- Exportação PNG 2x resolução
- Tema light mode com CSS variables (--editor-bg, --editor-panel-bg, etc.)
- Galeria com filtro por vibe (Todos, Moderno, Impactante, Profissional, Social)
