import bcrypt from 'bcryptjs'

export default async function (fastify, opts) {
  // POST /auth/login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body

    const user = await fastify.prisma.user.findUnique({
      where: { email },
      include: { company: true }
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({ error: 'Credenciais inválidas' })
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: user.companyId
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.companyId,
        hasCompany: !!user.company,
        company: user.company
      }
    }
  })

  // POST /auth/register
  fastify.post('/register', async (request, reply) => {
    const { name, email, password } = request.body

    if (!name || !email || !password) {
      return reply.code(400).send({ error: 'Nome, e-mail e senha são obrigatórios' })
    }

    const exists = await fastify.prisma.user.findUnique({ where: { email } })
    if (exists) {
      return reply.code(400).send({ error: 'Já existe uma conta com este e-mail' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await fastify.prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: null
    })

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, companyId: null, hasCompany: false }
    }
  })

  // GET /auth/me
  fastify.get('/me', async (request, reply) => {
    try {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id },
        include: { company: true }
      })
      if (!user) return reply.notFound()
      const { password, ...safe } = user
      return { ...safe, hasCompany: !!user.company }
    } catch (err) {
      return reply.code(500).send({ error: 'Erro interno de autenticação' })
    }
  })

  // POST /auth/refresh — renova token com dados atualizados do banco
  fastify.post('/refresh', async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
      include: { company: true }
    })
    if (!user) return reply.notFound()

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: user.companyId
    })

    const { password, ...safe } = user
    return {
      token,
      user: { ...safe, hasCompany: !!user.company }
    }
  })
}
