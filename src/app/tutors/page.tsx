"use client";

import { useEffect, useState, useCallback } from "react";
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
import TutorCard from "@/components/tutor-card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Search, Users, X } from "lucide-react";

const subjects = [
  "All",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Programming",
  "Business",
  "Art & Design",
];

interface Tutor {
  _id: string;
  name: string;
  avatar: string;
  bio: string;
  subjects: string[];
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  isVerified: boolean;
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [sort, setSort] = useState("rating");

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: "tutor" });
      if (search) params.set("search", search);
      if (subject !== "All") params.set("subject", subject);

      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      const list: Tutor[] = data.users || [];

      // Client-side sort
      if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (sort === "reviews") list.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
      else if (sort === "price-low") list.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
      else if (sort === "price-high") list.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));

      setTutors(list);
    } catch (err) {
      console.error("Failed to fetch tutors", err);
    } finally {
      setLoading(false);
    }
  }, [search, subject, sort]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTutors();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        {/* Header */}
          <div className="bg-linear-to-r from-purple-600 to-blue-600 py-16">
          <div className="container mx-auto px-4 text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Find Expert Tutors
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto"
            >
              Connect with experienced tutors for personalized 1-on-1 learning sessions
            </motion.p>

            {/* Search */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search tutors by name or subject..."
                className="pl-12 pr-24 py-6 text-base bg-white text-gray-900 border-0 shadow-lg rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700">
                Search
              </Button>
            </motion.form>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {/* Subject Badges */}
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <Badge
                  key={s}
                  variant={subject === s ? "default" : "outline"}
                  className={`cursor-pointer py-1.5 px-3 ${
                    subject === s ? "bg-purple-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSubject(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-sm text-gray-500">{tutors.length} tutors</span>
            </div>
          </div>

          {/* Tutors Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No tutors found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSubject("All");
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tutors.map((tutor, i) => (
                <motion.div
                  key={tutor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <TutorCard tutor={tutor} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
