import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/auth/firebase-google
 * Body: { idToken: string, role?: "student" | "tutor" }
 *
 * 1. Verifies the Firebase ID token with Firebase Admin SDK
 * 2. Upserts the user in MongoDB
 * 3. Returns user data so the client can call NextAuth signIn("credentials", ...)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idToken: string | undefined = body?.idToken;
    const role: string = body?.role || "student";

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 });
    }

    // ── Verify Firebase ID token ──────────────────────
    if (!adminAuth) {
      return NextResponse.json({ error: "Firebase Admin SDK not configured. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env.local" }, { status: 503 });
    }
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Invalid or expired Google token" }, { status: 401 });
    }

    const { uid, email, name, picture } = decoded;

    if (!email) {
      return NextResponse.json({ error: "Google account has no email" }, { status: 400 });
    }

    // ── Upsert user in MongoDB ────────────────────────
    await connectDB();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        avatar: picture || "",
        role,
        isVerified: true,
        googleId: uid,
      });
    } else {
      // Sync googleId / avatar on first Google login for existing users
      let changed = false;
      if (!user.googleId) { user.googleId = uid; changed = true; }
      if (!user.avatar && picture) { user.avatar = picture; changed = true; }
      if (!user.isVerified) { user.isVerified = true; changed = true; }
      if (changed) await user.save();
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error: unknown) {
    console.error("[firebase-google]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
