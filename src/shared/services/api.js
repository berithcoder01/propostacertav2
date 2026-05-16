const isNative = typeof window !== 'undefined' &&
  (!!window.Capacitor || window.location.protocol === 'file:' || window.location.protocol === 'capacitor:');

const getApiBase = () => {
  const base = import.meta.env.VITE_API_URL;
  if (!base) return isNative ? '' : '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const API_BASE = getApiBase();
const API_URL = isNative
  ? (API_BASE ? `${API_BASE}/api` : '/api')
  : '/api';

export { API_URL };

console.log('Ambiente:', isNative ? 'Nativo' : 'Web');
console.log('API_URL sendo usada:', API_URL);
if (isNative && !API_BASE) {
  console.error('AVISO: VITE_API_URL não definida em ambiente nativo!');
}

const getAuthHeaders = (hasBody = false) => {
  const token = localStorage.getItem('@propostacerta:token');
  return {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  let data;
  const rawText = await response.text();
  try { data = JSON.parse(rawText); } catch (e) {
    throw new Error(`Erro API: ${response.status}. Retorno: ${rawText.substring(0, 50)}...`);
  }
  if (!response.ok) throw new Error(data.error || 'Credenciais inválidas');
  return data;
};

export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Erro ao criar conta'); }
  return response.json();
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_URL}/auth/me`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Não autenticado');
  return response.json();
};

export const refreshToken = async () => {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({})
  });
  if (!response.ok) { const err = await response.json().catch(() => ({ error: 'Erro ao renovar token' }));
    throw new Error(err.message || err.detail || err.error || 'Erro ao renovar token');
  }
  return response.json();
};

// ─── Empresa ─────────────────────────────────────────────────────────────────
export const fetchCompany = async () => {
  const response = await fetch(`${API_URL}/company`, { headers: getAuthHeaders() });
  if (!response.ok) { const err = await response.json().catch(() => ({ error: 'Falha ao buscar empresa' }));
    throw new Error(err.error || 'Falha ao buscar empresa');
  }
  return response.json();
};

export const createCompany = async (companyData) => {
  const response = await fetch(`${API_URL}/company`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify(companyData)
  });
  if (!response.ok) { const err = await response.json().catch(() => ({ error: 'Falha ao criar empresa' }));
    throw new Error(err.detail ? `${err.error}: ${err.detail}` : (err.error || 'Falha ao criar empresa'));
  }
  return response.json();
};

export const updateCompany = async (companyData) => {
  const response = await fetch(`${API_URL}/company`, {
    method: 'PUT', headers: getAuthHeaders(true), body: JSON.stringify(companyData)
  });
  if (!response.ok) throw new Error('Falha ao atualizar empresa');
  return response.json();
};

// ─── Catálogo ────────────────────────────────────────────────────────────────
export const fetchCatalog = async () => {
  const response = await fetch(`${API_URL}/catalog`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar catálogo');
  return response.json();
};

export const createCatalogItem = async (itemData) => {
  const response = await fetch(`${API_URL}/catalog`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify(itemData)
  });
  if (!response.ok) throw new Error('Falha ao criar item');
  return response.json();
};

export const updateCatalogItem = async (id, itemData) => {
  const response = await fetch(`${API_URL}/catalog/${id}`, {
    method: 'PUT', headers: getAuthHeaders(true), body: JSON.stringify(itemData)
  });
  if (!response.ok) throw new Error('Falha ao atualizar item');
  return response.json();
};

export const deleteCatalogItem = async (id) => {
  const response = await fetch(`${API_URL}/catalog/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao deletar item');
  return true;
};

export const seedCatalog = async () => {
  const response = await fetch(`${API_URL}/catalog/seed`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({})
  });
  if (!response.ok) { const err = await response.json().catch(() => ({ error: 'Erro no seed do catálogo' }));
    throw new Error(err.error || 'Falha ao popular catálogo');
  }
  return response.json();
};

