// Rotas: /leads/ai
// IA para segmentação, enriquecimento e geração de templates de leads

export default async function (fastify, opts) {
  // POST /leads/ai/segment — classifica segmento do lead via Gemini
  fastify.post('/segment', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { name, description, city, state } = request.body
    if (!name) return reply.code(400).send({ error: 'Nome é obrigatório para segmentação' })

    try {
      const model = fastify.geminiProModel || null
      if (!model) {
        // Fallback: segmentação por regras simples
        const text = `${name} ${description || ''} ${city || ''} ${state || ''}`.toLowerCase()
        let segment = 'RESIDENCIAL'
        let confidence = 0.5

        const commercialKeywords = ['empresa', 'comércio', 'loja', 'escritório', 'corporativo', 'negócio', 'industrial', 'fábrica', 'galpão', 'depósito']
        const condoKeywords = ['condomínio', 'condominio', 'apartamento', 'prédio', 'edifício', 'torre', 'residencial']
        const industrialKeywords = ['industrial', 'fábrica', 'fabrica', 'manufatura', 'planta industrial', 'logística', 'armazém']

        if (industrialKeywords.some(k => text.includes(k))) {
          segment = 'INDUSTRIAL'
          confidence = 0.85
        } else if (commercialKeywords.some(k => text.includes(k))) {
          segment = 'COMERCIAL'
          confidence = 0.80
        } else if (condoKeywords.some(k => text.includes(k))) {
          segment = 'CONDOMINIO'
          confidence = 0.75
        }

        return { segment, confidence, method: 'keyword-fallback' }
      }

      const prompt = `Classifique este lead em um dos seguintes segmentos: RESIDENCIAL, COMERCIAL, INDUSTRIAL, CONDOMINIO.

Dados do lead:
- Nome: ${name}
- Descrição: ${description || 'Não informada'}
- Cidade: ${city || 'Não informada'}
- Estado: ${state || 'Não informada'}

Responda apenas um JSON válido: {"segment": "RESIDENCIAL|COMERCIAL|INDUSTRIAL|CONDOMINIO", "confidence": 0.0-1.0, "reasoning": "breve explicação"}`

      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      // Extrai JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return { segment: parsed.segment, confidence: parsed.confidence, reasoning: parsed.reasoning, method: 'gemini' }
      }

      return { segment: 'RESIDENCIAL', confidence: 0.5, method: 'gemini-fallback' }
    } catch (err) {
      fastify.log.error({ err }, 'Erro na segmentação por IA')
      return reply.code(500).send({ error: 'Erro na segmentação por IA', fallback: { segment: 'RESIDENCIAL', confidence: 0.5, method: 'error-fallback' } })
    }
  })

  // POST /leads/ai/enrich — enriquece dados do lead via IA
  fastify.post('/enrich', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { name, city, state, segment } = request.body
    if (!name) return reply.code(400).send({ error: 'Nome é obrigatório para enriquecimento' })

    try {
      const model = fastify.geminiProModel || null
      if (!model) {
        // Fallback: retorno básico
        return {
          enriched: false,
          reason: 'Gemini API não disponível — configurar GEMINI_API_KEY',
          suggestions: { email: null, phone: null, whatsapp: null, website: null }
        }
      }

      const prompt = `Enriqueça os dados do seguinte lead com informações de contato: nome, cidade, estado e segmento. Pesquise informações públicas como site oficial, e-mail comercial, telefone e endereço.

Lead: ${name}
Cidade: ${city || 'não informada'}
Estado: ${state || 'não informada'}
Segmento: ${segment || 'RESIDENCIAL'}

Responda apenas um JSON válido: {"email": "email@exemplo.com" ou null, "phone": "(00) 0000-0000" ou null, "whatsapp": "(00) 00000-0000" ou null, "website": "https://..." ou null, "source": "nome da fonte" ou null, "notes": "observações"}`

      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return { ...parsed, method: 'gemini' }
      }

      return { enriched: false, method: 'gemini-fallback', suggestions: {} }
    } catch (err) {
      fastify.log.error({ err }, 'Erro no enriquecimento por IA')
      return reply.code(500).send({ error: 'Erro no enriquecimento por IA', suggestions: {} })
    }
  })

  // POST /leads/ai/message-template — gera template de mensagem para abordagem
  fastify.post('/message-template', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { leadName, leadSegment, companyName, leadCity, serviceType } = request.body
    if (!leadName) return reply.code(400).send({ error: 'Nome do lead é obrigatório' })

    try {
      const model = fastify.geminiFlashModel || null
      if (!model) {
        // Fallback: template genérico
        const generic = {
          whatsapp: leadSegment === 'CONDOMINIO'
            ? `Olá! Sou da ${companyName}. Identificamos oportunidades de serviços para ${leadSegment === 'CONDOMINIO' ? 'seu condomínio' : 'sua empresa'} na região de ${leadCity || 'sua área'}. Gostaria de apresentar nossas soluções?`
            : `Olá ${leadName}! Sou da ${companyName}. Atuamos na região de ${leadCity || 'sua área'} com serviços especializados. Gostaria de conhecer suas necessidades?`,
          email: {
            subject: `Proposta Personalizada — ${companyName}`,
            body: `Prezado(a) ${leadName},\n\nA ${companyName} atua na região de ${leadCity || 'sua área'} com serviços especializados.\n\nGostaríamos de agendar uma conversa para entender suas necessidades e apresentar soluções personalizadas.\n\nAtenciosamente,\n${companyName}`
          }
        }
        return { ...generic, method: 'fallback' }
      }

      const prompt = `Gere templates de mensagem para abordagem comercial para o seguinte lead:

- Nome: ${leadName}
- Segmento: ${leadSegment || 'RESIDENCIAL'}
- Cidade: ${leadCity || 'não informada'}
- Serviço principal: ${serviceType || 'não especificado'}
- Empresa: ${companyName || 'nossa empresa'}

Gere:
1. Mensagem de WhatsApp (máx 500 caracteres, tom profissional e amigável)
2. Assunto de e-mail
3. Corpo de e-mail (máx 3 parágrafos)

Responda apenas JSON: {"whatsapp": "...", "email": {"subject": "...", "body": "..."}}`

      const result = await model.generateContent(prompt)
      const response = result.response

      // Tenta usar response.text() para o Gemini
      const text = typeof response.text === 'function' ? response.text() : String(response)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return { ...parsed, method: 'gemini' }
      }

      // Fallback genérico
      return {
        whatsapp: `Olá ${leadName}! Sou da ${companyName}. Gostaria de apresentar nossas soluções para ${leadSegment === 'CONDOMINIO' ? 'seu condomínio' : 'sua empresa'}. Posso ajudar?`,
        email: {
          subject: `Proposta Personalizada — ${companyName}`,
          body: `Prezado(a) ${leadName},\n\nGostaríamos de apresentar nossas soluções para ${leadSegment === 'CONDOMINIO' ? 'seu condomínio' : 'sua empresa'}.\n\nAguardamos seu contato.\n\nAtenciosamente,\n${companyName}`
        },
        method: 'fallback'
      }
    } catch (err) {
      fastify.log.error({ err }, 'Erro na geração de template')
      return reply.code(500).send({ error: 'Erro na geração de template por IA' })
    }
  })

  // POST /leads/ai/search — pesquisa Google Places (via proxy IA)
  fastify.post('/search-places', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { query, lat, lng, radius } = request.body
    if (!query) return reply.code(400).send({ error: 'Query de busca é obrigatória' })

    try {
      const model = fastify.geminiFlashModel || null
      if (!model) {
        return reply.code(503).send({ error: 'Gemini API não configurada', suggestions: [] })
      }

      const prompt = `Liste potenciais locais/empresas/condomínios na região para prospecção de serviços.

Busca: "${query}"
Localização: lat ${lat || 'não informada'}, lng ${lng || 'não informada'}, raio ${radius || 10}km

Retorne 10 resultados no formato JSON:
[{"name": "Nome do local", "address": "Endereço", "type": "COMERCIAL|RESIDENCIAL|CONDOMINIO|INDUSTRIAL", "potential": "alta|média|baixa", "reason": "por que é um bom lead"}]

Responda APENAS o JSON.`

      const result = await model.generateContent(prompt)
      const text = typeof result.response.text === 'function' ? result.response.text() : String(result.response)
      const jsonMatch = text.match(/\[[\s\S]*\]/)

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return { results: parsed, method: 'gemini' }
      }

      return { results: [], method: 'gemini-fallback' }
    } catch (err) {
      fastify.log.error({ err }, 'Erro na busca de lugares via IA')
      return reply.code(500).send({ error: 'Erro na busca de lugares', results: [] })
    }
  })

  // POST /leads/ai/chat — chat assistente para filtrar leads
  fastify.post('/chat', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { message, companySegment, companyCity } = request.body
    if (!message) return reply.code(400).send({ error: 'Mensagem é obrigatória' })

    try {
      const model = fastify.geminiFlashModel || null
      
      // If no AI model, use keyword-based filtering
      if (!model) {
        const lowerMsg = message.toLowerCase()
        const filters = {}
        
        // Detect segment intent
        const segmentKeywords = {
          'condominio': 'CONDOMINIO',
          'condomínio': 'CONDOMINIO',
          'apartamento': 'CONDOMINIO',
          'prédio': 'CONDOMINIO',
          'comercial': 'COMERCIAL',
          'loja': 'COMERCIAL',
          'empresa': 'COMERCIAL',
          'escritório': 'COMERCIAL',
          'industrial': 'INDUSTRIAL',
          'fábrica': 'INDUSTRIAL',
          'residencial': 'RESIDENCIAL',
          'casa': 'RESIDENCIAL'
        }
        
        for (const [keyword, segment] of Object.entries(segmentKeywords)) {
          if (lowerMsg.includes(keyword)) {
            filters.segment = segment
            break
          }
        }
        
        // Detect city intent
        const cityMatch = message.match(/em\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)/i)
        if (cityMatch) {
          filters.city = cityMatch[1]
        }
        
        // Generate contextual response
        let response = 'Entendi! '
        if (filters.segment) {
          response += `Vou filtrar leads do segmento ${filters.segment}. `
        }
        if (filters.city) {
          response += `Focando na região de ${filters.city}. `
        }
        if (!filters.segment && !filters.city) {
          response += 'Vou considerar isso na próxima curadoria de leads.'
        }
        
        return { 
          message: response,
          filters: Object.keys(filters).length > 0 ? filters : null
        }
      }

      // With AI model
      const prompt = `Você é um assistente de prospecção comercial. O usuário está buscando leads para sua empresa.

Perfil da empresa:
- Segmento: ${companySegment || 'não informado'}
- Cidade: ${companyCity || 'não informada'}

Mensagem do usuário: "${message}"

Analise a mensagem e retorne:
1. Uma resposta contextual e útil (máx 2 frases)
2. Filtros que podem ser aplicados na busca de leads (segment, city, minScore)

Responda APENAS JSON: {"message": "resposta ao usuário", "filters": {"segment": "RESIDENCIAL|COMERCIAL|INDUSTRIAL|CONDOMINIO" ou null, "city": "nome da cidade" ou null, "minScore": 0-100 ou null}}`

      const result = await model.generateContent(prompt)
      const text = typeof result.response.text === 'function' ? result.response.text() : String(result.response)
      const jsonMatch = text.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return { message: parsed.message, filters: parsed.filters }
      }

      return { message: 'Vou considerar isso na próxima curadoria de leads.', filters: null }
    } catch (err) {
      fastify.log.error({ err }, 'Erro no chat de prospecção')
      return { message: 'Entendi! Vou considerar isso na próxima rodada de prospecção.', filters: null }
    }
  })
}