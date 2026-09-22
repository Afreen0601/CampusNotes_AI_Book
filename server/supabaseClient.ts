import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Note, Semester, Subject, User } from '../src/types';

// Supabase configuration provided by the user
const SUPABASE_PROJECT_ID = 'odajnpjdimuqagmdcrpt';
const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const DEFAULT_SUPABASE_KEY = 'sb_publishable_c_R0Vh_9WUqHS3XHxQUIdg_1IYRg2Ft';

export const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY || DEFAULT_SUPABASE_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
  }
  return client;
}

export interface SupabaseHealthStatus {
  connected: boolean;
  projectId: string;
  url: string;
  tables: {
    users: boolean;
    notes: boolean;
    semesters: boolean;
    subjects: boolean;
  };
  details: string;
}

// Check database health and table status
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const sb = getSupabase();
  const tablesStatus = {
    users: false,
    notes: false,
    semesters: false,
    subjects: false
  };

  try {
    const [uRes, nRes, semRes, subRes] = await Promise.allSettled([
      sb.from('users').select('id').limit(1),
      sb.from('notes').select('id').limit(1),
      sb.from('semesters').select('id').limit(1),
      sb.from('subjects').select('id').limit(1)
    ]);

    tablesStatus.users = uRes.status === 'fulfilled' && !uRes.value.error;
    tablesStatus.notes = nRes.status === 'fulfilled' && !nRes.value.error;
    tablesStatus.semesters = semRes.status === 'fulfilled' && !semRes.value.error;
    tablesStatus.subjects = subRes.status === 'fulfilled' && !subRes.value.error;

    const allGood = Object.values(tablesStatus).every(Boolean);
    const someGood = Object.values(tablesStatus).some(Boolean);

    let details = 'Connected to Supabase. All tables operational.';
    if (!someGood) {
      details = 'Connected to project, but tables have not been created yet in the SQL Editor.';
    } else if (!allGood) {
      details = 'Connected, but some tables are missing.';
    }

    return {
      connected: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tables: tablesStatus,
      details
    };
  } catch (err: any) {
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tables: tablesStatus,
      details: err?.message || 'Failed to reach Supabase endpoint'
    };
  }
}

// Convert DB User row to App User type
export function mapDbUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    studentId: row.student_id || undefined,
    teacherId: row.teacher_id || undefined,
    department: row.department || undefined,
    semester: row.semester ? Number(row.semester) : undefined,
    bookmarks: Array.isArray(row.bookmarks) ? row.bookmarks : (typeof row.bookmarks === 'string' ? JSON.parse(row.bookmarks) : []),
    quizStats: row.quiz_stats || { completed: 0, avgScore: 0 }
  };
}

// Convert DB Note row to App Note type
export function mapDbNote(row: any): Note {
  return {
    id: row.id,
    title: row.title,
    semesterId: Number(row.semester_id),
    subjectId: row.subject_id,
    subjectCode: row.subject_code,
    subjectName: row.subject_name,
    unit: row.unit,
    description: row.description || '',
    author: row.author,
    uploadDate: row.upload_date,
    fileSize: row.file_size || '2.4 MB',
    totalPages: Number(row.total_pages) || 1,
    downloads: Number(row.downloads) || 0,
    views: Number(row.views) || 0,
    rating: Number(row.rating) || 4.8,
    tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : []),
    pages: Array.isArray(row.pages) ? row.pages : (typeof row.pages === 'string' ? JSON.parse(row.pages) : []),
    fileName: row.file_name || undefined
  };
}
