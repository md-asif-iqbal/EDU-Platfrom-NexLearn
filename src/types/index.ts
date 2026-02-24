export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: "student" | "tutor" | "admin";
  avatar: string;
  phone: string;
  bio: string;
  subjects: string[];
  rating: number;
  totalReviews: number;
  earnings: number;
  hourlyRate: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILesson {
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
}

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  subject: string;
  level: "School" | "College" | "University";
  price: number;
  tutor: IUser | string;
  thumbnail: string;
  lessons: ILesson[];
  syllabus: string[];
  rating: number;
  totalStudents: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession {
  _id: string;
  tutor: IUser | string;
  student: IUser | string;
  course: ICourse | string;
  roomId: string;
  scheduledAt: Date;
  duration: number;
  status: "upcoming" | "live" | "completed" | "cancelled";
  price: number;
  notes: string;
  createdAt: Date;
}

export interface IPayment {
  _id: string;
  user: IUser | string;
  course: ICourse | string;
  amount: number;
  currency: string;
  stripePaymentId: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
}

export interface IReview {
  _id: string;
  student: IUser | string;
  tutor: IUser | string;
  course: ICourse | string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IAIChat {
  _id: string;
  student: IUser | string;
  subject: string;
  messages: IChatMessage[];
  createdAt: Date;
}

export interface IQuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface IStudyPlanTask {
  subject: string;
  topic: string;
  duration: string;
  priority: string;
}

export interface IStudyPlanDay {
  day: string;
  date: string;
  tasks: IStudyPlanTask[];
}
