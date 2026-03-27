import cron from 'node-cron';
import prisma from '../prismaClient';
import { generateDailyQuizQuestions } from './gemini';

/** Generate daily quiz questions at midnight every day. */
export function startCronJobs(): void {
  // Run at 00:00 every day
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Generating daily quiz questions...');
    try {
      await generateAndSaveDailyQuiz();
      console.log('[Cron] Daily quiz generated successfully.');
    } catch (err) {
      console.error('[Cron] Failed to generate daily quiz:', err);
    }
  });

  console.log('[Cron] Jobs scheduled.');
}

/** Generate and save today's quiz questions. Can be called manually too. */
export async function generateAndSaveDailyQuiz(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  // Skip if already generated today
  const existing = await prisma.dailyQuiz.count({ where: { quizDate: today } });
  if (existing > 0) {
    console.log(`[Cron] Quiz for ${today} already exists (${existing} questions).`);
    return;
  }

  const questions = await generateDailyQuizQuestions(10);

  await prisma.dailyQuiz.createMany({
    data: questions.map((q) => ({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      topic: q.topic,
      difficulty: q.difficulty,
      quizDate: today,
      aiGenerated: true,
    })),
  });

  console.log(`[Cron] Saved ${questions.length} questions for ${today}.`);
}
