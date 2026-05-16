/**
 * Rota atualizada: POST /proposals/:id/share
 *
 * Substitui o bloco de share dentro de api/routes/proposals/index.js
 * Cole este trecho no lugar do bloco existente "// POST /proposals/:id/share"
 *
 * Mudanças em relação à versão anterior:
 *  1. Include de items e conditions na query (antes só incluía company)
 *  2. Usa formatProposalForWhatsApp() em vez de mensagem hardcoded
 *  3. Exporta também o campo `msg` formatado para o frontend exibir preview
 *  4. Mantém retrocompatibilidade: shareUrl ainda é gerado normalmente
 */

import { formatProposalForWhatsApp } from '../../lib/whatsappProposalFormatter.js'

// POST /proposals/:id/share
fastify.post('/:id/share', async (request, reply) => {
  const { companyId } = request.user
  const { id } = request.params

  const proposal = await fastify.prisma.proposal.findFirst({
    where: { id, companyId },
    include: {
      company: true,
      items: {
        orderBy: { sortOrder: 'asc' }
      },
      conditions: true,
    }
  })
  if (!proposal) return reply.notFound()

  // Gera ou reutiliza shareToken
  let { shareToken } = proposal
  if (!shareToken) {
    const { randomBytes } = await import('crypto')
    shareToken = randomBytes(15).toString('hex')
    await fastify.prisma.proposal.update({
      where: { id },
      data: {
        shareToken,
        shareExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'SENT',
      }
    })
  }

  const appUrl = process.env.APP_URL || 'http://localhost:5173'
  const shareUrl = `${appUrl}/p/${shareToken}`

  // Normaliza o objeto da proposta para o formatter
  // (o Prisma retorna conditions como objeto único com relação 1:1)
  const proposalForFormatter = {
    ...proposal,
    conditions: proposal.conditions, // já é um objeto ou null (relação 1:1)
    items: proposal.items || [],
  }

  // Gera a mensagem formatada
  const msg = formatProposalForWhatsApp(proposalForFormatter, proposal.company)

  // Monta o link WhatsApp
  const phone = proposal.clientPhone ? proposal.clientPhone.replace(/\D/g, '') : ''
  const waUrl = phone
    ? `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`

  return reply.send({ waUrl, shareUrl, msg })
})
