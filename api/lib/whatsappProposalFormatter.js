/**
 * whatsappProposalFormatter.js
 * Motor de formatação de proposta comercial para mensagem WhatsApp.
 *
 * WhatsApp suporta: *negrito*  _itálico_  ~tachado~  ```mono```  \n
 * Estratégia: emojis como ícones de seção, bloco monospace para tabela,
 * bullets • e formatação bold para valores em destaque.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0)

const fmtQty = (val) => {
  const n = parseFloat(val) || 0
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',')
}

function padEnd(str, len) { return String(str).slice(0, len).padEnd(len, ' ') }
function padStart(str, len) { return String(str).slice(0, len).padStart(len, ' ') }

const SEP_HEAVY = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
const SEP_LIGHT = '─────────────────────────────────'

// ─── Cabeçalho ────────────────────────────────────────────────────────────────

function buildHeader(proposal, company) {
  const companyName = (company?.name || '').toUpperCase()
  const clientContact = proposal.clientContact || proposal.clientName || 'Cliente'
  const propNum = proposal.number || '—'
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })

  const lines = []
  lines.push(`*${companyName}*`)
  if (company?.slogan) lines.push(`_${company.slogan}_`)
  lines.push('')
  lines.push(`Olá, *${clientContact}*! 👋`)
  lines.push('')
  lines.push('Segue sua *Proposta Comercial* conforme solicitado.')
  lines.push('')
  lines.push(`📋 *Proposta nº* ${propNum}`)
  lines.push(`📅 *Data* ${today}`)
  if (proposal.clientLocation) lines.push(`📍 *Local* ${proposal.clientLocation}`)
  if (proposal.object) lines.push(`🎯 *Objeto* ${proposal.object}`)

  return lines.join('\n')
}

// ─── Tabela de Itens (bloco monospace) ────────────────────────────────────────

function buildItemsTable(items, tipoProposta) {
  if (!items || items.length === 0) return ''
  const isContinuous = tipoProposta === 'servico_continuo'
  const lines = []

  lines.push('')
  lines.push(SEP_HEAVY)
  lines.push('🔧 *SERVIÇOS / MATERIAIS*')
  lines.push(SEP_HEAVY)
  lines.push('')

  const tableLines = []

  if (isContinuous) {
    tableLines.push(padEnd('ITEM', 22) + padStart('VL. UNIT.', 14))
    tableLines.push('─'.repeat(36))
    items.forEach((it, idx) => {
      const num = String(idx + 1).padStart(2, '0')
      const label = `${num}. ${it.label}`
      const price = parseFloat(it.unitPrice) || 0
      tableLines.push(padEnd(label, 22) + padStart(fmt(price), 14))
      if (it.unit) tableLines.push(`    [${it.unit}]`)
    })
    tableLines.push('─'.repeat(36))
    tableLines.push(padEnd('FATURAMENTO:', 22) + padStart('A MEDIR', 14))
  } else {
    tableLines.push(padEnd('ITEM', 18) + padStart('QTD', 6) + padStart('VALOR', 12))
    tableLines.push('─'.repeat(36))
    let total = 0
    items.forEach((it, idx) => {
      const qty = parseFloat(it.quantity) || 1
      const price = parseFloat(it.unitPrice) || 0
      const sub = qty * price
      total += sub
      const num = String(idx + 1).padStart(2, '0')
      const label = `${num}. ${it.label}`
      tableLines.push(padEnd(label, 18) + padStart(fmtQty(qty), 6) + padStart(fmt(sub), 12))
    })
    tableLines.push('─'.repeat(36))
    tableLines.push(padEnd('TOTAL:', 24) + padStart(fmt(total), 12))
  }

  lines.push('```')
  lines.push(...tableLines)
  lines.push('```')

  // Total em negrito fora do bloco (duplicado intencionalmente para visibilidade)
  if (!isContinuous) {
    const total = items.reduce(
      (s, it) => s + (parseFloat(it.quantity) || 1) * (parseFloat(it.unitPrice) || 0),
      0
    )
    lines.push('')
    lines.push(`💰 *TOTAL GERAL: ${fmt(total)}*`)
  }

  return lines.join('\n')
}

// ─── Forma de Pagamento ───────────────────────────────────────────────────────

function buildPayment(conditions, tipoProposta) {
  if (!conditions) return ''
  const c = conditions
  const isContinuous = tipoProposta === 'servico_continuo'

  const lines = []
  lines.push('')
  lines.push(SEP_LIGHT)
  lines.push('💳 *FORMA DE PAGAMENTO*')
  lines.push('')

  if (isContinuous) {
    lines.push('• Faturamento baseado em *medição periódica*')
    if (c.measurementDays) lines.push(`• Medição a cada *${c.measurementDays} dias*`)
    if (c.paymentNfDays) lines.push(`• Pagamento em até *${c.paymentNfDays} dias* após NF`)
  } else {
    if (c.downPayment && c.downPaymentDays) {
      lines.push(`• *${c.downPayment}% de entrada* — mobilização`)
      lines.push(`  ↳ em até *${c.downPaymentDays} dias*`)
    } else if (c.downPayment) {
      lines.push(`• *${c.downPayment}% de entrada* (mobilização)`)
    }
    if (c.measurementDays) {
      lines.push(`• Saldo via *medição a cada ${c.measurementDays} dias*`)
    }
    if (c.paymentNfDays) {
      lines.push(`• Pagamento em até *${c.paymentNfDays} dias* após NF`)
    }
  }

  if (c.paymentTerms) lines.push(`• Modalidade: *${c.paymentTerms}*`)
  lines.push('• Preços *fixos e irreajustáveis*')

  return lines.join('\n')
}

// ─── Garantias ────────────────────────────────────────────────────────────────

function buildWarranty(conditions, company) {
  if (company?.showWarranties === false) return ''

  const period = conditions?.warrantyPeriod || 5
  const type = (conditions?.warrantyType || 'ANOS').toLowerCase()

  const lines = []
  lines.push('')
  lines.push(SEP_LIGHT)
  lines.push(`🛡️ *GARANTIAS*`)
  lines.push('')
  lines.push(`• *${period} ${type}* contra defeitos de fabricação e instalação`)
  lines.push('• Assistência técnica durante toda a execução')

  return lines.join('\n')
}

// ─── Validade e Prazo ─────────────────────────────────────────────────────────

function buildValidity(conditions) {
  if (!conditions?.validityDays && !conditions?.executionPeriod) return ''

  const lines = []
  lines.push('')
  lines.push(SEP_LIGHT)

  if (conditions.validityDays) {
    lines.push(`⏳ *VALIDADE DA PROPOSTA*`)
    lines.push(`*${conditions.validityDays} dias* a partir desta data`)
  }

  if (conditions.executionPeriod) {
    if (conditions.validityDays) lines.push('')
    lines.push(`🏗️ *PRAZO DE EXECUÇÃO*`)
    lines.push(conditions.executionPeriod)
  }

  return lines.join('\n')
}

// ─── PIX ─────────────────────────────────────────────────────────────────────

function buildPix(company) {
  if (!company?.pixKey) return ''

  const lines = []
  lines.push('')
  lines.push(SEP_LIGHT)
  lines.push('💠 *PAGAMENTO VIA PIX*')
  lines.push(`Chave: \`${company.pixKey}\``)

  return lines.join('\n')
}

// ─── Observações ─────────────────────────────────────────────────────────────

function buildObservations(conditions) {
  const obs = conditions?.observations
  if (!obs) return ''

  const lines = []
  lines.push('')
  lines.push(SEP_LIGHT)
  lines.push('📝 *OBSERVAÇÕES*')
  lines.push('')
  // Limita para não poluir a conversa
  lines.push(obs.length > 500 ? obs.slice(0, 500) + '…' : obs)

  return lines.join('\n')
}

// ─── Rodapé ───────────────────────────────────────────────────────────────────

function buildFooter(company) {
  const lines = []
  lines.push('')
  lines.push(SEP_HEAVY)
  lines.push('')

  const contacts = []
  if (company?.phone) contacts.push(`📞 ${company.phone}`)
  if (company?.email) contacts.push(`✉️ ${company.email}`)
  if (company?.website) contacts.push(`🌐 ${company.website}`)
  if (contacts.length > 0) lines.push(contacts.join('   '))

  if (company?.cnpj) lines.push(`CNPJ ${company.cnpj}`)

  lines.push('')
  lines.push('_Agradecemos a oportunidade!_ 🤝')
  lines.push('_Para aprovação ou dúvidas, é só responder esta mensagem._')

  return lines.join('\n')
}

// ─── Motor Principal ─────────────────────────────────────────────────────────

/**
 * Gera a mensagem WhatsApp completa e formatada da proposta.
 *
 * @param {Object} proposal - Proposta com items[], conditions (obj), metadata, number, etc.
 * @param {Object} company  - Dados da empresa (name, phone, email, pixKey, showWarranties…)
 * @returns {string} Texto pronto para encodeURIComponent e envio via wa.me
 */
export function formatProposalForWhatsApp(proposal, company) {
  const conditions = Array.isArray(proposal.conditions)
    ? proposal.conditions[0]
    : proposal.conditions

  const items = proposal.items || []
  const tipoProposta = proposal.metadata?.tipoProposta || 'valor_fechado'

  const parts = [
    buildHeader(proposal, company),
    buildItemsTable(items, tipoProposta),
    buildPayment(conditions, tipoProposta),
    buildWarranty(conditions, company),
    buildPix(company),
    buildValidity(conditions),
    buildObservations(conditions),
    buildFooter(company),
  ]

  return parts.filter(Boolean).join('\n')
}
