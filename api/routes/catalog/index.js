'use strict';

import { CATALOG_SEEDS } from '../../lib/catalogSeeds.js'

// Rotas: /catalog
// Catálogo de itens da empresa + seed por segmento + busca semântica

export default async function (fastify, opts) {
  // GET /catalog — lista itens do catálogo da empresa
  fastify.get('/', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { isProduct, category, search } = request.query
    const where = { companyId, active: true }

    if (isProduct !== undefined) where.isProduct = isProduct === 'true'
    if (category) where.category = category
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }

    const items = await fastify.prisma.catalogItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { description: 'asc' }]
    })
    return items
  })

  // POST /catalog — cria item no catálogo
  fastify.post('/', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { code, description, unit, category, defaultPrice, notes, isProduct, stockQuantity, minStock, imageUrl } = request.body

    if (!description || !unit) {
      return reply.code(400).send({ error: 'Descrição e unidade são obrigatórios' })
    }

    const item = await fastify.prisma.catalogItem.create({
      data: {
        companyId,
        code, description, unit,
        category: category || 'SERVICO',
        defaultPrice: defaultPrice ? parseFloat(defaultPrice) : null,
        notes,
        isProduct: isProduct || false,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : 0,
        minStock: minStock !== undefined ? parseInt(minStock) : 5,
        imageUrl: imageUrl || null,
      }
    })

    return reply.code(201).send(item)
  })

  // PUT /catalog/:id — atualiza item
  fastify.put('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const item = await fastify.prisma.catalogItem.findFirst({ where: { id, companyId } })
    if (!item) return reply.notFound()

    const data = { ...request.body }
    delete data.id
    delete data.companyId

    if (data.stockQuantity !== undefined) data.stockQuantity = Math.max(0, parseInt(data.stockQuantity))
    if (data.minStock !== undefined) data.minStock = Math.max(0, parseInt(data.minStock))

    const updated = await fastify.prisma.catalogItem.update({ where: { id }, data })
    return updated
  })

  // DELETE /catalog/:id — inativa item (soft delete)
  fastify.delete('/:id', async (request, reply) => {
    const { companyId } = request.user
    const { id } = request.params

    const item = await fastify.prisma.catalogItem.findFirst({ where: { id, companyId } })
    if (!item) return reply.notFound()

    await fastify.prisma.catalogItem.update({ where: { id }, data: { active: false } })
    return reply.code(204).send()
  })

  // POST /catalog/seed — popula catálogo padrão do segmento
  fastify.post('/seed', async (request, reply) => {
    let { companyId } = request.user
    
    // Fallback: se o token for antigo e não tiver companyId, busca no banco
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id }
      })
      companyId = user.companyId
    }

    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const company = await fastify.prisma.company.findUnique({ where: { id: companyId } })
    if (!company) return reply.notFound()

    const seedItems = CATALOG_SEEDS[company.segment] || CATALOG_SEEDS['OUTRO']

    const existing = await fastify.prisma.catalogItem.count({ where: { companyId } })
    if (existing > 0) {
      return reply.code(400).send({ error: 'Catálogo já possui itens. Seed cancelado para evitar duplicatas.' })
    }

    try {
      const created = await fastify.prisma.catalogItem.createMany({
        data: seedItems.map(item => ({ ...item, companyId }))
      })

      return { created: created.count, segment: company.segment }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Erro ao popular catálogo', message: error.message })
    }
  })

  // ───────────────────────────────────────────────────────────────────────
  // BUSCA SEMÂNTICA (Bloco 1 - IA Core)
  // ───────────────────────────────────────────────────────────────────────

  // POST /catalog/search — busca semântica de itens no catálogo via IA
  fastify.post('/search', async (request, reply) => {
    let { companyId } = request.user
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } })
      companyId = user?.companyId
    }
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { query } = request.body
    if (!query || !query.trim()) {
      return reply.code(400).send({ error: 'Query de busca é obrigatória' })
    }

    // Buscar todos os itens ativos do catálogo da empresa
    const catalog = await fastify.prisma.catalogItem.findMany({
      where: { companyId, active: true },
      select: { id: true, description: true, unit: true, defaultPrice: true, suggestedPrice: true, category: true, isProduct: true, stockQuantity: true }
    })

    if (catalog.length === 0) {
      return reply.code(200).send({ results: [], message: 'Catálogo vazio. Cadastre itens primeiro.' })
    }

    // Se não houver Gemini configurado, usar busca por texto simples (fallback)
    const genAI = process.env.GEMINI_API_KEY
      ? new (await import('@google/generative-ai')).GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null

    if (!genAI) {
      const queryLower = query.toLowerCase()
      const results = catalog
        .map(item => {
          const descLower = item.description.toLowerCase()
          const tokens = queryLower.split(/\s+/)
          const matches = tokens.filter(t => descLower.includes(t)).length
          const relevanceScore = tokens.length > 0 ? matches / tokens.length : 0
          return {
            id: item.id,
            description: item.description,
            unit: item.unit,
            defaultPrice: item.defaultPrice,
            suggestedPrice: item.suggestedPrice,
            category: item.category,
            isProduct: item.isProduct,
            stockQuantity: item.stockQuantity,
            relevanceScore: Math.min(relevanceScore, 1),
            reason: `Correspondência de ${Math.round(relevanceScore * 100)}% com a busca`
          }
        })
        .filter(r => r.relevanceScore > 0.2)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10)

      return reply.code(200).send({ results, usedFallback: true })
    }

    // Busca semântica com Gemini
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const catalogJson = JSON.stringify(catalog)
      const prompt = `Você é um assistente de busca inteligente para catálogo de serviços e materiais.

Catálogo disponível:
${catalogJson}

Consulta do usuário: "${query}"

Analise a consulta e retorne os itens mais relevantes do catálogo, considerando sinônimos, contexto técnico e relevância semântica.

Retorne APENAS o JSON EXATO neste formato:
{
  "results": [
    {
      "id": "id_do_item",
      "description": "descrição original",
      "unit": "unidade",
      "defaultPrice": preco,
      "suggestedPrice": preco_sugerido,
      "category": "categoria",
      "isProduct": boolean,
      "stockQuantity": numero,
      "relevanceScore": 0.0 a 1.0,
      "reason": "por que este item é relevante para a consulta"
    }
  ]
}

Limite a 10 resultados. Se não houver correspondências relevantes, retorne array vazio.`

      const result = await model.generateContent(prompt)
      const responseText = result.response.text()

      const cleanJsonResponse = (text) => {
        try {
          const match = text.match(/\{[\s\S]*\}/)
          if (match) return JSON.parse(match[0])
          return JSON.parse(text)
        } catch {
          throw new Error('Falha ao processar resposta da IA')
        }
      }

      const resultJson = cleanJsonResponse(responseText)
      return reply.code(200).send({ ...resultJson, usedFallback: false })
    } catch (err) {
      fastify.log.error({ err }, 'Erro na busca semântica com Gemini')
      // Fallback simples
      const queryLower = query.toLowerCase()
      const results = catalog
        .map(item => {
          const descLower = item.description.toLowerCase()
          const tokens = queryLower.split(/\s+/)
          const matches = tokens.filter(t => descLower.includes(t)).length
          const relevanceScore = tokens.length > 0 ? matches / tokens.length : 0
          return {
            id: item.id,
            description: item.description,
            unit: item.unit,
            defaultPrice: item.defaultPrice,
            suggestedPrice: item.suggestedPrice,
            category: item.category,
            isProduct: item.isProduct,
            stockQuantity: item.stockQuantity,
            relevanceScore: Math.min(relevanceScore, 1),
            reason: `Correspondência de ${Math.round(relevanceScore * 100)}%`
          }
        })
        .filter(r => r.relevanceScore > 0.2)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10)

      return reply.code(200).send({ results, usedFallback: true })
    }
  })
}
