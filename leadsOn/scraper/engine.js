/**
 * Engine de Scraping Compartilhado
 * Usado tanto pelo daemon quanto pela API (trigger on-demand)
 */

import { DELAY_ENTRE_REQUISICOES_MS, MAX_LEADS_POR_BUSCA } from './config.js';
import { buscarLeadsGoogleMaps } from './sources/googleMaps.js';
import { inserirLote } from './inserter.js';
import { getCidadesAlvo } from './cities.js';

function aguardar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function scrapeProfile(profile, options = {}) {
  const { onProgress, log = console.log } = options;
  
  const scope = profile.businessScope || 'LOCAL';
  const baseCity = profile.baseCity || profile.companyCity || 'Maringá';
  const baseState = profile.baseState || profile.companyState || 'PR';
  
  const CIDADES_ALVO = getCidadesAlvo(scope, baseCity, baseState);
  
  log(`🏢 Scraping para: ${baseCity}/${baseState} (Alcance: ${scope})`);
  log(`📍 Cidades: ${CIDADES_ALVO.map(c => c.nome).join(', ')}`);

  // Busca por TIPOS DE CLIENTE (idealCustomerTypes), não por serviços oferecidos
  // Se a empresa faz "Reforma/Reparo", ela quer encontrar "Condomínios", "Lojas", etc.
  let TERMOS_ALVO = [];
  
  if (profile.idealCustomerTypes && profile.idealCustomerTypes.length > 0) {
    TERMOS_ALVO = profile.idealCustomerTypes;
  } else {
    // Fallback: busca por tipos de estabelecimentos que geralmente precisam de serviços
    TERMOS_ALVO = ['Condomínio', 'Shopping', 'Escola', 'Hospital', 'Escritório'];
  }

  TERMOS_ALVO = [...new Set(TERMOS_ALVO)];

  let totalGeral = { inseridos: 0, duplicados: 0, semWhatsapp: 0, leads: [] };
  let totalBuscas = CIDADES_ALVO.length * TERMOS_ALVO.length;
  let buscaAtual = 0;

  for (const cidade of CIDADES_ALVO) {
    for (const termo of TERMOS_ALVO) {
      buscaAtual++;
      const progresso = Math.round((buscaAtual / totalBuscas) * 100);
      
      log(`  🔎 [${progresso}%] Buscando "${termo}" em ${cidade.nome}...`);
      onProgress?.({ progress: progresso, cidade: cidade.nome, termo });

      try {
        const leads = await buscarLeadsGoogleMaps({
          cidade: cidade.nome,
          estado: cidade.estado,
          termo: termo,
          limite: MAX_LEADS_POR_BUSCA,
        });

        if (leads.length > 0) {
          const stats = await inserirLote(leads, profile.companyId);
          totalGeral.inseridos += stats.inseridos;
          totalGeral.duplicados += stats.duplicados;
          totalGeral.semWhatsapp += stats.semWhatsapp;
          totalGeral.leads = [...totalGeral.leads, ...leads];
          
          log(`    💾 ${stats.inseridos} novos | ${stats.duplicados} duplicados`);
        }
      } catch (err) {
        log(`    ❌ Erro: ${err.message}`);
      }

      if (buscaAtual < totalBuscas) {
        await aguardar(DELAY_ENTRE_REQUISICOES_MS);
      }
    }
  }

  log(`✅ Concluído: ${totalGeral.inseridos} leads novos encontrados`);
  return totalGeral;
}
