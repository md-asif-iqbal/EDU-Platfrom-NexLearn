"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Brain,
  CreditCard,
  Settings,
  PlusCircle,
  Star,
  BarChart3,
  UserCheck,
  Menu,
  X,
  Zap,
} from "lucide-react";

const studentLinks = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Browse Courses", icon: BookOpen },
  { href: "/ai", label: "AI Tools", icon: Brain },
  { href: "/student/sessions", label: "My Sessions", icon: Calendar },
  { href: "/student/payments", label: "Payments", icon: CreditCard },
];

const tutorLinks = [
  { href: "/tutor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tutor/courses", label: "My Courses", icon: BookOpen },
  { href: "/tutor/create-course", label: "Create Course", icon: PlusCircle },
  { href: "/tutor/sessions", label: "Sessions", icon: Calendar },
  { href: "/tutor/reviews", label: "Reviews", icon: Star },
  { href: "/tutor/earnings", label: "Earnings", icon: BarChart3 },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/verifications", label: "Verifications", icon: UserCheck },
];

export default function DashboardSidebar({ role: roleProp }: { role?: string } = {}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = roleProp || session?.user?.role || "student";
  const links =
    role === "admin"
      ? adminLinks
      : role === "tutor"
        ? tutorLinks
        : studentLinks;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NexLearn
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-linear-to-r from-blue-50 to-purple-50 text-blue-600 dark:from-blue-900/20 dark:to-purple-900/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-blue-600" : ""}`}
                />
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Profile Card */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <Link href={`/profile/${session?.user?.id || ""}`} onClick={() => setMobileOpen(false)}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg bg-white dark:bg-gray-800 shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-700"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden lg:block relative">
        {sidebarContent}
      </aside>
    </>
  );
}
