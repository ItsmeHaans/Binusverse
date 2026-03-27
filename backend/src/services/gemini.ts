import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface QuizQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  topic: string;
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface LearnAnalysisResult {
  strength: string[];
  weakness: string[];
}

export interface SkillUpgradeSuggestion {
  title: string;
  youtubeUrl: string;
  description: string;
  topicTag: string;
}

/** Parse AI JSON response safely. */
function parseJson<T>(text: string): T {
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ?? text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  const raw = jsonMatch ? jsonMatch[1] ?? jsonMatch[0] : text.trim();
  return JSON.parse(raw) as T;
}

/** Generate multiple-choice questions for the daily quiz. */
export async function generateDailyQuizQuestions(count = 10): Promise<QuizQuestion[]> {
  const prompt = `Generate ${count} multiple-choice questions for university students about computer science topics.
Topics can include: algorithms, data structures, databases, networking, operating systems, software engineering, web development, AI/ML basics, cybersecurity.

Return ONLY a JSON array with this exact structure, no extra text:
[
  {
    "question": "...",
    "optionA": "...",
    "optionB": "...",
    "optionC": "...",
    "optionD": "...",
    "correctOption": "A",
    "topic": "algorithms",
    "difficulty": "normal"
  }
]

- correctOption must be exactly "A", "B", "C", or "D"
- difficulty must be "easy", "normal", or "hard"
- Mix difficulties: 3 easy, 5 normal, 2 hard`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const questions = parseJson<QuizQuestion[]>(text);

  return questions.map((q) => ({
    ...q,
    correctOption: q.correctOption.toUpperCase(),
    difficulty: q.difficulty ?? 'normal',
  }));
}

/** Generate questions filtered by difficulty for Raid mode. */
export async function generateRaidQuestions(
  difficulty: 'easy' | 'normal' | 'hard',
  count = 10
): Promise<QuizQuestion[]> {
  const prompt = `Generate ${count} multiple-choice questions at ${difficulty} difficulty for university computer science students.
Topics: algorithms, data structures, databases, networking, OS, software engineering, web development.

Return ONLY a JSON array:
[
  {
    "question": "...",
    "optionA": "...",
    "optionB": "...",
    "optionC": "...",
    "optionD": "...",
    "correctOption": "A",
    "topic": "...",
    "difficulty": "${difficulty}"
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const questions = parseJson<QuizQuestion[]>(text);
  return questions.map((q) => ({ ...q, correctOption: q.correctOption.toUpperCase(), difficulty }));
}

/** Analyze a user's battle results and return strength/weakness topics. */
export async function analyzeUserPerformance(
  battleData: { topic: string; correct: boolean }[]
): Promise<LearnAnalysisResult> {
  if (battleData.length === 0) {
    return { strength: [], weakness: [] };
  }

  const prompt = `Analyze this student's quiz performance data and identify their academic strengths and weaknesses.

Performance data (topic + whether they answered correctly):
${JSON.stringify(battleData, null, 2)}

Return ONLY a JSON object:
{
  "strength": ["topic1", "topic2"],
  "weakness": ["topic3", "topic4"]
}

- List up to 5 strengths and 5 weaknesses
- Be specific (e.g., "Binary Search Trees" not just "Data Structures")
- Only include topics that appear in the data`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJson<LearnAnalysisResult>(text);
}

/** Suggest YouTube learning videos based on weakness topics. */
export async function suggestSkillUpgradeVideos(
  weaknessTopics: string[]
): Promise<SkillUpgradeSuggestion[]> {
  if (weaknessTopics.length === 0) return [];

  const prompt = `Suggest educational YouTube videos for a computer science student who is weak in these topics: ${weaknessTopics.join(', ')}.

Return ONLY a JSON array of 9 suggestions (3 per topic, max 9 total):
[
  {
    "title": "Understanding Binary Search Trees - Full Tutorial",
    "youtubeUrl": "https://www.youtube.com/results?search_query=binary+search+trees+tutorial",
    "description": "A comprehensive tutorial covering BST operations and implementation",
    "topicTag": "data structures"
  }
]

- youtubeUrl must be a YouTube search URL: https://www.youtube.com/results?search_query=<keywords>
- Use specific search terms to find relevant videos
- Titles should be descriptive and realistic`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJson<SkillUpgradeSuggestion[]>(text);
}
