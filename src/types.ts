export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  teacherId?: string;
  department?: string;
  semester?: number;
  bookmarks: string[];
  quizStats: {
    completed: number;
    avgScore: number;
    lastScore?: number;
  };
}

export interface Semester {
  id: number;
  number: number;
  name: string;
  description: string;
  totalSubjects: number;
  totalNotes: number;
}

export interface Subject {
  id: string;
  semesterId: number;
  code: string;
  name: string;
  description: string;
  credits: number;
  color?: string;
}

export interface NotePage {
  pageNumber: number;
  title: string;
  content: string;
  keyPoints?: string[];
  codeSnippet?: string;
  diagramTitle?: string;
}

export interface Note {
  id: string;
  title: string;
  semesterId: number;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  unit: string;
  description: string;
  author: string;
  uploadDate: string;
  fileSize: string;
  totalPages: number;
  downloads: number;
  views: number;
  rating: number;
  tags: string[];
  pages: NotePage[];
  fileName?: string;
  bookmarked?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citation?: string;
  suggestedFollowUps?: string[];
}

export type SummaryMode = 'exam_revision' | 'executive' | 'cheat_sheet' | 'crash_course';

export type ExplainMode = 'analogy' | 'eli5' | 'step_by_step';

export interface AdminMetrics {
  totalStudents: number;
  totalNotes: number;
  totalSubjects: number;
  totalDownloads: number;
  totalViews: number;
  quizzesTaken: number;
  semesterDistribution: { semester: number; notesCount: number; studentCount: number }[];
  popularNotes: { id: string; title: string; subjectCode: string; downloads: number }[];
}
