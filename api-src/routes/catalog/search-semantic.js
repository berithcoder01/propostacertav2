// Rotas: /catalog/search-semantic
// Busca semântica no catálogo usando IA (Gemini)

export default async function (fastify, opts) {
  // POST /catalog/search-semantic — busca itens similares via embedding
  fastify.post('/', async (request, reply) => {
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

    // 1. Buscar todos os itens ativos do catálogo da empresa
    const catalog = await fastify.prisma.catalogItem.findMany({
      where: { companyId, active: true },
      select: { id: true, description: true, unit: true, defaultPrice: true, category: true, suggestedPrice: true }
    })

    if (catalog.length === 0) {
      return reply.code(200).send({ results: [], message: 'Catálogo vazio. Cadastre itens primeiro.' })
    }

    // 2. Se não houver Gemini configurado, usar busca por texto simples (fallback)
    const genAI = process.env.GEMINI_API_KEY
      ? new (await import('@google/generative-ai')).GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null

    if (!genAI) {
      // Fallback: busca simples por correspondência de texto
      const queryLower = query.toLowerCase()
      const results = catalog
        .map(item => {
          const descLower = item.description.toLowerCase()
          const tokens = queryLower.split(/\s+/)
          const matches = tokens.filter(t => descLower.includes(t)).length
          const relevanceScore = matches / tokens.length
          return {
            id: item.id,
            description: item.description,
            unit: item.unit,
            defaultPrice: item.defaultPrice,
            suggestedPrice: item.suggestedPrice,
            category: item.category,
            relevanceScore: Math.min(relevanceScore, 1),
            reason: `Correspondência de ${Math.round(relevanceScore * 100)}% com a busca`
          }
        })
        .filter(r => r.relevanceScore > 0.2)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10)

      return reply.code(200).send({ results, usedFallback: true })
    }

    // 3. Busca semântica com Gemini
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
      "relevanceScore": 0.0 a 1.0,
      "reason": "por que este item é relevante para a consulta"
    }
  ]
}

Limite a 10 resultados. Se não houver correspondências relevantes, retorne array vazio.`

      const result = await model.generateContent(prompt)
      const responseText = result.response.text()

      // Limpar resposta JSON
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
      // Fallback para busca simples em caso de erro
      const queryLower = query.toLowerCase()
      const results = catalog
        .map(item => {
          const descLower = item.description.toLowerCase()
          const tokens = queryLower.split(/\s+/)
          const matches = tokens.filter(t => descLower.includes(t)).length
          const relevanceScore = matches / tokens.length
          return {
            id: item.id,
            description: item.description,
            unit: item.unit,
            defaultPrice: item.defaultPrice,
            suggestedPrice: item.suggestedPrice,
            category: item.category,
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