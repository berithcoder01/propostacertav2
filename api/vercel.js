import Fastify from 'fastify'
import app from './app.js'

let fastifyInstance = null

async function getFastify() {
  if (!fastifyInstance) {
    fastifyInstance = Fastify({ logger: false })
    await fastifyInstance.register(app)
    await fastifyInstance.ready()
  }
  return fastifyInstance
}

export default async function handler(req, res) {
  try {
    const fastify = await getFastify()
    if (req.url && req.url.startsWith('/api')) {
      req.url = req.url.slice(4) || '/'
    }
    fastify.server.emit('request', req, res)
  } catch (err) {
    console.error('Erro fatal no servidor:', err)
    fastifyInstance = null
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }))
  }
}