// ─── Propostas ───────────────────────────────────────────────────────────────
export const saveProposal = async ({ cliente, items, cond, propNum, templateId }) => {
  const response = await fetch(`${API_URL}/proposals`, {
    method: 'POST', headers: getAuthHeaders(true),
    body: JSON.stringify({
      number: propNum,
      clientName: cliente.nome, clientContact: cliente.contato,
      clientRole: cliente.cargo, clientLocation: cliente.local, clientPhone: cliente.tel,
      object: cliente.objeto,
      items: items.map(i => ({
        catalogId: i.catalogId || null, label: i.label, unit: i.unit,
        quantity: parseFloat(i.qty) || 0, unitPrice: parseFloat(i.price) || 0,
        category: i.category || 'SERVICO'
      })),
      conditions: {
        downPayment: parseFloat(cond.entrada) || 0,
        downPaymentDays: parseInt(cond.prazoEntrada) || 0,
        measurementDays: parseInt(cond.medicao) || 0,
        paymentNfDays: parseInt(cond.prazoNF) || 0,
        validityDays: parseInt(cond.validade) || 60,
        executionPeriod: cond.prazoExec, paymentTerms: cond.formaPagamento,
        observations: cond.obs, warrantyPeriod: cond.warrantyPeriod || 5,
        warrantyType: cond.warrantyType || 'ANOS', taxValue: cond.taxValue || null,
      },
      segmentData: { tipoProposta: cond.tipoProposta },
      templateId,
    })
  });
  if (!response.ok) throw new Error('Falha ao salvar proposta');
  return response.json();
};

