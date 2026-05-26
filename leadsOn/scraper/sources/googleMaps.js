import { chromium } from 'playwright';

/**
 * Normaliza número de telefone (remove espaços e caracteres especiais)
 * e adiciona o código do Brasil (55) se não houver.
 */
function normalizarTelefone(raw) {
  if (!raw) return '';
  const digitos = raw.replace(/\D/g, '');
  if (digitos.length < 10) return '';
  if (digitos.startsWith('55') && digitos.length >= 12) return digitos;
  return `55${digitos}`;
}

/**
 * Busca o WhatsApp ou Instagram no HTML de um site.
 */
async function buscarRedesSociaisNoSite(browser, url) {
  if (!url || !url.startsWith('http')) return { instagram: null, siteWhatsApp: null };
  
  const page = await browser.newPage();
  try {
    // Timeout curto para não prender o scraper se o site for lento/quebrado
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Extrai todos os links (href) da página inicial
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => a.href);
    });

    let instagram = null;
    let siteWhatsApp = null;

    for (const link of links) {
      if (!link) continue;
      if (link.includes('instagram.com/')) {
        instagram = link;
      }
      if (link.includes('wa.me/') || link.includes('api.whatsapp.com/') || link.includes('whatsapp://')) {
        siteWhatsApp = link;
      }
    }

    return { instagram, siteWhatsApp };
  } catch (err) {
    console.log(`      ⚠️  Falha ao acessar site ${url}: ${err.message.split('\n')[0]}`);
    return { instagram: null, siteWhatsApp: null };
  } finally {
    await page.close();
  }
}

/**
 * Scraper do Google Maps com Playwright.
 * Busca negócios, extrai telefone do Maps, abre os sites encontrados
 * para buscar Instagram e links diretos de WhatsApp.
 */
