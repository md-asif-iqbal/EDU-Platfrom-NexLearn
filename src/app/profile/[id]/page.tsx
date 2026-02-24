"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CourseCard from "@/components/course-card";
import {
  Star,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  Users,
  Award,
  Edit2,
  MessageSquare,
  Video,
  DollarSign,
  Loader2,
  CheckCircle2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  role: string;
  subjects: string[];
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  isVerified: boolean;
  createdAt: string;
}

interface Review {
  _id: string;
  student: { name: string; avatar: string };
  rating: number;
  comment: string;
  createdAt: string;
  course?: { title: string };
}

export default function ProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [courses, setCourses] = useState<Array<Record<string, unknown>>>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    bio: "",
    hourlyRate: "",
  });

  const isOwner = session?.user?.id === id;

  const fetchProfile = useCallback(async () => {
    try {
      const [userRes, reviewsRes] = await Promise.all([
        fetch(`/api/users/${id}`),
        fetch(`/api/reviews?tutorId=${id}&limit=10`),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setProfile(userData.user);
        setEditData({
          name: userData.user.name || "",
          phone: userData.user.phone || "",
          bio: userData.user.bio || "",
          hourlyRate: String(userData.user.hourlyRate || ""),
        });
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      }

      // Fetch courses if tutor
      const coursesRes = await fetch(`/api/courses?tutor=${id}&limit=10`);
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id, fetchProfile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          phone: editData.phone,
          bio: editData.bio,
          hourlyRate: editData.hourlyRate ? Number(editData.hourlyRate) : undefined,
        }),
      });

      if (res.ok) {
        toast.success("Profile updated!");
        setEditOpen(false);
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
          <Skeleton className="h-48 w-full" />
          <div className="container mx-auto px-4 -mt-16">
            <div className="flex items-end gap-6 mb-8">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>

        <div className="container mx-auto px-4 -mt-16 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.name.charAt(0)}
                </div>
              )}
            </motion.div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.isVerified && (
                  <Badge className="bg-blue-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize">{profile.role}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                {profile.role === "tutor" && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {profile.rating?.toFixed(1) || "New"}
                    </span>
                    <span>({profile.totalReviews} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
                {profile.hourlyRate > 0 && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ৳{profile.hourlyRate}/hr
                  </div>
                )}
              </div>

              {profile.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.subjects.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isOwner ? (
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Textarea
                          value={editData.bio}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          className="min-h-25"
                        />
                      </div>
                      {profile.role === "tutor" && (
                        <div>
                          <Label>Hourly Rate (৳)</Label>
                          <Input
                            type="number"
                            value={editData.hourlyRate}
                            onChange={(e) => setEditData({ ...editData, hourlyRate: e.target.value })}
                          />
                        </div>
                      )}
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full bg-blue-600"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : profile.role === "tutor" ? (
                <>
                  <Link href={`/courses?tutor=${profile._id}`}>
                    <Button variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Courses
                    </Button>
                  </Link>
                  <Button className="bg-linear-to-r from-blue-600 to-purple-600">
                    <Video className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="about" className="mb-12">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              {profile.role === "tutor" && (
                <>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="about">
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <Card className="md:col-span-2 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {profile.bio || "No bio added yet."}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats for tutors */}
                {profile.role === "tutor" && (
                  <Card className="md:col-span-3 border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-2xl font-bold">{courses.length}</p>
                          <p className="text-sm text-gray-500">Courses</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                            <Users className="w-6 h-6 text-purple-600" />
                          </div>
                          <p className="text-2xl font-bold">
                            {courses.reduce((acc: number, c: Record<string, unknown>) => acc + ((c.enrolledStudents as string[])?.length || 0), 0)}
                          </p>
                          <p className="text-sm text-gray-500">Students</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                            <Star className="w-6 h-6 text-amber-600" />
                          </div>
                          <p className="text-2xl font-bold">{profile.rating?.toFixed(1) || "—"}</p>
                          <p className="text-sm text-gray-500">Rating</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                            <Award className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold">{profile.totalReviews}</p>
                          <p className="text-sm text-gray-500">Reviews</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {profile.role === "tutor" && (
              <TabsContent value="courses">
                <div className="mt-6">
                  {courses.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No courses yet</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map((course: Record<string, unknown>) => (
                        <CourseCard key={course._id as string} course={course as never} />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {profile.role === "tutor" && (
              <TabsContent value="reviews">
                <div className="mt-6 max-w-2xl">
                  {reviews.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No reviews yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review._id} className="border-0 shadow-sm">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {review.student?.name?.charAt(0) || "S"}
                              </div>
                              <div>
                                <p className="font-medium">{review.student?.name || "Student"}</p>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs text-gray-400 ml-2">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                            {review.course && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {review.course.title}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}
