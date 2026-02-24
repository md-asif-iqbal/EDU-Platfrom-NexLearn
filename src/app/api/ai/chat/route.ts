import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import AIChat from "@/models/AIChat";
import { askGemini, buildHomeworkPrompt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { question, subject, chatId } = await req.json();

    if (!question || !subject) {
      return NextResponse.json(
        { error: "Question and subject are required" },
        { status: 400 }
      );
    }

    const prompt = buildHomeworkPrompt(subject, question);
    const aiResponse = await askGemini(prompt);

    let chat;
    if (chatId) {
      chat = await AIChat.findById(chatId);
      if (chat) {
        chat.messages.push(
          { role: "user", content: question, timestamp: new Date() },
          { role: "assistant", content: aiResponse, timestamp: new Date() }
        );
        await chat.save();
      }
    }

    if (!chat) {
      chat = await AIChat.create({
        student: session.user.id,
        subject,
        messages: [
          { role: "user", content: question, timestamp: new Date() },
          { role: "assistant", content: aiResponse, timestamp: new Date() },
        ],
      });
    }

    return NextResponse.json({
      response: aiResponse,
      chatId: chat._id,
    });
  } catch (error: unknown) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get AI response" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const chats = await AIChat.find({ student: session.user.id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ chats });
  } catch (error: unknown) {
    console.error("AI Chat GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
