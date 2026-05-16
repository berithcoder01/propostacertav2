// Rotas: /proposals/:id/profitability
// Análise de lucratividade para uma proposta

export default async function (fastify, opts) {
  // GET /proposals/:id/profitability — análise de margem e lucratividade
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
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        conditions: true,
        company: true
      }
    })

    if (!proposal) return reply.notFound('Proposta não encontrada')

    // 1. Cálculos básicos
    const items = proposal.items || []
    const totalItems = items.length

    const totalCusto = items.reduce((sum, i) => {
      // Se tem preço de custo (preço de compra), usa. Senão, estima margem sobre unitPrice
      return sum + (parseFloat(i.unitPrice) || 0) * (parseFloat(i.quantity) || 0)
    }, 0)

    const totalProposta = proposal.total || 0

    // 2. Margem bruta
    const margemBruta = totalProposta > 0
      ? ((totalProposta - totalCusto) / totalProposta) * 100
      : 0

    // 3. Estimativa de custos indiretos (baseado nos defaults da empresa)
    const empresa = proposal.company
    const safetyMargin = (empresa?.defaultSafetyMargin || 1.15) - 1 // ex: 0.15 = 15%


    // 4. Estimativa de impostos e encargos (simplificado para MEI/prestador)
    const estimativaEncargos = totalProposta * 0.14 // ~14% para encargos diversos (ajustado sem impostos)
    const custosTotais = totalCusto + estimativaEncargos
    const margemLiquida = totalProposta > 0
      ? ((totalProposta - custosTotais) / totalProposta) * 100
      : 0

    // 6. Análise por item
    const analiseItens = items.map(item => {
      const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
      const markup = subtotal > 0 ? (subtotal / (subtotal * 0.6)) : 0 // markup estimado 1.67x
      return {
        itemId: item.id,
        label: item.label,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        subtotal,
        markup: parseFloat(markup.toFixed(2)),
        // Flag se o preço parece abaixo do mercado
        precoBaixo: subtotal > 0 && subtotal < (item.defaultPrice || 0) * (parseFloat(item.quantity) || 0) * 0.7
      }
    })

    // 7. Alertas
    const alertas = []

    if (margemBruta < 20) {
      alertas.push({
        tipo: 'warning',
        mensagem: `Margem bruta de ${margemBruta.toFixed(1)}% está abaixo do recomendado (mínimo 20%)`,
        severidade: 'high'
      })
    }

    if (margemLiquida < 15) {
      alertas.push({
        tipo: 'danger',
        mensagem: `Margem líquida estimada de ${margemLiquida.toFixed(1)}% — considere revisar preços`,
        severidade: 'high'
      })
    }

    if (totalItems === 0) {
      alertas.push({
        tipo: 'info',
        mensagem: 'Nenhum item na proposta. Adicione serviços/materiais para análise.',
        severidade: 'medium'
      })
    }

    // Verificar itens com preço muito baixo
    const itensPrecoBaixo = analiseItens.filter(i => i.precoBaixo)
    if (itensPrecoBaixo.length > 0) {
      alertas.push({
        tipo: 'warning',
        mensagem: `${itensPrecoBaixo.length} item(ns) com preço abaixo de 70% do preço de mercado`,
        severidade: 'medium',
        itens: itensPrecoBaixo.map(i => i.label)
      })
    }

    // 8. Score de qualidade da proposta
    let score = 0
    if (totalItems > 0) score += 20
    if (proposal.conditions?.warrantyPeriod) score += 10
    if (proposal.conditions?.paymentMethod) score += 10
    if (proposal.conditions?.executionPeriod) score += 10
    if (proposal.object?.length > 10) score += 10
    if (proposal.clientPhone) score += 10
    if (proposal.clientEmail) score += 10
    if (margemBruta >= 30) score += 20
    else if (margemBruta >= 20) score += 10

    const classificacao = score >= 70 ? 'Excelente' : score >= 50 ? 'Boa' : score >= 30 ? 'Razoável' : 'Precisa de atenção'

    return {
      propostaId: proposal.id,
      numero: proposal.number,
      cliente: proposal.clientName,
      total: totalProposta,
      custoTotal: parseFloat(custosTotais.toFixed(2)),
      margemBruta: parseFloat(margemBruta.toFixed(1)),
      margemLiquida: parseFloat(margemLiquida.toFixed(1)),
      estimativaEncargos: parseFloat(estimativaEncargos.toFixed(2)),
      totalItens,
      analiseItens,
      alertas,
      score,
      classificacao,
      // Referências do mercado
      benchmarks: {
        margemBrutaRecomendada: '20-35%',
        markupRecomendado: '1.5x a 2.5x',

        taxaEncargosMedia: '~8-12%'
      },
      // Comparação com propostas anteriores (se houver)
      historico: {
        totalPropostasEmpresa: await fastify.prisma.proposal.count({ where: { companyId } }),
        totalAprovadas: await fastify.prisma.proposal.count({ where: { companyId, status: 'APPROVED' } }),
        mediaValorAprovadas: await calcularMediaAprovadas(fastify.prisma, companyId)
      }
    }
  })
}

async function calcularMediaAprovadas(prisma, companyId) {
  const aprovadas = await prisma.proposal.findMany({
    where: { companyId, status: 'APPROVED' },
    select: { total: true }
  })

  if (aprovadas.length === 0) return 0
  const soma = aprovadas.reduce((sum, p) => sum + (p.total || 0), 0)
  return parseFloat((soma / aprovadas.length).toFixed(2))
}