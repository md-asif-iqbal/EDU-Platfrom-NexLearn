import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";
import Session from "@/models/Session";
import Payment from "@/models/Payment";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const [
      totalUsers,
      totalTutors,
      totalStudents,
      totalCourses,
      activeSessions,
      recentUsers,
      recentPayments,
      totalRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "tutor" }),
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Session.countDocuments({ status: { $in: ["upcoming", "live"] } }),
      User.find().sort({ createdAt: -1 }).limit(10).select("-password").lean(),
      Payment.find({ status: "completed" })
        .populate("user", "name email")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTutors,
        totalStudents,
        totalCourses,
        activeSessions,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentUsers,
      recentPayments,
    });
  } catch (error: unknown) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
