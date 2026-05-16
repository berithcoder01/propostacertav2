import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../../.env.production');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?(\s|$)/);
process.env.DATABASE_URL = dbUrlMatch[1];

const prisma = new PrismaClient();

async function main() {
  console.log('Enabling pgvector extension...');
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('✅ Extension enabled successfully!');
  } catch (err) {
    console.error('❌ Error enabling extension:', err.message);
  }
}

main().finally(() => prisma.$disconnect());
