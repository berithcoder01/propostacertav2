/**
 * Configuração de Condições Comerciais Dinâmicas - EXPANDIDA
 * Inclui os 10 segmentos mais prováveis com especificidades completas
 */

export const commercialConditionsConfigExpanded = {
  types: {
    SERVICE_ONLY: {
      sections: {
        paymentConditions: true,
        guarantees: true,

        executionAndValidity: true,
      },
      wording: {
        executionPeriodLabel: "Prazo de Execução",
        warrantyLabel: "Garantia / SLA",
        warrantyDetailsPlaceholder: "Ex.: Suporte técnico, tempo de resposta, etc.",
      },
      defaults: {
        downPaymentPct: 20,
        downPaymentDays: 45,
        measurementDays: 0,

      }
    },
    PRODUCT_ONLY: {
      sections: {
        paymentConditions: true,
        guarantees: true,
        taxFrame: false,
        contractualPenalty: false,
        executionAndValidity: true,
      },
      wording: {
        executionPeriodLabel: "Prazo de Entrega",
        warrantyLabel: "Garantia de Fábrica",
        warrantyDetailsPlaceholder: "Ex.: Garantia contra defeitos de fabricação.",
      },
      defaults: {
        downPaymentPct: 100,
        downPaymentDays: 0,
        measurementDays: 0,
        showTaxFrame: false,
        showPenalty: false,
      }
    },
    HYBRID: {
      sections: {
        paymentConditions: true,
        guarantees: true,

        executionAndValidity: true,
      },
      wording: {
        executionPeriodLabel: "Prazo de Execução/Entrega",
        warrantyLabel: "Garantias e Suporte",
        warrantyDetailsPlaceholder: "Ex.: Garantia de instalação e do equipamento.",
      },
      defaults: {
        downPaymentPct: 20,
        downPaymentDays: 45,
        measurementDays: 10,

      }
    }
  },

  segments: {
    CONSTRUCAO_CIVIL: {
      sections: {

      },
      wording: {
        executionPeriodLabel: "Prazo de Obra",
        warrantyLabel: "Garantia de Execução (ART)",
        warrantyDetailsPlaceholder: "Ex.: Garantia de 12 meses contra defeitos de execução.",
      },
      defaults: {
        downPaymentPct: 20,
        downPaymentDays: 45,
        measurementDays: 10,
        warrantyPeriod: 12,
        warrantyType: "MESES",

      },
      proposalTypeSuggestion: "valor_fechado",
      suggestedItems: ["Mão de Obra", "Materiais", "Equipamentos"],
    },

    ESTETICA: {
      sections: {

      },
      wording: {
        executionPeriodLabel: "Cronograma de Sessões",
        warrantyLabel: "Cuidados Pós-Procedimento",
        warrantyDetailsPlaceholder: "Ex.: Orientações de cuidados e política de retorno.",
      },
      defaults: {
        downPaymentPct: 50,
        downPaymentDays: 0,
        measurementDays: 30,
        warrantyPeriod: 0,
        warrantyType: "PERSONALIZADO",

      },
      proposalTypeSuggestion: "servico_continuo",
      suggestedItems: ["Limpeza de Pele", "Massagem", "Depilação", "Tratamento Facial"],
    },

    JARDINAGEM: {
      sections: {

      },
      wording: {
        executionPeriodLabel: "Frequência de Visitas",
        warrantyLabel: "Garantia de Pegamento",
        warrantyDetailsPlaceholder: "Ex.: Garantia de substituição de mudas que não vingarem.",
      },
      defaults: {
        downPaymentPct: 0,
        downPaymentDays: 0,
        measurementDays: 30,
        warrantyPeriod: 90,
        warrantyType: "DIAS",

      },
      proposalTypeSuggestion: "servico_continuo",
      suggestedItems: ["Manutenção de Área Verde", "Poda", "Adubação", "Plantio"],
    },

    AR_CONDICIONADO: {
      wording: {
        executionPeriodLabel: "Prazo de Instalação",
        warrantyLabel: "Garantia Técnica (Instalação)",
        warrantyDetailsPlaceholder: "Ex.: Garantia de 90 dias em estanqueidade e carga de gás.",
      },
      defaults: {
        downPaymentPct: 30,
        downPaymentDays: 7,
        measurementDays: 0,
        warrantyPeriod: 90,
        warrantyType: "DIAS",

      },
      proposalTypeSuggestion: "valor_fechado",
      suggestedItems: ["Instalação de Split", "Manutenção", "Limpeza de Filtro"],
    },

    ELETRICA: {
      wording: {
        executionPeriodLabel: "Prazo de Execução",
        warrantyLabel: "Garantia de Funcionamento",
        warrantyDetailsPlaceholder: "Ex.: Garantia de 6 meses contra defeitos de execução.",
      },
      defaults: {
        downPaymentPct: 20,
        downPaymentDays: 45,
        measurementDays: 0,
        warrantyPeriod: 6,
        warrantyType: "MESES",

      },
      proposalTypeSuggestion: "valor_fechado",
      suggestedItems: ["Instalação Elétrica", "Manutenção", "Reparo"],
    },

    CONSULTORIA: {
      sections: {

      },
      wording: {
        executionPeriodLabel: "Prazo de Implementação",
        warrantyLabel: "SLA / Suporte",
        warrantyDetailsPlaceholder: "Ex.: Suporte pós-consultoria de 30 dias com tempo de resposta de 24h.",
      },
      defaults: {
        downPaymentPct: 50,
        downPaymentDays: 0,
        measurementDays: 0,
        warrantyPeriod: 30,
        warrantyType: "DIAS",

      },
      proposalTypeSuggestion: "valor_fechado",
      suggestedItems: ["Consultoria", "Diagnóstico", "Relatório", "Suporte"],
    },

    SAAS: {
      sections: {

      },
      wording: {
        executionPeriodLabel: "Prazo de Implementação",
        warrantyLabel: "SLA / Suporte",
        warrantyDetailsPlaceholder: "Ex.: SLA de 99.9% uptime, suporte 24/5.",
      },
      defaults: {
        downPaymentPct: 0,
        downPaymentDays: 0,
        measurementDays: 30,
        warrantyPeriod: 0,
        warrantyType: "PERSONALIZADO",

      },
      proposalTypeSuggestion: "servico_continuo",
      suggestedItems: ["Licença de Software", "Suporte Técnico", "Treinamento"],
    },

    LIMPEZA: {
      sections: {

      },
      wording: {
        executionPeriodLabel: "Frequência de Limpeza",
        warrantyLabel: "Padrão de Qualidade",
        warrantyDetailsPlaceholder: "Ex.: Inspeções semanais de qualidade.",
      },
      defaults: {
        downPaymentPct: 0,
        downPaymentDays: 0,
        measurementDays: 30,
        warrantyPeriod: 0,
        warrantyType: "PERSONALIZADO",

      },
      proposalTypeSuggestion: "servico_continuo",
      suggestedItems: ["Limpeza Diária", "Limpeza Semanal", "Limpeza Profunda"],
    },

    HIDRAULICA: {
      wording: {
        executionPeriodLabel: "Prazo de Execução",
        warrantyLabel: "Garantia de Funcionamento",
        warrantyDetailsPlaceholder: "Ex.: Garantia de 6 meses contra vazamentos.",
      },
      defaults: {
        downPaymentPct: 30,
        downPaymentDays: 7,
        measurementDays: 0,
        warrantyPeriod: 6,
        warrantyType: "MESES",

      },
      proposalTypeSuggestion: "valor_fechado",
      suggestedItems: ["Instalação Hidráulica", "Manutenção", "Reparo"],
    },

    DESIGN: {
      sections: {

      },
      wording: {
        executionPeriodLabel: "Prazo de Entrega",
        warrantyLabel: "Revisões Incluídas",
        warrantyDetailsPlaceholder: "Ex.: 3 rodadas de revisão incluídas no projeto.",
      },
      defaults: {
        downPaymentPct: 50,
        downPaymentDays: 0,
        measurementDays: 0,
        warrantyPeriod: 0,
        warrantyType: "PERSONALIZADO",

      },
      proposalTypeSuggestion: "valor_fechado",
      suggestedItems: ["Design Gráfico", "Logo", "Identidade Visual", "Diagramação"],
    },

    PINTURA: {
      wording: {
        executionPeriodLabel: "Prazo de Execução",
        warrantyLabel: "Garantia de Acabamento",
        warrantyDetailsPlaceholder: "Ex.: Garantia de 6 meses contra descamação.",
      },
      defaults: {
        downPaymentPct: 20,
        downPaymentDays: 45,
        measurementDays: 0,
        warrantyPeriod: 6,
        warrantyType: "MESES",

      },
      proposalTypeSuggestion: "valor_fechado",
      suggestedItems: ["Pintura Interna", "Pintura Externa", "Preparação de Superfície"],
    },

    OUTRO: {
      wording: {
        executionPeriodLabel: "Prazo de Execução",
        warrantyLabel: "Garantia",
        warrantyDetailsPlaceholder: "Descreva os detalhes da garantia.",
      },
      defaults: {
        downPaymentPct: 20,
        downPaymentDays: 45,
        measurementDays: 0,

      },
      proposalTypeSuggestion: "valor_fechado",
      suggestedItems: [],
    },
  }
};

