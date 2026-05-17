# Plano de Evolução: Sistema de Geração de Artes Sociais

Após analisar o código atual e pesquisar tendências de design para prestadores de serviços, identifiquei os seguintes pontos de melhoria e novos modelos a serem implementados.

## 1. Melhorias Estruturais e de Design (UI/UX)
- **Glassmorphism:** Implementar efeitos de vidro fosco (frosted glass) em sobreposições de texto para um visual mais moderno.
- **Tipografia Dinâmica:** Ajustar o tamanho da fonte automaticamente conforme o comprimento do texto para evitar quebras de layout.
- **Elementos Geométricos:** Adicionar formas (círculos, linhas, retângulos) que usam as cores da marca para dar profundidade ao design.
- **Gradientes de Marca:** Evoluir os gradientes estáticos para gradientes que utilizam as cores `primary` e `secondary` da empresa de forma mais inteligente.

## 2. Novos Modelos Propostos

| ID | Nome | Descrição | Layout |
|:---|:---|:---|:---|
| `minimal-glass` | Minimalista Glass | Texto sobre card de vidro fosco com foto de fundo. | Moderno / Clean |
| `neo-brutalism` | Neo-Brutalismo | Cores vibrantes, bordas grossas e sombras marcadas. | Impactante |
| `service-grid` | Grade de Serviços | Layout com ícones e lista de serviços em grid. | Informativo |
| `seasonal-promo` | Promoção Sazonal | Elementos temáticos (ex: frio/calor para ar-condicionado). | Contextual |
| `expert-profile` | Perfil do Especialista | Foco na foto do profissional com selo de verificado/garantia. | Autoridade |

## 3. Melhorias no Backend (bannerPresets.js)
- Adicionar novos campos como `price`, `discountPercentage`, `badgeText`.
- Incluir suporte a ícones de serviços específicos.
- Adicionar configurações de opacidade e blur para os temas.

## 4. Melhorias no Frontend (SocialArtsTab.jsx)
- Refatorar o `BannerRender` para ser mais modular, facilitando a manutenção de muitos modelos.
- Adicionar animações de entrada mais suaves para os elementos do banner no preview.
- Implementar um seletor de "Vibe" ou "Estilo" para filtrar os modelos.

---
**Próximo Passo:** Iniciar a implementação dos novos presets em `bannerPresets.js` e atualizar a lógica de renderização em `SocialArtsTab.jsx`.
