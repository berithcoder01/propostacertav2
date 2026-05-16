// Rotas: /company
// Gerencia o perfil/empresa do usuário autenticado

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Em serverless (Vercel), usar /tmp que é o único diretório com permissão de escrita
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
const UPLOAD_DIR = isServerless
  ? '/tmp/uploads/logos'
  : path.resolve(__dirname, '..', '..', 'uploads', 'logos')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']

// Garante que o diretório de uploads existe (ignora erro em serverless read-only)
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
} catch (e) {
  // Em serverless, o /tmp sempre existe, mas em caso de erro não falha o startup
  console.warn('Aviso: não foi possível criar diretório de uploads:', e.message)
}

function getCompanyId(request, reply) {
  let { companyId } = request.user
  if (!companyId) {
    return reply.code(400).send({ error: 'Empresa não configurada' })
  }
  return companyId
}

export default async function (fastify, opts) {

  // GET /company — retorna empresa do usuário atual (já existia)
  // GET /company — retorna empresa do usuário atual
  fastify.get('/', async (request, reply) => {
    let { companyId } = request.user

    // Se o token for antigo e não tiver companyId, busca no banco pelo userId
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id }
      })
      companyId = user.companyId
    }

    if (!companyId) return reply.code(404).send({ error: 'Empresa não cadastrada. Complete o onboarding.' })

    const company = await fastify.prisma.company.findUnique({ 
      where: { id: companyId },
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    })
    if (!company) return reply.notFound()
    return company
  })

  // POST /company — cria empresa (onboarding inicial)
  fastify.post('/', async (request, reply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({ error: 'Sessão inválida. Por favor, faça login novamente.' })
      }
      let { id: userId } = request.user

      // Sempre busca no banco — o token pode estar desatualizado
      const user = await fastify.prisma.user.findUnique({ where: { id: userId } })
      if (!user) return reply.code(401).send({ error: 'Usuário não encontrado' })

      // Usa o companyId do banco (fonte de verdade), não o do token
      const currentCompanyId = user.companyId

      if (currentCompanyId) {
        return reply.code(400).send({
          error: 'Você já possui uma empresa cadastrada. Use as Configurações para editar.'
        })
      }

      const {
        name, cnpj, phone, email, website,
        address, city, state, cep,
        segment, subSegments,
        primaryColor, secondaryColor, slogan, footerText,
        technicalData,
        showWarranties, showSpecialConditions, specialConditionText,
        defaultDownPaymentPct, defaultDownPaymentDays,
        defaultMeasurementDays, defaultPaymentNfDays,
        defaultValidityDays, defaultPaymentMethod, defaultSafetyMargin,

        businessType
      } = request.body

      if (!name || !name.trim()) {
        return reply.code(400).send({ error: 'Nome da empresa é obrigatório' })
      }

      // Valida segment contra o enum — evita erro do Prisma com valor inválido
      const VALID_SEGMENTS = ['ELETRICA', 'CONSTRUCAO_CIVIL', 'HIDRAULICA', 'PINTURA', 'AR_CONDICIONADO', 'OUTRO']
      const safeSegment = VALID_SEGMENTS.includes(segment) ? segment : 'OUTRO'
      const VALID_BUSINESS_TYPES = ['SERVICE_ONLY', 'PRODUCT_ONLY', 'HYBRID']
      const safeBusinessType = VALID_BUSINESS_TYPES.includes(businessType) ? businessType : 'SERVICE_ONLY'

      const company = await fastify.prisma.company.create({
        data: {
          name: name.trim(),
          cnpj: cnpj || null,
          phone: phone || null,
          email: email || null,
          website: website || null,
          address: address || null,
          city: city || null,
          state: state || null,
          cep: cep || null,
          segment: safeSegment,
          businessType: safeBusinessType,
          subSegments: Array.isArray(subSegments) ? subSegments : [],
          primaryColor: primaryColor || '#10B981',
          secondaryColor: secondaryColor || '#050505',
          slogan: slogan || null,
          footerText: footerText || null,
          technicalData: technicalData ?? null,

          showWarranties: showWarranties ?? true,
          showSpecialConditions: showSpecialConditions ?? false,
          specialConditionText: specialConditionText || null,
          defaultDownPaymentPct: parseFloat(defaultDownPaymentPct) || 20,
          defaultDownPaymentDays: parseInt(defaultDownPaymentDays) || 45,
          defaultMeasurementDays: parseInt(defaultMeasurementDays) || 10,
          defaultPaymentNfDays: parseInt(defaultPaymentNfDays) || 60,
          defaultValidityDays: parseInt(defaultValidityDays) || 60,
          defaultPaymentMethod: defaultPaymentMethod || 'depósito bancário',
          defaultSafetyMargin: parseFloat(defaultSafetyMargin) || 1.15,

        }
      })

      // Vincula a empresa ao usuário explicitamente
      await fastify.prisma.user.update({
        where: { id: userId },
        data: { companyId: company.id }
      })

      // Garante que a empresa nasça com o plano ENTERPRISE ativo para testes/desbloqueio
      try {
        const enterprisePlan = await fastify.prisma.plan.findUnique({
          where: { name: 'ENTERPRISE' }
        })
        if (enterprisePlan) {
          await fastify.prisma.subscription.create({
            data: {
              companyId: company.id,
              planId: enterprisePlan.id,
              status: 'ACTIVE',
              startsAt: new Date()
            }
          })
        }
      } catch (subErr) {
        fastify.log.warn('Aviso: falha ao associar plano padrão:', subErr.message)
      }

      // Popula catálogo padrão do segmento automaticamente
      try {
        const { CATALOG_SEEDS } = await import('../../lib/catalogSeeds.js')
        const seeds = CATALOG_SEEDS[safeSegment]
        if (seeds && seeds.length > 0) {
          await fastify.prisma.catalogItem.createMany({
            data: seeds.map(item => ({ ...item, companyId: company.id }))
          })
        }
      } catch (catalogErr) {
        // Catálogo é opcional — não falha o onboarding por isso
        fastify.log.warn('Aviso: falha ao popular catálogo:', catalogErr.message)
      }

      // Busca a empresa atualizada com a assinatura recém-criada
      const companyWithSub = await fastify.prisma.company.findUnique({
        where: { id: company.id },
        include: { subscription: { include: { plan: true } } }
      })

      return reply.code(201).send(companyWithSub)
    } catch (error) {
      fastify.log.error('Erro fatal no onboarding:', error)

      if (error.code === 'P2002') {
        return reply.code(400).send({
          error: 'Este usuário já está vinculado a uma empresa.'
        })
      }

      return reply.code(500).send({
        error: 'Erro interno ao criar empresa.'
      })
    }
  })

  // PUT /company — atualiza empresa existente
  fastify.put('/', async (request, reply) => {
    let { companyId } = request.user

    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id }
      })
      companyId = user.companyId
    }

    if (!companyId) return reply.code(404).send({ error: 'Empresa não encontrada' })

    const data = request.body

    // Remove campos que não devem ser atualizados diretamente
    delete data.id
    delete data.createdAt
    delete data.updatedAt
    delete data.userId

    // Sanitiza campos Json para nunca passar undefined
    if (data.technicalData === undefined) delete data.technicalData
    if (data.subSegments === undefined) delete data.subSegments

    // Valida businessType se presente
    const VALID_BUSINESS_TYPES = ['SERVICE_ONLY', 'PRODUCT_ONLY', 'HYBRID']
    if (data.businessType && !VALID_BUSINESS_TYPES.includes(data.businessType)) {
      return reply.code(400).send({ error: 'Tipo de negócio inválido. Use: SERVICE_ONLY, PRODUCT_ONLY ou HYBRID' })
    }

    const company = await fastify.prisma.company.update({
      where: { id: companyId },
      data,
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    })
    return company
  })

  // POST /company/pix — salva chave PIX da empresa
  fastify.post('/pix', async (request, reply) => {
    let { companyId } = request.user

    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id }
      })
      companyId = user.companyId
    }

    if (!companyId) return reply.code(404).send({ error: 'Empresa não encontrada' })

    const { pixKey } = request.body

    if (!pixKey || !pixKey.trim()) {
      return reply.code(400).send({ error: 'Chave PIX é obrigatória' })
    }

    const company = await fastify.prisma.company.update({
      where: { id: companyId },
      data: {
        pixKey: pixKey.trim(),
        updatedAt: new Date()
      }
    })
    return company
  })

  // GET /company/plans — lista planos disponíveis (com limite de propostas do usuário)
  fastify.get('/plans', async (request, reply) => {
    const plans = await fastify.prisma.plan.findMany({
      orderBy: { price: 'asc' }
    })
    return plans
  })

  // POST /company/subscribe — associa empresa a um plano
  fastify.post('/subscribe', async (request, reply) => {
    let { companyId } = request.user

    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id }
      })
      companyId = user.companyId
    }

    if (!companyId) return reply.code(404).send({ error: 'Empresa não encontrada' })

    const { planId } = request.body

    if (!planId) {
      return reply.code(400).send({ error: 'Plano é obrigatório' })
    }

    const plan = await fastify.prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) return reply.code(404).send({ error: 'Plano não encontrado' })

    const subscription = await fastify.prisma.subscription.upsert({
      where: { companyId },
      update: {
        planId,
        status: 'ACTIVE',
        startsAt: new Date(),
        endsAt: null,
        stripeSubscriptionId: null
      },
      create: {
        companyId,
        planId,
        status: plan.price === 0 ? 'ACTIVE' : 'TRIALING',
        startsAt: new Date(),
        endsAt: plan.price === 0 ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias trial
      }
    })
    return subscription
  })

  // ── ROTAS DE LOGO (UPLOAD/DELETE) ──────────────────────────────────────────

  // POST /company/logo — upload de logotipo
  fastify.post('/logo', async (request, reply) => {
    const companyId = getCompanyId(request, reply)
    if (!companyId || reply.sent) return

    try {
      const data = await request.file()
      if (!data) {
        return reply.code(400).send({ error: 'Nenhum arquivo enviado' })
      }

      const { filename, mimetype, file } = data

      // Validar tipo
      if (!ALLOWED_TYPES.includes(mimetype)) {
        await file.destroy()
        return reply.code(400).send({ error: `Tipo não permitido. Aceitos: ${ALLOWED_TYPES.join(', ')}` })
      }

      // Ler buffer completo (validar tamanho)
      const chunks = []
      for await (const chunk of file) {
        chunks.push(chunk)
        if (Buffer.concat(chunks).length > MAX_FILE_SIZE) {
          await file.destroy()
          return reply.code(400).send({ error: 'Arquivo muito grande. Máximo 5MB.' })
        }
      }
      const buffer = Buffer.concat(chunks)

      // Em serverless, salvar como base64 no banco (sem sistema de arquivos persistente)
      if (isServerless) {
        const base64 = buffer.toString('base64')
        const dataUrl = `data:${mimetype};base64,${base64}`

        await fastify.prisma.company.update({
          where: { id: companyId },
          data: {
            logoUrl: dataUrl,
            logoType: 'uploaded',
            updatedAt: new Date()
          }
        })

        return reply.code(200).send({ logoUrl: dataUrl, logoType: 'uploaded', message: 'Logo atualizada com sucesso' })
      }

      // Em ambiente local/VM, salvar em disco
      const ext = path.extname(filename || '.png')
      const hash = crypto.randomBytes(8).toString('hex')
      const savedFilename = `logo_${companyId}_${hash}${ext}`
      const filePath = path.join(UPLOAD_DIR, savedFilename)

      fs.writeFileSync(filePath, buffer)

      const logoUrl = `/uploads/logos/${savedFilename}`

      await fastify.prisma.company.update({
        where: { id: companyId },
        data: {
          logoUrl,
          logoType: 'uploaded',
          updatedAt: new Date()
        }
      })

      return reply.code(200).send({ logoUrl, logoType: 'uploaded', message: 'Logo atualizada com sucesso' })
    } catch (err) {
      fastify.log.error({ err }, 'Erro no upload de logo')
      return reply.code(500).send({ error: 'Erro ao processar upload de logo' })
    }
  })

  // DELETE /company/logo — remover logotipo
  fastify.delete('/logo', async (request, reply) => {
    const companyId = getCompanyId(request, reply)
    if (!companyId || reply.sent) return

    try {
      const company = await fastify.prisma.company.findUnique({ where: { id: companyId } })
      if (!company?.logoUrl) {
        return reply.code(400).send({ error: 'Nenhuma logo para remover' })
      }

      // Em serverless, não há arquivo para deletar (está em base64 no banco)
      if (!isServerless) {
        const filePath = path.join(UPLOAD_DIR, path.basename(company.logoUrl))
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }

      await fastify.prisma.company.update({
        where: { id: companyId },
        data: { logoUrl: null, logoType: null, updatedAt: new Date() }
      })

      return reply.code(200).send({ message: 'Logo removida com sucesso' })
    } catch (err) {
      fastify.log.error({ err }, 'Erro ao remover logo')
      return reply.code(500).send({ error: 'Erro ao remover logo' })
    }
  })
}