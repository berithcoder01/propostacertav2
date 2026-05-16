// Rotas: /leads/:id/proposal
// Cria proposta diretamente a partir de um lead

export default async function (fastify, opts) {
  // POST /leads/:id/proposal — cria proposta a partir do lead
  fastify.post('/:id/proposal', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params
    
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })
    
    // Buscar o lead
    const lead = await fastify.prisma.lead.findFirst({
      where: { id, companyId }
    })
    
    if (!lead) return reply.notFound('Lead não encontrado')
    
    try {
      // Gerar número da proposta
      const year = new Date().getFullYear()
      const count = await fastify.prisma.proposal.count({
        where: {
          companyId,
          createdAt: { gte: new Date(`${year}-01-01`) }
        }
      })
      const seq = String(count + 1).padStart(3, '0')
      const number = `${year}-${seq}`
      
      // Criar proposta a partir dos dados do lead
      const proposal = await fastify.prisma.proposal.create({
        data: {
          companyId,
          number,
          title: `Proposta para ${lead.name}`,
          object: `Serviços para ${lead.name}${lead.city ? ` em ${lead.city}` : ''}${lead.state ? `/${lead.state}` : ''}`,
          status: 'DRAFT',
          total: 0, // Será calculado depois com os items
          // Campos do cliente (snapshot do lead)
          clientName: lead.name,
          clientContact: lead.whatsapp || lead.phone || lead.email || 'Não informado',
          clientRole: null,
          clientLocation: lead.city || lead.state || 'Não informado',
          clientPhone: lead.whatsapp || lead.phone || null,
          // Dados específicos por segmento (vazio por enquanto, pode ser preenchido posteriormente)
          segmentData: {},
          metadata: {
            createdFromLead: lead.id,
            leadSource: lead.source,
            leadSegment: lead.segment
          }
        }
      })
      
      // Atualizar status do lead para NEGOTIATING
      await fastify.prisma.lead.update({
        where: { id },
        data: { 
          status: 'NEGOTIATING',
          contactHistory: JSON.stringify([...(JSON.parse(lead.contactHistory || '[]')), { 
            channel: 'proposal_creation', 
            proposalId: proposal.id,
            date: new Date().toISOString() 
          }])
        }
      })
      
      return reply.code(201).send(proposal)
    } catch (err) {
      fastify.log.error({ err }, 'Erro ao criar proposta a partir do lead')
      return reply.code(500).send({ 
        error: 'Erro ao criar proposta a partir do lead',
        message: err.message 
      })
    }
  })
}