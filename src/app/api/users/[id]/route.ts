import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error("User GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    // Only admin or the user themselves can update
    if (session.user.role !== "admin" && session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Fields that admin can update
    const adminFields: Record<string, unknown> = {};
    if (session.user.role === "admin") {
      if (typeof body.isVerified === "boolean") adminFields.isVerified = body.isVerified;
      if (body.role) adminFields.role = body.role;
    }

    // Fields the user can update about themselves
    const userFields: Record<string, unknown> = {};
    if (body.name) userFields.name = body.name;
    if (body.phone) userFields.phone = body.phone;
    if (body.bio) userFields.bio = body.bio;
    if (body.avatar) userFields.avatar = body.avatar;
    if (body.hourlyRate !== undefined) userFields.hourlyRate = body.hourlyRate;
    if (body.subjects) userFields.subjects = body.subjects;

    const updateData = { ...userFields, ...adminFields };

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully", user });
  } catch (error: unknown) {
    console.error("User PUT error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    );
  }
}
