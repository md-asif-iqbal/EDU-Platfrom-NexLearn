import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askGemini, buildQuizPrompt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, topic, difficulty } = await req.json();

    if (!subject || !topic || !difficulty) {
      return NextResponse.json(
        { error: "Subject, topic, and difficulty are required" },
        { status: 400 }
      );
    }

    const prompt = buildQuizPrompt(subject, topic, difficulty);
    const aiResponse = await askGemini(prompt);

    // Parse JSON from response
    let quiz;
    try {
      const cleaned = aiResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      quiz = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse quiz data. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ quiz });
  } catch (error: unknown) {
    console.error("AI Quiz error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
