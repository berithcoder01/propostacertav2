import fp from 'fastify-plugin'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default fp(async (fastify, opts) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    fastify.log.warn('GEMINI_API_KEY não configurada — funcionalidades de IA estarão limitadas')
    fastify.decorate('geminiFlashModel', null)
    fastify.decorate('geminiProModel', null)
  } else {
    const genAI = new GoogleGenerativeAI(apiKey)
    fastify.decorate('geminiFlashModel', genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }))
    fastify.decorate('geminiProModel', genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }))
    fastify.log.info('Gemini AI models loaded successfully')
  }

  // Helper global para limpeza de respostas JSON da IA
  fastify.decorate('cleanJsonResponse', (text) => {
    try {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) return JSON.parse(match[0])
      return JSON.parse(text)
    } catch (err) {
      throw new Error('Falha ao processar resposta JSON da IA: ' + text)
    }
  })
})