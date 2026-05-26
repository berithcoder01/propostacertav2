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

  // GET /leads/curated — leads processados pela IA com mensagem personalizada
  // Retorna leads com status NEW ou CONTACTED, ordenados por relevância
  fastify.get('/curated', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { segment, city, minScore = 0 } = request.query
    
    const where = { 
      companyId,
      status: { in: ['NEW', 'CONTACTED'] },
      processedByAI: true
    }
    if (segment) where.segment = segment
    if (city) where.city = { contains: city, mode: 'insensitive' }

    const leads = await fastify.prisma.lead.findMany({
      where,
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50
    })

    // Formata os leads para o frontend
    const curatedLeads = leads
      .filter(l => l.score >= parseInt(minScore))
      .map(lead => ({
        ...lead,
        nome_limpo: lead.nomeLimpo || lead.name,
        nome: lead.name,
        segmento: lead.segmentoDetectado || lead.segment,
        mensagem_personalizada: lead.mensagemPersonalizada,
        descricao: lead.motivoMatch || lead.notes,
        motivo_match: lead.motivoMatch
      }))

    return { leads: curatedLeads, total: curatedLeads.length }
  })

  // POST /leads/sync — Sincroniza leads do LeadsOn para PropostaCerta
  fastify.post('/sync', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    try {
      // Busca perfil de prospecção para calcular scores
      const profile = await fastify.prisma.prospectingProfile.findUnique({
        where: { companyId }
      })

      // URL do LeadsOn (configurável via env)
      const leadsonUrl = process.env.LEADSON_API_URL || 'http://localhost:3001'
      const lastSyncAt = request.body.lastSyncAt || null
      
      const response = await fetch(`${leadsonUrl}/api/leads/sync?limit=100${lastSyncAt ? `&lastSyncAt=${lastSyncAt}` : ''}`)
      
      if (!response.ok) {
        return reply.code(502).send({ error: 'Falha ao conectar com LeadsOn' })
      }

      const data = await response.json()
      let imported = 0
      let skipped = 0

      for (const leadOnLead of data.leads) {
        // Verifica se já existe (por whatsapp ou nome+cidade)
        const existing = await fastify.prisma.lead.findFirst({
          where: {
            companyId,
            OR: [
              leadOnLead.whatsapp ? { whatsapp: leadOnLead.whatsapp } : {},
              { name: leadOnLead.nome_limpo_ia || leadOnLead.nome_original, city: leadOnLead.cidade }
            ].filter(Boolean)
          }
        })

        if (existing) {
          skipped++
          continue
        }

        // Calcula score baseado no perfil de prospecção
        let score = 50 // Base score
        if (profile) {
          // Match de segmento
          const idealTypes = profile.idealCustomerTypes || []
          const leadSegment = leadOnLead.segmento?.toUpperCase() || 'RESIDENCIAL'
          
          // Mapeia segmentos do LeadsOn para tipos ideais
          const segmentMap = {
            'PINTOR': 'RESIDENCIAL',
            'ELETRICISTA': 'RESIDENCIAL',
            'CONDOMÍNIO': 'CONDOMINIO',
            'CONDOMINIO': 'CONDOMINIO',
            'COMÉRCIO': 'COMERCIAL',
            'INDÚSTRIA': 'INDUSTRIAL'
          }
          
          const mappedSegment = segmentMap[leadSegment] || leadSegment
          if (idealTypes.includes(mappedSegment)) {
            score += 20
          }
          
          // Match de cidade
          if (profile.targetAudienceDesc && leadOnLead.cidade) {
            const cityMatch = profile.targetAudienceDesc.toLowerCase().includes(leadOnLead.cidade.toLowerCase())
            if (cityMatch) score += 15
          }
          
          // Bonus por ter mensagem personalizada da IA
          if (leadOnLead.mensagem_personalizada) score += 15
        }

        // Cria o lead no PropostaCerta
        await fastify.prisma.lead.create({
          data: {
            companyId,
            name: leadOnLead.nome_limpo_ia || leadOnLead.nome_original,
            whatsapp: leadOnLead.whatsapp || null,
            city: leadOnLead.cidade || null,
            state: leadOnLead.estado || null,
            segment: (leadOnLead.segmento || 'RESIDENCIAL').toUpperCase(),
            source: 'GOOGLE_PLACES',
            status: 'NEW',
            score: Math.min(99, score),
            mensagemPersonalizada: leadOnLead.mensagem_personalizada || null,
            motivoMatch: profile?.targetAudienceDesc ? `Compatível com: ${profile.targetAudienceDesc}` : null,
            processedByAI: true,
            aiProcessingMethod: 'ollama',
            nomeLimpo: leadOnLead.nome_limpo_ia || null,
            segmentoDetectado: leadOnLead.segmento || null,
            notes: leadOnLead.conteudo_markdown || null,
            metadata: {
              instagram: leadOnLead.instagram,
              website: leadOnLead.website,
              leadsonId: leadOnLead.id,
              syncedAt: new Date().toISOString()
            }
          }
        })

        imported++
      }

      return {
        synced: true,
        imported,
        skipped,
        total: data.total,
        syncedAt: data.syncedAt
      }
    } catch (err) {
      fastify.log.error({ err }, 'Erro no sync com LeadsOn')
      return reply.code(500).send({ error: 'Erro ao sincronizar leads', details: err.message })
    }
  })
}