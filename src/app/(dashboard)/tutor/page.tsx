"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/dashboard-sidebar";
import ProgressChart from "@/components/progress-chart";
import Link from "next/link";
import {
  BookOpen,
  DollarSign,
  Users,
  Star,
  Calendar,
  TrendingUp,
  Plus,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Video,
} from "lucide-react";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function TutorDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [courses, setCourses] = useState<Array<{
    _id: string;
    title: string;
    subject: string;
    price: number;
    enrolledStudents: string[];
    isPublished: boolean;
    rating: number;
  }>>([]);
  const [sessions, setSessions] = useState<Array<{
    _id: string;
    student: { name: string; avatar: string };
    subject: string;
    scheduledAt: string;
    duration: number;
    status: string;
    roomId: string;
  }>>([]);
  const [reviews, setReviews] = useState<Array<{
    _id: string;
    student: { name: string; avatar: string };
    rating: number;
    comment: string;
    createdAt: string;
  }>>([]);

  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, sessionsRes, reviewsRes] = await Promise.all([
        fetch("/api/courses?limit=50"),
        fetch("/api/sessions"),
        fetch("/api/reviews?limit=5"),
      ]);

      const coursesData = await coursesRes.json();
      const sessionsData = await sessionsRes.json();
      const reviewsData = await reviewsRes.json();

      const myCourses = coursesData.courses || [];
      const mySessions = sessionsData.sessions || [];
      const myReviews = reviewsData.reviews || [];

      const totalStudents = myCourses.reduce(
        (acc: number, c: { enrolledStudents: string[] }) => acc + (c.enrolledStudents?.length || 0),
        0
      );

      setCourses(myCourses);
      setSessions(mySessions);
      setReviews(myReviews);
      setStats({
        totalCourses: myCourses.length,
        totalStudents,
        totalEarnings: totalStudents * 500,
        averageRating: 4.8,
        totalReviews: reviewsData.total || 0,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const earningsData = [
    { name: "Jan", earnings: 8500 },
    { name: "Feb", earnings: 12000 },
    { name: "Mar", earnings: 9500 },
    { name: "Apr", earnings: 15000 },
    { name: "May", earnings: 11000 },
    { name: "Jun", earnings: 18000 },
  ];

  const statCards = [
    { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-green-600", bg: "bg-green-100" },
    { label: "Total Earnings", value: `৳${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Average Rating", value: stats.averageRating.toFixed(1), icon: Star, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const upcomingSessions = sessions.filter(
    (s) => s.status === "upcoming" && new Date(s.scheduledAt) > new Date()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <DashboardSidebar role="tutor" />

      <main className="flex-1 p-4 md:p-8 lg:ml-64">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeIn} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Hello, {session?.user?.name?.split(" ")[0] || "Tutor"} 🎓
              </h1>
              <p className="text-gray-500">Manage your courses and sessions</p>
            </div>
            <Link href="/courses/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                New Course
              </Button>
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) =>
              loading ? (
                <Skeleton key={stat.label} className="h-32 rounded-xl" />
              ) : (
                <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            )}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Earnings Chart */}
            <motion.div variants={fadeIn} className="lg:col-span-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    Earnings Overview (৳ BDT)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart data={earningsData} type="line" dataKey="earnings" xKey="name" color="#F59E0B" height={250} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Sessions */}
            <motion.div variants={fadeIn}>
              <Card className="border-0 shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                      ))}
                    </div>
                  ) : upcomingSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No upcoming sessions</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingSessions.slice(0, 4).map((sess) => (
                        <div key={sess._id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium text-sm">{sess.subject}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(sess.scheduledAt).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Link href={`/session/${sess.roomId}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Video className="w-3 h-3 mr-1" />
                              Join
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Courses & Reviews Tabs */}
          <motion.div variants={fadeIn} className="mt-6">
            <Tabs defaultValue="courses">
              <TabsList className="mb-4">
                <TabsTrigger value="courses">My Courses</TabsTrigger>
                <TabsTrigger value="sessions">Session History</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="courses">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-20 rounded-xl" />
                        ))}
                      </div>
                    ) : courses.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No courses yet</p>
                        <p className="text-sm mb-4">Create your first course to start earning</p>
                        <Link href="/courses/new">
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Course
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {courses.map((course) => (
                          <div key={course._id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {course.title.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{course.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{course.subject}</Badge>
                                  <span className="text-xs text-gray-500">
                                    {course.enrolledStudents?.length || 0} students
                                  </span>
                                  <span className="text-xs text-gray-500">• ৳{course.price}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {course.isPublished ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Draft
                                </Badge>
                              )}
                              <Link href={`/courses/${course._id}`}>
                                <Button variant="ghost" size="sm">
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 rounded-xl" />
                        ))}
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No sessions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((sess) => (
                          <div key={sess._id} className="flex items-center justify-between p-4 rounded-xl border">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                sess.status === "completed" ? "bg-green-100" : sess.status === "cancelled" ? "bg-red-100" : "bg-blue-100"
                              }`}>
                                {sess.status === "completed" ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : sess.status === "cancelled" ? (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                  <Clock className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{sess.subject} Session</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(sess.scheduledAt).toLocaleDateString()} • {sess.duration} min
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">{sess.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-24 rounded-xl" />
                        ))}
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Star className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No reviews yet</p>
                        <p className="text-sm">Reviews will appear here once students rate your courses</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review._id} className="p-4 rounded-xl border">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                {review.student?.name?.charAt(0) || "S"}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{review.student?.name || "Student"}</p>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="ml-auto text-xs text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
