// Middleware de verificação de limites por plano de assinatura
// Aplica rate limiting e feature gating baseado no plano da empresa

const CACHE_DURATION = 60 * 1000; // 1 minuto de cache
const rateLimitStore = new Map();

export const planLimits = () => {
  return async (request, reply, next) => {
    try {
      const companyId = request.user?.companyId;

      // Pular verificação para rotas públicas ou sem autenticação
      if (!companyId) {
        request.planLimits = { hasAccess: true };
        return next();
      }

      // Buscar subscription no cache ou banco
      const cacheKey = `plan:${companyId}`;
      let planLimits = rateLimitStore.get(cacheKey);

      if (!planLimits || Date.now() - planLimits._cachedAt > CACHE_DURATION) {
        const subscription = await request.server.prisma.subscription.findUnique({
          where: { companyId },
          include: { plan: true }
        });

        if (!subscription || !subscription.plan) {
          planLimits = {
            hasAccess: true,
            maxProposals: 999,
            maxClients: 999,
            hasAi: false,
            hasWhiteLabel: false,
            planName: 'NONE',
            status: 'INACTIVE',
            proposalCount: 0,
            clientCount: 0,
            _cachedAt: Date.now()
          };
        } else {
          const [proposalCount, clientCount] = await Promise.all([
            request.server.prisma.proposal.count({ where: { companyId } }),
            request.server.prisma.client.count({ where: { companyId } })
          ]);

          planLimits = {
            hasAccess: subscription.status === 'ACTIVE' || subscription.status === 'TRIALING',
            maxProposals: subscription.plan.maxProposals,
            maxClients: subscription.plan.maxClients,
            hasAi: subscription.plan.hasAi,
            hasWhiteLabel: subscription.plan.hasWhiteLabel,
            planName: subscription.plan.name,
            status: subscription.status,
            proposalCount,
            clientCount,
            isTrial: subscription.status === 'TRIALING',
            trialEnds: subscription.endsAt,
            _cachedAt: Date.now()
          };
        }

        rateLimitStore.set(cacheKey, planLimits);
      }

      // Anexar limites ao request
      request.planLimits = planLimits;

      // Verificar se plano está ativo
      if (!planLimits.hasAccess) {
        return reply.code(403).send({
          error: 'Assinatura inativa',
          detail: 'Sua assinatura expirou ou está pendente. Atualize seu plano.'
        });
      }

      return next();
    } catch (err) {
      request.log.warn({ err }, 'Erro ao verificar limites do plano');
      return next(); // Permite passar em caso de erro (fail-open)
    }
  };
};

// Helper: decorador para adicionar verificações específicas
export const checkLimit = (feature) => {
  return (request, reply, next) => {
    const limits = request.planLimits;

    if (feature === 'ai' && !limits.hasAi) {
      return reply.code(403).send({
        error: 'Recurso indisponível',
        detail: 'Assine o plano Pro ou Enterprise para usar IA.'
      });
    }

    if (feature === 'whiteLabel' && !limits.hasWhiteLabel) {
      return reply.code(403).send({
        error: 'Recurso indisponível',
        detail: 'Assine o plano Pro ou Enterprise para White Label.'
      });
    }

    if (feature === 'proposals') {
      const maxProposals = limits.maxProposals;
      if (maxProposals > 0 && limits.proposalCount >= maxProposals) {
        return reply.code(403).send({
          error: 'Limite de propostas atingido',
          detail: `Seu plano ${limits.planName} permite ${maxProposals} propostas. Atualize seu plano.`,
          current: limits.proposalCount,
          max: maxProposals
        });
      }
    }

    if (feature === 'clients') {
      const maxClients = limits.maxClients;
      if (maxClients > 0 && limits.clientCount >= maxClients) {
        return reply.code(403).send({
          error: 'Limite de clientes atingido',
          detail: `Seu plano ${limits.planName} permite ${maxClients} clientes. Atualize seu plano.`,
          current: limits.clientCount,
          max: maxClients
        });
      }
    }

    return next();
  };
};