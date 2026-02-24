"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PaymentModal from "@/components/payment-modal";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Globe,
  Award,
  BarChart3,
  MessageSquare,
  ArrowLeft,
  Share2,
  Heart,
} from "lucide-react";
import toast from "react-hot-toast";

interface CourseDetail {
  _id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  price: number;
  thumbnail: string;
  tutor: {
    _id: string;
    name: string;
    avatar: string;
    bio: string;
    rating: number;
    totalReviews: number;
    subjects: string[];
  };
  lessons: Array<{
    title: string;
    content: string;
    duration: number;
    videoUrl: string;
    order: number;
  }>;
  rating: number;
  totalReviews: number;
  enrolledStudents: string[];
  isPublished: boolean;
  createdAt: string;
}

interface Review {
  _id: string;
  student: { name: string; avatar: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      const [courseRes, reviewsRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/reviews?courseId=${id}&limit=10`),
      ]);

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourse(courseData.course);
      }
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchCourse();
  }, [id, fetchCourse]);

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return toast.error("Please write a review");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: course?.tutor._id,
          courseId: id,
          rating: reviewRating,
          comment: reviewText,
        }),
      });

      if (res.ok) {
        toast.success("Review submitted!");
        setReviewText("");
        setReviewRating(5);
        fetchCourse();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const isEnrolled = session?.user?.id && course?.enrolledStudents?.includes(session.user.id);
  const totalDuration = course?.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0;

  const levelColors: Record<string, string> = {
    School: "bg-green-100 text-green-700",
    College: "bg-blue-100 text-blue-700",
    University: "bg-purple-100 text-purple-700",
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-80 rounded-xl mb-6" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-40" />
              </div>
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
            <p className="text-gray-500 mb-6">This course may have been removed or doesn&apos;t exist.</p>
            <Link href="/courses">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
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
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
          <div className="container mx-auto px-4">
            <Link href="/courses" className="inline-flex items-center gap-1 text-gray-400 hover:text-white mb-4 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </Link>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={levelColors[course.level] || ""}>{course.level}</Badge>
                  <Badge variant="outline" className="text-white border-gray-600">{course.subject}</Badge>
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-4xl font-bold mb-4"
                >
                  {course.title}
                </motion.h1>

                <p className="text-gray-300 text-lg mb-6 line-clamp-3">{course.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{course.rating?.toFixed(1) || "New"}</span>
                    <span className="text-gray-400">({course.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    {course.enrolledStudents?.length || 0} students
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons?.length || 0} lessons
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    {totalDuration} min total
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Link href={`/profile/${course.tutor._id}`}>
                    <div className="flex items-center gap-2 hover:opacity-80">
                      {course.tutor.avatar ? (
                        <Image
                          src={course.tutor.avatar}
                          alt={course.tutor.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {course.tutor.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{course.tutor.name}</p>
                        <p className="text-xs text-gray-400">Instructor</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                  <TabsTrigger value="tutor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">About This Course</h2>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                        {course.description}
                      </p>

                      <h3 className="text-lg font-bold mt-8 mb-4">What You&apos;ll Learn</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          "Master core concepts and fundamentals",
                          "Build real-world projects",
                          "Practice with exercises and quizzes",
                          "Get personalized  help",
                          "Access live tutoring sessions",
                          "Earn a completion certificate",
                        ].map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>

                      <h3 className="text-lg font-bold mt-8 mb-4">Requirements</h3>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>Basic understanding of the subject</li>
                        <li>A computer with internet access</li>
                        <li>Willingness to learn and practice</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="syllabus">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Course Syllabus</h2>
                        <span className="text-sm text-gray-500">
                          {course.lessons?.length || 0} lessons • {totalDuration} min
                        </span>
                      </div>

                      {!course.lessons || course.lessons.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                          <p>No lessons added yet</p>
                        </div>
                      ) : (
                        <Accordion type="single" collapsible className="space-y-2">
                          {course.lessons
                            .sort((a, b) => a.order - b.order)
                            .map((lesson, i) => (
                              <AccordionItem key={i} value={`lesson-${i}`} className="border rounded-lg px-4">
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                                      {i + 1}
                                    </div>
                                    <div>
                                      <p className="font-medium">{lesson.title}</p>
                                      <p className="text-xs text-gray-500">{lesson.duration} min</p>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-11">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {lesson.content || "Lesson content will be available after enrollment."}
                                  </p>
                                  {lesson.videoUrl && isEnrolled && (
                                    <div className="mt-3">
                                      {lesson.videoUrl.includes("youtube.com/embed") ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                                          <iframe
                                            src={lesson.videoUrl}
                                            title={lesson.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="absolute inset-0 w-full h-full"
                                          />
                                        </div>
                                      ) : (
                                        <Button variant="outline" size="sm">
                                          <PlayCircle className="w-4 h-4 mr-2" />
                                          Watch Video
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                  {lesson.videoUrl && !isEnrolled && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                                      <PlayCircle className="w-4 h-4" />
                                      <span>Enroll to watch this video lesson</span>
                                    </div>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                        </Accordion>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tutor">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {course.tutor.avatar ? (
                          <Image
                            src={course.tutor.avatar}
                            alt={course.tutor.name}
                            width={80}
                            height={80}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                            {course.tutor.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-bold">{course.tutor.name}</h2>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              {course.tutor.rating?.toFixed(1)} ({course.tutor.totalReviews} reviews)
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {course.tutor.subjects?.map((s) => (
                              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                        {course.tutor.bio || "Experienced tutor passionate about helping students learn and grow."}
                      </p>
                      <Link href={`/profile/${course.tutor._id}`}>
                        <Button variant="outline" className="mt-4">
                          View Full Profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      {/* Rating Summary */}
                      <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="text-center">
                          <p className="text-5xl font-bold">{course.rating?.toFixed(1) || "—"}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(course.rating || 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{course.totalReviews} reviews</p>
                        </div>
                      </div>

                      {/* Write Review */}
                      {session?.user && isEnrolled && (
                        <div className="mb-8 p-4 border rounded-xl">
                          <h3 className="font-medium mb-3">Write a Review</h3>
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button key={i} onClick={() => setReviewRating(i + 1)}>
                                <Star
                                  className={`w-6 h-6 cursor-pointer ${
                                    i < reviewRating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-300 hover:text-amber-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            placeholder="Share your experience..."
                            className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                          />
                          <Button
                            onClick={handleSubmitReview}
                            disabled={submitting}
                            className="mt-3 bg-blue-600"
                            size="sm"
                          >
                            {submitting ? "Submitting..." : "Submit Review"}
                          </Button>
                        </div>
                      )}

                      {/* Review List */}
                      {reviews.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p>No reviews yet. Be the first to review!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.map((review) => (
                            <div key={review._id} className="p-4 border rounded-xl">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                  {review.student?.name?.charAt(0) || "S"}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{review.student?.name || "Student"}</p>
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
                              <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sticky Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border-0 shadow-lg">
                  {course.thumbnail && !showPreview && (
                    <div
                      className="relative h-48 rounded-t-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        if (course.lessons?.[0]?.videoUrl?.includes("youtube.com/embed")) {
                          setShowPreview(true);
                        }
                      }}
                    >
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors">
                        <PlayCircle className="w-16 h-16 text-white/80" />
                      </div>
                    </div>
                  )}
                  {showPreview && course.lessons?.[0]?.videoUrl && (
                    <div className="relative aspect-video rounded-t-lg overflow-hidden">
                      <iframe
                        src={course.lessons[0].videoUrl}
                        title="Course Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-3xl font-bold">
                        {course.price === 0 ? "Free" : `৳${course.price.toLocaleString()}`}
                      </p>
                    </div>

                    {isEnrolled ? (
                      <Button className="w-full py-6 bg-green-600 hover:bg-green-700 text-base mb-4">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Enrolled — Continue Learning
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          if (!session) {
                            toast.error("Please sign in to enroll");
                            return;
                          }
                          if (course.price === 0) {
                            toast.success("Enrolled for free!");
                          } else {
                            setShowPayment(true);
                          }
                        }}
                        className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base mb-4"
                      >
                        {course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                      </Button>
                    )}

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span>{course.lessons?.length || 0} lessons</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{totalDuration} minutes of content</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span>{course.level} level</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span>English / Bangla</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="w-4 h-4 mr-2" />
                        Wishlist
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {showPayment && (
        <PaymentModal
          course={course}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            toast.success("Enrolled successfully!");
            fetchCourse();
          }}
        />
      )}
    </>
  );
}
