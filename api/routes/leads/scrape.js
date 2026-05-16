// Rotas: /leads/scrape
// Scraping inteligente de websites para prospecção de leads

export default async function (fastify, opts) {
  // POST /leads/scrape — scraping inteligente de websites
  fastify.post('/', async (request, reply) => {
    const { companyId } = request.user
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' })

    const { url, segment, limit = 10 } = request.body
    if (!url) return reply.code(400).send({ error: 'URL é obrigatória para scraping' })

    try {
      // Import puppeteer dinamicamente para evitar problemas de compilação em alguns ambientes
      const puppeteer = await import('puppeteer')
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      const page = await browser.newPage()
      
      await page.goto(url, { waitUntil: 'networkidle2' })
      
      // Função de extração de dados da página
      const extractData = () => {
        const leads = []
        
        // Seletores comuns para encontrar informações de empresas/leads
        const selectors = [
          '.company', '.business', '.lead', '.prospect', '.client',
          '[data-company]', '[data-business]', '[data-lead]',
          '.listing', '.item', '.card', '.result'
        ]
        
        // Tentar encontrar elementos com esses seletores
        let elements = []
        for (const selector of selectors) {
          const found = document.querySelectorAll(selector)
          if (found.length > 0) {
            elements = Array.from(found)
            break
          }
        }
        
        // Se não encontrou com seletores específicos, tentar buscar por padrões de texto
        if (elements.length === 0) {
          // Buscar por padrões comuns de dados de empresas
          const allText = document.body.innerText
          const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
          
          // Extrair informações básicas de cada linha que parece conter dados de empresa
          for (const line of lines.slice(0, limit * 2)) { // Pegar mais linhas para filtrar depois
            if (line.length > 10 && line.length < 200) { // Filtro básico de tamanho
              // Verificar se contém indicadores de empresa
              const companyIndicators = ['ltda', 'inc', 'corp', 'company', 'corporation', 'ltda.', 'inc.', 'corp.']
              const hasIndicator = companyIndicators.some(ind => line.toLowerCase().includes(ind))
              
              if (hasIndicator || line.match(/\d{2,3}\.\d{3}\.\d{3}/)) { // Pode ser CNPJ ou telefone
                leads.push({
                  name: line.substring(0, 100), // Limitar tamanho
                  address: '',
                  phone: '',
                  email: '',
                  website: url
                })
                
                if (leads.length >= limit) break
              }
            }
          }
        } else {
          // Processar elementos encontrados
          for (const element of elements.slice(0, limit)) {
            const text = element.innerText || element.textContent || ''
            const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
            
            let name = ''
            let address = ''
            let phone = ''
            let email = ''
            let website = url
            
            // Tentar extrair informações estruturadas
            for (const line of lines) {
              if (!name && line.length > 3 && line.length < 100) {
                name = line
              } else if (!address && line.length > 10 && line.length < 200) {
                // Verificar se parece um endereço
                if (line.match(/rua|avenida|av\.|street|st\.|road|rd\.|alameda|travesseiro/i)) {
                  address = line
                }
              } else if (!phone && line.match(/\(\d{2}\)\s*\d{4,5}-?\d{4}/)) {
                phone = line.match(/\(\d{2}\)\s*\d{4,5}-?\d{4}/)[0]
              } else if (!email && line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
                email = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)[0]
              }
            }
            
            // Se não encontrou nome nos elementos, usar o texto completo
            if (!name && lines.length > 0) {
              name = lines[0].substring(0, 100)
            }
            
            if (name) {
              leads.push({
                name,
                address: address || '',
                phone: phone || '',
                email: email || '',
                website
              })
            }
          }
        }
        
        return leads
      }
      
      const leadsData = await page.evaluate(extractData)
      
      await browser.close()
      
      // Enriquecer leads com informações básicas
      const enrichedLeads = leadsData.map(lead => ({
        ...lead,
        source: 'SCRAPING',
        segment: segment || 'RESIDENCIAL',
        status: 'NEW',
        metadata: {
          scrapedFrom: url,
          scrapedAt: new Date().toISOString()
        }
      }))
      
      // Salvar leads no banco de dados
      const createdLeads = []
      for (const leadData of enrichedLeads) {
        if (!leadData.name) continue
        
        const lead = await fastify.prisma.lead.create({
          data: {
            companyId,
            name: leadData.name,
            email: leadData.email || null,
            phone: leadData.phone || null,
            whatsapp: null,
            address: leadData.address || null,
            city: null, // Será preenchido posteriormente se necessário
            state: null,
            lat: null,
            lng: null,
            segment: leadData.segment,
            source: leadData.source,
            status: leadData.status,
            distanceKm: null,
            metadata: leadData.metadata,
            notes: `Lead extraído via scraping de ${url}`
          }
        })
        
        createdLeads.push(lead)
      }
      
      return {
        scrapedFrom: url,
        totalFound: leadsData.length,
        created: createdLeads.length,
        leads: createdLeads
      }
    } catch (err) {
      fastify.log.error({ err }, 'Erro no scraping de leads')
      return reply.code(500).send({ 
        error: 'Erro no scraping de leads', 
        message: err.message,
        suggestion: 'Verifique se a URL está acessível e se o conteúdo permite scraping'
      })
    }
  })
}