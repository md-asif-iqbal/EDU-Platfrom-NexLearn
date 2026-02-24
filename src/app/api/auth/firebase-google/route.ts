import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

/**
 * POST /api/auth/firebase-google
 * Body: { uid, email, name, picture, role, sig }
 *
 * Called after client Firebase popup succeeds.
 * sig = HMAC-SHA256(`${uid}:${email}`, NEXTAUTH_SECRET)
 * — proves the request came from our own front-end.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, email, name, picture, role, sig } = body ?? {};

    if (!uid || !email || !sig) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Verify HMAC ────────────────────────────────────
    const secret = process.env.NEXT_PUBLIC_NEXTAUTH_HMAC_SECRET || process.env.NEXTAUTH_SECRET || "";
    const payload = `${uid}:${email}`;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    let valid = false;
    try {
      valid = crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
    } catch {
      valid = false;
    }
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // ── Upsert user in MongoDB ────────────────────────
    await connectDB();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        avatar: picture || "",
        role: role || "student",
        isVerified: true,
        googleId: uid,
      });
    } else {
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
