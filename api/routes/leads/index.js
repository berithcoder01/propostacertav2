// Rotas: /leads
// CRUD completo de leads (prospecção) com filtros geográficos e por segmento

async function generateLeadId(prisma) {
  const count = await prisma.lead.count()
  return `LD-${String(count + 1).padStart(6, '0')}`
}

export default async function (fastify, opts) {
  // Registrar submódulos de rotas
  fastify.register((await import('./ai.js')).default, { prefix: '/ai' })
  fastify.register((await import('./dispatches.js')).default, { prefix: '/dispatches' })
  fastify.register((await import('./relatory.js')).default, { prefix: '/relatory' })
  fastify.register((await import('./scrape.js')).default, { prefix: '/scrape' })
  fastify.register((await import('./proposal.js')).default, { prefix: '/:id' })
  
  // GET /leads — lista com filtros
  fastify.get('/', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { status, segment, source, page = 1, limit = 50, lat, lng, radius } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const where = { companyId }

    if (status) where.status = status
    if (segment) where.segment = segment
    if (source) where.source = source

    const [leads, total] = await fastify.prisma.$transaction([
      fastify.prisma.lead.findMany({
        where,
        include: { company: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      fastify.prisma.lead.count({ where })
    ])

    return { leads, total, page: parseInt(page), limit: parseInt(limit) }
  })

  // GET /leads/:id
  fastify.get('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const lead = await fastify.prisma.lead.findFirst({
      where: { id, companyId },
      include: { company: true }
    })
    if (!lead) return reply.notFound()
    return lead
  })

  // POST /leads
  fastify.post('/', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const {
      name, email, phone, whatsapp, address, city, state,
      lat, lng, segment, source, status, distanceKm, metadata, notes
    } = request.body

    if (!name) return reply.code(400).send({ error: 'Nome do lead é obrigatório' })

    const lead = await fastify.prisma.lead.create({
      data: {
        companyId,
        name,
        email: email || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        address: address || null,
        city: city || null,
        state: state || null,
        lat: lat || null,
        lng: lng || null,
        segment: segment || 'RESIDENCIAL',
        source: source || 'MANUAL',
        status: status || 'NEW',
        distanceKm: distanceKm || null,
        metadata: metadata || null,
        notes: notes || null,
      },
      include: { company: true }
    })

    return reply.code(201).send(lead)
  })

  // PUT /leads/:id
  fastify.put('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const exists = await fastify.prisma.lead.findFirst({ where: { id, companyId } })
    if (!exists) return reply.notFound()

    const {
      name, email, phone, whatsapp, address, city, state,
      lat, lng, segment, source, status, distanceKm, metadata, notes
    } = request.body

    const lead = await fastify.prisma.lead.update({
      where: { id },
      data: {
        name: name || exists.name,
        email: email !== undefined ? email : exists.email,
        phone: phone !== undefined ? phone : exists.phone,
        whatsapp: whatsapp !== undefined ? whatsapp : exists.whatsapp,
        address: address !== undefined ? address : exists.address,
        city: city || exists.city,
        state: state || exists.state,
        lat: lat !== undefined ? lat : exists.lat,
        lng: lng !== undefined ? lng : exists.lng,
        segment: segment || exists.segment,
        source: source || exists.source,
        status: status || exists.status,
        distanceKm: distanceKm !== undefined ? distanceKm : exists.distanceKm,
        metadata: metadata !== undefined ? metadata : exists.metadata,
        notes: notes !== undefined ? notes : exists.notes,
      },
      include: { company: true }
    })

    return lead
  })

  // PATCH /leads/:id/status
  fastify.patch('/:id/status', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params
    const { status } = request.body

    const VALID = ['NEW', 'CONTACTED', 'NEGOTIATING', 'DISCARDED', 'CONVERTED']
    if (!VALID.includes(status)) {
      return reply.code(400).send({ error: `Status inválido. Valores aceitos: ${VALID.join(', ')}` })
    }

    const exists = await fastify.prisma.lead.findFirst({ where: { id, companyId } })
    if (!exists) return reply.notFound()

    const updated = await fastify.prisma.lead.update({
      where: { id },
      data: { status }
    })
    return updated
  })

  // DELETE /leads/:id
  fastify.delete('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params
    const exists = await fastify.prisma.lead.findFirst({ where: { id, companyId } })
    if (!exists) return reply.notFound()
    await fastify.prisma.lead.delete({ where: { id } })
    return reply.code(204).send()
  })

  // POST /leads/bulk — criação em lote (para importação ou scraping)
  fastify.post('/bulk', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { leads: leadsData } = request.body
    if (!Array.isArray(leadsData) || leadsData.length === 0) {
      return reply.code(400).send({ error: 'Array de leads vazio' })
    }

    const created = []
    for (const l of leadsData) {
      if (!l.name) continue
      const lead = await fastify.prisma.lead.create({
        data: {
          companyId,
          name: l.name,
          email: l.email || null,
          phone: l.phone || null,
          whatsapp: l.whatsapp || null,
          address: l.address || null,
          city: l.city || null,
          state: l.state || null,
          lat: l.lat || null,
          lng: l.lng || null,
          segment: l.segment || 'RESIDENCIAL',
          source: l.source || 'MANUAL',
          status: l.status || 'NEW',
          distanceKm: l.distanceKm || null,
          metadata: l.metadata || null,
          notes: l.notes || null,
        }
      })
      created.push(lead)
    }

    return reply.code(201).send({ created: created.length, leads: created })
  })
}