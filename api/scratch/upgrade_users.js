import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function upgrade() {
  const users = await prisma.user.findMany({
    where: { companyId: { not: null } },
    include: { company: true }
  });

  for (const user of users) {
    if (user.companyId) {
      // Garantir que existe um plano PRO
      let proPlan = await prisma.plan.findUnique({ where: { name: 'PRO' } });
      if (!proPlan) {
        proPlan = await prisma.plan.create({
          data: {
            name: 'PRO',
            price: 99.9,
            maxProposals: 100,
            maxClients: 500,
            hasAi: true,
            hasWhiteLabel: true,
            stripePriceId: 'price_pro_mock'
          }
        });
      }

      // Atualizar ou criar subscription
      await prisma.subscription.upsert({
        where: { companyId: user.companyId },
        update: { planId: proPlan.id, status: 'ACTIVE' },
        create: {
          companyId: user.companyId,
          planId: proPlan.id,
          status: 'ACTIVE',
          startDate: new Date(),
        }
      });
      console.log(`Usuário ${user.email} atualizado para PRO.`);
    }
  }
}

upgrade().finally(() => prisma.$disconnect());
