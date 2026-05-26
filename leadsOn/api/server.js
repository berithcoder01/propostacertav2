import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';

const PORT = Number(process.env.API_PORT) || 3001;
const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

// Health Check
app.get('/health', async () => ({ ok: true, timestamp: new Date().toISOString() }));

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🤖 Agente LeadsOn (Worker) rodando na porta ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
