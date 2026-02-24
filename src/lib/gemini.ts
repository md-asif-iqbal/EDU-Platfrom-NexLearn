import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
});

export async function askGemini(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to get AI response");
  }
}

export function buildHomeworkPrompt(subject: string, question: string): string {
  return `You are an expert ${subject} tutor for school and university students in Bangladesh. The student asked: ${question}

Explain this clearly with step by step solution.
Use simple language. Add examples where helpful.
Format your response with clear headings and bullet points.`;
}

export function buildQuizPrompt(
  subject: string,
  topic: string,
  difficulty: string
): string {
  return `Generate exactly 10 multiple choice questions about ${topic} in ${subject} at ${difficulty} level for students.
Return ONLY valid JSON with no extra text, no markdown code blocks:
{"questions": [{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": "A) ...", "explanation": "..."}]}`;
}

export function buildEssayPrompt(essay: string): string {
  return `You are an expert English teacher. Check this student essay carefully.
Return ONLY valid JSON with no extra text, no markdown code blocks:
{"score": 75, "grammar": "feedback here", "structure": "feedback here", "vocabulary": "feedback here", "improvements": ["improvement 1", "improvement 2"], "strengths": ["strength 1", "strength 2"]}

Essay: ${essay}`;
}

export function buildStudyPlanPrompt(
  subjects: string[],
  examDate: string,
  hoursPerDay: number
): string {
  return `Create a detailed study plan for a student.
Subjects: ${subjects.join(", ")}
Exam date: ${examDate}
Hours available per day: ${hoursPerDay}
Return ONLY valid JSON with no extra text, no markdown code blocks:
{"plan": [{"day": "Day 1", "date": "2024-01-15", "tasks": [{"subject": "Math", "topic": "Algebra", "duration": "2 hours", "priority": "high"}]}], "tips": ["tip 1", "tip 2"]}`;
}
