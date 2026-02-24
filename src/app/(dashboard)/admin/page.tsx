"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import DashboardSidebar from "@/components/dashboard-sidebar";
import ProgressChart from "@/components/progress-chart";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Star,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

interface PlatformStats {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalCourses: number;
  totalSessions: number;
  totalPayments: number;
  totalRevenue: number;
  totalReviews: number;
  averageRating: number;
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
  }>;
  recentPayments: Array<{
    _id: string;
    user: { name: string; email: string };
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTutors: 0,
    totalCourses: 0,
    totalSessions: 0,
    totalPayments: 0,
    totalRevenue: 0,
    totalReviews: 0,
    averageRating: 0,
    recentUsers: [],
    recentPayments: [],
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalUsers: data.stats?.totalUsers || 0,
          totalStudents: data.stats?.totalStudents || 0,
          totalTutors: data.stats?.totalTutors || 0,
          totalCourses: data.stats?.totalCourses || 0,
          totalSessions: data.stats?.activeSessions || 0,
          totalPayments: 0,
          totalRevenue: data.stats?.totalRevenue || 0,
          totalReviews: 0,
          averageRating: 0,
          recentUsers: data.recentUsers || [],
          recentPayments: data.recentPayments || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleVerifyUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: true }),
      });
      if (res.ok) {
        toast.success("User verified successfully");
        setStats((prev) => ({
          ...prev,
          recentUsers: prev.recentUsers.map((u) =>
            u._id === userId ? { ...u, isVerified: true } : u
          ),
        }));
      }
    } catch {
      toast.error("Failed to verify user");
    }
  };

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "text-green-600", bg: "bg-green-100" },
    { label: "Revenue", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Avg Rating", value: stats.averageRating.toFixed(1), icon: Star, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const growthData = [
    { name: "Jan", users: 120, revenue: 45000 },
    { name: "Feb", users: 180, revenue: 62000 },
    { name: "Mar", users: 250, revenue: 78000 },
    { name: "Apr", users: 310, revenue: 95000 },
    { name: "May", users: 420, revenue: 110000 },
    { name: "Jun", users: 530, revenue: 145000 },
  ];

  const filteredUsers = stats.recentUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 md:p-8 lg:ml-64">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeIn} className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-gray-500">Platform overview and management</p>
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

          {/* Sub-Stats */}
          <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-lg font-bold">{stats.totalTutors}</p>
                <p className="text-xs text-gray-500">Tutors</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border flex items-center gap-3">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-lg font-bold">{stats.totalSessions}</p>
                <p className="text-xs text-gray-500">Sessions</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-lg font-bold">{stats.totalReviews}</p>
                <p className="text-xs text-gray-500">Reviews</p>
              </div>
            </div>
          </motion.div>

          {/* Charts */}
          <motion.div variants={fadeIn} className="grid lg:grid-cols-2 gap-6 mb-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart data={growthData} type="line" dataKey="users" xKey="name" color="#2563EB" height={250} />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                  Revenue Growth (৳)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart data={growthData} type="bar" dataKey="revenue" xKey="name" color="#F59E0B" height={250} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Users & Payments Tabs */}
          <motion.div variants={fadeIn}>
            <Tabs defaultValue="users">
              <TabsList className="mb-4">
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Recent Users</CardTitle>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-16 rounded-xl" />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-sm text-gray-500 border-b">
                              <th className="pb-3 font-medium">User</th>
                              <th className="pb-3 font-medium">Role</th>
                              <th className="pb-3 font-medium">Status</th>
                              <th className="pb-3 font-medium">Joined</th>
                              <th className="pb-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {filteredUsers.map((user) => (
                              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                      {user.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{user.name}</p>
                                      <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {user.role}
                                  </Badge>
                                </td>
                                <td className="py-3">
                                  {user.isVerified ? (
                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-amber-600 text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pending
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-3 text-sm text-gray-500">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3">
                                  {!user.isVerified && (
                                    <Button size="sm" variant="outline" onClick={() => handleVerifyUser(user._id)} className="text-xs">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Verify
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No users found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 rounded-xl" />
                        ))}
                      </div>
                    ) : stats.recentPayments.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No payments yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-sm text-gray-500 border-b">
                              <th className="pb-3 font-medium">User</th>
                              <th className="pb-3 font-medium">Amount</th>
                              <th className="pb-3 font-medium">Status</th>
                              <th className="pb-3 font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {stats.recentPayments.map((payment) => (
                              <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="py-3">
                                  <p className="font-medium text-sm">{payment.user?.name || "User"}</p>
                                  <p className="text-xs text-gray-500">{payment.user?.email}</p>
                                </td>
                                <td className="py-3 font-semibold">৳{payment.amount.toLocaleString()}</td>
                                <td className="py-3">
                                  {payment.status === "succeeded" ? (
                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Success
                                    </Badge>
                                  ) : payment.status === "failed" ? (
                                    <Badge className="bg-red-100 text-red-700 text-xs">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Failed
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs capitalize">{payment.status}</Badge>
                                  )}
                                </td>
                                <td className="py-3 text-sm text-gray-500">
                                  {new Date(payment.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
