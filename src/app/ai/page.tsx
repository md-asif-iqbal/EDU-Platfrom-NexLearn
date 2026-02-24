"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Brain,
  MessageSquare,
  HelpCircle,
  FileText,
  CalendarDays,
  Loader2,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  RotateCcw,
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

export default function AIToolsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-blue-600 py-16">
          <div className="container mx-auto px-4 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain className="w-8 h-8" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              AI Study Tools
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-purple-100 max-w-2xl mx-auto"
            >
              Powered by Google Gemini — Get instant homework help, generate quizzes,
              check essays, and plan your studies
            </motion.p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 -mt-8">
          <Tabs defaultValue="homework" className="max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-4 mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-1">
              <TabsTrigger value="homework" className="gap-2 py-3">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Homework</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-2 py-3">
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="essay" className="gap-2 py-3">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Essay</span>
              </TabsTrigger>
              <TabsTrigger value="planner" className="gap-2 py-3">
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Planner</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="homework">
              <HomeworkHelper />
            </TabsContent>
            <TabsContent value="quiz">
              <QuizGenerator />
            </TabsContent>
            <TabsContent value="essay">
              <EssayChecker />
            </TabsContent>
            <TabsContent value="planner">
              <StudyPlanner />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── Homework Helper ──────────────────────────────────────── */
function HomeworkHelper() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, subject }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "Sorry, I couldn't generate a response." },
      ]);
    } catch {
      toast.error("Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          AI Homework Helper
        </CardTitle>
        <p className="text-sm text-gray-500">
          Ask any question and get step-by-step explanations
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto border rounded-xl p-4 mb-4 space-y-4 bg-gray-50 dark:bg-gray-800">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Sparkles className="w-12 h-12 mb-3" />
              <p className="font-medium">Ask me anything!</p>
              <p className="text-sm">I&apos;ll explain it step by step</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white dark:bg-gray-700 border rounded-bl-md shadow-sm"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                      toast.success("Copied!");
                    }}
                    className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            className="py-5"
          />
          <Button onClick={sendMessage} disabled={loading} className="px-6 bg-blue-600">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Quiz Generator ──────────────────────────────────────── */
