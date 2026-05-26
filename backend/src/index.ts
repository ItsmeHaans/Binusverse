import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { registerPvpNamespace } from './websocket/pvp';

const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: { origin: env.FRONTEND_URL, credentials: true },
});

registerPvpNamespace(io);

server.listen(env.PORT, () => {
  console.log(`Binusverse backend running on port ${env.PORT}`);
});
