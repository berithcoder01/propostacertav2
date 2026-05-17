export const fontPairs = [
  {
    id: 'modern-clean',
    label: 'Moderno Limpo',
    heading: 'Poppins, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    tags: ['tecnologia', 'startup', 'digital'],
  },
  {
    id: 'bold-impact',
    label: 'Impacto Forte',
    heading: 'Oswald, system-ui, sans-serif',
    body: 'Roboto, system-ui, sans-serif',
    tags: ['urgência', 'promoção', 'ação'],
  },
  {
    id: 'elegant-serif',
    label: 'Elegante',
    heading: 'Playfair Display, Georgia, serif',
    body: 'Lora, Georgia, serif',
    tags: ['luxo', 'beleza', 'moda'],
  },
  {
    id: 'friendly-rounded',
    label: 'Amigável',
    heading: 'Nunito, system-ui, sans-serif',
    body: 'Open Sans, system-ui, sans-serif',
    tags: ['infantil', 'educação', 'saúde'],
  },
  {
    id: 'tech-mono',
    label: 'Tech',
    heading: 'Space Grotesk, system-ui, sans-serif',
    body: 'JetBrains Mono, monospace',
    tags: ['dev', 'tech', 'inovação'],
  },
  {
    id: 'classic-pro',
    label: 'Clássico Pro',
    heading: 'Montserrat, system-ui, sans-serif',
    body: 'Source Sans 3, system-ui, sans-serif',
    tags: ['corporativo', 'escritório', 'consultoria'],
  },
  {
    id: 'display-hero',
    label: 'Display Hero',
    heading: 'Outfit, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    tags: ['hero', 'destaque', 'campanha'],
  },
  {
    id: 'minimal-sans',
    label: 'Minimal',
    heading: 'DM Sans, system-ui, sans-serif',
    body: 'DM Sans, system-ui, sans-serif',
    tags: ['minimalista', 'clean', 'simples'],
  },
]

export const getSegmentFontPair = (segment) => {
  const map = {
    ELETRICA: 'bold-impact',
    HIDRAULICA: 'bold-impact',
    PINTURA: 'modern-clean',
    CONSTRUCAO_CIVIL: 'classic-pro',
    AR_CONDICIONADO: 'modern-clean',
    SERVICOS: 'friendly-rounded',
    OUTRO: 'modern-clean',
  }
  return map[segment] || 'modern-clean'
}
