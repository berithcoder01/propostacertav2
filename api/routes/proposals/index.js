// Rotas: /proposals
// CRUD completo de propostas comerciais + compartilhamento + duplicação + análise de lucratividade

async function generateNumber(prisma, companyId) {
  const year = new Date().getFullYear()
  const count = await prisma.proposal.count({
    where: {
      companyId,
      createdAt: { gte: new Date(`${year}-01-01`) }
    }
  })
  const seq = String(count + 1).padStart(3, '0')
  return `${year}-${seq}`
}

export default async function (fastify, opts) {
  // GET /proposals
  fastify.get('/', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { status, clientId, page = 1, limit = 20 } = request.query

    // ── Lazy expiration routine ──
    const sentProposals = await fastify.prisma.proposal.findMany({
      where: { companyId, status: 'SENT' },
      include: { conditions: true }
    })

    const now = new Date()
    const expiredIds = []

    for (const p of sentProposals) {
      if (p.conditions && p.conditions.validityDays) {
        const validUntil = new Date(p.createdAt)
        validUntil.setDate(validUntil.getDate() + p.conditions.validityDays)
        if (now > validUntil) {
          expiredIds.push(p.id)
        }
      }
    }

    if (expiredIds.length > 0) {
      await fastify.prisma.$transaction(
        expiredIds.map(id => fastify.prisma.proposal.update({
          where: { id },
          data: { status: 'EXPIRED' }
        }))
      )
      await fastify.prisma.proposalStatusLog.createMany({
        data: expiredIds.map(id => ({
          proposalId: id,
          fromStatus: 'SENT',
          toStatus: 'EXPIRED'
        }))
      })
    }
    // ─────────────────────────────

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const where = { companyId }
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    const [proposals, total] = await fastify.prisma.$transaction([
      fastify.prisma.proposal.findMany({
        where,
        include: { items: true, conditions: true, client: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      fastify.prisma.proposal.count({ where })
    ])

    return { proposals, total, page: parseInt(page), limit: parseInt(limit) }
  })

  // GET /proposals/next-number
  fastify.get('/next-number', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const nextNumber = await generateNumber(fastify.prisma, companyId)
    return { number: nextNumber }
  })

  // --- Modelos de Proposta (Templates) ---
  fastify.get('/templates', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const templates = await fastify.prisma.proposalTemplate.findMany({
      where: { companyId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }]
    })

    return { templates }
  })

  fastify.post('/templates', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { name, level = 'CUSTOM', isDefault = false, sections, defaults, customFields, wording } = request.body
    if (!name) return reply.code(400).send({ error: 'Nome do modelo é obrigatório' })

    if (isDefault) {
      await fastify.prisma.proposalTemplate.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false }
      })
    }

    const template = await fastify.prisma.proposalTemplate.create({
      data: {
        companyId, name, level, isDefault,
        sections: sections || {},
        defaults: defaults || null,
        customFields: customFields || null,
        wording: wording || null,
      }
    })
    return reply.code(201).send(template)
  })

  fastify.put('/templates/:templateId', async (request, reply) => {
    const { companyId } = request.user
    const { templateId } = request.params

    const exists = await fastify.prisma.proposalTemplate.findFirst({ where: { id: templateId, companyId } })
    if (!exists) return reply.notFound()

    const { name, level, isDefault, sections, defaults, customFields, wording } = request.body
    const data = {}
    if (name !== undefined) data.name = name
    if (level !== undefined) data.level = level
    if (isDefault !== undefined) data.isDefault = isDefault
    if (sections !== undefined) data.sections = sections
    if (defaults !== undefined) data.defaults = defaults
    if (customFields !== undefined) data.customFields = customFields
    if (wording !== undefined) data.wording = wording

    if (isDefault) {
      await fastify.prisma.proposalTemplate.updateMany({
        where: { companyId, isDefault: true, id: { not: templateId } },
        data: { isDefault: false }
      })
    }

    const template = await fastify.prisma.proposalTemplate.update({ where: { id: templateId }, data })
    return template
  })

  fastify.delete('/templates/:templateId', async (request, reply) => {
    const { companyId } = request.user
    const { templateId } = request.params

    const exists = await fastify.prisma.proposalTemplate.findFirst({ where: { id: templateId, companyId } })
    if (!exists) return reply.notFound()

    const count = await fastify.prisma.proposalTemplate.count({ where: { companyId } })
    if (count <= 1) return reply.code(400).send({ error: 'Não é possível remover o último modelo' })

    await fastify.prisma.proposalTemplate.delete({ where: { id: templateId } })
    return reply.code(204).send()
  })

  fastify.patch('/templates/:templateId/set-default', async (request, reply) => {
    const { companyId } = request.user
    const { templateId } = request.params

    const exists = await fastify.prisma.proposalTemplate.findFirst({ where: { id: templateId, companyId } })
    if (!exists) return reply.notFound()

    await fastify.prisma.$transaction([
      fastify.prisma.proposalTemplate.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false }
      }),
      fastify.prisma.proposalTemplate.update({
        where: { id: templateId },
        data: { isDefault: true }
      })
    ])

    return { success: true, templateId }
  })

  // GET /proposals/:id
  fastify.get('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const proposal = await fastify.prisma.proposal.findFirst({
      where: { id, companyId },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        conditions: true,
        client: true,
        company: true
      }
    })
    if (!proposal) return reply.notFound()
    return proposal
  })

  // POST /proposals
  fastify.post('/', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const {
      clientId,
      clientName, clientContact, clientRole, clientLocation, clientPhone,
      number, title, object,
      items = [],
      conditions,
      segmentData,
      metadata,
      status,
      templateId
    } = request.body

    if (!clientName || !clientLocation) {
      return reply.code(400).send({ error: 'Nome do cliente e local são obrigatórios' })
    }

    const proposalNumber = number || await generateNumber(fastify.prisma, companyId)
    const total = items.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0)

    // Verificar disponibilidade de estoque para produtos
    const stockErrors = []
    for (const item of items) {
      if (item.isProduct && item.catalogId) {
        const catalogItem = await fastify.prisma.catalogItem.findUnique({ where: { id: item.catalogId } })
        if (catalogItem) {
          const available = catalogItem.stockQuantity - catalogItem.stockReserved
          const requested = parseInt(item.quantity) || 0
          if (requested > available) {
            stockErrors.push({
              itemId: item.catalogId,
              description: catalogItem.description,
              available,
              requested
            })
          }
        }
      }
    }
    if (stockErrors.length > 0) {
      return reply.code(400).send({ error: 'Estoque insuficiente', details: stockErrors })
    }

    // Se status é APPROVED, decrementar estoque imediatamente
    const isApproved = status === 'APPROVED'
    const stockUpdates = []
    if (isApproved) {
      for (const item of items) {
        if (item.isProduct && item.catalogId) {
          const qty = parseInt(item.quantity) || 0
          if (qty > 0) {
            stockUpdates.push(
              fastify.prisma.catalogItem.update({
                where: { id: item.catalogId },
                data: { stockQuantity: { decrement: qty } }
              })
            )
          }
        }
      }
    }

    const proposal = await fastify.prisma.$transaction(async (tx) => {
      const created = await tx.proposal.create({
        data: {
          companyId,
          clientId,
          templateId,
          number: proposalNumber,
          title,
          object,
          status: status || 'DRAFT',
          total,
          clientName,
          clientContact: clientContact || '',
          clientRole,
          clientLocation,
          clientPhone,
          segmentData,
          metadata,
          items: {
            create: items.map((item, idx) => ({
              catalogId: item.catalogId || null,
              label: item.label || item.description,
              unit: item.unit,
              quantity: parseFloat(item.quantity) || 0,
              unitPrice: parseFloat(item.unitPrice) || parseFloat(item.price) || 0,
              subtotal: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || parseFloat(item.price) || 0),
              notes: item.notes,
              category: item.category || 'SERVICO',
              isProduct: item.isProduct || false,
              stockReserved: item.isProduct ? (parseInt(item.quantity) || 0) : 0,
              sortOrder: idx
            }))
          },
          ...(conditions && {
            conditions: {
              create: {
                downPayment: parseFloat(conditions.downPayment) || 0,
                downPaymentDays: parseInt(conditions.downPaymentDays) || 0,
                measurementDays: parseInt(conditions.measurementDays) || 0,
                paymentNfDays: parseInt(conditions.paymentNfDays) || 0,
                validityDays: parseInt(conditions.validityDays) || 60,
                executionPeriod: conditions.executionPeriod,
                paymentTerms: conditions.paymentTerms,
                observations: conditions.observations,
                warrantyPeriod: parseInt(conditions.warrantyPeriod) || 5,
                warrantyType: conditions.warrantyType || 'ANOS',
              }
            }
          })
        },
        include: { items: true, conditions: true }
      })

      // Executar atualizações de estoque se aprovado
      if (stockUpdates.length > 0) {
        await Promise.all(stockUpdates.map(update => update))
      }

      return created
    })

    return reply.code(201).send(proposal)
  })

  // PUT /proposals/:id
  fastify.put('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const exists = await fastify.prisma.proposal.findFirst({ where: { id, companyId }, include: { items: true } })
    if (!exists) return reply.notFound()

    const {
      clientId,
      clientName, clientContact, clientRole, clientLocation, clientPhone,
      number, title, object,
      items,
      conditions,
      segmentData,
      metadata,
      status,
      templateId
    } = request.body

    const total = items
      ? items.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || parseFloat(i.price) || 0), 0)
      : exists.total

    // Calcular diferença de estoque se items mudaram e proposta estava aprovada
    const stockAdjustments = []
    if (items !== undefined && exists.status === 'APPROVED') {
      // Liberar estoque dos items antigos
      for (const oldItem of exists.items) {
        if (oldItem.isProduct && oldItem.catalogId && oldItem.stockReserved > 0) {
          stockAdjustments.push(
            fastify.prisma.catalogItem.update({
              where: { id: oldItem.catalogId },
              data: { stockQuantity: { increment: oldItem.stockReserved } }
            })
          )
        }
      }
      // Reservar estoque dos novos items
      if (items) {
        for (const item of items) {
          if (item.isProduct && item.catalogId) {
            const qty = parseInt(item.quantity) || 0
            if (qty > 0) {
              stockAdjustments.push(
                fastify.prisma.catalogItem.update({
                  where: { id: item.catalogId },
                  data: { stockQuantity: { decrement: qty } }
                })
              )
            }
          }
        }
      }
    }

    if (items !== undefined) {
      await fastify.prisma.proposalItem.deleteMany({ where: { proposalId: id } })
    }
    if (conditions !== undefined) {
      await fastify.prisma.commercialConditions.deleteMany({ where: { proposalId: id } })
    }

    const proposal = await fastify.prisma.$transaction(async (tx) => {
      const updated = await tx.proposal.update({
        where: { id },
        data: {
          clientId,
          templateId,
          number,
          title,
          object,
          total,
          status,
          clientName,
          clientContact,
          clientRole,
          clientLocation,
          clientPhone,
          segmentData,
          metadata,
          ...(items && {
            items: {
              create: items.map((item, idx) => ({
                catalogId: item.catalogId || null,
                label: item.label || item.description,
                unit: item.unit,
                quantity: parseFloat(item.quantity) || 0,
                unitPrice: parseFloat(item.unitPrice) || parseFloat(item.price) || 0,
                subtotal: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || parseFloat(item.price) || 0),
                notes: item.notes,
                category: item.category || 'SERVICO',
                isProduct: item.isProduct || false,
                stockReserved: item.isProduct ? (parseInt(item.quantity) || 0) : 0,
                sortOrder: idx
              }))
            }
          }),
          ...(conditions && {
            conditions: {
              create: {
                downPayment: parseFloat(conditions.downPayment) || 0,
                downPaymentDays: parseInt(conditions.downPaymentDays) || 0,
                measurementDays: parseInt(conditions.measurementDays) || 0,
                paymentNfDays: parseInt(conditions.paymentNfDays) || 0,
                validityDays: parseInt(conditions.validityDays) || 60,
                executionPeriod: conditions.executionPeriod,
                paymentTerms: conditions.paymentTerms,
                observations: conditions.observations,
                warrantyPeriod: parseInt(conditions.warrantyPeriod) || 5,
                warrantyType: conditions.warrantyType || 'ANOS',
              }
            }
          })
        },
        include: { items: { orderBy: { sortOrder: 'asc' } }, conditions: true }
      })

      if (stockAdjustments.length > 0) {
        await Promise.all(stockAdjustments.map(adj => adj))
      }

      return updated
    })

    return proposal
  })

  // ANÁLISE DE LUCRATIVIDADE (Bloco 2 - IA Core)
  // GET /proposals/:id/profitability
  fastify.get('/:id/profitability', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { id } = request.params
    const proposal = await fastify.prisma.proposal.findFirst({
      where: { id, companyId },
      include: { items: { orderBy: { sortOrder: 'asc' } }, conditions: true, company: true }
    })
    if (!proposal) return reply.notFound('Proposta não encontrada')

    const items = proposal.items || []
    const totalProposta = proposal.total || 0

    // Estimativa de custos: 60% do preço de venda como custo base
    const custoEstimadoItens = items.reduce((sum, i) => {
      return sum + (parseFloat(i.unitPrice) || 0) * 0.6 * (parseFloat(i.quantity) || 0)
    }, 0)

    const estimativaEncargos = totalProposta * 0.12
    const custosTotais = custoEstimadoItens + estimativaEncargos

    const margemBruta = totalProposta > 0
      ? ((totalProposta - custoEstimadoItens) / totalProposta) * 100 : 0
    const margemLiquida = totalProposta > 0
      ? ((totalProposta - custosTotais) / totalProposta) * 100 : 0

    const analiseItens = items.map(item => {
      const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
      return {
        itemId: item.id, label: item.label, quantity: item.quantity,
        unit: item.unit, unitPrice: item.unitPrice, subtotal,
        custoEstimado: parseFloat((subtotal * 0.6).toFixed(2)),
        margemItem: subtotal > 0 ? 40.0 : 0
      }
    })

    const alertas = []
    if (margemBruta > 0 && margemBruta < 20)
      alertas.push({ tipo: 'warning', mensagem: `Margem bruta de ${margemBruta.toFixed(1)}% abaixo do recomendado`, severidade: 'medium' })
    if (margemLiquida > 0 && margemLiquida < 15)
      alertas.push({ tipo: 'danger', mensagem: `Margem líquida de ${margemLiquida.toFixed(1)}% - revise preços`, severidade: 'high' })
    if (items.length === 0)
      alertas.push({ tipo: 'info', mensagem: 'Nenhum item na proposta.', severidade: 'medium' })

    let score = 0
    if (items.length > 0) score += 20
    if (proposal.conditions?.warrantyPeriod) score += 10
    if (proposal.object?.length > 10) score += 10
    if (proposal.clientPhone) score += 10
    if (proposal.clientEmail) score += 10
    if (margemBruta >= 30) score += 20
    else if (margemBruta >= 20) score += 10

    return reply.code(200).send({
      propostaId: proposal.id, numero: proposal.number,
      cliente: proposal.clientName, total: totalProposta,
      custoTotal: parseFloat(custosTotais.toFixed(2)),
      margemBruta: parseFloat(margemBruta.toFixed(1)),
      margemLiquida: parseFloat(margemLiquida.toFixed(1)),
      estimativaEncargos: parseFloat(estimativaEncargos.toFixed(2)),
      totalItens: items.length, analiseItens, alertas, score,
      classificacao: score >= 70 ? 'Excelente' : score >= 50 ? 'Boa' : score >= 30 ? 'Razoável' : 'Precisa de atenção'
    })
  })

  // PATCH /proposals/:id/status
  fastify.patch('/:id/status', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params
    const { status } = request.body

    const VALID = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED']
    if (!VALID.includes(status)) {
      return reply.code(400).send({ error: `Status inválido. Valores aceitos: ${VALID.join(', ')}` })
    }

    const exists = await fastify.prisma.proposal.findFirst({ where: { id, companyId }, include: { items: true } })
    if (!exists) return reply.notFound()

    if (exists.status !== status) {
      const stockAdjustments = []

      // Se mudando para APPROVED: validar e decrementar estoque dos produtos
      if (status === 'APPROVED' && exists.status !== 'APPROVED') {
        // Re-validar disponibilidade de estoque antes de aprovar
        const stockErrors = []
        for (const item of exists.items) {
          if (item.isProduct && item.catalogId && item.stockReserved > 0) {
            const catalogItem = await fastify.prisma.catalogItem.findUnique({ where: { id: item.catalogId } })
            if (catalogItem) {
              const available = catalogItem.stockQuantity
              const requested = item.stockReserved
              if (requested > available) {
                stockErrors.push({
                  itemId: item.catalogId,
                  description: catalogItem.description,
                  available,
                  requested
                })
              }
            }
          }
        }
        if (stockErrors.length > 0) {
          return reply.code(400).send({ error: 'Estoque insuficiente para aprovação', details: stockErrors })
        }

        for (const item of exists.items) {
          if (item.isProduct && item.catalogId && item.stockReserved > 0) {
            stockAdjustments.push(
              fastify.prisma.catalogItem.update({
                where: { id: item.catalogId },
                data: { stockQuantity: { decrement: item.stockReserved } }
              })
            )
          }
        }
      }

      // Se mudando de APPROVED para REJECTED/EXPIRED: liberar estoque
      if (exists.status === 'APPROVED' && (status === 'REJECTED' || status === 'EXPIRED')) {
        for (const item of exists.items) {
          if (item.isProduct && item.catalogId && item.stockReserved > 0) {
            stockAdjustments.push(
              fastify.prisma.catalogItem.update({
                where: { id: item.catalogId },
                data: { stockQuantity: { increment: item.stockReserved } }
              })
            )
          }
        }
      }

      const [updated] = await fastify.prisma.$transaction(async (tx) => {
        const result = await tx.proposal.update({ where: { id }, data: { status } })
        await tx.proposalStatusLog.create({
          data: { proposalId: id, fromStatus: exists.status, toStatus: status }
        })
        if (stockAdjustments.length > 0) {
          await Promise.all(stockAdjustments.map(adj => adj))
        }
        return [result]
      })
      return updated
    }
    return exists
  })

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
    const proposalForFormatter = {
      ...proposal,
      conditions: proposal.conditions, // Prisma retorna como objeto único (1:1)
      items: proposal.items || [],
    }

    // Gera a mensagem formatada usando o novo motor
    const { formatProposalForWhatsApp } = await import('../../lib/whatsappProposalFormatter.js')
    const msg = formatProposalForWhatsApp(proposalForFormatter, proposal.company)

    // Monta o link WhatsApp
    const phone = proposal.clientPhone ? proposal.clientPhone.replace(/\D/g, '') : ''
    const waUrl = phone
      ? `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`

    return reply.send({ waUrl, shareUrl, msg })
  })

  // POST /proposals/:id/duplicate
  fastify.post('/:id/duplicate', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const original = await fastify.prisma.proposal.findFirst({
      where: { id, companyId },
      include: { items: true, conditions: true }
    })
    if (!original) return reply.notFound()

    const nextNumber = await generateNumber(fastify.prisma, companyId)
    const copy = await fastify.prisma.proposal.create({
      data: {
        companyId,
        clientId: original.clientId,
        templateId: original.templateId,
        number: nextNumber,
        title: original.title ? `${original.title} (Cópia)` : null,
        object: original.object,
        total: original.total,
        status: 'DRAFT',
        clientName: original.clientName,
        clientContact: original.clientContact,
        clientRole: original.clientRole,
        clientLocation: original.clientLocation,
        clientPhone: original.clientPhone,
        segmentData: original.segmentData,
        metadata: original.metadata,
        items: {
          create: original.items.map(item => ({
            catalogId: item.catalogId, label: item.label, unit: item.unit,
            quantity: item.quantity, unitPrice: item.unitPrice,
            subtotal: item.subtotal, notes: item.notes,
            category: item.category, sortOrder: item.sortOrder,
            isProduct: item.isProduct || false,
            stockReserved: item.stockReserved || 0,
          }))
        },
        ...(original.conditions && {
          conditions: {
            create: {
              downPayment: original.conditions.downPayment,
              downPaymentDays: original.conditions.downPaymentDays,
              measurementDays: original.conditions.measurementDays,
              paymentNfDays: original.conditions.paymentNfDays,
              validityDays: original.conditions.validityDays,
              executionPeriod: original.conditions.executionPeriod,
              paymentTerms: original.conditions.paymentTerms,
              observations: original.conditions.observations,
              warrantyPeriod: original.conditions.warrantyPeriod || 5,
              warrantyType: original.conditions.warrantyType || 'ANOS',
            }
          }
        })
      },
      include: { items: true, conditions: true }
    })
    return reply.code(201).send(copy)
  })

  // DELETE /proposals/:id
  fastify.delete('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params
    const exists = await fastify.prisma.proposal.findFirst({ where: { id, companyId }, include: { items: true } })
    if (!exists) return reply.notFound()

    // Se proposta estava aprovada, liberar estoque
    if (exists.status === 'APPROVED') {
      const stockReleases = []
      for (const item of exists.items) {
        if (item.isProduct && item.catalogId && item.stockReserved > 0) {
          stockReleases.push(
            fastify.prisma.catalogItem.update({
              where: { id: item.catalogId },
              data: { stockQuantity: { increment: item.stockReserved } }
            })
          )
        }
      }
      if (stockReleases.length > 0) {
        await Promise.all(stockReleases.map(rel => rel))
      }
    }

    await fastify.prisma.proposal.delete({ where: { id } })
    return reply.code(204).send()
  })
}