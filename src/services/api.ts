import { Note, Semester, Subject, User, AdminMetrics, QuizQuestion } from '../types';

const API_BASE = '/api';

export async function loginUser(
  identifier: string,
  password: string,
  role?: string
): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, email: identifier, password, role })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to log in');
  return data;
}

export async function registerAccount(payload: {
  name: string;
  email?: string;
  password: string;
  role?: 'student' | 'admin';
  studentId?: string;
  teacherId?: string;
  department?: string;
  semester?: number;
}): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to register');
  return data;
}

export const registerStudent = registerAccount;
export const registerUser = registerAccount;

export async function fetchCurrentUser(token: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get current user');
  return data.user;
}

export async function fetchSemesters(): Promise<Semester[]> {
  const res = await fetch(`${API_BASE}/semesters`);
  if (!res.ok) throw new Error('Failed to fetch semesters');
  return res.json();
}

export async function fetchSubjects(semesterId?: number): Promise<Subject[]> {
  const url = semesterId ? `${API_BASE}/subjects?semesterId=${semesterId}` : `${API_BASE}/subjects`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

export async function createSubject(payload: { semesterId: number; code: string; name: string; description?: string; credits?: number }): Promise<Subject> {
  const res = await fetch(`${API_BASE}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create subject');
  return data;
}

export async function deleteSubject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/subjects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete subject');
}

export async function fetchNotes(filters?: { semesterId?: number; subjectId?: string; search?: string; sort?: string; userId?: string }): Promise<Note[]> {
  const params = new URLSearchParams();
  if (filters?.semesterId) params.append('semesterId', filters.semesterId.toString());
  if (filters?.subjectId) params.append('subjectId', filters.subjectId);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sort) params.append('sort', filters.sort);
  if (filters?.userId) params.append('userId', filters.userId);

  const res = await fetch(`${API_BASE}/notes?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function fetchNoteById(id: string): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch note');
  return res.json();
}

export async function toggleBookmark(noteId: string, userId: string): Promise<{ bookmarked: boolean; bookmarks: string[] }> {
  const res = await fetch(`${API_BASE}/notes/${noteId}/bookmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle bookmark');
  return data;
}

export async function uploadNote(formData: FormData): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload note');
  return data;
}

export async function updateNote(id: string, payload: Partial<Note>): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update note');
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete note');
}

export function getNoteDownloadUrl(id: string): string {
  return `${API_BASE}/notes/${id}/download`;
}

// AI Study Suite
export async function askAiChatbot(payload: { noteId?: string; question: string; history?: unknown[] }): Promise<{ answer: string; citation?: string; suggestedFollowUps?: string[] }> {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get AI answer');
  return data;
}

export async function summarizeNote(noteId: string, mode?: string): Promise<{ summary: string; noteTitle: string; mode: string }> {
  const res = await fetch(`${API_BASE}/ai/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, mode })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to summarize note');
  return data;
}

export async function explainConcept(payload: { noteId?: string; topic?: string; mode?: string }): Promise<{ explanation: string; topic: string; mode: string }> {
  const res = await fetch(`${API_BASE}/ai/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to explain concept');
  return data;
}

export async function generateQuiz(noteId: string): Promise<{ noteId: string; noteTitle: string; subjectCode: string; questions: QuizQuestion[] }> {
  const res = await fetch(`${API_BASE}/ai/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate quiz');
  return data;
}

export async function submitQuizScore(userId: string, score: number, total: number): Promise<{ stats: User['quizStats']; percentage: number }> {
  const res = await fetch(`${API_BASE}/ai/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, score, total })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit quiz score');
  return data;
}

// Admin metrics
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const res = await fetch(`${API_BASE}/admin/metrics`);
  if (!res.ok) throw new Error('Failed to fetch admin metrics');
  return res.json();
}

export interface AdminStudentItem {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  semester: number;
  quizzesTaken: number;
  avgScore: number;
  bookmarksCount: number;
}

export async function fetchAdminStudents(): Promise<AdminStudentItem[]> {
  const res = await fetch(`${API_BASE}/admin/students`);
  if (!res.ok) throw new Error('Failed to fetch students list');
  return res.json();
}

export async function deleteAdminStudent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/students/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete student');
}