function QuizGenerator() {
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<
    Array<{
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }>
  >([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) return toast.error("Enter a topic");
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, difficulty }),
      });
      const data = await res.json();
      setQuestions(data.quiz?.questions || []);
    } catch {
      toast.error("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const score = Object.entries(answers).filter(
    ([i, a]) => questions[Number(i)]?.correct === a
  ).length;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600" />
          AI Quiz Generator
        </CardTitle>
        <p className="text-sm text-gray-500">
          Generate practice quizzes on any topic instantly
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Enter topic (e.g., Quadratic Equations)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 min-w-50"
          />
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateQuiz} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate Quiz
          </Button>
        </div>

        {questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((q, qi) => (
              <motion.div
                key={qi}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qi * 0.1 }}
                className="p-5 border rounded-xl"
              >
                <p className="font-medium mb-3">
                  <span className="text-blue-600 mr-2">Q{qi + 1}.</span>
                  {q.question}
                </p>
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[qi] === oi;
                    const isCorrect = q.correct === oi;
                    let optClass = "border hover:bg-gray-50 dark:hover:bg-gray-800";
                    if (showResults && isCorrect) optClass = "border-green-500 bg-green-50 dark:bg-green-900/20";
                    else if (showResults && isSelected && !isCorrect) optClass = "border-red-500 bg-red-50 dark:bg-red-900/20";
                    else if (isSelected) optClass = "border-blue-500 bg-blue-50 dark:bg-blue-900/20";

                    return (
                      <button
                        key={oi}
                        onClick={() => {
                          if (!showResults) setAnswers({ ...answers, [qi]: oi });
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-colors ${optClass}`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          isSelected ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"
                        }`}>
                          {String.fromCharCode(65 + oi)}
                        </div>
                        {opt}
                        {showResults && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                        {showResults && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
                {showResults && q.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </motion.div>
            ))}

            <div className="flex items-center justify-between pt-4 border-t">
              {showResults ? (
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold">
                    Score: {score}/{questions.length}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({Math.round((score / questions.length) * 100)}%)
                    </span>
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnswers({});
                      setShowResults(false);
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(answers).length < questions.length}
                  className="bg-purple-600"
                >
                  Submit Answers
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Essay Checker ──────────────────────────────────────── */
function EssayChecker() {
  const [essay, setEssay] = useState("");
  const [subject, setSubject] = useState("English");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const checkEssay = async () => {
    if (essay.trim().length < 50) return toast.error("Essay must be at least 50 characters");
    setLoading(true);
    setFeedback("");

    try {
      const res = await fetch("/api/ai/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, subject }),
      });
      const data = await res.json();
      const result = data.result;
      if (result && typeof result === "object") {
        const parts: string[] = [];
        if (result.score !== undefined) parts.push(`Overall Score: ${result.score}/100`);
        if (result.grammar) parts.push(`\nGrammar: ${result.grammar}`);
        if (result.structure) parts.push(`\nStructure: ${result.structure}`);
        if (result.content) parts.push(`\nContent: ${result.content}`);
        if (result.suggestions?.length) parts.push(`\nSuggestions:\n${result.suggestions.map((s: string) => `• ${s}`).join("\n")}`);
        if (result.strengths?.length) parts.push(`\nStrengths:\n${result.strengths.map((s: string) => `• ${s}`).join("\n")}`);
        if (result.improvements?.length) parts.push(`\nAreas for Improvement:\n${result.improvements.map((s: string) => `• ${s}`).join("\n")}`);
        setFeedback(parts.join("\n") || JSON.stringify(result, null, 2));
      } else {
        setFeedback(typeof result === "string" ? result : "No feedback generated.");
      }
    } catch {
      toast.error("Failed to check essay");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          AI Essay Checker
        </CardTitle>
        <p className="text-sm text-gray-500">
          Get detailed feedback on grammar, structure, and content
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea
          placeholder="Paste or type your essay here (minimum 50 characters)..."
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          className="min-h-62.5 mb-4"
        />

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {essay.length} characters • ~{Math.ceil(essay.split(/\s+/).filter(Boolean).length)} words
          </span>
          <Button onClick={checkEssay} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Check Essay
          </Button>
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
          >
            <h3 className="font-bold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Feedback
            </h3>
            <div className="text-sm text-green-900 dark:text-green-100 whitespace-pre-line leading-relaxed">
              {feedback}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(feedback);
                toast.success("Feedback copied!");
              }}
              className="mt-3 text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy feedback
            </button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Study Planner ──────────────────────────────────────── */
function StudyPlanner() {
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<
    Array<{ day: number; topic: string; tasks: string[]; duration: string }>
  >([]);

  const generatePlan = async () => {
    if (!topic.trim()) return toast.error("Enter a topic or exam");
    setLoading(true);
    setPlan([]);

    try {
      const examDate = new Date();
      examDate.setDate(examDate.getDate() + Number(days));
      const res = await fetch("/api/ai/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: [subject],
          examDate: examDate.toISOString().split("T")[0],
          hoursPerDay: 4,
        }),
      });
      const data = await res.json();
      const resultPlan = data.result?.plan || data.result?.schedule || data.result;
      setPlan(Array.isArray(resultPlan) ? resultPlan : []);
    } catch {
      toast.error("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-amber-600" />
          AI Study Planner
        </CardTitle>
        <p className="text-sm text-gray-500">
          Get a personalized study schedule for any subject or exam
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Topic or exam (e.g., SSC Math Final Exam)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 min-w-50"
          />
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Days</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generatePlan} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate Plan
          </Button>
        </div>

        {plan.length > 0 && (
          <div className="space-y-4">
            {plan.map((dayPlan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4"
              >
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                    D{dayPlan.day}
                  </div>
                  {i < plan.length - 1 && (
                    <div className="w-0.5 flex-1 bg-amber-200 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{dayPlan.topic}</h3>
                      <Badge variant="outline" className="text-xs">{dayPlan.duration}</Badge>
                    </div>
                    <ul className="space-y-1.5">
                      {dayPlan.tasks.map((task, ti) => (
                        <li key={ti} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
