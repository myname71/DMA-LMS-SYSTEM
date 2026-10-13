export type UserRole = 'super_admin' | 'admin' | 'instructor' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  specialization?: string;
  phone?: string;
  qualifications?: { degree: string; institution: string; year: string }[];
  joinedAt: string;
  isApproved?: boolean; // For instructors
  subscriptionPlan?: 'none' | 'basic' | 'pro' | 'enterprise';
  suspended?: boolean;
  tempPassword?: string;
  customRoleId?: string;
  mustChangePassword?: boolean;
}

export interface SiteNotice {
  id: string;
  title: string;
  message: string;
  linkLabel?: string;
  linkUrl?: string;
  enabled: boolean;
  updatedAt?: string;
  updatedByName?: string;
  updatedByRole?: UserRole;
}

export interface MediaItem {
  id: string;
  name: string;
  dataUrl: string;
  type: 'image' | 'video' | 'document';
  uploadedAt: string;
  usedAs?: string | null;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

export interface InviteRecord {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  createdAt: string;
  status: 'pending' | 'accepted';
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf' | 'assignment' | 'pptx';
  contentUrl: string; // Video URL or Document preview
  isRequired: boolean;
  isCompleted?: boolean;
  videoSource?: 'file' | 'youtube' | 'vimeo'; // Video platforms support
  richTextContent?: string; // Rich text editor output content
  driveFileId?: string; // Connected Google Drive file reference id
  slides?: { title: string; content?: string; bullets?: string[]; image?: string }[]; // Slides for the PPTX presentations
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  courses: string[]; // sequence of Course IDs
  instructorId: string;
  instructorName: string;
  badge?: string;
  enrolledStudents?: string[]; // student user IDs
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  feedback?: string;
}

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  headline: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  instructorId: string;
  instructorName: string;
  price: number;
  image: string;
  /** Free courses can be previewed without an account (server enforces this). */
  isFree?: boolean;
  /** Optional card/hero thumbnail; falls back to `image` when absent. */
  thumbnail?: string;
  lessons: Lesson[];
  quizzes: Quiz[];
  assignments: Assignment[];
  reviews: CourseReview[];
  enrollmentCount: number;
  ratingAverage: number;
  isPublished: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0 to 100
  completedLessons: string[]; // lesson ids
  quizAttempts: { [quizId: string]: { score: number; passed: boolean } };
  completedAt?: string;
  certificateId?: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  issuedAt: string;
  credentialUrl: string;
}

export interface SubscriptionPlan {
  id: 'basic' | 'pro' | 'enterprise';
  name: string;
  price: string;
  billing: string;
  features: string[];
}

export interface RevenueRecord {
  id: string;
  date: string;
  amount: number;
  userId: string;
  userName: string;
  courseId?: string;
  courseTitle?: string;
  type: 'subscription' | 'single_purchase';
}
