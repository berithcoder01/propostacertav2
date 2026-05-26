import Fastify from 'fastify'
import app from '../api-src/app.js'

let fastifyInstance = null

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://berithcoder01.github.io',
  'https://narogestor.berithpro01.workers.dev',
  'https://propostacertav2.vercel.app',
  'https://propostacertav2-propostacerta-s-projects.vercel.app'
]

function isOriginAllowed(origin) {
  if (!origin) return true
  if (ALLOWED_ORIGINS.includes(origin)) return true
  if (origin.startsWith('https://propostacertav2') && origin.endsWith('.vercel.app')) return true
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true
  return false
}

async function getFastify() {
  if (!fastifyInstance) {
    fastifyInstance = Fastify({ logger: false })
    await fastifyInstance.register(app)
    await fastifyInstance.ready()
  }
  return fastifyInstance
}

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.Origin || ''

  // Handle CORS preflight (OPTIONS) immediately, without waiting for Fastify
  if (req.method === 'OPTIONS') {
    const allowedOrigin = isOriginAllowed(origin) ? origin : ''
    if (allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept, X-Requested-With')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Max-Age', '86400')
    }
    res.statusCode = 204
    res.end()
    return
  }
  try {
    const fastify = await getFastify()
    // Não fatiamos o prefixo '/api' porque o Fastify registra suas rotas com o prefixo '/api'.
    // Mantendo a URL original, o roteador interno do Fastify encontra a rota correspondente.
    
    // Retorna uma Promise para garantir que o Vercel espere a resposta do Fastify terminar
    return new Promise((resolve, reject) => {
      res.on('close', resolve)
      res.on('finish', resolve)
      res.on('error', reject)
      
      fastify.server.emit('request', req, res)
    })
  } catch (err) {
    console.error('Erro fatal no servidor:', err)
    fastifyInstance = null
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }))
  }
}

