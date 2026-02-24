import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// Verify the HMAC signature sent from the client after Firebase popup
function verifyGooglePayload(payload: string, sig: string): boolean {
  const secret = process.env.NEXT_PUBLIC_NEXTAUTH_HMAC_SECRET || process.env.NEXTAUTH_SECRET || "";
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Firebase Google provider (no Admin SDK needed) ──
    // Client does Firebase popup → gets uid/email/name/picture
    // Signs payload with NEXTAUTH_SECRET HMAC → sends here
    CredentialsProvider({
      id: "firebase-google",
      name: "Google (Firebase)",
      credentials: {
        uid:     { label: "UID",     type: "text" },
        email:   { label: "Email",   type: "text" },
        name:    { label: "Name",    type: "text" },
        picture: { label: "Picture", type: "text" },
        role:    { label: "Role",    type: "text" },
        sig:     { label: "Sig",     type: "text" },
      },
      async authorize(credentials) {
        const { uid, email, name, picture, role, sig } = credentials ?? {};
        if (!uid || !email || !sig) throw new Error("Missing Google credentials");

        // Verify HMAC so only our own client can use this provider
        const payload = `${uid}:${email}`;
        if (!verifyGooglePayload(payload, sig)) {
          throw new Error("Invalid Google sign-in signature");
        }

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

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),

    // ── Email / Password provider ───────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select(
          "+password"
        );

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password) {
          throw new Error("Please sign in with Google");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
