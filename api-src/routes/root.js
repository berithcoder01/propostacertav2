export default async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    return { status: 'ok', app: 'OrcaPro API', version: '2.0.0' }
  })

  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // GET /dev-upgrade — Fail-safe para ativação de IA
  fastify.get('/dev-upgrade', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id }
      })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(404).send({ error: 'Empresa não encontrada' })

    let proPlan = await fastify.prisma.plan.findUnique({
      where: { name: 'PRO' }
    })

    if (!proPlan) {
      proPlan = await fastify.prisma.plan.create({
        data: {
          name: 'PRO',
          price: 99.9,
          maxProposals: 100,
          maxClients: 500,
          hasAi: true,
          hasWhiteLabel: true,
          stripePriceId: 'price_pro_mock'
        }
      })
    }

    await fastify.prisma.subscription.upsert({
      where: { companyId },
      update: {
        planId: proPlan.id,
        status: 'ACTIVE',
        startsAt: new Date(),
        endsAt: null
      },
      create: {
        companyId,
        planId: proPlan.id,
        status: 'ACTIVE',
        startsAt: new Date()
      }
    })

    return { success: true, message: 'Upgrade para PRO concluído com sucesso (via GET)' }
  })
}
