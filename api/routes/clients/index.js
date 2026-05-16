// Rotas: /clients

export default async function (fastify, opts) {
  // GET /clients
  fastify.get('/', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const clients = await fastify.prisma.client.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { proposals: true } }
      }
    })
    return clients
  })

  // GET /clients/:id
  fastify.get('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const client = await fastify.prisma.client.findFirst({
      where: { id, companyId },
      include: {
        proposals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, number: true, total: true, status: true, createdAt: true }
        }
      }
    })
    if (!client) return reply.notFound()
    return client
  })

  // POST /clients
  fastify.post('/', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { name, contact, role, phone, email, location, address } = request.body

    if (!name || !contact || !location) {
      return reply.code(400).send({ error: 'Nome, contato e local são obrigatórios' })
    }

    const client = await fastify.prisma.client.create({
      data: { companyId, name, contact, role, phone, email, location, address }
    })
    return reply.code(201).send(client)
  })

  // PUT /clients/:id
  fastify.put('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const exists = await fastify.prisma.client.findFirst({ where: { id, companyId } })
    if (!exists) return reply.notFound()

    const data = request.body
    delete data.id
    delete data.companyId

    const client = await fastify.prisma.client.update({ where: { id }, data })
    return client
  })

  // DELETE /clients/:id
  fastify.delete('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const exists = await fastify.prisma.client.findFirst({ where: { id, companyId } })
    if (!exists) return reply.notFound()

    await fastify.prisma.client.delete({ where: { id } })
    return reply.code(204).send()
  })

  // ─── Atividades do Cliente ─────────────────────────────────────────────────
  
  // GET /clients/:id/activities
  fastify.get('/:id/activities', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const exists = await fastify.prisma.client.findFirst({ where: { id, companyId } })
    if (!exists) return reply.notFound()

    const activities = await fastify.prisma.clientActivity.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' }
    })
    return activities
  })

  // POST /clients/:id/activities
  fastify.post('/:id/activities', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params
    const { type, content } = request.body

    const exists = await fastify.prisma.client.findFirst({ where: { id, companyId } })
    if (!exists) return reply.notFound()

    if (!type || !content) return reply.code(400).send({ error: 'Tipo e conteúdo são obrigatórios' })

    const activity = await fastify.prisma.clientActivity.create({
      data: {
        clientId: id,
        type,
        content
      }
    })
    return reply.code(201).send(activity)
  })
}
