export default async function (fastify, opts) {
  fastify.get('/proposals/:token', async (request, reply) => {
    const { token } = request.params

    const proposal = await fastify.prisma.proposal.findUnique({
      where: { shareToken: token },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        conditions: true,
        company: true
      }
    })

    if (!proposal) {
      return reply.notFound('Proposta não encontrada ou link inválido.')
    }

    // Verifica se expirou
    if (proposal.shareExpiresAt && new Date() > proposal.shareExpiresAt) {
      return reply.code(403).send({ error: 'O link desta proposta expirou.' })
    }

    // Incrementa visualizações
    await fastify.prisma.proposal.update({
      where: { id: proposal.id },
      data: { viewCount: { increment: 1 } }
    })

    // Retorna os dados necessários para exibir (omitir campos muito sensíveis se aplicável)
    return proposal
  })

  fastify.post('/proposals/:token/accept', async (request, reply) => {
    const { token } = request.params
    const { name } = request.body

    const proposal = await fastify.prisma.proposal.findUnique({
      where: { shareToken: token }
    })

    if (!proposal) return reply.notFound('Proposta não encontrada.')

    if (proposal.status === 'APPROVED') {
      return reply.code(400).send({ error: 'Proposta já foi aceita.' })
    }

    // Cria o aceite e atualiza o status em transação
    await fastify.prisma.$transaction([
      fastify.prisma.proposalAcceptance.create({
        data: {
          proposalId: proposal.id,
          name: name || proposal.clientName,
          ip: request.ip || '0.0.0.0',
          userAgent: request.headers['user-agent'] || 'Desconhecido'
        }
      }),
      fastify.prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: 'APPROVED' }
      }),
      fastify.prisma.proposalStatusLog.create({
        data: {
          proposalId: proposal.id,
          fromStatus: proposal.status,
          toStatus: 'APPROVED'
        }
      })
    ])

    return reply.code(200).send({ message: 'Proposta aceita com sucesso.' })
  })
}
