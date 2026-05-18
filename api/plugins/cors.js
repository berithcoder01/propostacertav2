import fp from 'fastify-plugin'
import cors from '@fastify/cors'

export default fp(async function (fastify, opts) {
  fastify.register(cors, {
    origin: true, // Habilita qualquer origem de requisição que envie as credenciais adequadas ou simplesmente '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
})
