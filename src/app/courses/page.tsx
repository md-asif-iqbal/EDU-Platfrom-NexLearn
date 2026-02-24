"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourseCard from "@/components/course-card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const subjects = [
  "All",
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Bengali",
  "Programming",
  "Business",
];

const levels = ["All", "School", "College", "University"];

interface Course {
  _id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  price: number;
  thumbnail: string;
  tutor: { _id: string; name: string; avatar: string; rating: number };
  rating: number;
  totalReviews: number;
  enrolledStudents: string[];
  lessons: Array<{ title: string }>;
  isPublished: boolean;
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
          <div className="container mx-auto px-4 py-20">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </>
    }>
      <CoursesContent />
    </Suspense>
  );
}

function CoursesContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    subject: searchParams.get("subject") || "All",
    level: searchParams.get("level") || "All",
    sort: searchParams.get("sort") || "newest",
    page: Number(searchParams.get("page")) || 1,
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.subject !== "All") params.set("subject", filters.subject);
      if (filters.level !== "All") params.set("level", filters.level);
      params.set("sort", filters.sort);
      params.set("page", String(filters.page));
      params.set("limit", "9");

      const res = await fetch(`/api/courses?${params.toString()}`);
      const data = await res.json();

      setCourses(data.courses || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      subject: "All",
      level: "All",
      sort: "newest",
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.search || filters.subject !== "All" || filters.level !== "All";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 py-16">
          <div className="container mx-auto px-4 text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Explore Courses
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto"
            >
              Find the perfect course to accelerate your learning journey
            </motion.p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search courses, subjects, tutors..."
                className="pl-12 pr-24 py-6 text-base bg-white text-gray-900 border-0 shadow-lg rounded-xl"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
              >
                Search
              </Button>
            </motion.form>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>

            {/* Subject Pills */}
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <Badge
                  key={subject}
                  variant={filters.subject === subject ? "default" : "outline"}
                  className={`cursor-pointer py-1.5 px-3 ${
                    filters.subject === subject
                      ? "bg-blue-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() =>
                    setFilters({ ...filters, subject, page: 1 })
                  }
                >
                  {subject}
                </Badge>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Select
                value={filters.sort}
                onValueChange={(val) => setFilters({ ...filters, sort: val, page: 1 })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low</SelectItem>
                  <SelectItem value="price-high">Price: High</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-sm text-gray-500">{total} courses</span>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border mb-8"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Level</label>
                  <Select
                    value={filters.level}
                    onValueChange={(val) => setFilters({ ...filters, level: val, page: 1 })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="mt-4 text-sm text-red-500">
                  <X className="w-4 h-4 mr-1" />
                  Clear all filters
                </Button>
              )}
            </motion.div>
          )}

          {/* Course Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
              <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={filters.page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: i + 1 })}
                  className={filters.page === i + 1 ? "bg-blue-600" : ""}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                disabled={filters.page >= totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
