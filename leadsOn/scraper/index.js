/**
 * Scraper Principal — LeadsOn (Google Maps Automatizado via Playwright)
 *
 * Arquitetura com Fila Sequencial:
 * - Triggers on-demand da API entram numa fila
 * - Processados um por um (Playwright não suporta paralelo)
 * - Daemon roda na madrugada (00h-06h) para todos os perfis ativos
 */

import 'dotenv/config';
import http from 'http';
import { scrapeProfile } from './engine.js';
import { pool } from '../src/db/client.js';

const args = process.argv.slice(2);
const forceRun = args.includes('--force');
const TRIGGER_PORT = 3001;

// Fila sequencial de companyId pendentes
const filaScraping = [];
let processandoFila = false;

function aguardar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function verificarHorario() {
  if (forceRun) return true;
  const agora = new Date();
  const hora = agora.getHours();
  return hora >= 0 && hora < 6;
}

async function getActiveProfiles() {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, c.city as companyCity, c.state as companyState 
      FROM "ProspectingProfile" p
      JOIN "Company" c ON p."companyId" = c.id
      WHERE p."autoProspecting" = true
    `);
    return rows;
  } catch (err) {
    console.error('Erro ao buscar perfis de prospecção:', err.message);
    return [];
  }
}

async function executarRodadaParaPerfil(profile) {
  return scrapeProfile(profile, {
    log: (msg) => console.log(`  ${msg}`)
  });
}

async function processarFila() {
  if (processandoFila || filaScraping.length === 0) return;
  
  processandoFila = true;
  
  while (filaScraping.length > 0) {
    const companyId = filaScraping.shift();
    console.log(`\n📋 Processando fila: companyId ${companyId} (${filaScraping.length} restantes)`);
    
    try {
      const { rows } = await pool.query(`
        SELECT p.*, c.city as companyCity, c.state as companyState 
        FROM "ProspectingProfile" p
        JOIN "Company" c ON p."companyId" = c.id
        WHERE p."companyId" = $1
      `, [companyId]);
      
      if (rows.length > 0) {
        await executarRodadaParaPerfil(rows[0]);
        console.log(`✅ Fila: ${companyId} concluído`);
      } else {
        console.log(`⚠️ Fila: ${companyId} - perfil não encontrado`);
      }
    } catch (err) {
      console.error(`❌ Fila: ${companyId} - erro: ${err.message}`);
    }
    
    // Pausa entre processamentos da fila
    if (filaScraping.length > 0) {
      await aguardar(5000);
    }
  }
  
  processandoFila = false;
}

function addToFila(companyId) {
  // Evita duplicatas na fila
  if (!filaScraping.includes(companyId)) {
    filaScraping.push(companyId);
    console.log(`📥 companyId ${companyId} adicionado à fila (tamanho: ${filaScraping.length})`);
    processarFila();
  } else {
    console.log(`⏭️ companyId ${companyId} já está na fila`);
  }
}

function getStatusFila() {
  return {
    tamanho: filaScraping.length,
    processando: processandoFila,
    fila: [...filaScraping]
  };
}

async function executarTodasRodadas() {
  const profiles = await getActiveProfiles();
  
  if (profiles.length === 0) {
    console.log('\n💤 Nenhum perfil de prospecção ativo encontrado.');
    return;
  }
  
  console.log(`\n🚀 Daemon: ${profiles.length} perfis ativos. Iniciando varredura...`);
  
  for (const profile of profiles) {
    await executarRodadaParaPerfil(profile);
  }
}

async function daemonLoop() {
  console.log(`🤖 Daemon de Scraping Multi-Tenant Iniciado.`);
  console.log(`   Janela de execução: 00:00 às 06:00`);
  console.log(`   Trigger HTTP ativo na porta ${TRIGGER_PORT}`);
  console.log(`   Fila sequencial: ativa`);
  
  if (forceRun) {
    console.log(`   ⚠️ MODO FORÇADO: Executando imediatamente.`);
    await executarTodasRodadas();
    console.log(`\n✅ Execução forçada concluída.`);
    process.exit(0);
  }

  while (true) {
    if (verificarHorario()) {
      await executarTodasRodadas();
      console.log(`\n💤 Rodada daemon concluída. Dormindo por 1 hora...`);
      await aguardar(60 * 60 * 1000);
    } else {
      const agora = new Date().toLocaleTimeString('pt-BR');
      console.log(`[${agora}] 💤 Fora do horário. Dormindo 30 minutos...`);
      await aguardar(30 * 60 * 1000);
    }
  }
}

// Servidor HTTP para receber triggers on-demand da API
const triggerServer = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'POST' && req.url === '/trigger') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { companyId } = JSON.parse(body);
        if (!companyId) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'companyId obrigatório' }));
        }
        
        // Adiciona à fila (não executa imediatamente)
        addToFila(companyId);
        
        res.writeHead(202);
        res.end(JSON.stringify({
          success: true,
          companyId,
          message: 'Adicionado à fila de scraping',
          posicaoFila: filaScraping.length,
          status: getStatusFila()
        }));
      } catch (err) {
        console.error('Erro no trigger:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: 'ok', 
      uptime: process.uptime(),
      fila: getStatusFila()
    }));
  } else if (req.method === 'GET' && req.url === '/fila') {
    res.writeHead(200);
    res.end(JSON.stringify(getStatusFila()));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

triggerServer.listen(TRIGGER_PORT, () => {
  console.log(`🌐 Servidor de trigger rodando em http://localhost:${TRIGGER_PORT}`);
  daemonLoop().catch(err => {
    console.error(' Erro fatal no daemon:', err);
    process.exit(1);
  });
});
