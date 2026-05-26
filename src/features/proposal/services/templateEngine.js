// templateEngine.js
/**
 * Motor de Template NaroGestor v2.0
 * Suporta placeholders dinâmicos, lógica condicional e injeção de estilo.
 */

const CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const formatCurrency = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 'R$ 0,00' : CURRENCY_FORMATTER.format(num);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR', { 
    day: '2-digit', month: 'long', year: 'numeric' 
  });
};

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Renderiza o template HTML com os dados da proposta.
 */
export async function renderTemplate(templateName, data) {
  try {
    const response = await fetch(`/modelos/${templateName}.html`);
    if (!response.ok) {
      console.error(`Template "${templateName}" não encontrado.`);
      return null;
    }
    let html = await response.text();

    const company = data.companySettings || {};
    const cliente = data.cliente || {};
    const cond = data.cond || {};
    const items = data.items || [];

    // 1. Injeção de Variáveis de Estilo (Cores da Marca)
    const primary = company.primaryColor || '#1A5276';
    const secondary = company.secondaryColor || '#E87722';
    const styleInjection = `
      <style>
        :root {
          --primary-color: ${primary};
          --secondary-color: ${secondary};
        }
      </style>
    `;
    html = html.replace('</head>', `${styleInjection}</head>`);

    // 2. Mapeamento de Placeholders
    const replacements = {
      '{{COMPANY_NAME}}': escapeHtml(company.name || company.companyName || 'Sua Empresa'),
      '{{COMPANY_SLOGAN}}': escapeHtml(company.slogan || ''),
      '{{COMPANY_CNPJ}}': escapeHtml(company.cnpj || ''),
      '{{COMPANY_ADDRESS}}': escapeHtml(company.address || ''),
      '{{COMPANY_CITY}}': escapeHtml(company.city || ''),
      '{{COMPANY_STATE}}': escapeHtml(company.state || ''),
      '{{COMPANY_PHONE}}': escapeHtml(company.phone || ''),
      '{{COMPANY_EMAIL}}': escapeHtml(company.email || ''),
      '{{COMPANY_WEBSITE}}': escapeHtml(company.website || ''),
      '{{LOGO_URL}}': company.logoUrl || '',
      '{{PIX_KEY}}': escapeHtml(company.pixKey || ''),
      
      '{{CLIENT_NOME}}': escapeHtml(cliente.nome || ''),
      '{{CLIENT_CONTATO}}': escapeHtml(cliente.contato || ''),
      '{{CLIENT_CARGO}}': escapeHtml(cliente.cargo || ''),
      '{{CLIENT_LOCAL}}': escapeHtml(cliente.local || ''),
      '{{CLIENT_TEL}}': escapeHtml(cliente.tel || ''),
      '{{CLIENT_OBJETO}}': escapeHtml(cliente.objeto || ''),

      '{{PROPOSAL_NUM}}': escapeHtml(data.propNum || ''),
      '{{PROPOSAL_DATE}}': data.todayDate || formatDate(new Date()),
      '{{TOTAL_AMOUNT}}': formatCurrency(data.total || 0),
      
      '{{COND_VALIDADE}}': escapeHtml(cond.validade || '30'),
      '{{COND_PRAZO_EXEC}}': escapeHtml(cond.prazoExec || 'A combinar'),
      '{{COND_FORMA_PAGAMENTO}}': escapeHtml(cond.formaPagamento || 'A combinar'),
      '{{COND_ENTRADA}}': escapeHtml(cond.entrada || '0'),
      '{{COND_PRAZO_ENTRADA}}': escapeHtml(cond.prazoEntrada || '0'),
      '{{COND_MEDICAO}}': escapeHtml(cond.medicao || '0'),
      '{{COND_PRAZO_NF}}': escapeHtml(cond.prazoNF || '0'),
      '{{COND_WARRANTY_PERIOD}}': escapeHtml(cond.warrantyPeriod || '12'),
      '{{COND_WARRANTY_TYPE}}': escapeHtml(cond.warrantyType || 'meses'),
      '{{COND_OBS}}': escapeHtml(cond.obs || ''),
      '{{FOOTER_NOTE}}': escapeHtml(company.footerText || ''),
    };

    // 3. Processamento de Lógica Condicional (IF/ENDIF)
    const conditions = {
      'IF_PIX': !!company.pixKey,
      'IF_PAGAMENTO': cond.showPagamento !== false,
      'IF_GARANTIA': cond.showWarranties !== false,
      'IF_OBS': !!cond.obs,
    };

    for (const [tag, isVisible] of Object.entries(conditions)) {
      const startTag = `<!-- ${tag} -->`;
      const endTag = `<!-- END${tag} -->`;
      let startIdx = html.indexOf(startTag);
      
      while (startIdx !== -1) {
        const endIdx = html.indexOf(endTag, startIdx);
        if (endIdx === -1) break;

        if (isVisible) {
          // Remove apenas os comentários
          html = html.substring(0, startIdx) + 
                 html.substring(startIdx + startTag.length, endIdx) + 
                 html.substring(endIdx + endTag.length);
        } else {
          // Remove todo o bloco
          html = html.substring(0, startIdx) + html.substring(endIdx + endTag.length);
        }
        startIdx = html.indexOf(startTag);
      }
    }

    // 4. Substituição de Placeholders
    for (const [placeholder, value] of Object.entries(replacements)) {
      html = html.split(placeholder).join(value);
    }

    // 5. Renderização da Tabela de Itens
    const itemMarkerStart = '<!-- ITEMS_START -->';
    const itemMarkerEnd = '<!-- ITEMS_END -->';
    const startTableIdx = html.indexOf(itemMarkerStart);
    const endTableIdx = html.indexOf(itemMarkerEnd);

    if (startTableIdx !== -1 && endTableIdx !== -1) {
      const beforeTable = html.substring(0, startTableIdx);
      const afterTable = html.substring(endTableIdx + itemMarkerEnd.length);
      
      const rows = items.map((item, i) => {
        const qty = parseFloat(item.qty || item.quantity) || 0;
        const price = parseFloat(item.price || item.unitPrice) || 0;
        const total = qty * price;
        return `
          <tr>
            <td style="text-align: center;">${String(i + 1).padStart(2, '0')}</td>
            <td>${escapeHtml(item.label)}</td>
            <td style="text-align: center;">${escapeHtml(item.unit || 'un')}</td>
            <td style="text-align: center;">${qty}</td>
            <td style="text-align: right;">${formatCurrency(price)}</td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(total)}</td>
          </tr>
        `;
      }).join('');

      html = beforeTable + (rows || '<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhum item listado.</td></tr>') + afterTable;
    }

    // Limpeza de placeholders não resolvidos
    html = html.replace(/\{\{[A-Z_]+\}\}/g, '');

    return html;
  } catch (error) {
    console.error('Erro crítico no templateEngine:', error);
    return null;
  }
}
