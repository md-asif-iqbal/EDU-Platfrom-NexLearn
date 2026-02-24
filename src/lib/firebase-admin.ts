import * as admin from "firebase-admin";

// Only initialise when real credentials are present (skipped during build/CI)
if (
  !admin.apps.length &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  !process.env.FIREBASE_PRIVATE_KEY.includes("YOUR_PRIVATE_KEY_HERE")
) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines that env vars often carry
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export default admin;
