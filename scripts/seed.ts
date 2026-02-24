/**
 * Seed script – populates MongoDB with REAL demo data:
 *   • 1 admin, 1 student
 *   • 6 verified tutors with real randomuser.me avatars
 *   • 6 courses with YouTube embed video lessons & Unsplash thumbnails
 *
 * Run:  npx tsx scripts/seed.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://asifnaasmind_db_user:H8yd9uzKzfmnfF0Y@cluster0.krmw4r6.mongodb.net/eduai";

/* ── Schemas ──────────────────────────────────────────── */
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["student", "tutor", "admin"], default: "student" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    subjects: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LessonSchema = new mongoose.Schema({
  title: String,
  videoUrl: { type: String, default: "" },
  duration: { type: Number, default: 0 },
  order: Number,
});

const CourseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    subject: {
      type: String,
      enum: ["Math", "Physics", "Chemistry", "Biology", "English", "Bengali", "Programming", "Business"],
    },
    level: { type: String, enum: ["School", "College", "University"] },
    price: Number,
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    thumbnail: { type: String, default: "" },
    lessons: [LessonSchema],
    syllabus: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

/* ── Tutor definitions ─────────────────────────────────── */
const TUTORS = [
  {
    name: "Md. Rafiqul Islam",
    email: "rafiqul@eduai.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Former professor at Dhaka College. Specializes in SSC HSC and university admission math preparation. Expert in making complex topics simple and easy. 15 years of teaching experience.",
    subjects: ["Math"],
    rating: 4.9,
    totalReviews: 156,
    hourlyRate: 500,
    phone: "+880-1712-111111",
  },
  {
    name: "Dr. Aminul Haque",
    email: "aminul@eduai.com",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    bio: "PhD from BUET. Research experience in quantum physics. Makes physics fun and understandable for every student from school to university level. 12 years experience.",
    subjects: ["Physics"],
    rating: 4.8,
    totalReviews: 132,
    hourlyRate: 700,
    phone: "+880-1712-222222",
  },
  {
    name: "Farzana Akter",
    email: "farzana@eduai.com",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    bio: "M.Sc from Dhaka University Chemistry department. Passionate about teaching organic chemistry in simple Bangla with real life examples. 8 years experience.",
    subjects: ["Chemistry"],
    rating: 4.7,
    totalReviews: 98,
    hourlyRate: 600,
    phone: "+880-1712-333333",
  },
  {
    name: "Dr. Nasrin Sultana",
    email: "nasrin@eduai.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "MBBS from Dhaka Medical College. Expert in biology for medical admission. Helped 500+ students get into medical colleges across Bangladesh. 10 years experience.",
    subjects: ["Biology"],
    rating: 4.9,
    totalReviews: 210,
    hourlyRate: 800,
    phone: "+880-1712-444444",
  },
  {
    name: "Tanvir Ahmed",
    email: "tanvir@eduai.com",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    bio: "Senior Software Engineer with experience at local and international tech companies. Teaches web development from basics to advanced level. 8 years experience.",
    subjects: ["Programming"],
    rating: 4.8,
    totalReviews: 245,
    hourlyRate: 900,
    phone: "+880-1712-555555",
  },
  {
    name: "Ruksana Khanam",
    email: "ruksana@eduai.com",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    bio: "IELTS score 8.5. Trained by British Council. Helped 1000+ students improve their English and achieve IELTS band 7 and above. 6 years experience.",
    subjects: ["English"],
    rating: 4.6,
    totalReviews: 178,
    hourlyRate: 500,
    phone: "+880-1712-666666",
  },
];

/* ── Course definitions ──────────────────────────────────── */
interface CourseInput {
  tutorIndex: number;
  title: string;
  description: string;
  subject: string;
  level: string;
  price: number;
  thumbnail: string;
  rating: number;
  totalStudents: number;
  syllabus: string[];
  lessons: { title: string; videoUrl: string; duration: number; order: number }[];
}

