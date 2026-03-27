import { Server as SocketIOServer, Socket } from 'socket.io';
import prisma from '../prismaClient';
import { finalizePvpSession } from '../services/battle.service';

interface JoinPayload {
  sessionId: string;
  userId: string;
}

interface AnswerPayload {
  sessionId: string;
  userId: string;
  questionId: string;
  answer: string;
  timeTaken: number;
}

// sessionId → Set of userIds currently connected
const sessionParticipants = new Map<string, Set<string>>();
// userId → socketId for direct messaging
const userSockets = new Map<string, string>();

export function initPvpSocket(io: SocketIOServer): void {
  const pvp = io.of('/pvp');

  pvp.on('connection', (socket: Socket) => {
    console.log(`[PvP] Socket connected: ${socket.id}`);

    socket.on('join', async ({ sessionId, userId }: JoinPayload) => {
      try {
        const session = await prisma.pvpSession.findUnique({
          where: { id: sessionId },
          include: {
            challenger: { select: { id: true, name: true, level: true } },
            opponent:   { select: { id: true, name: true, level: true } },
          },
        });

        if (!session) { socket.emit('error', { message: 'Session not found' }); return; }
        if (session.challengerId !== userId && session.opponentId !== userId) {
          socket.emit('error', { message: 'You are not part of this session' }); return;
        }
        if (session.status === 'FINISHED') { socket.emit('error', { message: 'Session already finished' }); return; }

        socket.join(`pvp:${sessionId}`);
        userSockets.set(userId, socket.id);

        if (!sessionParticipants.has(sessionId)) sessionParticipants.set(sessionId, new Set());
        sessionParticipants.get(sessionId)!.add(userId);

        socket.emit('joined', { sessionId, session });

        // Start when both players are connected
        const participants = sessionParticipants.get(sessionId)!;
        if (
          participants.has(session.challengerId) &&
          participants.has(session.opponentId) &&
          session.status === 'WAITING'
        ) {
          await prisma.pvpSession.update({ where: { id: sessionId }, data: { status: 'ACTIVE' } });

          const today = new Date().toISOString().slice(0, 10);
          const questions = await prisma.dailyQuiz.findMany({
            where: { quizDate: today },
            take: 10,
            select: { id: true, question: true, optionA: true, optionB: true, optionC: true, optionD: true, topic: true },
          });

          pvp.to(`pvp:${sessionId}`).emit('started', {
            sessionId,
            questions,
            challenger: session.challenger,
            opponent:   session.opponent,
          });
        }
      } catch (err) {
        console.error('[PvP] join error:', err);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    socket.on('answer', async ({ sessionId, userId, questionId, answer, timeTaken }: AnswerPayload) => {
      try {
        const session = await prisma.pvpSession.findUnique({ where: { id: sessionId } });
        if (!session || session.status !== 'ACTIVE') {
          socket.emit('error', { message: 'Session is not active' }); return;
        }

        const question = await prisma.dailyQuiz.findUnique({ where: { id: questionId } });
        if (!question) { socket.emit('error', { message: 'Question not found' }); return; }

        const alreadyAnswered = await prisma.pvpAnswer.findFirst({ where: { sessionId, userId, questionId } });
        if (alreadyAnswered) return;

        const correct = question.correctOption === answer.toUpperCase();
        await prisma.pvpAnswer.create({
          data: { sessionId, userId, questionId, answer: answer.toUpperCase(), timeTaken, correct },
        });

        // Notify opponent
        const opponentId = session.challengerId === userId ? session.opponentId : session.challengerId;
        const opponentSocketId = userSockets.get(opponentId);
        if (opponentSocketId) {
          pvp.to(opponentSocketId).emit('opponent_answered', { questionId, correct });
        }

        // Check if both players finished
        const today = new Date().toISOString().slice(0, 10);
        const totalQ = Math.min(await prisma.dailyQuiz.count({ where: { quizDate: today } }), 10);
        const challengerCount = await prisma.pvpAnswer.count({ where: { sessionId, userId: session.challengerId } });
        const opponentCount   = await prisma.pvpAnswer.count({ where: { sessionId, userId: session.opponentId } });

        if (challengerCount >= totalQ && opponentCount >= totalQ) {
          // Delegate all DB logic to the service
          const result = await finalizePvpSession(sessionId);
          if (result) {
            pvp.to(`pvp:${sessionId}`).emit('result', result);
          }
          sessionParticipants.delete(sessionId);
        }
      } catch (err) {
        console.error('[PvP] answer error:', err);
        socket.emit('error', { message: 'Failed to record answer' });
      }
    });

    socket.on('disconnect', () => {
      for (const [uid, sid] of userSockets.entries()) {
        if (sid === socket.id) { userSockets.delete(uid); break; }
      }
    });
  });
}
