// proposalRenderContext.js
import { fetchCompany, fetchTemplates } from '../../../shared/services/api';

async function urlToBase64(url) {
  try {
    if (!url) return null;
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    const res = await fetch(fullUrl);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function sectionsToActiveBlocks(sections = {}) {
  const map = {
    paymentConditions: 'condicoes',
    guarantees: 'garantia',
    taxFrame: 'impostos',
    contractualPenalty: 'multas',
    executionAndValidity: 'escopo',
    observations: 'observacoes',
    scope: 'escopo',
    cronograma: 'cronograma',
    beneficios: 'beneficios',
    entrega: 'entrega',
    suporte: 'suporte',
    normas: 'normas',
  };
  return Object.entries(sections)
    .filter(([, v]) => v === true)
    .map(([k]) => map[k] || k);
}

export async function buildProposalRenderContext({ proposal, templateId }) {
  const company = await fetchCompany();

  let resolvedLogoUrl = company.logoUrl || null;
  if (resolvedLogoUrl && !resolvedLogoUrl.startsWith('data:')) {
    const b64 = await urlToBase64(resolvedLogoUrl);
    resolvedLogoUrl = b64 || null;
  }

  const companySettings = {
    ...company,
    logoUrl: resolvedLogoUrl,
    logoType: resolvedLogoUrl ? (company.logoType || 'uploaded') : (company.logoType || null),
    primaryColor: company.primaryColor || '#1A5276',
    secondaryColor: company.secondaryColor || '#E87722',
    proposalTheme: company.proposalTheme || 'industrial_bold',
  };

  let activeBlocks = ['escopo', 'condicoes', 'garantia', 'observacoes'];
  let templateDefaults = {};
  let templateWording = {};
  let templateCustomFields = [];

  const tid = templateId || proposal?.templateId;
  if (tid) {
    try {
      const { templates } = await fetchTemplates();
      const tpl = templates.find(t => t.id === tid);
      if (tpl) {
        if (tpl.sections) activeBlocks = sectionsToActiveBlocks(tpl.sections);
        if (tpl.defaults) templateDefaults = tpl.defaults;
        if (tpl.wording) templateWording = tpl.wording;
        if (tpl.customFields) templateCustomFields = tpl.customFields;
      }
    } catch { /* fallback */ }
  }

  const rawCond = Array.isArray(proposal?.conditions)
    ? (proposal.conditions[0] || {})
    : (proposal?.conditions || {});

  const cond = {
    entrada:        rawCond.downPayment      ?? templateDefaults.downPaymentPct  ?? company.defaultDownPaymentPct  ?? 20,
    prazoEntrada:   rawCond.downPaymentDays  ?? templateDefaults.downPaymentDays ?? company.defaultDownPaymentDays ?? 45,
    medicao:        rawCond.measurementDays  ?? templateDefaults.measurementDays ?? company.defaultMeasurementDays ?? 10,
    prazoNF:        rawCond.paymentNfDays    ?? company.defaultPaymentNfDays     ?? 60,
    validade:       rawCond.validityDays     ?? templateDefaults.validityDays    ?? company.defaultValidityDays    ?? 60,
    prazoExec:      rawCond.executionPeriod  ?? '',
    formaPagamento: rawCond.paymentTerms     ?? company.defaultPaymentMethod     ?? '',
    obs:            rawCond.observations     ?? '',
    tipoProposta:   proposal?.segmentData?.tipoProposta || proposal?.metadata?.tipoProposta || 'valor_fechado',
    // Toggles de visibilidade
    showPagamento:  rawCond.showPagamento  !== false,
    showWarranties: rawCond.showWarranties ?? companySettings.showWarranties ?? true,
    showImpostos:   rawCond.showTaxes      ?? companySettings.showTaxes      ?? false,
    showMultas:     rawCond.showMultas     ?? false,
    // Garantia
    warrantyPeriod: rawCond.warrantyPeriod ?? templateDefaults.warrantyPeriod ?? '5',
    warrantyType:   rawCond.warrantyType   ?? 'anos',
    // Impostos
    impostoDAS:   rawCond.impostoDAS   ?? '11,2',
    impostoISS:   rawCond.impostoISS   ?? '2,79',
    impostoIPI:   rawCond.impostoIPI   ?? '15',
    impostoDIFAL: rawCond.impostoDIFAL ?? '6',
    // Multas
    multaDiaria: rawCond.multaDiaria ?? '0,3',
    multaLimite: rawCond.multaLimite ?? '10',
    // Template
    customFields: templateCustomFields,
    wording: templateWording,
  };

  const items = proposal?.items || [];
  const total = items.reduce(
    (sum, item) => sum + (parseFloat(item.quantity || item.qty) || 0) * (parseFloat(item.unitPrice || item.price) || 0),
    0
  );
  const todayDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const cliente = {
    nome:    proposal?.clientName     || '',
    contato: proposal?.clientContact  || '',
    cargo:   proposal?.clientRole     || '',
    local:   proposal?.clientLocation || '',
    tel:     proposal?.clientPhone    || '',
    objeto:  proposal?.clientObject   || proposal?.object || '',
  };

  return {
    companySettings,
    cond,
    activeBlocks,
    templateId: tid || null,
    propNum: proposal?.number || '',
    cliente,
    items: items.map(item => ({
      id:       item.id       || item.catalogId || null,
      label:    item.label    || '',
      unit:     item.unit     || 'UNID.',
      qty:      item.quantity ?? item.qty   ?? 0,
      price:    item.unitPrice ?? item.price ?? 0,
      category: item.category || 'SERVICO',
    })),
    total,
    todayDate,
    modelo: companySettings.proposalTheme || 'industrial_bold'
  };
}
