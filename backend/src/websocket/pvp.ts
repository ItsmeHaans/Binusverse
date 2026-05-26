import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { battleService } from '../services/battle.service';

interface AuthSocket extends Socket {
  userId?: string;
}

export function registerPvpNamespace(io: Server) {
  const pvp = io.of('/pvp');

  pvp.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) return next(new Error('No token'));
    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  pvp.on('connection', (socket: AuthSocket) => {
    socket.on('join_session', (sessionId: string) => {
      socket.join(sessionId);
    });

    socket.on('answer', async (data: {
      sessionId: string;
      questionId: string;
      answer: string;
      timeTaken: number;
    }) => {
      if (!socket.userId) return;

      try {
        const result = await battleService.submitPvpAnswer(
          data.sessionId,
          socket.userId,
          data.questionId,
          data.answer,
          data.timeTaken,
        );

        socket.to(data.sessionId).emit('opponent_answered', {
          questionId: data.questionId,
          correct: result.correct,
        });

        const room = pvp.adapter.rooms.get(data.sessionId);
        if (room && room.size >= 2) {
          const session = await (await import('../prisma')).default.pvpSession.findUnique({
            where: { id: data.sessionId },
            include: { answers: true },
          });

          if (session) {
            const challengerAnswers = session.answers.filter((a) => a.userId === session.challengerId);
            const opponentAnswers = session.answers.filter((a) => a.userId === session.opponentId);

            const totalQ = 10;
            if (challengerAnswers.length >= totalQ && opponentAnswers.length >= totalQ) {
              await battleService.finalizePvpSession(data.sessionId);
              pvp.to(data.sessionId).emit('session_finished', { sessionId: data.sessionId });
            }
          }
        }
      } catch (err) {
        socket.emit('error', { message: (err as Error).message });
      }
    });

    socket.on('disconnect', () => {
      // no-op: session stays open until finalized
    });
  });
}
