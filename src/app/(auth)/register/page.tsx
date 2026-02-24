"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Zap,
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  Phone,
  BookOpen,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Programming",
  "Business",
  "Art & Design",
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"student" | "tutor" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    bio: "",
    hourlyRate: "",
    subjects: [] as string[],
  });

  const toggleSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const validateStep1 = () => {
    if (!role) {
      toast.error("Please select a role");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be 6+ characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (role === "tutor") {
      if (formData.subjects.length === 0)
        newErrors.subjects = "Select at least one subject";
      if (!formData.hourlyRate) newErrors.hourlyRate = "Hourly rate is required";
      if (!formData.bio.trim()) newErrors.bio = "Bio is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(role === "student" ? 2 : 2);
    } else if (step === 2 && validateStep2()) {
      if (role === "tutor") {
        setStep(3);
      } else {
        handleSubmit();
      }
    } else if (step === 3 && validateStep3()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          role,
          bio: formData.bio || undefined,
          hourlyRate: formData.hourlyRate
            ? Number(formData.hourlyRate)
            : undefined,
          subjects: role === "tutor" ? formData.subjects : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      toast.success("Account created! Signing you in...");

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push(role === "tutor" ? "/tutor" : "/student");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    signIn("google", { callbackUrl: "/student" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NexLearn
          </span>
        </Link>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, ...(role === "tutor" ? [3] : [])].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step >= s
                        ? "bg-linear-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  {s < (role === "tutor" ? 3 : 2) && (
                    <div
                      className={`flex-1 h-1 rounded-full ${
                        step > s ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Role Selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">
                      Join NexLearn
                    </h1>
                    <p className="text-gray-500">How do you want to use NexLearn?</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setRole("student")}
                      className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                        role === "student"
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-1">Student</h3>
                      <p className="text-sm text-gray-500">Learn from expert tutors</p>
                      {role === "student" && (
                        <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-blue-600" />
                      )}
                    </button>

                    <button
                      onClick={() => setRole("tutor")}
                      className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                        role === "tutor"
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-3">
                        <GraduationCap className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-1">Tutor</h3>
                      <p className="text-sm text-gray-500">Teach & earn money</p>
                      {role === "tutor" && (
                        <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-purple-600" />
                      )}
                    </button>
                  </div>

                  {/* Google Signup */}
                  <Button
                    onClick={handleGoogleSignup}
                    variant="outline"
                    className="w-full py-6 mb-4 text-base"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Basic Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">
                      Create Your Account
                    </h1>
                    <p className="text-gray-500">
                      Fill in your details to get started
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="pl-10 py-5"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 py-5"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+880 1XXX-XXXXXX"
                        className="pl-10 py-5"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 py-5"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 py-5"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Tutor Details */}
              {step === 3 && role === "tutor" && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Tutor Profile</h1>
                    <p className="text-gray-500">
                      Tell students about yourself
                    </p>
                  </div>

                  <div>
                    <Label>Subjects You Teach</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {subjects.map((subject) => (
                        <Badge
                          key={subject}
                          onClick={() => toggleSubject(subject)}
                          variant={
                            formData.subjects.includes(subject)
                              ? "default"
                              : "outline"
                          }
                          className={`cursor-pointer py-2 px-3 text-sm transition-colors ${
                            formData.subjects.includes(subject)
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                    {errors.subjects && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.subjects}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (৳ BDT)</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="hourlyRate"
                        type="number"
                        placeholder="500"
                        min="100"
                        className="pl-10 py-5"
                        value={formData.hourlyRate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hourlyRate: e.target.value,
                          })
                        }
                      />
                    </div>
                    {errors.hourlyRate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.hourlyRate}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell students about your experience, teaching style, and qualifications..."
                      className="mt-1 min-h-30"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                    />
                    {errors.bio && (
                      <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 py-6 bg-linear-to-r from-blue-600 to-purple-600 text-white text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : step === 1 ? (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (step === 2 && role === "student") ||
                  (step === 3 && role === "tutor") ? (
                  "Create Account"
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
