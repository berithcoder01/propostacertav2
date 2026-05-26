export default async function (fastify, opts) {
  // GET /reminders
  fastify.get('/', async (request, reply) => {
    const { companyId } = request.user
    const { status } = request.query // 'pending', 'completed', 'all'

    const where = { companyId }
    if (status === 'pending') where.isCompleted = false
    else if (status === 'completed') where.isCompleted = true

    const reminders = await fastify.prisma.reminder.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        proposal: { select: { number: true, clientName: true } }
      }
    })
    return reminders
  })

  // POST /reminders
  fastify.post('/', async (request, reply) => {
    const { companyId } = request.user
    const { title, description, dueDate, proposalId } = request.body

    if (!title || !dueDate) {
      return reply.code(400).send({ error: 'Título e data de vencimento são obrigatórios' })
    }

    const reminder = await fastify.prisma.reminder.create({
      data: {
        companyId,
        title,
        description,
        dueDate: new Date(dueDate),
        proposalId: proposalId || null
      }
    })
    return reply.code(201).send(reminder)
  })

  // PATCH /reminders/:id
  fastify.patch('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params
    const { title, description, dueDate, isCompleted } = request.body

    const existing = await fastify.prisma.reminder.findFirst({ where: { id, companyId } })
    if (!existing) return reply.notFound()

    const updated = await fastify.prisma.reminder.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(isCompleted !== undefined && { isCompleted })
      }
    })
    return updated
  })

  // DELETE /reminders/:id
  fastify.delete('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const existing = await fastify.prisma.reminder.findFirst({ where: { id, companyId } })
    if (!existing) return reply.notFound()

    await fastify.prisma.reminder.delete({ where: { id } })
    return reply.send({ success: true })
  })
}
