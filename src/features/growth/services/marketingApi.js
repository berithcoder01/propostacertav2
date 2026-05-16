import { API_URL } from '../../../shared/services/api'

const getAuthHeaders = (hasBody = false) => {
  const token = localStorage.getItem('@propostacerta:token');
  return {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getMarketingProfile = async () => {
  const response = await fetch(`${API_URL}/marketing/profile`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error('Falha ao buscar perfil')
  return response.json()
}

export const createOrUpdateMarketingProfile = async (data) => {
  const response = await fetch(`${API_URL}/marketing/profile`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Falha ao atualizar perfil')
  return response.json()
}

export const getActiveChallenge = async () => {
  const response = await fetch(`${API_URL}/marketing/challenge/active`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error('Falha ao buscar desafio')
  return response.json()
}

export const startNewChallenge = async () => {
  const response = await fetch(`${API_URL}/marketing/challenge/start`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({})
  })
  if (!response.ok) throw new Error('Falha ao iniciar desafio')
  return response.json()
}

export const completeChallenge = async (challengeId) => {
  const response = await fetch(`${API_URL}/marketing/challenge/${challengeId}/complete`, {
    method: 'POST', headers: getAuthHeaders(true), body: JSON.stringify({})
  })
  if (!response.ok) throw new Error('Falha ao concluir desafio')
  return response.json()
}

export const getTaskDetail = async (challengeId, day) => {
  const response = await fetch(`${API_URL}/marketing/challenge/${challengeId}/task/${day}`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error('Falha ao buscar tarefa')
  return response.json()
}

export const markTaskAsDone = async (taskId) => {
  const response = await fetch(`${API_URL}/marketing/task/${taskId}/done`, {
    method: 'PATCH', headers: getAuthHeaders(true), body: JSON.stringify({})
  })
  if (!response.ok) throw new Error('Falha ao marcar como feito')
  return response.json()
}

export const markTaskAsSkipped = async (taskId) => {
  const response = await fetch(`${API_URL}/marketing/task/${taskId}/skip`, {
    method: 'PATCH', headers: getAuthHeaders(true), body: JSON.stringify({})
  })
  if (!response.ok) throw new Error('Falha ao pular tarefa')
  return response.json()
}

export const getChallengeHistory = async () => {
  const response = await fetch(`${API_URL}/marketing/challenge/history`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error('Falha ao buscar historico')
  return response.json()
}
