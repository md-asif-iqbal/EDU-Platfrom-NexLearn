import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

function generateRoomId(): string {
  return `eduai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {
      $or: [{ tutor: session.user.id }, { student: session.user.id }],
    };

    if (status) query.status = status;

    const sessions = await Session.find(query)
      .populate("tutor", "name avatar")
      .populate("student", "name avatar")
      .populate("course", "title subject")
      .sort({ scheduledAt: 1 })
      .lean();

    return NextResponse.json({ sessions });
  } catch (error: unknown) {
    console.error("Sessions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { tutorId, courseId, scheduledAt, duration, price } = await req.json();

    if (!tutorId || !scheduledAt) {
      return NextResponse.json(
        { error: "Tutor and scheduled date are required" },
        { status: 400 }
      );
    }

    const roomId = generateRoomId();

    const newSession = await Session.create({
      tutor: tutorId,
      student: authSession.user.id,
      course: courseId || undefined,
      roomId,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      price: price || 0,
      status: "upcoming",
    });

    const populatedSession = await Session.findById(newSession._id)
      .populate("tutor", "name avatar")
      .populate("student", "name avatar")
      .populate("course", "title subject");

    return NextResponse.json(
      { message: "Session booked successfully", session: populatedSession },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Session POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to book session" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { sessionId, status, notes } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      updates,
      { new: true }
    )
      .populate("tutor", "name avatar")
      .populate("student", "name avatar")
      .populate("course", "title subject");

    if (!updatedSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Session updated successfully",
      session: updatedSession,
    });
  } catch (error: unknown) {
    console.error("Session PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
