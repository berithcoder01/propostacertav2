// scripts/seedBusinessTypeKnowledge.js
// Popula a base de conhecimento de tipos de negócio com embeddings
// Execute: node scripts/seedBusinessTypeKnowledge.js

import { PrismaClient } from '@prisma/client';
import { BUSINESS_TYPE_KNOWLEDGE_BASE } from '../lib/businessTypeKnowledgeBase.js';

const prisma = new PrismaClient();

// Gera um embedding determinístico simplificado a partir do texto
// Em produção, substituir por chamada à API de embedding (ex: Gemini embedding-001)
function generateSimpleEmbedding(text, dimensions = 1536) {
  const vector = new Array(dimensions).fill(0);
  const chars = text.split('');
  for (let i = 0; i < chars.length; i++) {
    const code = chars[i].charCodeAt(0) || 0;
    const idx = i % dimensions;
    vector[idx] += Math.sin(code) * (1 / (i + 1));
  }
  // Normalizar
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= magnitude;
    }
  }
  return vector;
}

async function main() {
  console.log('🌱 Iniciando seed da base de conhecimento de tipos de negócio...');
  console.log(`📦 Total de entradas: ${BUSINESS_TYPE_KNOWLEDGE_BASE.length}`);

  let created = 0;
  let skipped = 0;

  for (const entry of BUSINESS_TYPE_KNOWLEDGE_BASE) {
    const existing = await prisma.businessTypeKnowledge.findFirst({
      where: { description: entry.description },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const embedding = generateSimpleEmbedding(entry.description);
    const vectorStr = `[${embedding.join(',')}]`;

    await prisma.$executeRawUnsafe(`
      INSERT INTO "BusinessTypeKnowledge" (
        id, description, "businessType", segment, "primaryIntention", "primaryAction", "secondaryAction",
        keywords, confidence, embedding, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2::"BusinessType", $3::"Segment", $4, $5, $6,
        $7::text[], $8, $9::vector, NOW(), NOW()
      )
    `,
      entry.description,
      entry.businessType,
      entry.segment,
      entry.primaryIntention,
      entry.primaryAction,
      entry.secondaryAction || null,
      entry.keywords || [],
      entry.confidence || 0.85,
      vectorStr
    );
    created++;
  }

  console.log(`✅ Seed concluído! ${created} criados, ${skipped} já existentes.`);

  // Estatísticas
  const total = await prisma.businessTypeKnowledge.count();
  const byTypeRaw = await prisma.$queryRawUnsafe(`
    SELECT "businessType", COUNT(*)::int as count
    FROM "BusinessTypeKnowledge"
    GROUP BY "businessType"
  `);
  console.log(`📊 Total na base: ${total}`);
  for (const t of byTypeRaw) {
    console.log(`   ${t.businessType}: ${t.count}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