const COURSES: CourseInput[] = [
  {
    tutorIndex: 0,
    title: "Complete Mathematics for SSC & HSC",
    description:
      "Master algebra, geometry, trigonometry and calculus with step by step Bangla explanation. Covers full SSC and HSC syllabus with 200+ practice problems. Perfect for students preparing for board exams and university admission tests.",
    subject: "Math",
    level: "College",
    price: 1499,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    rating: 4.9,
    totalStudents: 3240,
    syllabus: [
      "Number System and Basic Algebra",
      "Linear Equations and Inequalities",
      "Quadratic Equations",
      "Geometry Basics and Theorems",
      "Trigonometry Full Chapter",
      "Statistics and Probability",
    ],
    lessons: [
      { title: "Number System and Basic Algebra", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", duration: 45, order: 1 },
      { title: "Linear Equations and Inequalities", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", duration: 52, order: 2 },
      { title: "Quadratic Equations", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", duration: 48, order: 3 },
      { title: "Geometry Basics and Theorems", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", duration: 60, order: 4 },
      { title: "Trigonometry Full Chapter", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", duration: 55, order: 5 },
      { title: "Statistics and Probability", videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw", duration: 40, order: 6 },
    ],
  },
  {
    tutorIndex: 1,
    title: "Physics Mastery — HSC & Admission",
    description:
      "Complete HSC physics with university admission preparation. Covers mechanics, electricity, optics, modern physics with animated explanations. Includes 150+ solved problems and practice tests.",
    subject: "Physics",
    level: "College",
    price: 1799,
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    rating: 4.8,
    totalStudents: 2150,
    syllabus: [
      "Physical Quantities and Measurement",
      "Vectors and Motion",
      "Newton Laws of Motion",
      "Work Energy and Power",
      "Electricity and Magnetism",
      "Wave and Sound",
    ],
    lessons: [
      { title: "Physical Quantities and Measurement", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE", duration: 38, order: 1 },
      { title: "Vectors and Motion", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE", duration: 50, order: 2 },
      { title: "Newton Laws of Motion", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE", duration: 55, order: 3 },
      { title: "Work Energy and Power", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE", duration: 45, order: 4 },
      { title: "Electricity and Magnetism", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE", duration: 65, order: 5 },
      { title: "Wave and Sound", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE", duration: 42, order: 6 },
    ],
  },
  {
    tutorIndex: 2,
    title: "Chemistry Complete — SSC to Admission",
    description:
      "Learn organic, inorganic and physical chemistry from basics to advanced level. Perfect for SSC HSC and medical admission students. Includes lab demonstrations and 100+ practice problems.",
    subject: "Chemistry",
    level: "College",
    price: 1599,
    thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
    rating: 4.7,
    totalStudents: 1890,
    syllabus: [
      "Atomic Structure and Periodic Table",
      "Chemical Bonding",
      "Organic Chemistry Basics",
      "Acids Bases and Salts",
      "Electrochemistry",
      "Environmental Chemistry",
    ],
    lessons: [
      { title: "Atomic Structure and Periodic Table", videoUrl: "https://www.youtube.com/embed/uVFCOfSuPTo", duration: 50, order: 1 },
      { title: "Chemical Bonding", videoUrl: "https://www.youtube.com/embed/uVFCOfSuPTo", duration: 45, order: 2 },
      { title: "Organic Chemistry Basics", videoUrl: "https://www.youtube.com/embed/uVFCOfSuPTo", duration: 60, order: 3 },
      { title: "Acids Bases and Salts", videoUrl: "https://www.youtube.com/embed/uVFCOfSuPTo", duration: 40, order: 4 },
      { title: "Electrochemistry", videoUrl: "https://www.youtube.com/embed/uVFCOfSuPTo", duration: 48, order: 5 },
      { title: "Environmental Chemistry", videoUrl: "https://www.youtube.com/embed/uVFCOfSuPTo", duration: 35, order: 6 },
    ],
  },
  {
    tutorIndex: 3,
    title: "Biology for Medical Admission",
    description:
      "Complete biology preparation for medical admission test. Covers cell biology, genetics, human physiology, plant biology and ecology. Includes diagrams, mnemonics and 200+ MCQs.",
    subject: "Biology",
    level: "University",
    price: 1999,
    thumbnail: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80",
    rating: 4.9,
    totalStudents: 4320,
    syllabus: [
      "Cell Structure and Function",
      "Cell Division Mitosis and Meiosis",
      "Genetics and DNA",
      "Human Digestive System",
      "Human Circulatory System",
      "Plant Physiology",
    ],
    lessons: [
      { title: "Cell Structure and Function", videoUrl: "https://www.youtube.com/embed/QnQe0xW_JY4", duration: 55, order: 1 },
      { title: "Cell Division Mitosis and Meiosis", videoUrl: "https://www.youtube.com/embed/QnQe0xW_JY4", duration: 50, order: 2 },
      { title: "Genetics and DNA", videoUrl: "https://www.youtube.com/embed/QnQe0xW_JY4", duration: 65, order: 3 },
      { title: "Human Digestive System", videoUrl: "https://www.youtube.com/embed/QnQe0xW_JY4", duration: 45, order: 4 },
      { title: "Human Circulatory System", videoUrl: "https://www.youtube.com/embed/QnQe0xW_JY4", duration: 48, order: 5 },
      { title: "Plant Physiology", videoUrl: "https://www.youtube.com/embed/QnQe0xW_JY4", duration: 42, order: 6 },
    ],
  },
  {
    tutorIndex: 4,
    title: "Web Development with React and Next.js",
    description:
      "Learn modern web development from scratch. HTML CSS JavaScript React Next.js with real project building. Get job ready in 3 months. Includes 10+ real-world projects and interview preparation.",
    subject: "Programming",
    level: "University",
    price: 2499,
    thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
    rating: 4.8,
    totalStudents: 5670,
    syllabus: [
      "HTML and CSS Fundamentals",
      "JavaScript ES6 and Beyond",
      "React Components and Hooks",
      "Next.js App Router",
      "MongoDB and API Building",
      "Deploy Full Stack App",
    ],
    lessons: [
      { title: "HTML and CSS Fundamentals", videoUrl: "https://www.youtube.com/embed/zOjov-2OZ0E", duration: 60, order: 1 },
      { title: "JavaScript ES6 and Beyond", videoUrl: "https://www.youtube.com/embed/zOjov-2OZ0E", duration: 75, order: 2 },
      { title: "React Components and Hooks", videoUrl: "https://www.youtube.com/embed/zOjov-2OZ0E", duration: 80, order: 3 },
      { title: "Next.js App Router", videoUrl: "https://www.youtube.com/embed/zOjov-2OZ0E", duration: 70, order: 4 },
      { title: "MongoDB and API Building", videoUrl: "https://www.youtube.com/embed/zOjov-2OZ0E", duration: 65, order: 5 },
      { title: "Deploy Full Stack App", videoUrl: "https://www.youtube.com/embed/zOjov-2OZ0E", duration: 45, order: 6 },
    ],
  },
  {
    tutorIndex: 5,
    title: "English Communication and IELTS",
    description:
      "Improve English speaking writing reading and listening. IELTS preparation with practice tests. Achieve band 7+ score guaranteed. Includes mock tests and personalized feedback.",
    subject: "English",
    level: "University",
    price: 1299,
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    rating: 4.6,
    totalStudents: 6890,
    syllabus: [
      "English Grammar Foundation",
      "Vocabulary Building",
      "Speaking and Pronunciation",
      "Writing Task 1 and 2",
      "Reading Comprehension",
      "Listening Practice",
    ],
    lessons: [
      { title: "English Grammar Foundation", videoUrl: "https://www.youtube.com/embed/bEZO6RURJEU", duration: 45, order: 1 },
      { title: "Vocabulary Building", videoUrl: "https://www.youtube.com/embed/bEZO6RURJEU", duration: 40, order: 2 },
      { title: "Speaking and Pronunciation", videoUrl: "https://www.youtube.com/embed/bEZO6RURJEU", duration: 55, order: 3 },
      { title: "Writing Task 1 and 2", videoUrl: "https://www.youtube.com/embed/bEZO6RURJEU", duration: 60, order: 4 },
      { title: "Reading Comprehension", videoUrl: "https://www.youtube.com/embed/bEZO6RURJEU", duration: 50, order: 5 },
      { title: "Listening Practice", videoUrl: "https://www.youtube.com/embed/bEZO6RURJEU", duration: 45, order: 6 },
    ],
  },
];

/* ── Main ───────────────────────────────────────────────── */
async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  const hashedPassword = await bcrypt.hash("Demo@1234", 12);

  // --- Admin ---
  const admin = await User.findOneAndUpdate(
    { email: "admin@eduai.com" },
    {
      name: "Admin User",
      email: "admin@eduai.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      bio: "EduAI Platform Administrator",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("👑 Admin: " + admin.email);

  // --- Student ---
  const student = await User.findOneAndUpdate(
    { email: "student@eduai.com" },
    {
      name: "Asif Iqbal",
      email: "student@eduai.com",
      password: hashedPassword,
      role: "student",
      isVerified: true,
      bio: "Computer Science student passionate about web development and AI.",
      phone: "+880-1812-345678",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("📚 Student: " + student.email);

  // --- Tutors ---
  const tutorDocs: mongoose.Document[] = [];
  for (const t of TUTORS) {
    const doc = await User.findOneAndUpdate(
      { email: t.email },
      {
        ...t,
        password: hashedPassword,
        role: "tutor",
        isVerified: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    tutorDocs.push(doc);
    console.log("🎓 Tutor: " + doc.name + " (" + t.email + ")");
  }

  // --- Remove old courses by these tutors ---
  const tutorIds = tutorDocs.map((t) => t._id);
  const deleted = await Course.deleteMany({ tutor: { $in: tutorIds } });
  console.log("\n🗑️  Removed " + deleted.deletedCount + " existing demo courses");

  // --- Also remove old demo tutor courses ---
  const oldTutor = await User.findOne({ email: "tutor@eduai.com" });
  if (oldTutor) {
    const oldDeleted = await Course.deleteMany({ tutor: oldTutor._id });
    console.log("🗑️  Removed " + oldDeleted.deletedCount + " old demo tutor courses");
  }

  // --- Insert courses ---
  const courseDocs = COURSES.map((c) => {
    const { tutorIndex, ...rest } = c;
    return {
      ...rest,
      tutor: tutorDocs[tutorIndex]._id,
      isPublished: true,
    };
  });
  const inserted = await Course.insertMany(courseDocs);
  console.log("\n📦 Inserted " + inserted.length + " courses:\n");
  inserted.forEach((c, i) => {
    console.log("   " + (i + 1) + ". " + c.title + " — ৳" + c.price);
  });

  console.log("\n✅ Seed complete!");
  console.log("\n📋 Login Credentials (password: Demo@1234):");
  console.log("   Admin:   admin@eduai.com");
  console.log("   Student: student@eduai.com");
  TUTORS.forEach((t) => console.log("   Tutor:   " + t.email));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
