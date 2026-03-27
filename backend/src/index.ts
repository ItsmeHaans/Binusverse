import './config/env'; // validate env vars first
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { initPvpSocket } from './websocket/pvp';
import { startCronJobs } from './services/cron';
import prisma from './prismaClient';

const server = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────

const io = new SocketIOServer(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initPvpSocket(io);

// ─── Start ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Test DB connection
  await prisma.$connect();
  console.log('[DB] Connected to PostgreSQL');

  // Start background jobs
  startCronJobs();

  server.listen(env.PORT, () => {
    console.log(`[Server] BINUSVERSE backend running on http://localhost:${env.PORT}`);
    console.log(`[Server] Environment: ${env.NODE_ENV}`);
    console.log(`[Server] CORS origin: ${env.FRONTEND_URL}`);
    console.log(`[WS] Socket.io PvP namespace: /pvp`);
  });
}

main().catch((err) => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