export const fetchNextProposalNumber = async () => {
  const response = await fetch(`${API_URL}/proposals/next-number`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar próximo número');
  const data = await response.json();
  return data.number;
};

export const fetchProposals = async ({ page = 1, limit = 50 } = {}) => {
  const response = await fetch(`${API_URL}/proposals?page=${page}&limit=${limit}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar propostas');
  const data = await response.json();
  return data.proposals || [];
};

export const fetchProposalById = async (id) => {
  const response = await fetch(`${API_URL}/proposals/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar detalhes da proposta');
  return response.json();
};

export const updateProposal = async (id, { cliente, items, cond, propNum }) => {
  const response = await fetch(`${API_URL}/proposals/${id}`, {
    method: 'PUT', headers: getAuthHeaders(true),
    body: JSON.stringify({
      number: propNum,
      clientName: cliente.nome, clientContact: cliente.contato,
      clientRole: cliente.cargo, clientLocation: cliente.local, clientPhone: cliente.tel,
      object: cliente.objeto,
      items: items.map(i => ({
        catalogId: i.catalogId || null, label: i.label, unit: i.unit,
        quantity: parseFloat(i.qty) || 0, unitPrice: parseFloat(i.price) || 0,
        category: i.category || 'SERVICO',
      })),
      conditions: {
        downPayment: parseFloat(cond.entrada) || 0,
        downPaymentDays: parseInt(cond.prazoEntrada) || 0,
        measurementDays: parseInt(cond.medicao) || 0,
        paymentNfDays: parseInt(cond.prazoNF) || 0,
        validityDays: parseInt(cond.validade) || 60,
        executionPeriod: cond.prazoExec, paymentTerms: cond.formaPagamento,
        observations: cond.obs, warrantyPeriod: cond.warrantyPeriod || 5,
        warrantyType: cond.warrantyType || 'ANOS', taxValue: cond.taxValue || null,
      },
      segmentData: { tipoProposta: cond.tipoProposta },
    })
  });
  if (!response.ok) throw new Error('Falha ao atualizar proposta');
  return response.json();
};

export const updateProposalStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/proposals/${id}/status`, {
    method: 'PATCH', headers: getAuthHeaders(true), body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Falha ao atualizar status');
  return response.json();
};

export const shareProposal = async (id) => {
  const response = await fetch(`${API_URL}/proposals/${id}/share`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({})
  });
  if (!response.ok) throw new Error('Falha ao gerar link de compartilhamento');
  return response.json();
};

export const duplicateProposal = async (id) => {
  const response = await fetch(`${API_URL}/proposals/${id}/duplicate`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({})
  });
  if (!response.ok) throw new Error('Falha ao duplicar proposta');
  return response.json();
};

export const deleteProposal = async (id) => {
  const response = await fetch(`${API_URL}/proposals/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao deletar proposta');
  return true;
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const fetchStats = async () => {
  const response = await fetch(`${API_URL}/dashboard/stats`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar estatísticas');
  return response.json();
};

export const fetchRecentProposals = async () => {
  const response = await fetch(`${API_URL}/dashboard/recent`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar propostas recentes');
  return response.json();
};

export const fetchSummary = async () => {
  const response = await fetch(`${API_URL}/dashboard/summary`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar resumo financeiro');
  return response.json();
};

// ─── IA ──────────────────────────────────────────────────────────────────────
export const aiPriceResearch = async (query) => {
  const response = await fetch(`${API_URL}/ai/price-research`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({ query })
  });
  if (!response.ok) { const error = await response.json();
    throw new Error(error.error || 'Falha ao realizar pesquisa de preço com IA');
  }
  return response.json();
};

export const aiFindSuppliers = async (item, location) => {
  const response = await fetch(`${API_URL}/ai/find-suppliers`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({ item, location })
  });
  if (!response.ok) { const error = await response.json();
    throw new Error(error.error || 'Falha ao buscar fornecedores com IA');
  }
  return response.json();
};

export const aiChat = async (messages, proposalId = null) => {
  const response = await fetch(`${API_URL}/ai/chat`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({ messages, proposalId })
  });
  if (!response.ok) { const error = await response.json();
    throw new Error(error.error || 'Falha ao processar chat com IA');
  }
  return response.json();
};

export const aiSearch = async (query) => {
  const response = await fetch(`${API_URL}/catalog/search`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({ query })
  });
  if (!response.ok) { const error = await response.json();
    throw new Error(error.error || 'Falha na busca inteligente');
  }
  return response.json();
};

export const aiAnalyzeProfitability = async (proposalId) => {
  const response = await fetch(`${API_URL}/proposals/${proposalId}/profitability`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) { const error = await response.json();
    throw new Error(error.error || 'Falha ao analisar lucratividade');
  }
  return response.json();
};

export const aiSuggestItems = async (currentItems) => {
  const response = await fetch(`${API_URL}/ai/suggest-items`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({ currentItems })
  });
  if (!response.ok) { const error = await response.json();
    throw new Error(error.error || 'Falha ao sugerir itens');
  }
  return response.json();
};

export const aiGenerateProposal = async (description, clientData) => {
  const response = await fetch(`${API_URL}/ai/generate-proposal`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({ description, ...clientData })
  });
  if (!response.ok) { const error = await response.json();
    throw new Error(error.error || 'Falha ao gerar proposta com IA');
  }
  return response.json();
};

export const aiFollowUp = async (proposalId) => {
  const response = await fetch(`${API_URL}/ai/follow-up`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({ proposalId })
  });
  if (!response.ok) { const error = await response.json();
    throw new Error(error.error || 'Falha ao gerar follow-up');
  }
  return response.json();
};

