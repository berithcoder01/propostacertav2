// Serviço de API para Leads (Prospecção)
import { API_URL } from '../../../shared/services/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('@narogestor:token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Listar leads com filtros
export const fetchLeads = async ({ status, segment, source, page = 1, limit = 50 }) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.append('status', status);
  if (segment) params.append('segment', segment);
  if (source) params.append('source', source);

  const response = await fetch(`${API_URL}/leads?${params}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar leads');
  return response.json();
};

// Buscar lead por ID
export const fetchLeadById = async (id) => {
  const response = await fetch(`${API_URL}/leads/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar lead');
  return response.json();
};

// Criar lead
export const createLead = async (leadData) => {
  const response = await fetch(`${API_URL}/leads`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(leadData)
  });
  if (!response.ok) { const err = await response.json().catch(() => ({ error: 'Falha ao criar lead' })); throw new Error(err.error || 'Falha ao criar lead'); }
  return response.json();
};

// Atualizar lead
export const updateLead = async (id, leadData) => {
  const response = await fetch(`${API_URL}/leads/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(leadData)
  });
  if (!response.ok) throw new Error('Falha ao atualizar lead');
  return response.json();
};

// Atualizar status do lead
export const updateLeadStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/leads/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Falha ao atualizar status');
  return response.json();
};

// Deletar lead
export const deleteLead = async (id) => {
  const response = await fetch(`${API_URL}/leads/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao deletar lead');
  return true;
};

// Criar múltiplos leads
export const createLeadsBulk = async (leads) => {
  const response = await fetch(`${API_URL}/leads/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ leads })
  });
  if (!response.ok) throw new Error('Falha ao criar leads em lote');
  return response.json();
};

// Disparar WhatsApp
export const dispatchWhatsApp = async (leadId, message) => {
  const response = await fetch(`${API_URL}/leads/dispatches/whatsapp`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ leadId, message })
  });
  if (!response.ok) throw new Error('Falha ao gerar link WhatsApp');
  return response.json();
};

// Disparar E-mail
export const dispatchEmail = async (leadId, subject, body) => {
  const response = await fetch(`${API_URL}/leads/dispatches/email`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ leadId, subject, body })
  });
  if (!response.ok) throw new Error('Falha ao gerar link E-mail');
  return response.json();
};

// Disparo em massa
export const dispatchBulk = async (leadIds, channel, message, subject, body) => {
  const response = await fetch(`${API_URL}/leads/dispatches/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ leadIds, channel, message, subject, body })
  });
  if (!response.ok) throw new Error('Falha no disparo em massa');
  return response.json();
};

// IA — Segmentar lead
export const aiSegmentLead = async (name, description, city, state) => {
  const response = await fetch(`${API_URL}/leads/ai/segment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description, city, state })
  });
  if (!response.ok) throw new Error('Falha na segmentação');
  return response.json();
};

// IA — Enriquecer dados do lead
export const aiEnrichLead = async (name, city, state, segment) => {
  const response = await fetch(`${API_URL}/leads/ai/enrich`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, city, state, segment })
  });
  if (!response.ok) throw new Error('Falha no enriquecimento');
  return response.json();
};

// IA — Gerar template de mensagem
export const aiMessageTemplate = async (leadName, leadSegment, companyName, leadCity, serviceType) => {
  const response = await fetch(`${API_URL}/leads/ai/message-template`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ leadName, leadSegment, companyName, leadCity, serviceType })
  });
  if (!response.ok) throw new Error('Falha na geração de template');
  return response.json();
};

// IA — Buscar locais/empresas para prospecção
export const aiSearchPlaces = async (query, lat, lng, radius) => {
  const response = await fetch(`${API_URL}/leads/ai/search-places`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ query, lat, lng, radius })
  });
  if (!response.ok) throw new Error('Falha na busca de locais');
  return response.json();
};

// Scraping de websites para prospecção
export const scrapeWebsite = async (url, segment, limit = 10) => {
  const response = await fetch(`${API_URL}/leads/scrape`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ url, segment, limit })
  });
  if (!response.ok) throw new Error('Falha no scraping de website');
  return response.json();
};

// Criar proposta a partir de um lead
export const createProposalFromLead = async (leadId) => {
  const response = await fetch(`${API_URL}/leads/${leadId}/proposal`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Falha ao criar proposta a partir do lead');
  return response.json();
};

// Relatórios
export const fetchWeeklyReport = async () => {
  const response = await fetch(`${API_URL}/leads/relatory/weekly`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar relatório semanal');
  return response.json();
};

export const fetchLeadsSummary = async () => {
  const response = await fetch(`${API_URL}/leads/relatory/summary`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Falha ao buscar resumo');
  return response.json();
};