/**
 * Função utilitária para obter a configuração final combinada
 */
export const getFinalConfigExpanded = (businessType, segment) => {
  const base = commercialConditionsConfigExpanded.types[businessType] || 
               commercialConditionsConfigExpanded.types.SERVICE_ONLY;
  const override = commercialConditionsConfigExpanded.segments[segment] || {};

  return {
    ...base,
    sections: { ...base.sections, ...(override.sections || {}) },
    wording: { ...base.wording, ...(override.wording || {}) },
    defaults: { ...base.defaults, ...(override.defaults || {}) },
    proposalTypeSuggestion: override.proposalTypeSuggestion || "valor_fechado",
    suggestedItems: override.suggestedItems || [],
  };
};

/**
 * Mapeamento de Segmentos para BusinessType padrão
 */
export const SEGMENT_TO_BUSINESS_TYPE = {
  CONSTRUCAO_CIVIL: "HYBRID",
  ESTETICA: "SERVICE_ONLY",
  JARDINAGEM: "SERVICE_ONLY",
  AR_CONDICIONADO: "HYBRID",
  ELETRICA: "SERVICE_ONLY",
  CONSULTORIA: "SERVICE_ONLY",
  SAAS: "SERVICE_ONLY",
  LIMPEZA: "SERVICE_ONLY",
  HIDRAULICA: "SERVICE_ONLY",
  DESIGN: "SERVICE_ONLY",
  PINTURA: "SERVICE_ONLY",
  OUTRO: "SERVICE_ONLY",
};
