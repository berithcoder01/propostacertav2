/**
 * Base de Conhecimento Vetorial Estruturada para Classificação de Negócios
 * 
 * Este arquivo contém a estrutura completa de exemplos de negócios organizados por:
 * - Tipo de Negócio (SERVICE_ONLY, PRODUCT_ONLY, HYBRID)
 * - Segmento (ELETRICA, CONSTRUCAO_CIVIL, HIDRAULICA, PINTURA, AR_CONDICIONADO, OUTRO)
 * - Intenção Primária
 * - Ação Primária
 * - Ação Secundária (para HYBRID)
 * 
 * Cada entrada será convertida em um embedding vetorial para busca por similaridade (RAG).
 */

export const BUSINESS_TYPE_KNOWLEDGE_BASE = [
  // ============================================================================
  // SEGMENTO: ELETRICA
  // ============================================================================

  // SERVICE_ONLY - ELETRICA
  {
    id: "biz-eletrica-service-001",
    description: "Sou eletricista autônomo, realizo instalações elétricas residenciais e comerciais, além de manutenção de sistemas.",
    businessType: "SERVICE_ONLY",
    segment: "ELETRICA",
    primaryIntention: "Prestação de Mão de Obra",
    primaryAction: "Instalar",
    secondaryAction: null,
    keywords: ["eletricista", "instalação elétrica", "manutenção", "residencial", "comercial"],
    confidence: 0.93,
  },
  {
    id: "biz-eletrica-service-002",
    description: "Empresa de manutenção elétrica para condomínios, realizamos inspeção, reparo e manutenção preventiva de sistemas.",
    businessType: "SERVICE_ONLY",
    segment: "ELETRICA",
    primaryIntention: "Manutenção e Reparo",
    primaryAction: "Manter",
    secondaryAction: null,
    keywords: ["manutenção elétrica", "inspeção", "reparo", "condomínio", "preventiva"],
    confidence: 0.91,
  },
  {
    id: "biz-eletrica-service-003",
    description: "Consultoria em eficiência energética, analisamos sistemas elétricos e recomendamos otimizações para reduzir consumo.",
    businessType: "SERVICE_ONLY",
    segment: "ELETRICA",
    primaryIntention: "Consultoria e Assessoria",
    primaryAction: "Consultar",
    secondaryAction: null,
    keywords: ["consultoria", "eficiência energética", "otimização", "análise", "redução de consumo"],
    confidence: 0.88,
  },

  // PRODUCT_ONLY - ELETRICA
  {
    id: "biz-eletrica-product-001",
    description: "Loja de materiais elétricos, vendemos fios, cabos, disjuntores, lâmpadas e componentes para instalações.",
    businessType: "PRODUCT_ONLY",
    segment: "ELETRICA",
    primaryIntention: "Venda Varejista",
    primaryAction: "Vender",
    secondaryAction: null,
    keywords: ["loja de materiais", "fios", "cabos", "disjuntores", "lâmpadas", "componentes"],
    confidence: 0.94,
  },
  {
    id: "biz-eletrica-product-002",
    description: "Distribuidora de componentes elétricos, fornecemos para lojas, eletricistas e empresas de construção.",
    businessType: "PRODUCT_ONLY",
    segment: "ELETRICA",
    primaryIntention: "Distribuição",
    primaryAction: "Distribuir",
    secondaryAction: null,
    keywords: ["distribuidora", "fornecedor", "componentes elétricos", "atacado", "revendedor"],
    confidence: 0.92,
  },

  // HYBRID - ELETRICA
  {
    id: "biz-eletrica-hybrid-001",
    description: "Empresa de automação residencial, vendemos equipamentos de automação e realizamos projeto, instalação e manutenção.",
    businessType: "HYBRID",
    segment: "ELETRICA",
    primaryIntention: "Venda + Instalação",
    primaryAction: "Vender",
    secondaryAction: "Instalar",
    keywords: ["automação residencial", "equipamentos", "venda", "instalação", "projeto", "manutenção"],
    confidence: 0.94,
  },
  {
    id: "biz-eletrica-hybrid-002",
    description: "Empresa de painéis solares, vendemos equipamentos de energia solar e realizamos instalação, manutenção e monitoramento.",
    businessType: "HYBRID",
    segment: "ELETRICA",
    primaryIntention: "Venda + Instalação",
    primaryAction: "Vender",
    secondaryAction: "Instalar",
    keywords: ["painéis solares", "energia solar", "venda", "instalação", "monitoramento", "manutenção"],
    confidence: 0.93,
  },

  // ============================================================================
  // SEGMENTO: CONSTRUCAO_CIVIL
  // ============================================================================

  // SERVICE_ONLY - CONSTRUCAO_CIVIL
  {
    id: "biz-construcao-service-001",
    description: "Construtora que realiza obras de construção civil, reformas residenciais e comerciais.",
    businessType: "SERVICE_ONLY",
    segment: "CONSTRUCAO_CIVIL",
    primaryIntention: "Prestação de Mão de Obra",
    primaryAction: "Construir",
    secondaryAction: null,
    keywords: ["construtora", "construção", "reforma", "obra", "residencial", "comercial"],
    confidence: 0.93,
  },
  {
    id: "biz-construcao-service-002",
    description: "Empresa de restauração de imóveis históricos, realizamos restauração, conservação e reabilitação estrutural.",
    businessType: "SERVICE_ONLY",
    segment: "CONSTRUCAO_CIVIL",
    primaryIntention: "Prestação de Mão de Obra",
    primaryAction: "Restaurar",
    secondaryAction: null,
    keywords: ["restauração", "conservação", "imóvel histórico", "reabilitação", "estrutural"],
    confidence: 0.90,
  },
  {
    id: "biz-construcao-service-003",
    description: "Consultoria em engenharia civil, oferecemos análise estrutural, projeto e supervisão de obras.",
    businessType: "SERVICE_ONLY",
    segment: "CONSTRUCAO_CIVIL",
    primaryIntention: "Consultoria e Assessoria",
    primaryAction: "Consultar",
    secondaryAction: null,
    keywords: ["consultoria", "engenharia civil", "análise estrutural", "projeto", "supervisão"],
    confidence: 0.89,
  },

  // PRODUCT_ONLY - CONSTRUCAO_CIVIL
  {
    id: "biz-construcao-product-001",
    description: "Loja de materiais de construção, vendemos cimento, tijolos, ferragens, pisos, tintas e outros materiais.",
    businessType: "PRODUCT_ONLY",
    segment: "CONSTRUCAO_CIVIL",
    primaryIntention: "Venda Varejista",
    primaryAction: "Vender",
    secondaryAction: null,
    keywords: ["loja de materiais", "cimento", "tijolos", "ferragens", "pisos", "tintas"],
    confidence: 0.94,
  },
  {
    id: "biz-construcao-product-002",
    description: "Fábrica de pré-moldados, produzimos blocos, placas e estruturas pré-moldadas para construção.",
    businessType: "PRODUCT_ONLY",
    segment: "CONSTRUCAO_CIVIL",
    primaryIntention: "Fabricação",
    primaryAction: "Fabricar",
    secondaryAction: null,
    keywords: ["fábrica", "pré-moldados", "blocos", "placas", "estruturas", "produção"],
    confidence: 0.92,
  },

  // HYBRID - CONSTRUCAO_CIVIL
  {
    id: "biz-construcao-hybrid-001",
    description: "Construtora com loja de materiais, vendemos materiais de construção e realizamos obras e reformas.",
    businessType: "HYBRID",
    segment: "CONSTRUCAO_CIVIL",
    primaryIntention: "Venda + Construção",
    primaryAction: "Vender",
    secondaryAction: "Construir",
    keywords: ["construtora", "loja de materiais", "venda", "construção", "reforma", "obra"],
    confidence: 0.93,
  },

  // ============================================================================
  // SEGMENTO: HIDRAULICA
  // ============================================================================

  // SERVICE_ONLY - HIDRAULICA
  {
    id: "biz-hidraulica-service-001",
    description: "Encanador profissional, realizo instalação, manutenção e reparo de sistemas de água e esgoto.",
    businessType: "SERVICE_ONLY",
    segment: "HIDRAULICA",
    primaryIntention: "Prestação de Mão de Obra",
    primaryAction: "Instalar",
    secondaryAction: null,
    keywords: ["encanador", "hidráulica", "instalação", "manutenção", "reparo", "água", "esgoto"],
    confidence: 0.93,
  },
  {
    id: "biz-hidraulica-service-002",
    description: "Empresa de manutenção hidráulica para condomínios, realizamos limpeza de caixas, reparo de vazamentos e inspeção.",
    businessType: "SERVICE_ONLY",
    segment: "HIDRAULICA",
    primaryIntention: "Manutenção e Reparo",
    primaryAction: "Manter",
    secondaryAction: null,
    keywords: ["manutenção hidráulica", "limpeza", "vazamento", "inspeção", "condomínio"],
    confidence: 0.91,
  },

  // PRODUCT_ONLY - HIDRAULICA
  {
    id: "biz-hidraulica-product-001",
    description: "Distribuidora de tubos e conexões, vendemos tubos de PVC, cobre, conexões, válvulas e registros.",
    businessType: "PRODUCT_ONLY",
    segment: "HIDRAULICA",
    primaryIntention: "Distribuição",
    primaryAction: "Distribuir",
    secondaryAction: null,
    keywords: ["distribuidora", "tubos", "conexões", "PVC", "cobre", "válvulas", "registros"],
    confidence: 0.93,
  },

  // HYBRID - HIDRAULICA
  {
    id: "biz-hidraulica-hybrid-001",
    description: "Empresa de soluções hidráulicas, vendemos componentes e realizamos projeto, instalação e manutenção de sistemas.",
    businessType: "HYBRID",
    segment: "HIDRAULICA",
    primaryIntention: "Venda + Instalação",
    primaryAction: "Vender",
    secondaryAction: "Instalar",
    keywords: ["soluções hidráulicas", "venda", "componentes", "projeto", "instalação", "manutenção"],
    confidence: 0.94,
  },

  // ============================================================================
  // SEGMENTO: PINTURA
  // ============================================================================

  // SERVICE_ONLY - PINTURA
  {
    id: "biz-pintura-service-001",
    description: "Pintor profissional, realizo pintura de paredes, fachadas, móveis e trabalhos de acabamento.",
    businessType: "SERVICE_ONLY",
    segment: "PINTURA",
    primaryIntention: "Prestação de Mão de Obra",
    primaryAction: "Pintar",
    secondaryAction: null,
    keywords: ["pintor", "pintura", "paredes", "fachada", "móvel", "acabamento"],
    confidence: 0.92,
  },
  {
    id: "biz-pintura-service-002",
    description: "Empresa de pintura decorativa, oferecemos serviços de pintura artística, murais e efeitos especiais.",
    businessType: "SERVICE_ONLY",
    segment: "PINTURA",
    primaryIntention: "Prestação de Mão de Obra",
    primaryAction: "Pintar",
    secondaryAction: null,
    keywords: ["pintura decorativa", "pintura artística", "murais", "efeitos especiais"],
    confidence: 0.90,
  },

  // PRODUCT_ONLY - PINTURA
  {
    id: "biz-pintura-product-001",
    description: "Loja de tintas e materiais de pintura, vendemos tintas, pincéis, rolos, solventes e acessórios.",
    businessType: "PRODUCT_ONLY",
    segment: "PINTURA",
    primaryIntention: "Venda Varejista",
    primaryAction: "Vender",
    secondaryAction: null,
    keywords: ["loja de tintas", "tintas", "pincéis", "rolos", "solventes", "acessórios"],
    confidence: 0.94,
  },

  // HYBRID - PINTURA
  {
    id: "biz-pintura-hybrid-001",
    description: "Empresa de pintura com loja, vendemos tintas e materiais de pintura e oferecemos serviços de pintura profissional.",
    businessType: "HYBRID",
    segment: "PINTURA",
    primaryIntention: "Venda + Serviço",
    primaryAction: "Vender",
    secondaryAction: "Pintar",
    keywords: ["empresa de pintura", "loja de tintas", "venda", "serviço de pintura", "materiais"],
    confidence: 0.93,
  },

  // ============================================================================
  // SEGMENTO: AR_CONDICIONADO
  // ============================================================================

  // SERVICE_ONLY - AR_CONDICIONADO
  {
    id: "biz-ar-service-001",
    description: "Técnico em ar condicionado, realizo instalação, manutenção, limpeza e reparo de equipamentos de climatização.",
    businessType: "SERVICE_ONLY",
    segment: "AR_CONDICIONADO",
    primaryIntention: "Prestação de Mão de Obra",
    primaryAction: "Instalar",
    secondaryAction: null,
    keywords: ["técnico ar condicionado", "climatização", "instalação", "manutenção", "limpeza", "reparo"],
    confidence: 0.93,
  },

  // PRODUCT_ONLY - AR_CONDICIONADO
  {
    id: "biz-ar-product-001",
    description: "Loja de ar condicionado, vendemos equipamentos de climatização, acessórios e peças de reposição.",
    businessType: "PRODUCT_ONLY",
    segment: "AR_CONDICIONADO",
    primaryIntention: "Venda Varejista",
    primaryAction: "Vender",
    secondaryAction: null,
    keywords: ["loja ar condicionado", "climatização", "equipamentos", "acessórios", "peças"],
    confidence: 0.94,
  },

  // HYBRID - AR_CONDICIONADO
  {
    id: "biz-ar-hybrid-001",
    description: "Empresa de climatização, vendemos equipamentos de ar condicionado e realizamos projeto, instalação, manutenção e reparo.",
    businessType: "HYBRID",
    segment: "AR_CONDICIONADO",
    primaryIntention: "Venda + Instalação",
    primaryAction: "Vender",
    secondaryAction: "Instalar",
    keywords: ["climatização", "ar condicionado", "venda", "projeto", "instalação", "manutenção", "reparo"],
    confidence: 0.94,
  },


  // ============================================================================
  // SEGMENTO: OUTRO (Serviços e Produtos Diversos)
  // ============================================================================

  // SERVICE_ONLY - OUTRO
  {
    id: "biz-outro-service-001",
    description: "Consultoria em TI, oferecemos serviços de desenvolvimento de software customizado e suporte técnico.",
    businessType: "SERVICE_ONLY",
    segment: "OUTRO",
    primaryIntention: "Consultoria e Assessoria",
    primaryAction: "Consultar",
    secondaryAction: null,
    keywords: ["consultoria TI", "desenvolvimento software", "suporte técnico", "customizado"],
    confidence: 0.90,
  },
  {
    id: "biz-outro-service-002",
    description: "Clínica de estética, oferecemos tratamentos faciais, corporais, massagens e terapias holísticas.",
    businessType: "SERVICE_ONLY",
    segment: "OUTRO",
    primaryIntention: "Saúde e Bem-estar",
    primaryAction: "Tratar",
    secondaryAction: null,
    keywords: ["clínica estética", "tratamento", "massagem", "terapia", "bem-estar"],
    confidence: 0.91,
  },
  {
    id: "biz-outro-service-003",
    description: "Agência de marketing digital, criamos campanhas, gerenciamos redes sociais e oferecemos consultoria de marca.",
    businessType: "SERVICE_ONLY",
    segment: "OUTRO",
    primaryIntention: "Consultoria e Assessoria",
    primaryAction: "Consultar",
    secondaryAction: null,
    keywords: ["agência marketing", "campanhas", "redes sociais", "consultoria marca"],
    confidence: 0.89,
  },
  {
    id: "biz-outro-service-004",
    description: "Professor particular, ofereço aulas de matemática, física e química para ensino médio e superior.",
    businessType: "SERVICE_ONLY",
    segment: "OUTRO",
    primaryIntention: "Educação e Treinamento",
    primaryAction: "Ensinar",
    secondaryAction: null,
    keywords: ["professor", "aulas", "educação", "matemática", "física", "química"],
    confidence: 0.88,
  },

  // PRODUCT_ONLY - OUTRO
  {
    id: "biz-outro-product-001",
    description: "E-commerce de eletrônicos, vendemos smartphones, tablets, notebooks e acessórios.",
    businessType: "PRODUCT_ONLY",
    segment: "OUTRO",
    primaryIntention: "E-commerce",
    primaryAction: "Vender",
    secondaryAction: null,
    keywords: ["e-commerce", "eletrônicos", "smartphones", "tablets", "notebooks", "acessórios"],
    confidence: 0.94,
  },
  {
    id: "biz-outro-product-002",
    description: "Loja de roupas e acessórios de moda, com presença física e online.",
    businessType: "PRODUCT_ONLY",
    segment: "OUTRO",
    primaryIntention: "Venda Varejista",
    primaryAction: "Vender",
    secondaryAction: null,
    keywords: ["loja roupas", "moda", "acessórios", "varejo", "online"],
    confidence: 0.93,
  },
  {
    id: "biz-outro-product-003",
    description: "Livraria que vende livros didáticos, de ficção, não-ficção e infantis.",
    businessType: "PRODUCT_ONLY",
    segment: "OUTRO",
    primaryIntention: "Venda Varejista",
    primaryAction: "Vender",
    secondaryAction: null,
    keywords: ["livraria", "livros", "didático", "ficção", "infantil"],
    confidence: 0.92,
  },

  // HYBRID - OUTRO
  {
    id: "biz-outro-hybrid-001",
    description: "Pet shop que vende rações e acessórios, além de oferecer serviços de banho, tosa e consultoria veterinária.",
    businessType: "HYBRID",
    segment: "OUTRO",
    primaryIntention: "Venda + Serviço",
    primaryAction: "Vender",
    secondaryAction: "Tratar",
    keywords: ["pet shop", "rações", "acessórios", "banho", "tosa", "consultoria veterinária"],
    confidence: 0.93,
  },
  {
    id: "biz-outro-hybrid-002",
    description: "Estúdio de fotografia que vende álbuns, quadros, impressões e oferece serviços de ensaios fotográficos.",
    businessType: "HYBRID",
    segment: "OUTRO",
    primaryIntention: "Venda + Serviço",
    primaryAction: "Vender",
    secondaryAction: "Fotografar",
    keywords: ["estúdio fotografia", "álbuns", "quadros", "impressões", "ensaios fotográficos"],
    confidence: 0.92,
  },
  {
    id: "biz-outro-hybrid-003",
    description: "Clínica odontológica que vende produtos de higiene bucal e oferece tratamentos, limpeza e consultoria.",
    businessType: "HYBRID",
    segment: "OUTRO",
    primaryIntention: "Venda + Serviço",
    primaryAction: "Vender",
    secondaryAction: "Tratar",
    keywords: ["clínica odontológica", "higiene bucal", "tratamento", "limpeza", "consultoria"],
    confidence: 0.93,
  },
];

