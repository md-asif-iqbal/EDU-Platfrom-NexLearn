"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardSidebar from "@/components/dashboard-sidebar";
import ProgressChart from "@/components/progress-chart";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Star,
  Brain,
  Calendar,
  TrendingUp,
  PlayCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

interface DashboardData {
  enrolledCourses: number;
  completedSessions: number;
  upcomingSessions: number;
  aiChatsCount: number;
  recentCourses: Array<{
    _id: string;
    title: string;
    subject: string;
    thumbnail: string;
    progress?: number;
  }>;
  upcomingSessionsList: Array<{
    _id: string;
    tutor: { name: string; avatar: string };
    subject: string;
    scheduledAt: string;
    roomId: string;
  }>;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    enrolledCourses: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    aiChatsCount: 0,
    recentCourses: [],
    upcomingSessionsList: [],
  });

  const fetchDashboard = useCallback(async () => {
    try {
      const [coursesRes, sessionsRes, aiRes] = await Promise.all([
        fetch("/api/courses?limit=4"),
        fetch("/api/sessions"),
        fetch("/api/ai/chat"),
      ]);

      const coursesData = await coursesRes.json();
      const sessionsData = await sessionsRes.json();
      const aiData = await aiRes.json();

      const now = new Date();
      const upcoming = (sessionsData.sessions || []).filter(
        (s: { status: string; scheduledAt: string }) =>
          s.status === "upcoming" && new Date(s.scheduledAt) > now
      );
      const completed = (sessionsData.sessions || []).filter(
        (s: { status: string }) => s.status === "completed"
      );

      setDashboardData({
        enrolledCourses: coursesData.total || 0,
        completedSessions: completed.length,
        upcomingSessions: upcoming.length,
        aiChatsCount: (aiData.chats || []).length,
        recentCourses: (coursesData.courses || []).slice(0, 4),
        upcomingSessionsList: upcoming.slice(0, 3),
      });
    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = [
    { label: "Enrolled Courses", value: dashboardData.enrolledCourses, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Completed Sessions", value: dashboardData.completedSessions, icon: Clock, color: "text-green-600", bg: "bg-green-100" },
    { label: "Upcoming Sessions", value: dashboardData.upcomingSessions, icon: Calendar, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "AI Conversations", value: dashboardData.aiChatsCount, icon: Brain, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  const chartData = [
    { name: "Mon", hours: 2 },
    { name: "Tue", hours: 3.5 },
    { name: "Wed", hours: 1.5 },
    { name: "Thu", hours: 4 },
    { name: "Fri", hours: 2.5 },
    { name: "Sat", hours: 5 },
    { name: "Sun", hours: 3 },
  ];

  const subjectColors: Record<string, string> = {
    Mathematics: "bg-blue-100 text-blue-700",
    Physics: "bg-purple-100 text-purple-700",
    Chemistry: "bg-green-100 text-green-700",
    Biology: "bg-emerald-100 text-emerald-700",
    English: "bg-amber-100 text-amber-700",
    Programming: "bg-rose-100 text-rose-700",
    Business: "bg-cyan-100 text-cyan-700",
    "Art & Design": "bg-pink-100 text-pink-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <DashboardSidebar role="student" />

      <main className="flex-1 p-4 md:p-8 lg:ml-64">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeIn} className="mb-8">
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {session?.user?.name?.split(" ")[0] || "Student"} 👋
            </h1>
            <p className="text-gray-500">Here&apos;s what&apos;s happening with your learning journey</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) =>
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
            {/* Learning Progress Chart */}
            <motion.div variants={fadeIn} className="lg:col-span-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Weekly Learning Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart data={chartData} type="bar" dataKey="hours" xKey="name" color="#2563EB" height={250} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeIn}>
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/courses">
                    <Button variant="outline" className="w-full justify-start py-5">
                      <BookOpen className="w-4 h-4 mr-3 text-blue-600" />
                      Browse Courses
                    </Button>
                  </Link>
                  <Link href="/tutors">
                    <Button variant="outline" className="w-full justify-start py-5">
                      <Star className="w-4 h-4 mr-3 text-amber-600" />
                      Find a Tutor
                    </Button>
                  </Link>
                  <Link href="/ai">
                    <Button variant="outline" className="w-full justify-start py-5">
                      <Brain className="w-4 h-4 mr-3 text-purple-600" />
                      AI Study Tools
                    </Button>
                  </Link>
                  <Link href="/ai">
                    <Button variant="outline" className="w-full justify-start py-5">
                      <MessageSquare className="w-4 h-4 mr-3 text-green-600" />
                      AI Homework Help
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Courses */}
          <motion.div variants={fadeIn} className="mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                  My Courses
                </CardTitle>
                <Link href="/courses">
                  <Button variant="ghost" size="sm">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                  </div>
                ) : dashboardData.recentCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No courses yet</p>
                    <p className="text-sm">Start by browsing our course catalog</p>
                    <Link href="/courses">
                      <Button className="mt-4" size="sm">
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {dashboardData.recentCourses.map((course) => (
                      <Link href={`/courses/${course._id}`} key={course._id}>
                        <div className="flex items-center gap-4 p-4 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {course.title.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{course.title}</p>
                            <Badge variant="outline" className={`text-xs mt-1 ${subjectColors[course.subject] || ""}`}>
                              {course.subject}
                            </Badge>
                            <Progress value={course.progress || 30} className="mt-2 h-1.5" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div variants={fadeIn} className="mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : dashboardData.upcomingSessionsList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No upcoming sessions</p>
                    <p className="text-sm">Book a session with a tutor to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.upcomingSessionsList.map((sess) => (
                      <div
                        key={sess._id}
                        className="flex items-center justify-between p-4 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{sess.subject} Session</p>
                            <p className="text-sm text-gray-500">
                              with {sess.tutor?.name || "Tutor"} •{" "}
                              {new Date(sess.scheduledAt).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <Link href={`/session/${sess.roomId}`}>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
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
        </motion.div>
      </main>
    </div>
  );
}
