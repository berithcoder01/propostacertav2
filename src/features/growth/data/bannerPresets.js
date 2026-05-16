/**
 * bannerPresets.js
 * 6 presets de artes prontas para redes sociais.
 * Cada preset define metadados, layout visual e conteúdo padrão.
 * O campo `theme` controla o gradiente de fundo no card de preview.
 * O campo `fields` define quais campos de texto o usuário pode personalizar.
 */

export const bannerPresets = [
  {
    id: 'promocao',
    name: 'Promoção / Oferta',
    description: 'Destaque um serviço especial com suas cores e chame para o orçamento.',
    category: 'Conversão',
    icon: '🎯',
    theme: {
      cardGradient: 'linear-gradient(135deg, #1e3a5f, #e85a1a)',
      previewBg: 'brand-gradient', // usa primaryColor → secondaryColor da empresa
      textColor: '#FFFFFF',
    },
    layout: 'centered-impact',
    sizes: ['1080x1080', '1080x1920'],
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
    id: 'antes-depois',
    name: 'Antes e Depois',
    description: 'Mostre a transformação do seu trabalho. Ideal para obras, pinturas e instalações.',
    category: 'Portfólio',
    icon: '🔄',
    theme: {
      cardGradient: 'linear-gradient(135deg, #1a1a1a, #374151)',
      previewBg: 'dark',
      textColor: '#FFFFFF',
    },
    layout: 'split-before-after',
    sizes: ['1080x1080'],
    fields: [
      {
        key: 'mainText',
        label: 'Legenda do Resultado',
        placeholder: 'Resultado que fala por si!',
        defaultValue: 'Resultado que fala por si! Qualidade garantida.',
        multiline: false,
        maxLength: 60,
      },
    ],
  },

  {
    id: 'depoimento',
    name: 'Depoimento de Cliente',
    description: 'Compartilhe a satisfação de quem já contratou. Prova social gera confiança.',
    category: 'Prova Social',
    icon: '💬',
    theme: {
      cardGradient: 'linear-gradient(135deg, #1e3a5f, #1e3a5f88)',
      previewBg: 'brand-dark',
      textColor: '#FFFFFF',
    },
    layout: 'testimonial-quote',
    sizes: ['1080x1080', '1080x1920'],
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
    id: 'dica',
    name: 'Dica Profissional',
    description: 'Compartilhe conhecimento técnico e mostre autoridade no seu segmento.',
    category: 'Autoridade',
    icon: '💡',
    theme: {
      cardGradient: 'linear-gradient(135deg, #0f0f0f, #1f2937)',
      previewBg: 'dark-brand',
      textColor: '#FFFFFF',
    },
    layout: 'tip-card',
    sizes: ['1080x1080', '1080x1920'],
    fields: [
      {
        key: 'mainText',
        label: 'Dica / Conteúdo',
        placeholder: 'Sabia que a fiação antiga pode causar curtos-circuitos?',
        defaultValue: 'Sabia que a fiação antiga pode causar curtos-circuitos? Faça uma revisão preventiva e garanta a segurança da sua família!',
        multiline: true,
        maxLength: 180,
      },
    ],
  },

  {
    id: 'servicos',
    name: 'Lista de Serviços',
    description: 'Apresente o portfólio completo da sua empresa em um layout profissional.',
    category: 'Portfólio',
    icon: '📋',
    theme: {
      cardGradient: 'linear-gradient(135deg, #1e3a5f, #0a0a0a)',
      previewBg: 'brand-dark',
      textColor: '#FFFFFF',
    },
    layout: 'services-list',
    sizes: ['1080x1080', '1080x1920'],
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

  {
    id: 'urgencia',
    name: 'Chamada de Urgência',
    description: 'Para serviços emergenciais. Destaque o telefone e o atendimento rápido.',
    category: 'Conversão',
    icon: '🚨',
    theme: {
      cardGradient: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
      previewBg: 'danger',
      textColor: '#FFFFFF',
    },
    layout: 'urgency-cta',
    sizes: ['1080x1080', '1080x1920'],
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
];

/** Retorna os campos inicializados com os defaultValues de um preset */
export const getInitialFields = (preset) => {
  if (!preset?.fields) return {};
  return preset.fields.reduce((acc, field) => {
    acc[field.key] = field.defaultValue;
    return acc;
  }, {});
};

/** Agrupa presets por categoria */
export const getPresetsByCategory = () => {
  return bannerPresets.reduce((acc, preset) => {
    if (!acc[preset.category]) acc[preset.category] = [];
    acc[preset.category].push(preset);
    return acc;
  }, {});
};
