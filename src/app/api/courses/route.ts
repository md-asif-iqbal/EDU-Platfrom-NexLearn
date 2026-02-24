import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const level = searchParams.get("level");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const rating = searchParams.get("rating");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const query: Record<string, unknown> = { isPublished: true };

    if (subject) query.subject = subject;
    if (level) query.level = level;
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      query.price = priceFilter;
    }
    if (rating) query.rating = { $gte: parseFloat(rating) };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption: Record<string, 1 | -1> = {};
    switch (sort) {
      case "popular":
        sortOption = { totalStudents: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "price-low":
        sortOption = { price: 1 };
        break;
      case "price-high":
        sortOption = { price: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("tutor", "name avatar rating")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Courses GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "tutor") {
      return NextResponse.json(
        { error: "Only tutors can create courses" },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await req.json();

    const course = await Course.create({
      ...body,
      tutor: session.user.id,
    });

    return NextResponse.json(
      { message: "Course created successfully", course },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Course POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create course" },
      { status: 500 }
    );
  }
}
