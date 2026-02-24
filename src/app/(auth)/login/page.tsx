"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-sm mt-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {msg}
    </p>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "6+ characters", ok: password.length >= 6 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-400", "bg-yellow-400", "bg-green-400"];
  const labels = ["Weak", "Fair", "Strong"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : "bg-gray-200"}`} />
        ))}
      </div>
      <p className={`text-xs ${score === 1 ? "text-red-500" : score === 2 ? "text-yellow-600" : "text-green-600"}`}>
        {labels[score - 1] || ""}
      </p>
      <div className="flex gap-3 mt-1">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs flex items-center gap-0.5 ${c.ok ? "text-green-600" : "text-gray-400"}`}>
            <CheckCircle2 className="w-3 h-3" /> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
    if (name === "email") {
      if (!value) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
    }
    if (name === "password") {
      if (!value) return "Password is required";
      if (value.length < 6) return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    newErrors.email = validateField("email", formData.email);
    newErrors.password = validateField("password", formData.password);
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        if (result.error.includes("No user found")) toast.error("No account found with this email");
        else if (result.error.includes("Invalid password")) toast.error("Incorrect password. Try again.");
        else if (result.error.includes("sign in with Google")) toast.error("This account uses Google sign-in");
        else toast.error(result.error);
      } else {
        toast.success("Welcome back! 🎉");
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        const userRole = sessionData?.user?.role || "student";
        const dashboardPath = userRole === "admin" ? "/admin" : userRole === "tutor" ? "/tutor" : "/student";
        router.push(dashboardPath);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // Step 1: Firebase popup sign-in
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Step 2: Create/upsert user in MongoDB via our API
      const res = await fetch("/api/auth/firebase-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google sign-in failed");

      // Step 3: Create NextAuth JWT session using firebase-google credentials provider
      const signInResult = await signIn("firebase-google", {
        idToken,
        redirect: false,
      });

      if (signInResult?.error) throw new Error(signInResult.error);

      toast.success(`Welcome back, ${data.user?.name?.split(" ")[0] || ""}! 🎉`);
      const dashboardPath =
        data.user?.role === "admin" ? "/admin" :
        data.user?.role === "tutor" ? "/tutor" : "/student";
      router.push(dashboardPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      // Ignore popup-closed-by-user
      if (!msg.includes("popup-closed") && !msg.includes("cancelled")) {
        toast.error(msg);
      }
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NexLearn</span>
        </Link>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-500">Sign in to continue learning</p>
            </div>

            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              disabled={isGoogleLoading}
              className="w-full py-6 mb-6 text-base"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white dark:bg-gray-900 px-4 text-gray-500">or sign in with email</span></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`pl-10 py-5 ${errors.email && touched.email ? "border-red-400 focus:border-red-400" : touched.email && !errors.email ? "border-green-400" : ""}`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                  />
                  {touched.email && !errors.email && formData.email && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
                {touched.email && <FieldError msg={errors.email} />}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 py-5 ${errors.password && touched.password ? "border-red-400 focus:border-red-400" : ""}`}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.password && <FieldError msg={errors.password} />}
              </div>

              <div className="flex items-center justify-end">
                <Link href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-linear-to-r from-blue-600 to-purple-600 text-white text-base"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 font-medium hover:underline">Sign up free</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
