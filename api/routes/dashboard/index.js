// Rotas: /dashboard/stats, /dashboard/recent, /dashboard/summary
// Estatísticas e propostas recentes para o painel principal

export default async function (fastify, opts) {
  // GET /dashboard/stats — resumo de estatísticas da empresa
  fastify.get('/stats', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalProposals, recentProposals, approvedProposals, totalRevenue, monthlyProposals, totalClients] = await Promise.all([
      fastify.prisma.proposal.count({ where: { companyId } }),
      fastify.prisma.proposal.findMany({
        where: { companyId },
        include: { client: true, conditions: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      fastify.prisma.proposal.count({
        where: { companyId, status: 'APPROVED' }
      }),
      fastify.prisma.proposal.aggregate({
        where: { companyId, status: 'APPROVED' },
        _sum: { total: true }
      }),
      fastify.prisma.proposal.count({
        where: {
          companyId,
          createdAt: { gte: firstDayOfMonth }
        }
      }),
      fastify.prisma.client.count({ where: { companyId } })
    ])

    return {
      totalProposals,
      recentProposals,
      approvedProposals,
      approvedValue: totalRevenue._sum.total || 0,
      monthlyProposals,
      totalClients,
      approvalRate: totalProposals > 0
        ? Math.round((approvedProposals / totalProposals) * 100)
        : 0
    }
  })

  // GET /dashboard/recent — propostas recentes para feed do dashboard
  fastify.get('/recent', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const proposals = await fastify.prisma.proposal.findMany({
      where: { companyId },
      include: {
        client: { select: { name: true, location: true } },
        conditions: { select: { downPayment: true, downPaymentDays: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return proposals.map(p => ({
      id: p.id,
      number: p.number,
      clientName: p.clientName,
      clientLocation: p.client?.location || p.clientLocation,
      total: p.total,
      status: p.status,
      createdAt: p.createdAt,
      object: p.object,
      hasConditions: !!p.conditions,
      downPayment: p.conditions?.downPayment || 0,
      downPaymentDays: p.conditions?.downPaymentDays || 0
    }))
  })

  // GET /dashboard/summary — resumo financeiro mensal
  fastify.get('/summary', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [currentMonth, lastMonth, pendingValue] = await Promise.all([
      fastify.prisma.proposal.aggregate({
        where: {
          companyId,
          status: 'APPROVED',
          createdAt: { gte: firstDayOfMonth }
        },
        _sum: { total: true },
        _count: { _all: true }
      }),
      fastify.prisma.proposal.aggregate({
        where: {
          companyId,
          status: 'APPROVED',
          createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth }
        },
        _sum: { total: true },
        _count: { _all: true }
      }),
      fastify.prisma.proposal.aggregate({
        where: { companyId, status: 'SENT' },
        _sum: { total: true }
      })
    ])

    return {
      currentMonth: {
        revenue: currentMonth._sum.total || 0,
        count: currentMonth._count._all
      },
      lastMonth: {
        revenue: lastMonth._sum.total || 0,
        count: lastMonth._count._all
      },
      pendingRevenue: pendingValue._sum.total || 0,
      growthRate: lastMonth._sum.total && lastMonth._sum.total > 0
        ? Math.round(((currentMonth._sum.total || 0) - (lastMonth._sum.total || 0)) / (lastMonth._sum.total) * 100)
        : currentMonth._sum.total > 0 ? 100 : 0
    }
  })
}