import prisma from '../prismaClient';
import { analyzeUserPerformance, suggestSkillUpgradeVideos } from './gemini';

export async function analyzePerformance(userId: string) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const cached = await prisma.learnAnalysis.findUnique({ where: { userId } });
  if (cached && cached.updatedAt > twentyFourHoursAgo) {
    return { strength: cached.strength, weakness: cached.weakness, cached: true };
  }

  const pvpAnswers = await prisma.pvpAnswer.findMany({
    where: { userId },
    include: { question: { select: { topic: true } } },
    take: 100,
    orderBy: { createdAt: 'desc' },
  });

  const battleData = pvpAnswers
    .filter((a) => a.question.topic)
    .map((a) => ({ topic: a.question.topic as string, correct: a.correct }));

  const analysis = await analyzeUserPerformance(battleData);

  await prisma.learnAnalysis.upsert({
    where: { userId },
    create: { userId, strength: analysis.strength, weakness: analysis.weakness },
    update: { strength: analysis.strength, weakness: analysis.weakness, updatedAt: new Date() },
  });

  return { ...analysis, cached: false };
}

export async function suggestVideos(userId: string, weaknessTopics: string[]) {
  const suggestions = await suggestSkillUpgradeVideos(weaknessTopics);

  await prisma.skillUpgrade.deleteMany({ where: { aiSuggestedFor: userId } });
  await prisma.skillUpgrade.createMany({
    data: suggestions.map((s) => ({
      title: s.title,
      youtubeUrl: s.youtubeUrl,
      topicTag: s.topicTag,
      aiSuggestedFor: userId,
    })),
  });

  return suggestions;
}

export async function getSkillUpgrades(userId: string, randomCount?: number) {
  const upgrades = await prisma.skillUpgrade.findMany({
    where: { aiSuggestedFor: userId },
    orderBy: { createdAt: 'desc' },
  });

  if (randomCount && randomCount > 0 && upgrades.length > randomCount) {
    return [...upgrades].sort(() => Math.random() - 0.5).slice(0, randomCount);
  }

  return upgrades;
}
