"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock } from "lucide-react";

interface TutorCardProps {
  tutor: {
    _id: string;
    name: string;
    avatar: string;
    bio: string;
    subjects: string[];
    rating: number;
    totalReviews: number;
    hourlyRate: number;
  };
  index?: number;
}

export default function TutorCard({ tutor, index = 0 }: TutorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
        <CardContent className="p-6 text-center">
          {/* Avatar */}
          <div className="mb-4">
            <Avatar className="w-20 h-20 mx-auto ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all">
              <AvatarImage src={tutor.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl font-bold">
                {tutor.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-lg mb-1">{tutor.name}</h3>

          {/* Subjects */}
          <div className="flex flex-wrap justify-center gap-1 mb-3">
            {tutor.subjects.slice(0, 3).map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
            {tutor.subjects.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{tutor.subjects.length - 3}
              </Badge>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {tutor.bio || "Expert tutor ready to help you learn."}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">
                {tutor.rating?.toFixed(1) || "0.0"}
              </span>
              <span className="text-gray-400">
                ({tutor.totalReviews || 0})
              </span>
            </div>
          </div>

          {/* Rate & Book */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-blue-600">
                ৳{tutor.hourlyRate || 0}
              </span>
              <span className="text-xs text-gray-400">/hr</span>
            </div>
            <Link href={`/profile/${tutor._id}`}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
              >
                Book Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
