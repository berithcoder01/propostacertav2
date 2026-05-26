// seed.js — popula banco de desenvolvimento e produção
// Execute: node seed.js

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { CATALOG_SEEDS } from './lib/catalogSeeds.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // 1. Criar planos de assinatura padrão (MANDATÓRIO para o onboarding)
  console.log('📦 Criando planos de assinatura...')

  const planFree = await prisma.plan.upsert({
    where: { name: 'FREE' },
    update: {},
    create: {
      name: 'FREE',
      price: 0,
      billing: 'MONTHLY',
      features: JSON.stringify([
        'Até 3 propostas/mês',
        'Até 10 clientes',
        'Suporte via e-mail'
      ]),
      maxProposals: 3,
      maxClients: 10,
      hasAi: false,
      hasWhiteLabel: false
    }
  })
  console.log(`   ✅ Plano FREE verificado`)

  const planPro = await prisma.plan.upsert({
    where: { name: 'PRO' },
    update: {},
    create: {
      name: 'PRO',
      price: 49.90,
      billing: 'MONTHLY',
      features: JSON.stringify([
        'Até 50 propostas/mês',
        'Clientes ilimitados',
        'Assistente de IA',
        'White Label (Sua Logo)',
        'Suporte prioritário'
      ]),
      maxProposals: 50,
      maxClients: 100,
      hasAi: true,
      hasWhiteLabel: true,
      stripePriceId: 'price_pro_mock'
    }
  })
  console.log(`   ✅ Plano PRO verificado`)

  const planEnterprise = await prisma.plan.upsert({
    where: { name: 'ENTERPRISE' },
    update: {},
    create: {
      name: 'ENTERPRISE',
      price: 149.90,
      billing: 'MONTHLY',
      features: JSON.stringify([
        'Propostas ilimitadas',
        'Clientes ilimitados',
        'IA sem limites',
        'Domínio customizado',
        'Gerente de conta'
      ]),
      maxProposals: -1,
      maxClients: -1,
      hasAi: true,
      hasWhiteLabel: true,
      stripePriceId: 'price_enterprise_mock'
    }
  })
  console.log(`   ✅ Plano ENTERPRISE verificado`)

  // 2. Criar usuário demo
  const hashedPassword = await bcrypt.hash('senha123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@propostacerta.com.br' },
    update: {},
    create: {
      name: 'Marco Antonio',
      email: 'demo@propostacerta.com.br',
      password: hashedPassword
    }
  })
  console.log('✅ Usuário demo verificado:', user.email)

  // 3. Criar empresa demo se não existir
  let company = await prisma.company.findFirst({
    where: { user: { id: user.id } }
  })

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'PropostaCerta Demo',
        segment: 'ELETRICA',
        slogan: 'Soluções em Engenharia',
        footerText: 'Obrigado pela preferência.',
        primaryColor: '#4F6EF7',
        secondaryColor: '#050505',
        user: { connect: { id: user.id } }
      }
    })
    console.log('✅ Empresa demo criada')
    
    // Atribuir assinatura FREE
    await prisma.subscription.create({
      data: {
        companyId: company.id,
        planId: planFree.id,
        status: 'ACTIVE',
        startsAt: new Date()
      }
    })
  } else {
    console.log('✅ Empresa demo já existe')
  }

  // 4. Popula catálogo se estiver vazio
  const catalogCount = await prisma.catalogItem.count({ where: { companyId: company.id } })
  if (catalogCount === 0) {
    const seeds = CATALOG_SEEDS['ELETRICA'] || []
    await prisma.catalogItem.createMany({
      data: seeds.map(item => ({ ...item, companyId: company.id }))
    })
    console.log(`✅ Catálogo populado com ${seeds.length} itens`)
  }

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('   Login: demo@propostacerta.com.br / senha123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())