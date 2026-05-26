import path from 'node:path'
import fs from 'node:fs'
import AutoLoad from '@fastify/autoload'
import fjwt from '@fastify/jwt'
import cors from '@fastify/cors'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function (fastify, opts) {
  // Proteção 1: Rate Limiting (Proteção contra DDoS e Brute Force)
  const rateLimit = (await import('@fastify/rate-limit')).default
  await fastify.register(rateLimit, {
    max: 100, // limite de 100 requisições
    timeWindow: '1 minute', // por minuto, por IP
    errorResponseBuilder: function (request, context) {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Limite de requisições excedido. Tente novamente em 1 minuto.'
      }
    }
  })

  // Proteção 2: CORS Restrito (Proteção de acesso à API)
  const allowedOrigins = [
    'http://localhost:5173', // Dev local
    'https://berithcoder01.github.io' // Produção no GitHub Pages
  ]
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Permite requisições sem origin (como REST clients e o mobile nativo) ou origens na lista permitida
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true)
        return
      }
      cb(new Error('Bloqueado pelo CORS - Origem não autorizada'), false)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    credentials: true
  })

  // JWT
  fastify.register(fjwt, {
    secret: process.env.JWT_SECRET || 'orcapro-secret-change-in-production'
  })

  // Decorator de autenticação
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.send(err)
    }
  })

  // Hook global de autenticação
  fastify.addHook('preHandler', async (request, reply) => {
    const PUBLIC = ['/auth/login', '/auth/register', '/health', '/public', '/company/debug', '/company/debug-create', '/uploads']
    const isPublic = PUBLIC.some(p => {
      const url = request.url
      return url === p || url === `/api${p}` || url.startsWith(`${p}/`) || url.startsWith(`/api${p}/`)
    })
    const url = request.url
    if (isPublic || url === '/' || url === '/api' || url === '/api/') return

    try {
      await request.jwtVerify()
      // Fallback: se o token não tiver companyId, busca no banco
      if (request.user && !request.user.companyId && fastify.prisma) {
        const u = await fastify.prisma.user.findUnique({
          where: { id: request.user.id },
          select: { companyId: true }
        })
        if (u?.companyId) request.user.companyId = u.companyId
      }
    } catch (err) {
      return reply.send(err)
    }
  })

  // Servir arquivos estáticos de uploads (logos, etc.)
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  const uploadsDir = isServerless
    ? '/tmp/uploads'
    : path.join(__dirname, 'uploads')
  if (fs.existsSync(uploadsDir)) {
    fastify.register(async function staticRoutes(fastify) {
      fastify.get('/uploads/logos/*', async (request, reply) => {
        const filePath = path.join(uploadsDir, request.params['*'])
        if (!fs.existsSync(filePath)) return reply.code(404).send({ error: 'Arquivo não encontrado' })
        const stat = fs.statSync(filePath)
        const stream = fs.createReadStream(filePath)
        reply.header('Content-Type', getMimeType(filePath))
        reply.header('Content-Length', stat.size)
        reply.header('Cache-Control', 'public, max-age=31536000')
        return reply.send(stream)
      })
    })
  }

// Plugin multipart para uploads de arquivo (import dinâmico para compatibilidade ESM)
const multipartPlugin = (await import('@fastify/multipart')).default
fastify.register(multipartPlugin, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 2,
    headerPairs: 2000
  }
})

  // Plugins
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // Plugin Gemini AI já é carregado via AutoLoad acima

  // Rotas
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({ prefix: '/api' }, opts)
  })
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' }
  return types[ext] || 'application/octet-stream'
}
