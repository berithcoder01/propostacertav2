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
│   ├── PhotoPanel.jsx            # Upload de foto (suporte a 2 fotos para Antes/Depois)
│   ├── BackgroundPanel.jsx       # Controle de fundo (sólido, gradiente, imagem)
│   ├── LayoutPanel.jsx           # Espaçamento, posição, rectBlocks
│   ├── DecorationPanel.jsx       # Sistema de decorações com items configuráveis
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
│   ├── PresetGallery.jsx         # Layout masonry Pinterest-style, busca, filtros
│   ├── PresetCard.jsx            # Card com preview real + badge categoria + hover overlay
│   └── MiniRenderer.jsx          # Renderiza template real em escala reduzida
│
├── data/
│   └── bannerPresets.js          # Definição dos presets de arte
│
├── utils/
│   ├── color.js                  # getContrastColor + lightenColor
│   ├── segments.js               # SEGMENT_LABELS centralizado + getSegmentLabel
│   └── background.js             # resolveBackground + resolveOverlay
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
- 6 ferramentas: Conteúdo, Foto, Fundo, Layout, Decoração, CTA
- **Painel Fundo**: controle de cor sólida, gradiente (ângulo + 2 cores) ou imagem com overlay
- **Foto opcional**: todos os templates aceitam foto como fundo (requiresPhoto: 'optional')
- **Duas fotos**: template Antes/Depois com uploads independentes (photo + photoAlt)
- **Decorações configuráveis**: 5 elementos (Linha, Canto, Brilho, Pontos, Selo) com posição, cor e opacidade por item
- **Offset de texto**: range expandido (-200 a +200px) com botão "Centralizar"
- **Botão de download**: movido para o rodapé do PropertiesPanel (modelo Adobe)
- **Micro-copy**: estados vazios com orientação em todos os painéis
- Painéis contextuais conforme tool selecionada
- Exportação PNG 2x resolução
- Tema light/dark com CSS variables (--editor-bg, --editor-panel-bg, etc.)
- Galeria estilo Pinterest (masonry) com cards de alturas variadas (1:1 e 9:16)
- Layout orgânico sem agrupamento por categoria — todos os templates misturados
- Badge de categoria no canto superior esquerdo de cada card
- Busca por nome, categoria ou tags
- Filtros por categoria via chips (aplicados à lista plana)
- Grid responsivo: 2 col (mobile) → 3 (tablet) → 4 (desktop) → 5 (wide)
- Hover overlay com ação "Usar template"
- **Todos os 12 renderers integrados**: CTA, Offset, RectBlocks, DecorativeShapes e LayoutSpacing funcionais em todos os presets
- `SEGMENT_LABELS` centralizado em `utils/segments.js` (zero duplicatas)
