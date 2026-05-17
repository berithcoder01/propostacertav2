/**
 * EVOLVED BANNER PRESETS v2.0
 * Sistema de presets para geração de artes sociais com suporte a múltiplos estilos
 * Inclui modelos originais + novos modelos modernos (glassmorphism, neo-brutalism, etc)
 */

export const bannerPresets = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // SEÇÃO 1: WHATSAPP STATUS (Originais + Novos)
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'foto-status',
    name: 'Foto + Texto (WhatsApp)',
    description: 'Suba uma foto do seu trabalho e adicione texto com seus dados. Ideal para Status do WhatsApp e Stories.',
    category: 'WhatsApp Status',
    vibe: 'social',
    icon: '📱',
    theme: {
      cardGradient: 'linear-gradient(135deg, #075e54, #25d366)',
      previewBg: 'dark',
      textColor: '#FFFFFF',
    },
    layout: 'photo-overlay',
    sizes: ['1080x1920'],
    requiresPhoto: true,
    fields: [
      {
        key: 'mainText',
        label: 'Chamada Principal',
        placeholder: 'Serviço feito com qualidade!',
        defaultValue: 'Serviço feito com qualidade!',
        multiline: true,
        maxLength: 120,
      },
      {
        key: 'ctaText',
        label: 'Chamada para Ação',
        placeholder: 'Peça seu orçamento!',
        defaultValue: 'Peça seu orçamento!',
        multiline: false,
        maxLength: 50,
      },
    ],
  },

  {
    id: 'urgencia',
    name: 'Chamada de Urgência',
    description: 'Para serviços emergenciais. Destaque o telefone e o atendimento rápido.',
    category: 'WhatsApp Status',
    vibe: 'bold',
    icon: '🚨',
    theme: {
      cardGradient: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
      previewBg: 'danger',
      textColor: '#FFFFFF',
    },
    layout: 'urgency-cta',
    sizes: ['1080x1080', '1080x1920'],
    requiresPhoto: false,
    fields: [
      {
        key: 'mainText',
        label: 'Mensagem de Urgência',
        placeholder: 'Atendimento 24h para emergências!',
        defaultValue: 'Atendimento 24h para emergências! Chame agora.',
        multiline: false,
        maxLength: 80,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SEÇÃO 2: INSTAGRAM STORIES (Originais + Novos)
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'story-promo',
    name: 'Story Promocional',
    description: 'Story vertical com foto de fundo, texto promocional e seus dados. Perfeito para Instagram Stories.',
    category: 'Instagram Stories',
    vibe: 'social',
    icon: '📸',
    theme: {
      cardGradient: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
      previewBg: 'dark',
      textColor: '#FFFFFF',
    },
    layout: 'story-promo',
    sizes: ['1080x1920'],
    requiresPhoto: true,
    fields: [
      {
        key: 'mainText',
        label: 'Texto Promocional',
        placeholder: 'Orçamento grátis esta semana!',
        defaultValue: 'Orçamento grátis esta semana!',
        multiline: true,
        maxLength: 100,
      },
    ],
  },

  {
    id: 'minimal-glass',
    name: 'Minimalista Glass',
    description: 'Design moderno com efeito glassmorphism. Foto com card de vidro fosco para texto.',
    category: 'Instagram Stories',
    vibe: 'modern',
    icon: '✨',
    theme: {
      cardGradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      previewBg: 'dark',
      textColor: '#FFFFFF',
    },
    layout: 'minimal-glass',
    sizes: ['1080x1920'],
    requiresPhoto: true,
    fields: [
      {
        key: 'mainText',
        label: 'Texto Principal',
        placeholder: 'Transforme seu espaço com estilo!',
        defaultValue: 'Transforme seu espaço com estilo!',
        multiline: true,
        maxLength: 100,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SEÇÃO 3: INSTAGRAM FEED (Originais + Novos)
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'post-antes-depois',
    name: 'Antes e Depois com Foto',
    description: 'Montagem com foto do antes e depois do seu trabalho. Gera 40% mais engajamento.',
    category: 'Instagram Feed',
    vibe: 'social',
    icon: '🔄',
    theme: {
      cardGradient: 'linear-gradient(135deg, #1a1a1a, #374151)',
      previewBg: 'dark',
      textColor: '#FFFFFF',
    },
    layout: 'photo-before-after',
    sizes: ['1080x1080'],
    requiresPhoto: true,
    fields: [
      {
        key: 'mainText',
        label: 'Legenda do Resultado',
        placeholder: 'Resultado que fala por si!',
        defaultValue: 'Resultado que fala por si!',
        multiline: false,
        maxLength: 60,
      },
    ],
  },

  {
    id: 'promocao',
    name: 'Promoção / Oferta',
    description: 'Destaque um serviço especial com suas cores e chame para o orçamento.',
    category: 'Instagram Feed',
    vibe: 'bold',
    icon: '🎯',
    theme: {
      cardGradient: 'linear-gradient(135deg, #1e3a5f, #e85a1a)',
      previewBg: 'brand-gradient',
      textColor: '#FFFFFF',
    },
    layout: 'centered-impact',
    sizes: ['1080x1080', '1080x1920'],
    requiresPhoto: false,
    fields: [
      {
        key: 'mainText',
        label: 'Chamada Principal',
        placeholder: 'Orçamento grátis e sem compromisso!',
        defaultValue: 'Orçamento grátis e sem compromisso! Ligue agora.',
        multiline: false,
        maxLength: 80,
      },
    ],
  },

  {
    id: 'neo-brutalism',
    name: 'Neo-Brutalismo',
    description: 'Design impactante com bordas grossas, cores vibrantes e tipografia marcante.',
    category: 'Instagram Feed',
    vibe: 'bold',
    icon: '⚡',
    theme: {
      cardGradient: 'linear-gradient(135deg, #000000, #1a1a1a)',
      previewBg: 'dark',
      textColor: '#FFFFFF',
    },
    layout: 'neo-brutalism',
    sizes: ['1080x1080', '1080x1920'],
    requiresPhoto: false,
    fields: [
      {
        key: 'mainText',
        label: 'Mensagem Principal',
        placeholder: 'Seu serviço em destaque!',
        defaultValue: 'Seu serviço em destaque!',
        multiline: true,
        maxLength: 100,
      },
    ],
  },

  {
    id: 'service-grid',
    name: 'Grade de Serviços',
    description: 'Layout em grid com ícones dos serviços. Perfeito para listar múltiplas ofertas.',
    category: 'Instagram Feed',
    vibe: 'professional',
    icon: '📊',
    theme: {
      cardGradient: 'linear-gradient(135deg, #0f3460, #16213e)',
      previewBg: 'dark',
      textColor: '#FFFFFF',
    },
    layout: 'service-grid',
    sizes: ['1080x1080', '1080x1920'],
    requiresPhoto: false,
    fields: [
      {
        key: 'service1',
        label: 'Serviço 1',
        placeholder: 'Instalação',
        defaultValue: 'Instalação',
        multiline: false,
        maxLength: 30,
      },
      {
        key: 'service2',
        label: 'Serviço 2',
        placeholder: 'Manutenção',
        defaultValue: 'Manutenção',
        multiline: false,
        maxLength: 30,
      },
      {
        key: 'service3',
        label: 'Serviço 3',
        placeholder: 'Reparo',
        defaultValue: 'Reparo',
        multiline: false,
        maxLength: 30,
      },
      {
        key: 'tagline',
        label: 'Frase de Encerramento',
        placeholder: 'Qualidade garantida',
        defaultValue: 'Qualidade garantida',
        multiline: false,
        maxLength: 50,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SEÇÃO 4: PROVA SOCIAL (Originais + Novos)
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'depoimento',
    name: 'Depoimento de Cliente',
    description: 'Compartilhe a satisfação de quem já contratou. Prova social gera confiança.',
    category: 'Prova Social',
    vibe: 'professional',
    icon: '💬',
    theme: {
      cardGradient: 'linear-gradient(135deg, #1e3a5f, #1e3a5f88)',
      previewBg: 'brand-dark',
      textColor: '#FFFFFF',
    },
    layout: 'testimonial-quote',
    sizes: ['1080x1080', '1080x1920'],
    requiresPhoto: false,
    fields: [
      {
        key: 'mainText',
        label: 'Texto do Depoimento',
        placeholder: 'Serviço excelente! Profissional pontual e competente.',
        defaultValue: 'Serviço excelente! Profissional pontual e competente. Recomendo muito!',
        multiline: true,
        maxLength: 200,
      },
      {
        key: 'clientName',
        label: 'Nome do Cliente',
        placeholder: 'João Silva',
        defaultValue: 'Cliente Satisfeito',
        multiline: false,
        maxLength: 40,
      },
    ],
  },

  {
    id: 'expert-profile',
    name: 'Perfil do Especialista',
    description: 'Destaque a foto do profissional com selo de verificado e autoridade.',
    category: 'Prova Social',
    vibe: 'professional',
    icon: '👤',
    theme: {
      cardGradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      previewBg: 'dark',
      textColor: '#FFFFFF',
    },
    layout: 'expert-profile',
    sizes: ['1080x1080', '1080x1920'],
    requiresPhoto: true,
    fields: [
      {
        key: 'mainText',
        label: 'Título / Especialidade',
        placeholder: 'Eletricista Certificado',
        defaultValue: 'Eletricista Certificado',
        multiline: false,
        maxLength: 60,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SEÇÃO 5: AUTORIDADE (Originais + Novos)
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'dica',
    name: 'Dica Profissional',
    description: 'Compartilhe conhecimento técnico e mostre autoridade no seu segmento.',
    category: 'Autoridade',
    vibe: 'professional',
    icon: '💡',
    theme: {
      cardGradient: 'linear-gradient(135deg, #0f0f0f, #1f2937)',
      previewBg: 'dark-brand',
      textColor: '#FFFFFF',
    },
    layout: 'tip-card',
    sizes: ['1080x1080', '1080x1920'],
    requiresPhoto: false,
    fields: [
      {
        key: 'mainText',
        label: 'Dica / Conteúdo',
        placeholder: 'Sabia que a fiação antiga pode causar curtos-circuitos?',
        defaultValue: 'Sabia que a fiação antiga pode causar curtos-circuitos? Faça uma revisão preventiva!',
        multiline: true,
        maxLength: 180,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SEÇÃO 6: PORTFÓLIO (Originais + Novos)
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'servicos',
    name: 'Lista de Serviços',
    description: 'Apresente o portfólio completo da sua empresa em um layout profissional.',
    category: 'Portfólio',
    vibe: 'professional',
    icon: '📋',
    theme: {
      cardGradient: 'linear-gradient(135deg, #1e3a5f, #0a0a0a)',
      previewBg: 'brand-dark',
      textColor: '#FFFFFF',
    },
    layout: 'services-list',
    sizes: ['1080x1080', '1080x1920'],
    requiresPhoto: false,
    fields: [
      {
        key: 'service1',
        label: 'Serviço 1',
        placeholder: 'Instalação Elétrica',
        defaultValue: 'Instalação Elétrica',
        multiline: false,
        maxLength: 40,
      },
      {
        key: 'service2',
        label: 'Serviço 2',
        placeholder: 'Manutenção Preventiva',
        defaultValue: 'Manutenção Preventiva',
        multiline: false,
        maxLength: 40,
      },
      {
        key: 'service3',
        label: 'Serviço 3',
        placeholder: 'Laudos e Projetos',
        defaultValue: 'Laudos e Projetos',
        multiline: false,
        maxLength: 40,
      },
      {
        key: 'tagline',
        label: 'Frase de Encerramento',
        placeholder: 'Qualidade e confiança em cada projeto.',
        defaultValue: 'Qualidade e confiança em cada projeto.',
        multiline: false,
        maxLength: 60,
      },
    ],
  },
]

/**
 * Função auxiliar para obter valores iniciais dos campos de um preset
 * @param {Object} preset - O preset selecionado
 * @returns {Object} Objeto com os valores padrão dos campos
 */
export const getInitialFields = (preset) => {
  if (!preset?.fields) return {}
  return preset.fields.reduce((acc, field) => {
    acc[field.key] = field.defaultValue
    return acc
  }, {})
}

/**
 * Função auxiliar para agrupar presets por categoria
 * @returns {Object} Presets agrupados por categoria
 */
export const getPresetsByCategory = () => {
  return bannerPresets.reduce((acc, preset) => {
    if (!acc[preset.category]) acc[preset.category] = []
    acc[preset.category].push(preset)
    return acc
  }, {})
}

/**
 * Função auxiliar para filtrar presets por "vibe" (estilo)
 * @param {string} vibe - O estilo desejado ('modern', 'bold', 'professional', 'social')
 * @returns {Array} Array de presets que correspondem ao vibe
 */
export const getPresetsByVibe = (vibe) => {
  if (vibe === 'all') return bannerPresets
  return bannerPresets.filter(preset => preset.vibe === vibe)
}

/**
 * Função para obter metadados sobre os vibes disponíveis
 * @returns {Array} Array com informações sobre os vibes
 */
export const getAvailableVibes = () => {
  return [
    { id: 'all', label: 'Todos', icon: '🎨' },
    { id: 'modern', label: 'Moderno', icon: '✨' },
    { id: 'bold', label: 'Impactante', icon: '⚡' },
    { id: 'professional', label: 'Profissional', icon: '💼' },
    { id: 'social', label: 'Social', icon: '👥' },
  ]
}

/**
 * Função para validar os valores de um campo
 * @param {string} key - Chave do campo
 * @param {string} value - Valor a validar
 * @param {Object} preset - O preset que contém o campo
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateFieldValue = (key, value, preset) => {
  const field = preset.fields?.find(f => f.key === key)
  if (!field) return { isValid: false, error: 'Campo não encontrado' }

  if (value.length > field.maxLength) {
    return { isValid: false, error: `Máximo ${field.maxLength} caracteres` }
  }

  return { isValid: true, error: null }
}
