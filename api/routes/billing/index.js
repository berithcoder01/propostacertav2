// Rotas: /billing
// Gerencia faturamento, planos e integração Stripe

export default async function (fastify, opts) {
  // GET /billing/plans — lista todos os planos disponíveis
  fastify.get('/plans', async (request, reply) => {
    const plans = await fastify.prisma.plan.findMany({
      orderBy: { price: 'asc' }
    })
    return plans
  })

  // GET /billing/subscription — retorna assinatura atual da empresa
  fastify.get('/subscription', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id }
      })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(404).send({ error: 'Empresa não encontrada' })

    const subscription = await fastify.prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true }
    })

    // Buscar limites do plano
    let stats = { proposalCount: 0, clientCount: 0 }
    if (subscription) {
      const [proposals, clients] = await Promise.all([
        fastify.prisma.proposal.count({ where: { companyId } }),
        fastify.prisma.client.count({ where: { companyId } })
      ])
      stats = { proposalCount: proposals, clientCount: clients }
    }

    return { subscription: subscription || null, stats }
  })

  // POST /billing/webhook — webhook do Stripe
  fastify.post('/webhook', async (request, reply) => {
    const sig = request.headers['stripe-signature']
    // Em produção, validar assinatura com stripe.webhooks.constructEvent
    // Em dev, aceitar body direto

    const event = request.body

    if (!event || !event.type) {
      return reply.code(400).send({ error: 'Evento inválido' })
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object
          const companyId = session.metadata?.companyId
          const stripeSubscriptionId = session.subscription

          if (companyId && stripeSubscriptionId) {
            // Buscar subscription existente e vincular Stripe ID
            const subscription = await fastify.prisma.subscription.findFirst({
              where: { companyId }
            })

            if (subscription) {
              await fastify.prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                  stripeSubscriptionId,
                  status: 'ACTIVE',
                  startsAt: new Date(),
                  endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
                }
              })
            }
          }
          break
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const sub = event.data.object
          const companyId = sub.metadata?.companyId

          if (companyId) {
            await fastify.prisma.subscription.upsert({
              where: { companyId },
              update: {
                status: sub.status?.toUpperCase() || 'ACTIVE',
                stripeSubscriptionId: sub.id,
                endsAt: new Date(sub.current_period_end * 1000),
              },
              create: {
                companyId,
                status: sub.status?.toUpperCase() || 'ACTIVE',
                stripeSubscriptionId: sub.id,
                startsAt: new Date(sub.current_period_start * 1000),
                endsAt: new Date(sub.current_period_end * 1000),
              }
            })
          }
          break
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object
          const companyId = sub.metadata?.companyId

          if (companyId) {
            await fastify.prisma.subscription.updateMany({
              where: { companyId },
              data: { status: 'INACTIVE' }
            })
          }
          break
        }
        case 'invoice.payment_succeeded': {
          // Renovação bem sucedida — atualizar período
          const subscription = event.data.object
          const companyId = subscription.metadata?.companyId

          if (companyId) {
            await fastify.prisma.subscription.updateMany({
              where: { companyId },
              data: {
                endsAt: new Date(subscription.lines.data[0]?.period?.end * 1000 || Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'ACTIVE',
              }
            })
          }
          break
        }
        case 'invoice.payment_failed': {
          // Pagamento falhou — notificar para revisão
          const subscription = event.data.object
          const companyId = subscription.metadata?.companyId

          if (companyId) {
            fastify.log.warn({ companyId }, 'Pagamento Stripe falhou - subscription pode expirar')
          }
          break
        }
      }

      return reply.code(200).send({ received: true })
    } catch (err) {
      fastify.log.error({ err, eventType: event.type }, 'Erro ao processar webhook do Stripe')
      return reply.code(500).send({ error: 'Erro ao processar webhook' })
    }
  })

  // POST /billing/create-checkout — cria sessão de checkout no Stripe
  fastify.post('/create-checkout', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id }
      })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(404).send({ error: 'Empresa não encontrada' })

    const { priceId } = request.body

    if (!priceId) {
      return reply.code(400).send({ error: 'Price ID é obrigatório' })
    }

    // Em produção:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    // const session = await stripe.checkout.sessions.create({
    //   success_url: `${process.env.VITE_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.VITE_APP_URL}/billing`,
    //   mode: 'subscription',
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   customer_email: request.user.email,
    //   metadata: { companyId }
    // })
    // return { checkoutUrl: session.url }

    // Mock para desenvolvimento
    return {
      checkoutUrl: `https://buy.stripe.com/test_mock?${Date.now()}`,
      priceId,
      companyId
    }
  })

  // POST /billing/dev-upgrade — Ativa plano PRO instantaneamente (Apenas para Testes/Dev)
  fastify.post('/dev-upgrade', async (request, reply) => {
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
          price: 29.90,
          billing: 'monthly',
          features: JSON.stringify([
            'Propostas ilimitadas',
            'IA: 50 requisições/dia',
            'Assistente de sugestões',
            'White Label básico',
            '500 MB de armazenamento',
          ]),
          maxProposals: 100,
          maxClients: 500,
          hasAi: true,
          hasWhiteLabel: true,
          stripePriceId: 'price_pro_mock'
        }
      })
    }

    // Registrar no log de auditoria
    await fastify.prisma.auditLog.create({
      data: {
        action: 'PLAN_UPGRADE',
        entity: 'Subscription',
        userId: request.user.id,
        companyId: companyId,
        details: JSON.stringify({ planName: 'PRO', method: 'dev-upgrade' }),
      }
    })

    const subscription = await fastify.prisma.subscription.upsert({
      where: { companyId },
      update: { planId: proPlan.id, status: 'ACTIVE' },
      create: {
        companyId,
        planId: proPlan.id,
        status: 'ACTIVE',
        startsAt: new Date()
      }
    })

    // Invalidar cache de limits
    reply.header('Cache-Control', 'no-store')

    return { success: true, subscription }
  })
}