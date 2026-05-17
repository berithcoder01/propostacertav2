import { API_URL } from '../../../../shared/services/api'

const getAuthHeaders = (hasBody = false) => {
  const token = localStorage.getItem('@propostacerta:token')
  return {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

const handleResponse = async (response) => {
  const text = await response.text()
  const data = text ? JSON.parse(text) : { success: false, error: 'Resposta vazia do servidor' }
  
  if (!response.ok) {
    throw new Error((data && data.error) || `Erro ${response.status}`)
  }
  return data
}

export const getMarketingProfile = async () => {
  const response = await fetch(`${API_URL}/marketing/profile`, { headers: getAuthHeaders() })
  return handleResponse(response)
}

export const createOrUpdateMarketingProfile = async (data) => {
  const response = await fetch(`${API_URL}/marketing/profile`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export const getActiveChallenge = async () => {
  const response = await fetch(`${API_URL}/marketing/challenge/active`, { headers: getAuthHeaders() })
  return handleResponse(response)
}

export const startNewChallenge = async () => {
  const response = await fetch(`${API_URL}/marketing/challenge/start`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({})
  })
  return handleResponse(response)
}

export const completeChallenge = async (challengeId) => {
  const response = await fetch(`${API_URL}/marketing/challenge/${challengeId}/complete`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({})
  })
  return handleResponse(response)
}

export const getTaskDetail = async (challengeId, day) => {
  const response = await fetch(`${API_URL}/marketing/challenge/${challengeId}/task/${day}`, { headers: getAuthHeaders() })
  return handleResponse(response)
}

export const markTaskAsDone = async (taskId) => {
  const response = await fetch(`${API_URL}/marketing/task/${taskId}/done`, {
    method: 'PATCH',
    headers: getAuthHeaders(true),
    body: JSON.stringify({})
  })
  return handleResponse(response)
}

export const markTaskAsSkipped = async (taskId) => {
  const response = await fetch(`${API_URL}/marketing/task/${taskId}/skip`, {
    method: 'PATCH',
    headers: getAuthHeaders(true),
    body: JSON.stringify({})
  })
  return handleResponse(response)
}

export const getChallengeHistory = async () => {
  const response = await fetch(`${API_URL}/marketing/challenge/history`, { headers: getAuthHeaders() })
  return handleResponse(response)
}
