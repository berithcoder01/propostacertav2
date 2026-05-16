export const fmt = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtNum = (v, decimals = 2) =>
  Number(v).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

export const SEGMENTS = {
  SERVICOS: {
    label: 'Serviços Gerais',
    icon: 'Wrench',
    defaultBlocks: ['escopo', 'condicoes', 'garantia', 'observacoes'],
    description: 'Proposta padrão para prestação de serviços',
  },
  PRODUTOS: {
    label: 'Produtos',
    icon: 'Package',
    defaultBlocks: ['escopo', 'condicoes', 'entrega', 'garantia'],
    description: 'Proposta focada em venda de produtos com entrega',
  },
  CONSTRUCAO: {
    label: 'Construção Civil',
    icon: 'HardHat',
    defaultBlocks: ['escopo', 'cronograma', 'condicoes', 'garantia', 'normas', 'observacoes'],
    description: 'Proposta técnica com cronograma e normas',
  },
  BELEZA: {
    label: 'Beleza & Bem-estar',
    icon: 'Sparkles',
    defaultBlocks: ['escopo', 'condicoes', 'beneficios', 'observacoes'],
    description: 'Proposta visual com foco em resultados',
  },
  SAUDE: {
    label: 'Saúde & Manipulação',
    icon: 'Heart',
    defaultBlocks: ['escopo', 'condicoes', 'garantia', 'normas', 'observacoes'],
    description: 'Proposta técnica com conformidade sanitária',
  },
  TECNOLOGIA: {
    label: 'Tecnologia & TI',
    icon: 'Monitor',
    defaultBlocks: ['escopo', 'cronograma', 'condicoes', 'suporte', 'observacoes'],
    description: 'Proposta com escopo técnico e suporte',
  },
};

export const PROPOSAL_BLOCKS = {
  escopo: { label: 'Escopo / Itens', alwaysActive: true },
  condicoes: { label: 'Condições Comerciais', alwaysActive: true },
  cronograma: { label: 'Cronograma de Execução' },
  garantia: { label: 'Garantia' },
  entrega: { label: 'Condições de Entrega' },
  beneficios: { label: 'Benefícios / Resultados' },
  normas: { label: 'Conformidade / Normas Técnicas' },
  suporte: { label: 'Suporte Técnico' },
  observacoes: { label: 'Observações' },
};