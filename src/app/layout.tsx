import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import AIChatbot from "@/components/ai-chatbot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NexLearn — Your Next Level of Learning Starts Here",
  description:
    "NexLearn is an  online tutoring platform. Connect with expert tutors, get AI homework help, generate quizzes, and create personalized study plans.",
  keywords: [
    "tutoring",
    "AI learning",
    "online education",
    "NexLearn",
    "homework help",
    "study planner",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <AIChatbot />
        </Providers>
      </body>
    </html>
  );
}