/**
 * Função auxiliar para buscar exemplos por tipo de negócio
 */
export function getExamplesByBusinessType(businessType) {
  return BUSINESS_TYPE_KNOWLEDGE_BASE.filter((item) => item.businessType === businessType);
}

/**
 * Função auxiliar para buscar exemplos por segmento
 */
export function getExamplesBySegment(segment) {
  return BUSINESS_TYPE_KNOWLEDGE_BASE.filter((item) => item.segment === segment);
}

/**
 * Função auxiliar para buscar exemplos por tipo de negócio e segmento
 */
export function getExamplesByBusinessTypeAndSegment(businessType, segment) {
  return BUSINESS_TYPE_KNOWLEDGE_BASE.filter(
    (item) => item.businessType === businessType && item.segment === segment
  );
}

/**
 * Função auxiliar para contar exemplos por tipo de negócio
 */
export function countByBusinessType() {
  const counts = { SERVICE_ONLY: 0, PRODUCT_ONLY: 0, HYBRID: 0 };
  BUSINESS_TYPE_KNOWLEDGE_BASE.forEach((item) => {
    counts[item.businessType]++;
  });
  return counts;
}

/**
 * Função auxiliar para contar exemplos por segmento
 */
export function countBySegment() {
  const counts = {};
  BUSINESS_TYPE_KNOWLEDGE_BASE.forEach((item) => {
    counts[item.segment] = (counts[item.segment] || 0) + 1;
  });
  return counts;
}
