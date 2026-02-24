import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { adminAuth } from "@/lib/firebase-admin";

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Firebase Google token provider ──────────────
    // Called after client-side Firebase Google sign-in
    CredentialsProvider({
      id: "firebase-google",
      name: "Google (Firebase)",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) throw new Error("No token provided");

        if (!adminAuth) throw new Error("Firebase Admin is not configured on this server");
        let decoded;
        try {
          decoded = await adminAuth.verifyIdToken(credentials.idToken);
        } catch {
          throw new Error("Invalid or expired Google token");
        }

        const { uid, email, name, picture } = decoded;
        if (!email) throw new Error("Google account has no email");

        await connectDB();
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: name || email.split("@")[0],
            email,
            avatar: picture || "",
            role: credentials.role || "student",
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
