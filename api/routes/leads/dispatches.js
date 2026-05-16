// Rotas: /leads/dispatches
// Disparo de mensagens multicanal (WhatsApp + E-mail) para leads

export default async function (fastify, opts) {
  // POST /leads/dispatches/whatsapp — gera deep link WhatsApp para envio de mensagem
  fastify.post('/whatsapp', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { leadId, message } = request.body
    if (!leadId) return reply.code(400).send({ error: 'Lead ID é obrigatório' })

    const lead = await fastify.prisma.lead.findFirst({
      where: { id: leadId, companyId },
      include: { company: true }
    })
    if (!lead) return reply.notFound('Lead não encontrado')

    const phone = lead.whatsapp || lead.phone
    if (!phone) return reply.code(400).send({ error: 'Lead não possui telefone/WhatsApp' })

    const cleanPhone = phone.replace(/\D/g, '')
    const defaultMsg = message || (async () => {
      const { name: companyName } = lead.company || {}
      const templates = {
        CONDOMINIO: `Olá! Sou da ${companyName || 'sua empresa'}. Identificamos oportunidades de serviços para seu condomínio. Gostaria de apresentar nossas soluções?`,
        COMERCIAL: `Olá! Sou da ${companyName || 'sua empresa'}. Atuamos na área comercial e gostaríamos de conhecer suas necessidades. Podemos conversar?`,
        RESIDENCIAL: `Olá! Sou da ${companyName || 'sua empresa'}. Oferecemos serviços especializados na sua região. Gostaria de saber mais sobre suas necessidades?`,
        INDUSTRIAL: `Olá! Sou da ${companyName || 'sua empresa'}. Trabalhamos com soluções para o segmento industrial. Podemos apresentar nossas propostas?`,
      }
      return templates[lead.segment] || templates.RESIDENCIAL
    })()

    const msg = typeof defaultMsg === 'string' ? defaultMsg : await defaultMsg
    const encodedMsg = encodeURIComponent(msg)

    // Atualiza status do lead
    await fastify.prisma.lead.update({
      where: { id: leadId },
      data: { status: 'CONTACTED', contactHistory: JSON.stringify([...(JSON.parse(lead.contactHistory || '[]')), { channel: 'whatsapp', message: msg, date: new Date().toISOString() }]) }
    })

    const waUrl = `https://wa.me/55${cleanPhone}?text=${encodedMsg}`
    return { waUrl, phone: cleanPhone, message: msg, leadName: lead.name }
  })

  // POST /leads/dispatches/email — prepara envio de e-mail
  fastify.post('/email', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { leadId, subject, body } = request.body
    if (!leadId) return reply.code(400).send({ error: 'Lead ID é obrigatório' })

    const lead = await fastify.prisma.lead.findFirst({
      where: { id: leadId, companyId },
      include: { company: true }
    })
    if (!lead) return reply.notFound('Lead não encontrado')
    if (!lead.email) return reply.code(400).send({ error: 'Lead não possui e-mail' })

    const company = lead.company || {}
    const defaultSubject = subject || `Proposta Personalizada — ${company.name || 'Sua Empresa'}`
    const defaultBody = body || `Prezado(a) ${lead.name},\n\nA ${company.name} atua na sua região com serviços especializados.\n\nGostaríamos de agendar uma conversa para entender suas necessidades.\n\nAtenciosamente,\n${company.name}`

    // Atualiza status do lead
    await fastify.prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'CONTACTED',
        contactHistory: JSON.stringify([...(JSON.parse(lead.contactHistory || '[]')), { channel: 'email', subject: defaultSubject, date: new Date().toISOString() }])
      }
    })

    return {
      to: lead.email,
      subject: defaultSubject,
      body: defaultBody,
      leadName: lead.name,
      mailtoUrl: `mailto:${lead.email}?subject=${encodeURIComponent(defaultSubject)}&body=${encodeURIComponent(defaultBody)}`
    }
  })

  // POST /leads/dispatches/bulk — disparo em massa
  fastify.post('/bulk', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { leadIds, channel, message, subject, body } = request.body
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return reply.code(400).send({ error: 'Lista de leads é obrigatória' })
    }
    if (!channel || !['whatsapp', 'email'].includes(channel)) {
      return reply.code(400).send({ error: 'Canal inválido. Use "whatsapp" ou "email"' })
    }

    const leads = await fastify.prisma.lead.findMany({
      where: { id: { in: leadIds }, companyId }
    })

    const results = []
    for (const lead of leads) {
      try {
        if (channel === 'whatsapp') {
          const phone = lead.whatsapp || lead.phone
          if (!phone) { results.push({ leadId: lead.id, name: lead.name, status: 'skipped', reason: 'Sem telefone' }); continue }
          const cleanPhone = phone.replace(/\D/g, '')
          const msg = message || `Olá ${lead.name}! Sou da ${lead.company?.name || 'sua empresa'}. Gostaria de apresentar nossas soluções.`
          const encodedMsg = encodeURIComponent(msg)
          const waUrl = `https://wa.me/55${cleanPhone}?text=${encodedMsg}`

          await fastify.prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'CONTACTED' }
          })
          results.push({ leadId: lead.id, name: lead.name, status: 'sent', url: waUrl, channel: 'whatsapp' })
        } else {
          if (!lead.email) { results.push({ leadId: lead.id, name: lead.name, status: 'skipped', reason: 'Sem e-mail' }); continue }
          const mailtoUrl = `mailto:${lead.email}?subject=${encodeURIComponent(subject || `Proposta — lead.company?.name`)}&body=${encodeURIComponent(body || '')}`
          results.push({ leadId: lead.id, name: lead.name, status: 'generated', url: mailtoUrl, channel: 'email' })
        }
      } catch (err) {
        results.push({ leadId: lead.id, name: lead.name, status: 'error', reason: err.message })
      }
    }

    return { processed: results.length, sent: results.filter(r => r.status === 'sent' || r.status === 'generated').length, results }
  })
}