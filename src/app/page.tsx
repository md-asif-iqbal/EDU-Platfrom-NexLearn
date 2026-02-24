"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Zap,
  Search,
  Users,
  BookOpen,
  Star,
  ArrowRight,
  UserPlus,
  Video,
  Brain,
  FileText,
  ListChecks,
  CalendarDays,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Languages,
  Code2,
  Briefcase,
  PenLine,
  Quote,
  Check,
  Sparkles,
} from "lucide-react";

function StatCounter({ end, duration = 2000, format }: { end: number; duration?: number; format?: (n: number) => string }) {
  const [count, setCount] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = divRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let current = 0;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  const display = format ? format(count) : String(count);
  return <div ref={divRef} className="text-4xl font-bold">{display}</div>;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const subjects = [
  { name: "Math", icon: Calculator, color: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
  { name: "Physics", icon: Atom, color: "from-purple-500 to-purple-600", bg: "bg-purple-50" },
  { name: "Chemistry", icon: FlaskConical, color: "from-green-500 to-green-600", bg: "bg-green-50" },
  { name: "Biology", icon: Leaf, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50" },
  { name: "English", icon: Languages, color: "from-orange-500 to-orange-600", bg: "bg-orange-50" },
  { name: "Bengali", icon: PenLine, color: "from-red-500 to-red-600", bg: "bg-red-50" },
  { name: "Programming", icon: Code2, color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50" },
  { name: "Business", icon: Briefcase, color: "from-amber-500 to-amber-600", bg: "bg-amber-50" },
];

const demoCourses = [
  { id: "1", title: "Complete Mathematics for SSC & HSC", subject: "Math", tutor: "Md. Rafiqul Islam", rating: 4.9, students: 3240, price: 1499, thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80" },
  { id: "2", title: "Physics Mastery — HSC & Admission", subject: "Physics", tutor: "Dr. Aminul Haque", rating: 4.8, students: 2150, price: 1799, thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80" },
  { id: "3", title: "Chemistry Complete — SSC to Admission", subject: "Chemistry", tutor: "Farzana Akter", rating: 4.7, students: 1890, price: 1599, thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80" },
  { id: "4", title: "Biology for Medical Admission", subject: "Biology", tutor: "Dr. Nasrin Sultana", rating: 4.9, students: 4320, price: 1999, thumbnail: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80" },
  { id: "5", title: "Web Development with React and Next.js", subject: "Programming", tutor: "Tanvir Ahmed", rating: 4.8, students: 5670, price: 2499, thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80" },
  { id: "6", title: "English Communication and IELTS", subject: "English", tutor: "Ruksana Khanam", rating: 4.6, students: 6890, price: 1299, thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80" },
];

const demoTutors = [
  { id: "1", name: "Md. Rafiqul Islam", subjects: ["Math"], rating: 4.9, reviews: 156, rate: 500, bio: "Former professor at Dhaka College. 15 years of teaching experience.", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "2", name: "Dr. Aminul Haque", subjects: ["Physics"], rating: 4.8, reviews: 132, rate: 700, bio: "PhD from BUET. Makes physics fun and understandable.", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
  { id: "3", name: "Farzana Akter", subjects: ["Chemistry"], rating: 4.7, reviews: 98, rate: 600, bio: "M.Sc from Dhaka University. Passionate about organic chemistry.", avatar: "https://randomuser.me/api/portraits/women/28.jpg" },
  { id: "4", name: "Dr. Nasrin Sultana", subjects: ["Biology"], rating: 4.9, reviews: 210, rate: 800, bio: "MBBS from Dhaka Medical College. Expert in medical admission.", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "5", name: "Tanvir Ahmed", subjects: ["Programming"], rating: 4.8, reviews: 245, rate: 900, bio: "Senior Software Engineer. Teaches web dev from basics to advanced.", avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
  { id: "6", name: "Ruksana Khanam", subjects: ["English"], rating: 4.6, reviews: 178, rate: 500, bio: "IELTS score 8.5. Trained by British Council.", avatar: "https://randomuser.me/api/portraits/women/55.jpg" },
];

const testimonials = [
  { name: "Sakib Hasan", role: "HSC Student, Dhaka Board", rating: 5, quote: "NexLearn completely changed how I study. The AI homework helper saved me hours every week, and my GPA improved from 4.2 to 5.0 in just 3 months!", avatar: "https://randomuser.me/api/portraits/men/12.jpg" },
  { name: "Nusrat Jahan", role: "Medical Admission Student", rating: 5, quote: "The quiz generator is amazing! I practiced 1000+ MCQs on Biology and Chemistry. Got admitted to Dhaka Medical College. Thank you NexLearn!", avatar: "https://randomuser.me/api/portraits/women/23.jpg" },
  { name: "Rakibul Islam", role: "University Student, CSE", rating: 5, quote: "Tanvir sir's React course helped me land my first internship. The project-based learning approach is exactly what I needed.", avatar: "https://randomuser.me/api/portraits/men/34.jpg" },
];

const faqs = [
  { q: "How does NexLearn work?", a: "NexLearn connects students with expert tutors and provides  learning tools. Create a free account, browse courses or tutors, watch video lessons, and use AI tools for homework help, quiz practice, essay checking, and study planning." },
  { q: "Is the AI homework helper free?", a: "Yes! Free users get 5 AI questions per day. Pro subscribers get unlimited access to AI Homework Helper and Quiz Generator. Premium subscribers get all AI tools including Study Planner and Essay Checker." },
  { q: "How do live tutoring sessions work?", a: "After booking a session with a tutor, you will receive a Jitsi Meet link for high-quality video call with screen sharing, chat, and whiteboard. Sessions are recorded for later review." },
  { q: "Can I become a tutor on NexLearn?", a: "Yes! Register as a tutor, complete your profile with qualifications and subjects, and start creating courses. Once verified by our admin team, students can discover and book sessions with you." },
  { q: "What subjects are available?", a: "We currently cover Mathematics, Physics, Chemistry, Biology, English, Bengali, Programming, and Business Studies. New subjects and courses are added every week by our growing tutor community." },
  { q: "How do payments work?", a: "We use Stripe for secure payments. You can pay for individual courses or subscribe to monthly Pro (৳499/mo) or Premium (৳999/mo) plans. Tutors receive their earnings directly. All transactions are encrypted and secure." },
];

const plans = [
  { name: "Free", price: "0", currency: "৳", period: "forever", features: ["5 AI questions/day", "Browse all courses", "View tutor profiles", "Community forum access"], popular: false, cta: "Get Started Free", href: "/register" },
  { name: "Pro", price: "499", currency: "৳", period: "/month", features: ["Unlimited AI questions", "10 tutoring sessions/month", "AI Quiz Generator", "AI Essay Checker", "Priority support", "Progress tracking"], popular: true, cta: "Start Pro Plan", href: "/register" },
  { name: "Premium", price: "999", currency: "৳", period: "/month", features: ["Everything in Pro", "Unlimited sessions", "AI Study Planner", "1-on-1 mentorship", "Certificate on completion", "Offline access", "Custom learning path"], popular: false, cta: "Start Premium Plan", href: "/register" },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-purple-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="mb-6 px-4 py-1.5 bg-blue-100 text-blue-700 border-0 text-sm">
                <Sparkles className="w-4 h-4 mr-1" />  Learning Platform
              </Badge>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Your Next Level of{" "}
              <span className="bg-linear-to-r from-blue-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">Learning</span>{" "}
              Starts Here
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Connect with expert tutors, get AI homework help, generate quizzes, and create personalized study plans — powered by NexLearn.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input type="text" placeholder="Search courses, subjects, or tutors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 pr-4 py-6 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 bg-white shadow-lg" />
                <Link href={`/courses?search=${searchQuery}`}>
                  <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6">Search</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tutors">
                <Button size="lg" className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-6 text-lg rounded-xl hover:opacity-90">
                  Find a Tutor <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl border-2">
                  Become a Tutor <Zap className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Students", value: "10,000+", icon: Users, color: "text-blue-600" },
              { label: "Tutors", value: "500+", icon: Zap, color: "text-purple-600" },
              { label: "Courses", value: "200+", icon: BookOpen, color: "text-green-600" },
              { label: "Rating", value: "4.9★", icon: Star, color: "text-amber-500" },
            ].map((stat) => (
              <motion.div key={stat.label} whileHover={{ y: -5, scale: 1.02 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-gray-100 dark:border-gray-700">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="py-12 bg-linear-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
            <div>
              <StatCounter end={10000} format={(n) => n.toLocaleString() + "+"} />
              <p className="text-blue-100 mt-1">Active Students</p>
            </div>
            <div>
              <StatCounter end={500} format={(n) => n + "+"} />
              <p className="text-blue-100 mt-1">Expert Tutors</p>
            </div>
            <div>
              <StatCounter end={50} format={(n) => n + "+"} />
              <p className="text-blue-100 mt-1">Subjects</p>
            </div>
            <div>
              <StatCounter end={49} format={(n) => (n / 10).toFixed(1)} />
              <p className="text-blue-100 mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-0">How It Works</Badge>
            <h2 className="text-4xl font-bold mb-4">Start Learning in 3 Simple Steps</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Get started in minutes and begin your learning journey</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up free using email or Google. Choose student or tutor role.", icon: UserPlus, color: "from-blue-500 to-blue-600" },
              { step: "02", title: "Find Your Tutor", desc: "Browse tutors by subject, rating, and price. Read reviews.", icon: Search, color: "from-purple-500 to-purple-600" },
              { step: "03", title: "Start Learning", desc: "Book sessions, access courses, and use AI tools.", icon: Video, color: "from-green-500 to-green-600" },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeInUp}>
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 bg-linear-to-br ${item.color} rounded-2xl flex items-center justify-center`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-6xl font-bold text-gray-100 dark:text-gray-800 absolute top-4 right-4">{item.step}</span>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SUBJECTS GRID ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-0">Subjects</Badge>
            <h2 className="text-4xl font-bold mb-4">Explore Our Subjects</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose from a wide range of subjects taught by expert tutors</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <motion.div key={subject.name} variants={scaleIn}>
                <Link href={`/courses?subject=${subject.name}`}>
                  <Card className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-linear-to-br ${subject.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <subject.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg">{subject.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">20+ Courses</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== POPULAR COURSES ===== */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-center justify-between mb-12">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700 border-0">Popular</Badge>
              <h2 className="text-4xl font-bold">Popular Courses</h2>
            </div>
            <Link href="/courses"><Button variant="outline" className="hidden sm:flex">View All <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoCourses.map((course) => (
              <motion.div key={course.id} variants={fadeInUp}>
                <Link href="/courses">
                <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="h-48 relative overflow-hidden">
                    {course.thumbnail ? (
                      <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-blue-300" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-white/90 text-gray-700 border-0">{course.subject}</Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">by {course.tutor}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">{course.students.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-lg font-bold text-blue-600">৳{course.price}</span>
                      <Button size="sm" className="bg-linear-to-r from-blue-600 to-purple-600 text-white">Enroll</Button>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TOP TUTORS ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-700 border-0">Top Rated</Badge>
            <h2 className="text-4xl font-bold mb-4">Meet Our Top Tutors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Learn from the best educators in their fields</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoTutors.map((tutor) => (
              <motion.div key={tutor.id} variants={fadeInUp}>
                <Card className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all">
                      {tutor.avatar ? (
                        <Image src={tutor.avatar} alt={tutor.name} width={80} height={80} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                          {tutor.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{tutor.name}</h3>
                    <div className="flex flex-wrap justify-center gap-1 mb-3">
                      {tutor.subjects.map((s) => (<Badge key={s} variant="secondary" className="text-xs">{s}</Badge>))}
                    </div>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{tutor.bio}</p>
                    <div className="flex items-center justify-center gap-1 mb-4">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{tutor.rating}</span>
                      <span className="text-gray-400 text-sm">({tutor.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="font-semibold text-blue-600">৳{tutor.rate}/hr</span>
                      <Link href="/tutors">
                        <Button size="sm" className="bg-linear-to-r from-blue-600 to-purple-600 text-white">Book</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== AI FEATURES ===== */}
      <section className="py-24 bg-linear-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-blue-800 text-blue-200 border-0"><Sparkles className="w-4 h-4 mr-1" /> Powered by AI</Badge>
            <h2 className="text-4xl font-bold mb-4">Learn with AI Superpowers</h2>
            <p className="text-blue-200 max-w-2xl mx-auto">Our AI tools powered by Google Gemini help you learn faster and smarter</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "AI Homework Helper", desc: "Get step-by-step explanations for any homework question instantly.", icon: Brain, gradient: "from-blue-500 to-cyan-500" },
              { title: "AI Quiz Generator", desc: "Generate unlimited practice quizzes on any topic with feedback.", icon: ListChecks, gradient: "from-purple-500 to-pink-500" },
              { title: "AI Essay Checker", desc: "Check essays for grammar, structure, and vocabulary with scores.", icon: FileText, gradient: "from-green-500 to-emerald-500" },
              { title: "AI Study Planner", desc: "Create personalized study schedules based on your exam dates.", icon: CalendarDays, gradient: "from-amber-500 to-orange-500" },
            ].map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="bg-white/10 backdrop-blur-sm border-white/10 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 mb-4 bg-linear-to-br ${feature.gradient} rounded-2xl flex items-center justify-center`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-sm text-blue-200">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-12">
            <Link href="/ai">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl">
                Try AI Tools Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-pink-100 text-pink-700 border-0">Testimonials</Badge>
            <h2 className="text-4xl font-bold mb-4">What Students Say</h2>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeInUp}>
                <Card className="border-0 shadow-lg h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (<Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />))}
                    </div>
                    <Quote className="w-8 h-8 text-blue-200 mb-3" />
                    <p className="text-gray-600 mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {typeof t.avatar === "string" && t.avatar.startsWith("http") ? (
                          <Image src={t.avatar} alt={t.name} width={48} height={48} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">{typeof t.avatar === "string" ? t.avatar : "?"}</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-gray-500">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-0">Pricing</Badge>
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose the plan that works best for you</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <motion.div key={plan.name} variants={fadeInUp}>
                <Card className={`relative border-0 shadow-lg h-full ${plan.popular ? "ring-2 ring-blue-600 shadow-xl scale-105" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-linear-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-bold">{plan.currency}{plan.price}</span>
                      <span className="text-gray-500">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (<li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500 shrink-0" />{f}</li>))}
                    </ul>
                    <Link href={plan.href} className="w-full">
                      <Button className={`w-full py-6 ${plan.popular ? "bg-linear-to-r from-blue-600 to-purple-600 text-white" : ""}`} variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-0">FAQ</Badge>
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm px-6">
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-24 bg-linear-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Start Learning?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Join thousands of students learning smarter with NexLearn. Start free today!</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl">
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">Browse Courses</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
