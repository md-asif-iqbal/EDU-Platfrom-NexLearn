import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askGemini, buildEssayPrompt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { essay } = await req.json();

    if (!essay || essay.trim().length < 50) {
      return NextResponse.json(
        { error: "Essay must be at least 50 characters long" },
        { status: 400 }
      );
    }

    const prompt = buildEssayPrompt(essay);
    const aiResponse = await askGemini(prompt);

    let result;
    try {
      const cleaned = aiResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse essay analysis. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error("AI Essay error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check essay" },
      { status: 500 }
    );
  }
}
