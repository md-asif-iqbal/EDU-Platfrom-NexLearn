import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Course from "@/models/Course";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId).populate("tutor", "name");
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100),
      currency: "usd",
      metadata: {
        courseId: course._id.toString(),
        userId: session.user.id,
        courseName: course.title,
      },
    });

    const payment = await Payment.create({
      user: session.user.id,
      course: courseId,
      amount: course.price,
      currency: "usd",
      stripePaymentId: paymentIntent.id,
      status: "pending",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error: unknown) {
    console.error("Payment POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment" },
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

    const payments = await Payment.find({ user: session.user.id })
      .populate("course", "title thumbnail subject price")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ payments });
  } catch (error: unknown) {
    console.error("Payments GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
