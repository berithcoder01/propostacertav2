export const SEGMENT_LABELS = {
  ELETRICA: 'Elétrica',
  HIDRAULICA: 'Hidráulica',
  PINTURA: 'Pintura',
  CONSTRUCAO_CIVIL: 'Construção Civil',
  AR_CONDICIONADO: 'Ar Condicionado',
  SERVICOS: 'Serviços',
  OUTRO: 'Serviços',
}

export const getSegmentLabel = (segment) =>
  SEGMENT_LABELS[segment] || 'Serviços'
