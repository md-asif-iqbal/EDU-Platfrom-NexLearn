import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const data = await resend.emails.send({
      from: "NexLearn <noreply@nexlearn.app>",
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send email");
  }
}

export function welcomeEmailTemplate(name: string): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563EB; font-size: 28px;">⚡ Welcome to NexLearn!</h1>
      </div>
      <p style="font-size: 16px; color: #333;">Hi ${name},</p>
      <p style="font-size: 16px; color: #333;">
        Welcome to NexLearn — Your Next Level of Learning Starts Here! We're excited to have you on board.
      </p>
      <div style="background: linear-gradient(135deg, #2563EB, #7C3AED); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
        <h2 style="color: white; margin: 0;">Start Learning Today</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0;">
          Explore courses, connect with tutors, and use AI tools to supercharge your learning.
        </p>
        <a href="${process.env.NEXTAUTH_URL}/courses" 
           style="display: inline-block; background: white; color: #2563EB; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
          Browse Courses
        </a>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">
        © 2025 NexLearn. Built by Asif. All rights reserved.
      </p>
    </div>
  `;
}

export function sessionBookingTemplate(
  studentName: string,
  tutorName: string,
  date: string,
  subject: string
): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563EB;">📅 Session Booked!</h1>
      <p>Hi ${studentName},</p>
      <p>Your tutoring session has been confirmed:</p>
      <div style="background: #F8FAFC; padding: 20px; border-radius: 12px; border-left: 4px solid #2563EB;">
        <p><strong>Tutor:</strong> ${tutorName}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Date:</strong> ${date}</p>
      </div>
      <p>You'll receive a link to join the session before it starts.</p>
      <p style="font-size: 14px; color: #666;">— The NexLearn Team</p>
    </div>
  `;
}
