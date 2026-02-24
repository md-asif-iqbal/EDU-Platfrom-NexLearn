import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askGemini, buildStudyPlanPrompt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjects, examDate, hoursPerDay } = await req.json();

    if (!subjects?.length || !examDate || !hoursPerDay) {
      return NextResponse.json(
        { error: "Subjects, exam date, and hours per day are required" },
        { status: 400 }
      );
    }

    const prompt = buildStudyPlanPrompt(subjects, examDate, hoursPerDay);
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
        { error: "Failed to parse study plan. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error("AI Planner error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate study plan" },
      { status: 500 }
    );
  }
}
