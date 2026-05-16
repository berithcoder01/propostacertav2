// Rotas: /leads/relatory
// Relatórios semanais e periódicos de prospecção

export default async function (fastify, opts) {
  // GET /leads/relatory/weekly — relatório semanal de novos leads
  fastify.get('/weekly', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [newLeads, leadsBySegment, leadsByStatus, topLeads] = await fastify.prisma.$transaction([
      fastify.prisma.lead.findMany({
        where: { companyId, createdAt: { gte: oneWeekAgo } },
        orderBy: { createdAt: 'desc' }
      }),
      fastify.prisma.lead.groupBy({
        by: ['segment'],
        where: { companyId },
        _count: true
      }),
      fastify.prisma.lead.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true
      }),
      fastify.prisma.lead.findMany({
        where: { companyId, status: { not: 'DISCARDED' } },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    return {
      period: { from: oneWeekAgo.toISOString(), to: new Date().toISOString() },
      totalNewLeads: newLeads.length,
      leadsBySegment: leadsBySegment.map(g => ({ segment: g.segment, count: g._count })),
      leadsByStatus: leadsByStatus.map(g => ({ status: g.status, count: g._count })),
      topLeads: topLeads.map(l => ({
        id: l.id,
        name: l.name,
        segment: l.segment,
        status: l.status,
        city: l.city,
        createdAt: l.createdAt
      }))
    }
  })

  // GET /leads/relatory/summary — resumo geral de leads
  fastify.get('/summary', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const [total, bySegment, byStatus, converted, activeLeads] = await fastify.prisma.$transaction([
      fastify.prisma.lead.count({ where: { companyId } }),
      fastify.prisma.lead.groupBy({ by: ['segment'], where: { companyId }, _count: true }),
      fastify.prisma.lead.groupBy({ by: ['status'], where: { companyId }, _count: true }),
      fastify.prisma.lead.count({ where: { companyId, status: 'CONVERTED' } }),
      fastify.prisma.lead.count({ where: { companyId, status: { in: ['NEW', 'CONTACTED', 'NEGOTIATING'] } } })
    ])

    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0

    return {
      total,
      conversionRate: parseFloat(conversionRate),
      activeLeads,
      bySegment: bySegment.map(g => ({ segment: g.segment, count: g._count })),
      byStatus: byStatus.map(g => ({ status: g.status, count: g._count })),
      converted
    }
  })
}