// ─── Outros ──────────────────────────────────────────────────────────────────
export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  const response = await fetch(`${API_URL}/company/logo`, {
    method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('@propostacerta:token')}` },
    body: formData
  });
  if (!response.ok) throw new Error('Falha no upload da logo');
  return response.json();
};

export const fetchPlans = async () => {
  const response = await fetch(`${API_URL}/billing/plans`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar planos');
  return response.json();
};

export const fetchSubscription = async () => {
  const response = await fetch(`${API_URL}/billing/subscription`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar assinatura');
  return response.json();
};

export const createCheckoutSession = async (priceId) => {
   const response = await fetch(`${API_URL}/billing/create-checkout`, {
     method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({ priceId })
   });
   if (!response.ok) throw new Error('Falha ao criar sessão de pagamento');
   return response.json();
 };

// ─── Clientes ─────────────────────────────────────────────────────────────────
export const fetchClients = async () => {
   const response = await fetch(`${API_URL}/clients`, { headers: getAuthHeaders() });
   if (!response.ok) throw new Error('Falha ao buscar clientes');
   return response.json();
 };

export const createClient = async (clientData) => {
   const response = await fetch(`${API_URL}/clients`, {
     method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify(clientData)
   });
   if (!response.ok) throw new Error('Falha ao criar cliente');
   return response.json();
 };

export const updateClient = async (id, clientData) => {
   const response = await fetch(`${API_URL}/clients/${id}`, {
     method: 'PUT', headers: getAuthHeaders(true), body: JSON.stringify(clientData)
   });
   if (!response.ok) throw new Error('Falha ao atualizar cliente');
   return response.json();
 };

export const deleteClient = async (id) => {
   const response = await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
   if (!response.ok) throw new Error('Falha ao deletar cliente');
   return true;
 };

export const fetchClientActivities = async (clientId) => {
   const response = await fetch(`${API_URL}/clients/${clientId}/activities`, { headers: getAuthHeaders() });
   if (!response.ok) throw new Error('Falha ao buscar atividades');
   return response.json();
 };

export const createClientActivity = async (clientId, activityData) => {
   const response = await fetch(`${API_URL}/clients/${clientId}/activities`, {
     method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify(activityData)
   });
   if (!response.ok) throw new Error('Falha ao criar atividade');
   return response.json();
 };

// ─── Lembretes ─────────────────────────────────────────────────────────────────
export const fetchReminders = async () => {
   const response = await fetch(`${API_URL}/reminders`, { headers: getAuthHeaders() });
   if (!response.ok) throw new Error('Falha ao buscar lembretes');
   return response.json();
 };

export const createReminder = async (reminderData) => {
   const response = await fetch(`${API_URL}/reminders`, {
     method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify(reminderData)
   });
   if (!response.ok) throw new Error('Falha ao criar lembrete');
   return response.json();
 };

export const deleteReminder = async (id) => {
   const response = await fetch(`${API_URL}/reminders/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
   if (!response.ok) throw new Error('Falha ao deletar lembrete');
   return true;
 };

export const updateReminder = async (id, reminderData) => {
   const response = await fetch(`${API_URL}/reminders/${id}`, {
     method: 'PUT', headers: getAuthHeaders(true), body: JSON.stringify(reminderData)
   });
   if (!response.ok) throw new Error('Falha ao atualizar lembrete');
   return response.json();
 };

// ─── Modelos de Proposta (Fase 11) ─────────────────────────────────────────
export const fetchTemplates = async () => {
   const response = await fetch(`${API_URL}/proposals/templates`, { headers: getAuthHeaders() });
   if (!response.ok) throw new Error('Falha ao buscar modelos');
   const data = await response.json();
   return data.templates || [];
 };

export const createTemplate = async (templateData) => {
   const response = await fetch(`${API_URL}/proposals/templates`, {
     method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify(templateData)
   });
   if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Falha ao criar modelo'); }
   return response.json();
 };

export const updateTemplate = async (id, templateData) => {
   const response = await fetch(`${API_URL}/proposals/templates/${id}`, {
     method: 'PUT', headers: getAuthHeaders(true), body: JSON.stringify(templateData)
   });
   if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Falha ao atualizar modelo'); }
   return response.json();
 };

export const deleteTemplate = async (id) => {
   const response = await fetch(`${API_URL}/proposals/templates/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
   if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Falha ao deletar modelo'); }
   return true;
 };

export const setDefaultTemplate = async (id) => {
   const response = await fetch(`${API_URL}/proposals/templates/${id}/set-default`, {
     method: 'PATCH', headers: getAuthHeaders()
   });
   if (!response.ok) throw new Error('Falha ao definir modelo padrão');
   return response.json();
 };