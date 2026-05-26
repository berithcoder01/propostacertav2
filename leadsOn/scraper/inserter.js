import { pool } from '../src/db/client.js';

/**
 * Insere um lead diretamente na tabela 'Lead' do PropostaCerta.
 * Usa ON CONFLICT para evitar duplicatas baseadas no WhatsApp.
 */
export async function inserirLead({ nome_original, whatsapp, cidade, estado, segmento, instagram, website }, companyId) {
  if (!companyId) return { inserido: false, motivo: 'erro_config' };

  // Verifica duplicata por WhatsApp
  if (whatsapp) {
    const { rows } = await pool.query(
      'SELECT id FROM "Lead" WHERE "whatsapp" = $1 AND "companyId" = $2 LIMIT 1',
      [whatsapp, companyId],
    );
    if (rows.length > 0) return { inserido: false, motivo: 'duplicado_whatsapp' };
  }

  // Verifica duplicata por Nome + Cidade (caso não tenha WhatsApp)
  if (!whatsapp) {
    const { rows } = await pool.query(
      'SELECT id FROM "Lead" WHERE "name" = $1 AND "city" = $2 AND "companyId" = $3 LIMIT 1',
      [nome_original, cidade, companyId],
    );
    if (rows.length > 0) return { inserido: false, motivo: 'duplicado_nome_cidade' };
  }

  // Mapeamento de Segmentos do Google Maps para o Enum do PropostaCerta
  const segmentoMap = {
    'pintor': 'RESIDENCIAL',
    'eletricista': 'RESIDENCIAL',
    'construção': 'COMERCIAL',
    'condomínio': 'CONDOMINIO',
    'indústria': 'INDUSTRIAL',
    'comércio': 'COMERCIAL',
    'comercial': 'COMERCIAL',
    'residencial': 'RESIDENCIAL',
    'loja': 'COMERCIAL',
    'escritório': 'COMERCIAL',
    'shopping': 'COMERCIAL',
    'escola': 'COMERCIAL',
    'hospital': 'COMERCIAL'
  };
  
  const segmentoDetectado = Object.keys(segmentoMap).find(k => 
    segmento?.toLowerCase().includes(k)
  ) ? segmentoMap[Object.keys(segmentoMap).find(k => segmento?.toLowerCase().includes(k))] : 'RESIDENCIAL';

  // Insere na tabela do PropostaCerta
  const { rowCount } = await pool.query(`
    INSERT INTO "Lead" (
      "id", "companyId", "name", "whatsapp", "city", "state", 
      "segment", "source", "status", "createdAt", "updatedAt",
      "score", "processedByAI", "aiProcessingMethod", "nomeLimpo", "segmentoDetectado", "metadata"
    )
    VALUES (
      gen_random_uuid(), 
      $8, 
      $1, $2, $3, $4, 
      $5::"LeadSegment", 'GOOGLE_PLACES', 'NEW', NOW(), NOW(),
      50, true, 'ollama', $1, $6, $7
    )
    ON CONFLICT DO NOTHING
  `, [nome_original, whatsapp || null, cidade, estado, segmentoDetectado, segmentoDetectado, JSON.stringify({ instagram: instagram || null, website: website || null }), companyId]);

  return { inserido: rowCount > 0, motivo: rowCount > 0 ? 'ok' : 'duplicado' };
}

/**
 * Insere um lote de leads e retorna estatísticas da operação.
 */
export async function inserirLote(leads, companyId) {
  let inseridos = 0;
  let duplicados = 0;
  let semWhatsapp = 0;

  for (const lead of leads) {
    if (!lead.whatsapp) semWhatsapp++;
    const { inserido } = await inserirLead(lead, companyId);
    if (inserido) inseridos++;
    else duplicados++;
  }

  return { total: leads.length, inseridos, duplicados, semWhatsapp };
}
