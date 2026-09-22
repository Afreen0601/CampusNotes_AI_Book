-- ==============================================================================
-- AI-Book: Supabase PostgreSQL Database Schema
-- Project ID: odajnpjdimuqagmdcrpt
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/odajnpjdimuqagmdcrpt/sql/new
-- ==============================================================================

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table (Students & Faculty/Teachers)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    student_id TEXT,
    teacher_id TEXT,
    department TEXT DEFAULT 'Computer Science & Engineering',
    semester INTEGER DEFAULT 1,
    bookmarks JSONB DEFAULT '[]'::jsonb,
    quiz_stats JSONB DEFAULT '{"completed": 0, "avgScore": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Semesters Table
CREATE TABLE IF NOT EXISTS public.semesters (
    id INTEGER PRIMARY KEY,
    number INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

-- 4. Create Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    semester_id INTEGER REFERENCES public.semesters(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    color TEXT DEFAULT 'indigo'
);

-- 5. Create Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    semester_id INTEGER REFERENCES public.semesters(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    description TEXT,
    author TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    file_size TEXT DEFAULT '2.4 MB',
    total_pages INTEGER DEFAULT 1,
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 4.8,
    tags JSONB DEFAULT '[]'::jsonb,
    pages JSONB DEFAULT '[]'::jsonb,
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_notes_semester ON public.notes(semester_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON public.notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON public.users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_teacher_id ON public.users(teacher_id);

-- 7. Disable Row Level Security (RLS) or add permissive public policies
-- This allows the Supabase publishable anon key to read and write records
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on semesters" ON public.semesters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);

-- 8. Seed Initial Semesters
INSERT INTO public.semesters (id, number, name, description) VALUES
(1, 1, 'Semester 1', 'Foundations of Computer Science & Engineering'),
(2, 2, 'Semester 2', 'Data Structures & System Architectures'),
(3, 3, 'Semester 3', 'Advanced Core Computing & Software Paradigms'),
(4, 4, 'Semester 4', 'Networks, Intelligence & Security'),
(5, 5, 'Semester 5', 'Distributed Systems & Cloud Computing'),
(6, 6, 'Semester 6', 'Capstone Projects & Applied AI')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Initial Subjects
INSERT INTO public.subjects (id, semester_id, code, name, description, credits, color) VALUES
('sub-sem1-dbms', 1, 'CS101', 'Database Management Systems', 'Relational data models, SQL queries, normalization, ACID properties, transaction control & concurrency.', 4, 'indigo'),
('sub-sem1-cfa', 1, 'CS102', 'Computer Fundamentals & Architecture', 'Digital logic, Von Neumann architecture, CPU pipelines, instruction sets, cache hierarchies.', 4, 'blue'),
('sub-sem1-math1', 1, 'MA101', 'Engineering Mathematics I', 'Linear algebra, matrix eigenvalues, calculus, differential equations, optimization foundations.', 3, 'emerald'),
('sub-sem2-dsa', 2, 'CS201', 'Data Structures & Algorithms', 'Stacks, queues, balanced search trees, graph algorithms, asymptotic time/space complexities.', 4, 'indigo'),
('sub-sem2-os', 2, 'CS202', 'Operating Systems', 'Process scheduling, virtual memory, paging, race conditions, file systems, distributed OS.', 4, 'violet'),
('sub-sem3-cn', 3, 'CS301', 'Computer Networks', 'OSI model, TCP/IP handshake, congestion control, routing protocols (BGP, OSPF), DNS.', 4, 'cyan'),
('sub-sem4-ai', 4, 'CS401', 'Artificial Intelligence & Machine Learning', 'Search heuristics, supervised learning, neural networks, LLMs, reinforcement learning.', 4, 'amber')
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Demo Accounts
INSERT INTO public.users (id, name, email, password_hash, role, student_id, teacher_id, department, semester, bookmarks, quiz_stats) VALUES
(
    'usr-student-demo',
    'Sarah Jenkins',
    'sarah.j@campus.edu',
    'e081c7ffc0d9a6c7',
    'student',
    'CS2026-0842',
    NULL,
    'Computer Science & Engineering',
    1,
    '["note-sem1-dbms-u1"]'::jsonb,
    '{"completed": 3, "avgScore": 86}'::jsonb
),
(
    'usr-admin-demo',
    'Prof. Alan Sharma',
    'admin@campus.edu',
    '9b6653d9e037c22e',
    'admin',
    NULL,
    'FAC-CS-101',
    'Faculty of Computer Science',
    NULL,
    '[]'::jsonb,
    '{"completed": 0, "avgScore": 0}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
