import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function (fastify, opts) {
  // Inicialização lazy
  const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null;

  // Helper para limpar markdown code blocks da resposta da IA
  const cleanJsonResponse = (text) => {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      return JSON.parse(text);
    } catch (err) {
      throw new Error('Falha ao processar resposta JSON da IA: ' + text);
    }
  };

  // POST /ai/price-research
  fastify.post('/price-research', async (request, reply) => {
    const { companyId } = request.user;
    const { query } = request.body;

    if (!model) {
      return reply.code(500).send({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    }
    if (!query) {
      return reply.code(400).send({ error: 'Query de pesquisa é obrigatória.' });
    }

    try {
      const prompt = `Você é um assistente especializado em orçamentos de engenharia, construção e serviços no Brasil.
Pesquise e estime o preço de mercado atual para o seguinte item/serviço: "${query}"
Forneça os resultados no formato JSON EXATAMENTE como este esquema:
{
  "item": "nome detalhado do item",
  "estimatedPriceRange": { "min": valor_numerico, "max": valor_numerico },
  "unit": "unidade (ex: un, m2, kg, h)",
  "notes": "observações adicionais sobre variação de preço ou marcas",
  "sources": ["fontes estimadas ou locais de busca"]
}
Retorne APENAS o JSON, sem formatação markdown ou textos explicativos.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const resultJson = cleanJsonResponse(responseText);

      const record = await fastify.prisma.priceResearch.create({
        data: {
          companyId,
          query,
          results: resultJson
        }
      });

      return reply.code(200).send(record);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Erro ao consultar Gemini: ' + err.message });
    }
  });

  // POST /ai/find-suppliers
  fastify.post('/find-suppliers', async (request, reply) => {
    const { companyId } = request.user;
    const { item, location } = request.body;

    if (!model) {
      return reply.code(500).send({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    }
    if (!item || !location) {
      return reply.code(400).send({ error: 'Item e localização são obrigatórios.' });
    }

    try {
      const prompt = `Você é um assistente especializado em suprimentos no Brasil.
Sugira 3 a 5 potenciais fornecedores reais para o item "${item}" na região de "${location}".
Forneça os resultados no formato JSON EXATAMENTE como este esquema:
{
  "suppliers": [
    {
      "name": "nome do fornecedor",
      "type": "fabricante/distribuidor/loja",
      "contactInfo": "site, telefone ou endereço estimado",
      "notes": "motivo da sugestão"
    }
  ]
}
Retorne APENAS o JSON, sem formatação markdown ou textos explicativos.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const resultJson = cleanJsonResponse(responseText);

      const record = await fastify.prisma.priceResearch.create({
        data: {
          companyId,
          query: `Fornecedores: ${item} em ${location}`,
          results: resultJson
        }
      });

      return reply.code(200).send(record);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Erro ao consultar Gemini: ' + err.message });
    }
  });

  // POST /ai/chat
  fastify.post('/chat', async (request, reply) => {
    const { companyId } = request.user;
    const { proposalId, messages } = request.body;

    if (!model) {
      return reply.code(500).send({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    }

    try {
      let systemPrompt = 'Você é um assistente especializado em orçamentos técnicos e comerciais.';

      if (proposalId) {
        const proposal = await fastify.prisma.proposal.findUnique({
          where: { id: proposalId },
          include: { items: true, conditions: true }
        });
        if (proposal) {
          systemPrompt = `Você é o assistente IA da PropostaCerta. Ajude o usuário com esta proposta comercial:
- Cliente: ${proposal.clientName}
- Valor Total: R$ ${proposal.total}
- Itens do Orçamento: ${proposal.items.map(i => `${i.qty}x ${i.label}`).join(', ')}
- Condições: ${proposal.conditions ? proposal.conditions.paymentMethod : 'Padrão'}
Seja direto, profissional e ajude com redação técnica ou cálculos.`;
        }
      }

      const chat = model.startChat({
        history: messages.slice(0, -1).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        systemInstruction: systemPrompt
      });

      const lastMessage = messages[messages.length - 1].content;
      const result = await chat.sendMessage(lastMessage);

      return reply.code(200).send({ content: result.response.text() });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Erro no chat do Gemini: ' + err.message });
    }
  });

  // POST /ai/search — busca semântica no catálogo
  fastify.post('/search', async (request, reply) => {
    const { companyId } = request.user;
    const { query } = request.body;

    if (!model) {
      return reply.code(500).send({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    }
    if (!query) {
      return reply.code(400).send({ error: 'Query de busca é obrigatória.' });
    }

    try {
      const catalog = await fastify.prisma.catalogItem.findMany({
        where: { companyId, active: true },
        select: { id: true, description: true, unit: true, defaultPrice: true, category: true, isProduct: true }
      });

      if (catalog.length === 0) {
        return reply.code(200).send({ results: [], message: 'Catálogo vazio. Cadastre itens primeiro.' });
      }

      const catalogJson = JSON.stringify(catalog);

      const prompt = `Você é um assistente de busca inteligente para orçamentos.

Catálogo:
${catalogJson}

Consulta: "${query}"

Retorne APENAS o JSON exato:
{
  "results": [
    {
      "id": "id_do_item",
      "description": "descrição",
      "unit": "unidade",
      "defaultPrice": preco,
      "isProduct": false,
      "relevanceScore": 0 a 1,
      "reason": "por que este item é relevante"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const resultJson = cleanJsonResponse(responseText);

      return reply.code(200).send(resultJson);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Erro na busca semântica: ' + err.message });
    }
  });

  // POST /ai/generate-proposal — gera proposta automaticamente
  fastify.post('/generate-proposal', async (request, reply) => {
    const { companyId } = request.user;
    const { description, clientName, clientPhone, clientEmail, clientLocation } = request.body;

    if (!model) {
      return reply.code(500).send({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    }
    if (!description) {
      return reply.code(400).send({ error: 'Descrição do projeto é obrigatória.' });
    }

    try {
      const [company, catalog] = await Promise.all([
        fastify.prisma.company.findUnique({ where: { id: companyId } }),
        fastify.prisma.catalogItem.findMany({ where: { companyId, active: true } })
      ]);

      const catalogJson = JSON.stringify(catalog);
      const companySegment = company ? company.segment : 'OUTRO';

      const prompt = `Você é um assistente de geração de propostas para a PropostaCerta.

EMPRESA:
- Segmento: ${companySegment}
- Itens do catálogo: ${catalogJson}

Gere uma proposta para: "${description}"
${clientName ? `\nCliente: ${clientName}` : ''}
${clientPhone ? `\nTelefone: ${clientPhone}` : ''}
${clientEmail ? `\nE-mail: ${clientEmail}` : ''}
${clientLocation ? `\nLocal: ${clientLocation}` : ''}

Retorne APENAS o JSON EXATO:
{
  "clientName": "Nome",
  "clientContact": "contato",
  "clientEmail": "email",
  "clientLocation": "cidade/estado",
  "clientPhone": "telefone",
  "object": "Resumo do projeto",
  "items": [
    { "label": "Nome", "unit": "PT|ML|M2|M3|UNID|HRS|VB|KG|CJ|MTS", "quantity": 0, "unitPrice": 0, "category": "SERVICO|MATERIAL|EQUIPAMENTO|MAO_DE_OBRA", "isProduct": false, "notes": "" }
  ],
  "conditions": {
    "downPayment": 0, "downPaymentDays": 0, "measurementDays": 0, "paymentNfDays": 0, "validityDays": 60
  }
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const resultJson = cleanJsonResponse(responseText);

      return reply.code(200).send(resultJson);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Erro ao gerar proposta: ' + err.message });
    }
  });

  // POST /ai/suggest-items — sugere itens complementares
  fastify.post('/suggest-items', async (request, reply) => {
    const { companyId } = request.user;
    const { currentItems } = request.body;

    if (!model) {
      return reply.code(500).send({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    }

    try {
      const catalog = await fastify.prisma.catalogItem.findMany({
        where: { companyId, active: true },
        select: { id: true, description: true, unit: true, defaultPrice: true, category: true, isProduct: true }
      });

      const catalogJson = JSON.stringify(catalog);
      const itemsJson = JSON.stringify(currentItems || []);

      const prompt = `Você é um assistente de complementação de escopo.

Catálogo: ${catalogJson}
Itens já incluídos: ${itemsJson}

Sugira itens complementares que NÃO estão na lista.
Retorne APENAS: {"suggestions": [{"id": "...", "label": "...", "unit": "...", "quantity": 0, "unitPrice": 0, "isProduct": false, "reason": "..."}]}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const resultJson = cleanJsonResponse(responseText);

      return reply.code(200).send(resultJson);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Erro ao sugerir itens: ' + err.message });
    }
  });

  // POST /ai/follow-up — gera mensagem de follow-up
  fastify.post('/follow-up', async (request, reply) => {
    const { companyId } = request.user;
    const { proposalId } = request.body;

    if (!model) {
      return reply.code(500).send({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    }
    if (!proposalId) {
      return reply.code(400).send({ error: 'ID da proposta é obrigatório.' });
    }

    try {
      const proposal = await fastify.prisma.proposal.findUnique({
        where: { id: proposalId },
        include: { items: true, conditions: true }
      });

      if (!proposal) return reply.code(404).send({ error: 'Proposta não encontrada' });

      const prompt = `Gere uma mensagem curta e profissional de follow-up para reativar interesse do cliente.
Proposta #${proposal.number} - Cliente: ${proposal.clientName} - Valor: R$ ${proposal.total.toFixed(2)}
Itens: ${proposal.items.slice(0, 5).map(i => i.label).join(', ')}
Máximo 5 linhas, tom humano, inclua pergunta aberta.`;

      const result = await model.generateContent(prompt);
      return reply.code(200).send({ message: result.response.text().trim() });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Erro ao gerar follow-up: ' + err.message });
    }
  });

  // ────────────────────────────────────────────────────
  // FASE 8: POST /ai/business-type/classify — classifica tipo de negócio e segmento
  // Nunca retorna 500: Gemini isolado em try/catch interno, fallback por palavras-chave garante 200
  // ────────────────────────────────────────────────────
  fastify.post('/business-type/classify', async (request, reply) => {
    const { description } = request.body;
    if (!description) {
      return reply.code(400).send({ error: 'A descrição do negócio é obrigatória.' });
    }

    const VALID_SEGMENTS = ['ELETRICA', 'CONSTRUCAO_CIVIL', 'HIDRAULICA', 'PINTURA', 'AR_CONDICIONADO', 'OUTRO'];

    // Fallback por palavras-chave
    const classifyByKeywords = (text) => {
      const lower = text.toLowerCase();
      let segment = 'OUTRO';
      if (lower.includes('elétric') || lower.includes('eletric')) segment = 'ELETRICA';
      else if (lower.includes('hidráulic') || lower.includes('hidraulic') || lower.includes('encanamento')) segment = 'HIDRAULICA';
      else if (lower.includes('pintura') || lower.includes('pintor')) segment = 'PINTURA';
      else if (lower.includes('ar condicionado') || lower.includes('climatiz') || lower.includes('hvac')) segment = 'AR_CONDICIONADO';
      else if (lower.includes('construção') || lower.includes('construcao') || lower.includes('civil') || lower.includes('obra')) segment = 'CONSTRUCAO_CIVIL';

      return { segment, confidence: 0.65, reasoning: 'Classificação por palavras-chave.', method: 'keyword-fallback' };
    };

    const activeModel = fastify.geminiFlashModel || model;
    if (activeModel) {
      try {
        const prompt = `Analise a descrição do negócio abaixo e retorne um JSON com:
- segment: um dos valores exatos: ELETRICA, CONSTRUCAO_CIVIL, HIDRAULICA, PINTURA, AR_CONDICIONADO, OUTRO
- confidence: número de 0.0 a 1.0
- reasoning: explicação curta em português

Descrição: "${description}"

Responda APENAS o JSON, sem markdown: {"segment": "...", "confidence": 0.0, "reasoning": "..."}`;

        const result = await activeModel.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const segment = VALID_SEGMENTS.includes(parsed.segment) ? parsed.segment : 'OUTRO';
          return reply.code(200).send({
            segment,
            confidence: Math.round((parsed.confidence || 0.8) * 100) / 100,
            reasoning: parsed.reasoning || '',
            method: 'gemini',
          });
        }
      } catch (geminiErr) {
        fastify.log.warn({ geminiErr }, 'Gemini falhou na classificação — usando fallback por palavras-chave');
      }
    }

    return reply.code(200).send(classifyByKeywords(description));
  });
}