export async function buscarLeadsGoogleMaps({ cidade, estado, termo, limite = 100 }) {
  console.log(`\n🚀 Iniciando navegador para buscar: "${termo} em ${cidade} ${estado}"`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  const leads = [];

  try {
    const query = encodeURIComponent(`${termo} em ${cidade} ${estado}`);
    const url = `https://www.google.com/maps/search/${query}`;
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // Aguarda o JS do Maps renderizar o conteúdo
    await page.waitForSelector('div[role="feed"], div[role="main"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Aceitar cookies do Google se aparecer (Europa/alguns IPs)
    try {
      const btnAceitar = await page.locator('button:has-text("Aceitar tudo")');
      if (await btnAceitar.isVisible()) {
        await btnAceitar.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) { /* ignora */ }

    // O Google Maps carrega os resultados num painel lateral (role="feed")
    // Vamos fazer scroll neste painel para carregar mais resultados.
    const feedLocator = page.locator('div[role="feed"]');
    await feedLocator.waitFor({ state: 'visible', timeout: 15000 });

    console.log(`  📜 Carregando resultados (rolando a página)...`);
    
    let previousCount = 0;
    let attempts = 0;
    
    while (leads.length < limite && attempts < 10) {
      // Pega todos os cards de locais carregados até agora
      const articles = page.locator('div[role="feed"] > div > div[role="article"]');
      const count = await articles.count();
      
      if (count === previousCount) {
        attempts++;
      } else {
        attempts = 0;
      }
      previousCount = count;

      // Fazer scroll no último elemento carregado
      if (count > 0) {
        await articles.nth(count - 1).scrollIntoViewIfNeeded();
      }
      
      // Checa se apareceu o fim da lista ("You've reached the end of the list.")
      const endText = await page.getByText("You've reached the end of the list").isVisible();
      const endTextPT = await page.getByText("Você chegou ao final da lista").isVisible();
      if (endText || endTextPT) break;

      await page.waitForTimeout(2000); // Aguarda carregamento AJAX
    }

    // Agora que rolamos a lista, vamos processar cada item encontrado.
    const finalArticles = page.locator('div[role="feed"] > div > div[role="article"]');
    const totalEncontrados = await finalArticles.count();
    console.log(`  ✅ ${totalEncontrados} locais carregados. Extraindo dados e acessando sites...`);

    const limiteExtrair = Math.min(totalEncontrados, limite);

    for (let i = 0; i < limiteExtrair; i++) {
      const article = finalArticles.nth(i);
      
      // Nome do local
      const nome_original = await article.getAttribute('aria-label') || '';
      if (!nome_original) continue;

      // Clicar no local para abrir o painel de detalhes (onde tem o site e telefone estruturado)
      await article.click();
      await page.waitForTimeout(2000); // Aguarda painel abrir

      // Extrair informações do painel lateral direito
      let mapsPhone = '';
      let website = '';

      // Aguarda o painel carregar completamente
      await page.waitForTimeout(1500);

      try {
        // Método 1: Buscar qualquer botão com ícone de telefone no painel
        const phoneBtn = page.locator('button[aria-label*="Telefone"], button[aria-label*="telefone"], button[data-item-id*="phone"]');
        if (await phoneBtn.count() > 0) {
          const ariaLabel = await phoneBtn.first().getAttribute('aria-label');
          if (ariaLabel) {
            // Extrai números do aria-label
            const nums = ariaLabel.match(/[\d\s()+-]+/);
            if (nums) mapsPhone = nums[0].trim();
          }
        }
      } catch (e) { /* ignora */ }

      // Método 2: Buscar link tel: no painel de detalhes
      if (!mapsPhone) {
        try {
          const telLink = await page.locator('a[href^="tel:"]').first().getAttribute('href', { timeout: 2000 });
          if (telLink) mapsPhone = telLink.replace('tel:', '').trim();
        } catch (e) { /* ignora */ }
      }

      // Método 3: Extrair texto do painel que parece telefone (padrão brasileiro)
      if (!mapsPhone) {
        try {
          const panelText = await page.locator('div[role="main"] div[jsaction]').first().textContent({ timeout: 2000 });
          if (panelText) {
            const phoneMatch = panelText.match(/(\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4})/);
            if (phoneMatch) mapsPhone = phoneMatch[1];
          }
        } catch (e) { /* ignora */ }
      }

      try {
        const siteButton = page.locator('a[data-tooltip="Abrir website"], a[aria-label*="website"], a[data-item-id*="website"]');
        if (await siteButton.count() > 0) {
          website = await siteButton.first().getAttribute('href') || '';
        }
      } catch (e) { /* ignora */ }

      let whatsapp = normalizarTelefone(mapsPhone);
      let instagram = null;
      let siteWhatsApp = null;

      // Se achou um site, visita o site para tentar pegar redes sociais
      if (website) {
        console.log(`    🌐 Visitando site de: ${nome_original}`);
        const socialData = await buscarRedesSociaisNoSite(browser, website);
        instagram = socialData.instagram;
        siteWhatsApp = socialData.siteWhatsApp;
        
        // Se o site forneceu um link direto de wa.me, priorizamos ele para o número de whats
        if (siteWhatsApp) {
          const waMatch = siteWhatsApp.match(/wa\.me\/(?:55)?(\d+)/) || siteWhatsApp.match(/phone=(?:55)?(\d+)/);
          if (waMatch && waMatch[1]) {
            whatsapp = `55${waMatch[1]}`;
          }
        }
      }

      leads.push({
        nome_original,
        whatsapp,
        cidade,
        estado,
        segmento: termo,
        instagram,
        website
      });

      process.stdout.write(`    ↳ Capturado: ${nome_original} | Tel: ${whatsapp || 'N/A'}\n`);
    }

  } catch (error) {
    console.error(`\n❌ Erro durante scraping do Google Maps: ${error.message}`);
  } finally {
    await browser.close();
  }

  return leads.filter(lead => lead.nome_original && lead.nome_original.trim() !== '');
}
