"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, BookOpen } from "lucide-react";

interface CourseCardProps {
  course: {
    _id: string;
    title: string;
    description: string;
    subject: string;
    level: string;
    price: number;
    thumbnail: string;
    rating: number;
    totalStudents?: number;
    enrolledStudents?: string[];
    totalReviews?: number;
    lessons?: Array<{ title: string }>;
    tutor: {
      _id: string;
      name: string;
      avatar: string;
      rating: number;
    };
  };
  index?: number;
}

const subjectColors: Record<string, string> = {
  Math: "bg-blue-100 text-blue-700",
  Physics: "bg-purple-100 text-purple-700",
  Chemistry: "bg-green-100 text-green-700",
  Biology: "bg-emerald-100 text-emerald-700",
  English: "bg-orange-100 text-orange-700",
  Bengali: "bg-red-100 text-red-700",
  Programming: "bg-cyan-100 text-cyan-700",
  Business: "bg-amber-100 text-amber-700",
};

export default function CourseCard({ course, index = 0 }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/courses/${course._id}`}>
        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
          {/* Thumbnail */}
          <div className="relative h-48 bg-linear-to-br from-blue-100 to-purple-100 overflow-hidden">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-blue-300" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge
                className={`${subjectColors[course.subject] || "bg-gray-100 text-gray-700"} border-0 font-medium`}
              >
                {course.subject}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90 font-medium">
                {course.level}
              </Badge>
            </div>
          </div>

          <CardContent className="p-5">
            {/* Title */}
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors mb-3">
              {course.title}
            </h3>

            {/* Tutor */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {course.tutor?.name?.charAt(0) || "T"}
              </div>
              <span className="text-sm text-gray-600">
                {course.tutor?.name || "Tutor"}
              </span>
            </div>

            {/* Rating & Students */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {course.rating?.toFixed(1) || "0.0"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {course.totalStudents || course.enrolledStudents?.length || 0} students
                </span>
              </div>
            </div>

            {/* Price & Enroll */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div>
                {course.price === 0 ? (
                  <span className="text-lg font-bold text-green-600">Free</span>
                ) : (
                  <span className="text-lg font-bold text-blue-600">
                    ৳{course.price}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
              >
                Enroll Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
