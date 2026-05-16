import api from '../../../shared/services/api'

export const getMarketingProfile = () => api.get('/marketing/profile')
export const createOrUpdateMarketingProfile = (data) => api.post('/marketing/profile', data)
export const getActiveChallenge = () => api.get('/marketing/challenge/active')
export const startNewChallenge = () => api.post('/marketing/challenge/start')
export const completeChallenge = (challengeId) => api.post(`/marketing/challenge/${challengeId}/complete`)
export const getTaskDetail = (challengeId, day) => api.get(`/marketing/challenge/${challengeId}/task/${day}`)
export const markTaskAsDone = (taskId) => api.patch(`/marketing/task/${taskId}/done`)
export const markTaskAsSkipped = (taskId) => api.patch(`/marketing/task/${taskId}/skip`)
export const getChallengeHistory = () => api.get('/marketing/challenge/history')
