import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import User from "@/models/User";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const tutorId = searchParams.get("tutorId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: Record<string, unknown> = {};
    if (courseId) query.course = courseId;
    if (tutorId) query.tutor = tutorId;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("student", "name avatar")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { tutorId, courseId, rating, comment } = await req.json();

    if (!tutorId || !courseId || !rating || !comment) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const existingReview = await Review.findOne({
      student: session.user.id,
      course: courseId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this course" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      student: session.user.id,
      tutor: tutorId,
      course: courseId,
      rating,
      comment,
    });

    // Update tutor's average rating
    const tutorReviews = await Review.find({ tutor: tutorId });
    const avgRating =
      tutorReviews.reduce((sum, r) => sum + r.rating, 0) /
      tutorReviews.length;

    await User.findByIdAndUpdate(tutorId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: tutorReviews.length,
    });

    // Update course rating
    const courseReviews = await Review.find({ course: courseId });
    const courseAvg =
      courseReviews.reduce((sum, r) => sum + r.rating, 0) /
      courseReviews.length;

    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(courseAvg * 10) / 10,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("student", "name avatar")
      .populate("course", "title");

    return NextResponse.json(
      { message: "Review submitted successfully", review: populatedReview },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Review POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit review" },
      { status: 500 }
    );
  }
}
