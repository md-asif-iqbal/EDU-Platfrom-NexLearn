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
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "English", "Programming", "Business", "Art & Design",
];

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-sm mt-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {msg}
    </p>
  );
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "6+ chars", ok: password.length >= 6 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["Weak", "Fair", "Strong"];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${score === 1 ? "text-red-500" : score === 2 ? "text-yellow-600" : score === 3 ? "text-green-600" : ""}`}>
          {score > 0 ? labels[score - 1] : ""}
        </span>
        <div className="flex gap-2">
          {checks.map((c) => (
            <span key={c.label} className={`text-xs flex items-center gap-0.5 ${c.ok ? "text-green-600" : "text-gray-400"}`}>
              <CheckCircle2 className="w-3 h-3" /> {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"student" | "tutor" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
    if (touched.subjects) setErrors((prev) => ({ ...prev, subjects: "" }));
  };

  // ── Field-level validators ──────────────────────────────
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Name must be at least 3 characters";
        if (!/^[a-zA-Z\s.'-]+$/.test(value)) return "Name can only contain letters";
        break;
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
        break;
      case "phone":
        if (value && !/^(\+880|880|0)?[1-9]\d{8,10}$/.test(value.replace(/\s|-/g, "")))
          return "Enter a valid phone number (e.g. 01712345678)";
        break;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter";
        if (!/\d/.test(value)) return "Include at least one number";
        break;
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        break;
      case "hourlyRate":
        if (!value) return "Hourly rate is required";
        if (isNaN(Number(value)) || Number(value) < 100) return "Minimum rate is ৳100";
        if (Number(value) > 10000) return "Maximum rate is ৳10,000";
        break;
      case "bio":
        if (!value.trim()) return "Bio is required";
        if (value.trim().length < 30) return "Bio must be at least 30 characters";
        if (value.trim().length > 500) return "Bio must be under 500 characters";
        break;
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      let err = validateField(name, value);
      // re-validate confirmPassword when password changes
      if (name === "password" && touched.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          password: err,
          confirmPassword: formData.confirmPassword && value !== formData.confirmPassword ? "Passwords do not match" : "",
        }));
        return;
      }
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // ── Step validators ────────────────────────────────────
  const validateStep1 = () => {
    if (!role) { toast.error("Please select a role to continue"); return false; }
    return true;
  };

  const validateStep2 = () => {
    const fields = ["name", "email", "password", "confirmPassword"];
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    fields.forEach((f) => {
      newTouched[f] = true;
      newErrors[f] = validateField(f, formData[f as keyof typeof formData] as string);
    });
    if (formData.phone) {
      newTouched.phone = true;
      newErrors.phone = validateField("phone", formData.phone);
    }
    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every((e) => !e);
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    if (role === "tutor") {
      if (formData.subjects.length === 0) newErrors.subjects = "Select at least one subject";
      newTouched.hourlyRate = true;
      newErrors.hourlyRate = validateField("hourlyRate", formData.hourlyRate);
      newTouched.bio = true;
      newErrors.bio = validateField("bio", formData.bio);
    }
    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every((e) => !e);
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) {
      if (role === "tutor") setStep(3);
      else handleSubmit();
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
          hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
          subjects: role === "tutor" ? formData.subjects : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }
      toast.success("Account created! Signing you in… 🎉");
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) router.push("/login");
      else { router.push(role === "tutor" ? "/tutor" : "/student"); router.refresh(); }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      // Step 1: Firebase popup
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Step 2: Upsert in MongoDB (role defaults to "student" for Google signup)
      const res = await fetch("/api/auth/firebase-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role: role || "student" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google sign-up failed");

      // Step 3: NextAuth session via firebase-google provider
      const signInResult = await signIn("firebase-google", {
        idToken,
        role: role || "student",
        redirect: false,
      });
      if (signInResult?.error) throw new Error(signInResult.error);

      toast.success(`Account created! Welcome, ${data.user?.name?.split(" ")[0] || ""}! 🎉`);
      const dashboardPath =
        data.user?.role === "tutor" ? "/tutor" : "/student";
      router.push(dashboardPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-up failed";
      if (!msg.includes("popup-closed") && !msg.includes("cancelled")) {
        toast.error(msg);
      }
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NexLearn</span>
        </Link>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, ...(role === "tutor" ? [3] : [])].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? "bg-linear-to-r from-blue-600 to-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  {s < (role === "tutor" ? 3 : 2) && (
                    <div className={`flex-1 h-1 rounded-full ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* ── Step 1: Role Selection ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Join NexLearn</h1>
                    <p className="text-gray-500">How do you want to use NexLearn?</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setRole("student")}
                      className={`relative p-6 rounded-xl border-2 transition-all text-left ${role === "student" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-1">Student</h3>
                      <p className="text-sm text-gray-500">Learn from expert tutors</p>
                      {role === "student" && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-blue-600" />}
                    </button>

                    <button
                      onClick={() => setRole("tutor")}
                      className={`relative p-6 rounded-xl border-2 transition-all text-left ${role === "tutor" ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-3">
                        <GraduationCap className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-1">Tutor</h3>
                      <p className="text-sm text-gray-500">Teach & earn money</p>
                      {role === "tutor" && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-purple-600" />}
                    </button>
                  </div>

                  {/* Google Signup */}
                  <Button onClick={handleGoogleSignup} variant="outline" disabled={isGoogleLoading} className="w-full py-6 mb-4 text-base">
                    {isGoogleLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    Sign up with Google
                  </Button>
                </motion.div>
              )}

              {/* ── Step 2: Basic Info ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
                    <p className="text-gray-500">Fill in your details to get started</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="name" name="name" placeholder="e.g. Md. Asif Iqbal"
                        className={`pl-10 py-5 ${errors.name && touched.name ? "border-red-400" : touched.name && !errors.name ? "border-green-400" : ""}`}
                        value={formData.name} onChange={handleChange} onBlur={handleBlur}
                      />
                      {touched.name && !errors.name && formData.name && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {touched.name && <FieldError msg={errors.name} />}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email" name="email" type="email" placeholder="you@example.com"
                        className={`pl-10 py-5 ${errors.email && touched.email ? "border-red-400" : touched.email && !errors.email ? "border-green-400" : ""}`}
                        value={formData.email} onChange={handleChange} onBlur={handleBlur} autoComplete="email"
                      />
                      {touched.email && !errors.email && formData.email && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {touched.email && <FieldError msg={errors.email} />}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">Phone <span className="text-gray-400 font-normal">(optional)</span></Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone" name="phone" type="tel" placeholder="01712345678"
                        className={`pl-10 py-5 ${errors.phone && touched.phone ? "border-red-400" : ""}`}
                        value={formData.phone} onChange={handleChange} onBlur={handleBlur}
                      />
                    </div>
                    {touched.phone && <FieldError msg={errors.phone} />}
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password" name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 py-5 ${errors.password && touched.password ? "border-red-400" : ""}`}
                        value={formData.password} onChange={handleChange} onBlur={handleBlur} autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.password && <FieldError msg={errors.password} />}
                    <PasswordStrengthBar password={formData.password} />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirmPassword" name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 py-5 ${errors.confirmPassword && touched.confirmPassword ? "border-red-400" : touched.confirmPassword && !errors.confirmPassword ? "border-green-400" : ""}`}
                        value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.confirmPassword && <FieldError msg={errors.confirmPassword} />}
                    {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                      <p className="flex items-center gap-1 text-green-600 text-sm mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Tutor Details ── */}
              {step === 3 && role === "tutor" && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Tutor Profile</h1>
                    <p className="text-gray-500">Tell students about yourself</p>
                  </div>

                  {/* Subjects */}
                  <div>
                    <Label>Subjects You Teach</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {subjects.map((subject) => (
                        <Badge
                          key={subject}
                          onClick={() => toggleSubject(subject)}
                          variant={formData.subjects.includes(subject) ? "default" : "outline"}
                          className={`cursor-pointer py-2 px-3 text-sm transition-colors ${formData.subjects.includes(subject) ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-100"}`}
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                    <FieldError msg={errors.subjects} />
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (৳ BDT)</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="hourlyRate" name="hourlyRate" type="number" placeholder="500" min="100" max="10000"
                        className={`pl-10 py-5 ${errors.hourlyRate && touched.hourlyRate ? "border-red-400" : touched.hourlyRate && !errors.hourlyRate ? "border-green-400" : ""}`}
                        value={formData.hourlyRate} onChange={handleChange} onBlur={handleBlur}
                      />
                    </div>
                    {touched.hourlyRate && <FieldError msg={errors.hourlyRate} />}
                    <p className="text-xs text-gray-400 mt-1">Min ৳100 — Max ৳10,000 per hour</p>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio" name="bio"
                      placeholder="Tell students about your experience, qualifications, and teaching style... (min 30 characters)"
                      className={`mt-1 min-h-30 ${errors.bio && touched.bio ? "border-red-400" : touched.bio && !errors.bio ? "border-green-400" : ""}`}
                      value={formData.bio} onChange={handleChange} onBlur={handleBlur}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {touched.bio ? <FieldError msg={errors.bio} /> : <span />}
                      <span className={`text-xs ${formData.bio.length > 500 ? "text-red-500" : "text-gray-400"}`}>
                        {formData.bio.length}/500
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 py-6">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 py-6 bg-linear-to-r from-blue-600 to-purple-600 text-white text-base"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
                ) : step === 1 ? (
                  <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (step === 2 && role === "student") || (step === 3 && role === "tutor") ? (
                  "Create Account"
                ) : (
                  <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
