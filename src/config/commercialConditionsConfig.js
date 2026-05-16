export const commercialConditionsConfig = {
  SERVICE_ONLY: {
    // Visibilidade das seções
    sections: {
      paymentConditions: true,
      guarantees: true, // Será interpretado como SLA/Suporte

      executionAndValidity: true,
      measurementDays: false, // Não relevante para muitos serviços
    },
    // Wording (terminologia) para campos específicos
    wording: {
      executionPeriodLabel: "Prazo de Implementação",
      warrantyLabel: "SLA / Suporte",
      warrantyDetailsPlaceholder: "Ex.: Suporte 24/7, tempo de resposta de 4h",

    },
    // Valores padrão para campos
    defaults: {
      entrada: '0',
      medicao: '',

    },
  },
  PRODUCT_ONLY: {
    sections: {
      paymentConditions: true,
      guarantees: true, // Será interpretado como Garantia de Fábrica
      taxFrame: false, // Ocultar quadro de impostos detalhado
      contractualPenalty: false, // Ocultar multa contratual por padrão
      executionAndValidity: true,
      measurementDays: false,
    },
    wording: {
      executionPeriodLabel: "Prazo de Entrega",
      warrantyLabel: "Garantia de Fábrica",
      warrantyDetailsPlaceholder: "Ex.: 1 ano contra defeitos de fabricação",
      taxFrameTitle: "Impostos (opcional)",
      contractualPenaltyTitle: "Multa por Não Entrega",
    },
    defaults: {
      entrada: '100', // Pagamento integral por padrão
      medicao: '',
      showImpostos: false,
      showMultas: false,
    },
  },
  HYBRID: {
    sections: {
      paymentConditions: true,
      guarantees: true,

      executionAndValidity: true,
      measurementDays: true,
    },
    wording: {
      executionPeriodLabel: "Prazo de Execução/Entrega",
      warrantyLabel: "Garantias e Suporte",
      warrantyDetailsPlaceholder: "Ex.: Garantia de 1 ano para produto, SLA de 99.9% para serviço",

    },
    defaults: {
      entrada: '20',
      medicao: '10',

    },
  },
};
