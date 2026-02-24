"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import VideoSession from "@/components/video-session";
import Navbar from "@/components/navbar";
import {
  Clock,
  Calendar,
  FileText,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface SessionData {
  _id: string;
  tutor: { _id: string; name: string; avatar: string };
  student: { _id: string; name: string; avatar: string };
  subject: string;
  scheduledAt: string;
  duration: number;
  status: string;
  roomId: string;
  notes: string;
}

export default function SessionPage() {
  const { roomId } = useParams();
  const { data: session } = useSession();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        const found = (data.sessions || []).find(
          (s: SessionData) => s.roomId === roomId
        );
        if (found) {
          setSessionData(found);
          setNotes(found.notes || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch session", err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) fetchSession();
  }, [roomId, fetchSession]);

  const handleSaveNotes = async () => {
    if (!sessionData) return;
    setSaving(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionData._id,
          notes,
        }),
      });
      if (res.ok) {
        toast.success("Notes saved!");
      } else {
        toast.error("Failed to save notes");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionData) return;
    try {
      const res = await fetch("/api/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionData._id,
          status: "completed",
          notes,
        }),
      });
      if (res.ok) {
        toast.success("Session completed!");
        setSessionData((prev) => (prev ? { ...prev, status: "completed" } : prev));
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-[60vh] rounded-xl mb-4" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-900 text-white">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={session?.user?.role === "tutor" ? "/tutor" : "/student"}>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              {sessionData && (
                <>
                  <Badge variant="outline" className="text-white border-gray-600">
                    {sessionData.subject}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(sessionData.scheduledAt).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    {sessionData.duration} min
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {sessionData?.status === "upcoming" || sessionData?.status === "live" || sessionData?.status === "in-progress" ? (
                <Badge className="bg-green-600 animate-pulse">Live</Badge>
              ) : sessionData?.status === "completed" ? (
                <Badge className="bg-gray-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              ) : null}

              {sessionData && sessionData.status !== "completed" && (
                <Button onClick={handleEndSession} variant="destructive" size="sm">
                  End Session
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Video Area */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl overflow-hidden bg-black aspect-video"
              >
                <VideoSession
                  roomId={roomId as string}
                  userName={session?.user?.name || "User"}
                />
              </motion.div>
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              {/* Participant Info */}
              {sessionData && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Participants</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                          {sessionData.tutor?.name?.charAt(0) || "T"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{sessionData.tutor?.name || "Tutor"}</p>
                          <p className="text-xs text-gray-500">Tutor</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                          {sessionData.student?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{sessionData.student?.name || "Student"}</p>
                          <p className="text-xs text-gray-500">Student</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Session Notes
                  </h3>
                  <Textarea
                    placeholder="Take notes during the session..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white min-h-50 text-sm"
                  />
                  <Button
                    onClick={handleSaveNotes}
                    disabled={saving}
                    size="sm"
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Notes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
