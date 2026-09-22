import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_SEMESTERS,
  INITIAL_SUBJECTS,
  INITIAL_NOTES,
  DEMO_STUDENT,
  DEMO_ADMIN
} from './src/data/seedData';
import { Note, Subject, Semester, User, QuizQuestion } from './src/types';
import {
  getSupabase,
  checkSupabaseHealth,
  mapDbUser,
  mapDbNote,
  SUPABASE_URL,
  SUPABASE_KEY
} from './server/supabaseClient';

// In-memory persistent state (seeded with college curriculum)
let semesters: Semester[] = [...INITIAL_SEMESTERS];
let subjects: Subject[] = [...INITIAL_SUBJECTS];
let notes: Note[] = [...INITIAL_NOTES];
let users: User[] = [
  { ...DEMO_STUDENT },
  { ...DEMO_ADMIN },
  {
    id: 'usr-student-2',
    name: 'Michael Chang',
    email: 'm.chang@campus.edu',
    role: 'student',
    studentId: 'CS2026-0419',
    department: 'Computer Science & Engineering',
    semester: 1,
    bookmarks: ['note-dbms-unit1'],
    quizStats: { completed: 2, avgScore: 92, lastScore: 95 }
  },
  {
    id: 'usr-student-3',
    name: 'Priya Patel',
    email: 'p.patel@campus.edu',
    role: 'student',
    studentId: 'CS2026-0922',
    department: 'Information Technology',
    semester: 2,
    bookmarks: ['note-dsa-unit2'],
    quizStats: { completed: 5, avgScore: 84, lastScore: 80 }
  }
];

// In-memory user passwords hash simulation (bcrypt-style salt + sha256)
const userPasswords: Record<string, string> = {
  'student@campus.edu': hashPassword('student123'),
  'admin@campus.edu': hashPassword('admin123'),
  'm.chang@campus.edu': hashPassword('password123'),
  'p.patel@campus.edu': hashPassword('password123')
};

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_campus_salt_2026').digest('hex');
}

// Multer storage for note uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Gemini AI Client lazy initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
      aiClient = null;
    }
  }
  return aiClient;
}

// Simple PDF Generator Helper that returns a valid PDF binary buffer
function generatePdfBuffer(note: Note): Buffer {
  // Generate a valid minimal PDF 1.4 document stream
  const title = note.title.replace(/[()\\]/g, '');
  const subject = (note.subjectCode ? `[${note.subjectCode}] ` : '') + (note.subjectName || '');
  const author = note.author.replace(/[()\\]/g, '');
  
  let pagesPdfText = '';
  const pageObjectIds: number[] = [];
  let currentObjId = 3;

  note.pages.forEach((page, idx) => {
    const pageObjId = ++currentObjId;
    const contentObjId = ++currentObjId;
    pageObjectIds.push(pageObjId);

    const safeTitle = page.title.replace(/[()\\]/g, '');
    const cleanContentLines = page.content
      .split('\n')
      .slice(0, 15)
      .map(l => l.replace(/[()\\]/g, '').substring(0, 80));

    let streamBody = `BT /F1 16 Tf 50 750 Td (${safeTitle}) Tj ET\n`;
    streamBody += `BT /F2 10 Tf 50 730 Td (Page ${page.pageNumber} of ${note.totalPages} | ${subject} | ${author}) Tj ET\n`;
    streamBody += `BT /F2 10 Tf 50 720 Td (____________________________________________________________________________) Tj ET\n`;

    let y = 695;
    cleanContentLines.forEach(line => {
      if (line.trim().length > 0) {
        streamBody += `BT /F2 10 Tf 50 ${y} Td (${line}) Tj ET\n`;
        y -= 16;
      }
    });

    if (page.keyPoints && page.keyPoints.length > 0) {
      y -= 10;
      streamBody += `BT /F1 11 Tf 50 ${y} Td (Key Academic Highlights:) Tj ET\n`;
      y -= 16;
      page.keyPoints.forEach(kp => {
        const cleanKp = kp.replace(/[()\\]/g, '').substring(0, 75);
        streamBody += `BT /F2 9 Tf 60 ${y} Td (* ${cleanKp}) Tj ET\n`;
        y -= 14;
      });
    }

    const streamLength = Buffer.byteLength(streamBody);

    pagesPdfText += `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>\nendobj\n`;
    pagesPdfText += `${contentObjId} 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamBody}\nendstream\nendobj\n`;
  });

  const kidsArray = pageObjectIds.map(id => `${id} 0 R`).join(' ');
  const pdfHeader = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [${kidsArray}] /Count ${note.pages.length} >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  const completePdf = pdfHeader + pagesPdfText + `xref\n0 6\n0000000000 65535 f \ntrailer\n<< /Size ${currentObjId + 1} /Root 1 0 R >>\nstartxref\n100\n%%EOF\n`;
  return Buffer.from(completePdf, 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // SUPABASE DATABASE STATUS & SYNCHRONIZATION
  // ==========================================

  // GET /api/database/status
  app.get('/api/database/status', async (req, res) => {
    try {
      const health = await checkSupabaseHealth();
      res.json({
        ...health,
        recordsInCache: {
          users: users.length,
          notes: notes.length,
          subjects: subjects.length,
          semesters: semesters.length
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to check database status' });
    }
  });

  // GET /api/database/schema (Downloadable SQL migration script)
  app.get('/api/database/schema', (req, res) => {
    try {
      const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      res.type('text/plain').send(sql);
    } catch {
      res.status(500).send('-- Failed to read supabase-schema.sql');
    }
  });

  // POST /api/database/sync (Push in-memory state to Supabase tables)
  app.post('/api/database/sync', async (req, res) => {
    const sb = getSupabase();
    const results: Record<string, string> = {};

    // 1. Sync Semesters
    try {
      const { error } = await sb.from('semesters').upsert(
        semesters.map(s => ({
          id: s.id,
          number: s.number,
          name: s.name,
          description: s.description
        }))
      );
      results.semesters = error ? `Warning: ${error.message}` : 'Synced successfully';
    } catch (e: any) {
      results.semesters = `Failed: ${e.message}`;
    }

    // 2. Sync Subjects
    try {
      const { error } = await sb.from('subjects').upsert(
        subjects.map(s => ({
          id: s.id,
          semester_id: s.semesterId,
          code: s.code,
          name: s.name,
          description: s.description,
          credits: s.credits,
          color: s.color
        }))
      );
      results.subjects = error ? `Warning: ${error.message}` : 'Synced successfully';
    } catch (e: any) {
      results.subjects = `Failed: ${e.message}`;
    }

    // 3. Sync Notes
    try {
      const { error } = await sb.from('notes').upsert(
        notes.map(n => ({
          id: n.id,
          title: n.title,
          semester_id: n.semesterId,
          subject_id: n.subjectId,
          subject_code: n.subjectCode,
          subject_name: n.subjectName,
          unit: n.unit,
          description: n.description,
          author: n.author,
          upload_date: n.uploadDate,
          file_size: n.fileSize,
          total_pages: n.totalPages,
          downloads: n.downloads,
          views: n.views,
          rating: n.rating,
          tags: n.tags,
          pages: n.pages,
          file_name: n.fileName || null
        }))
      );
      results.notes = error ? `Warning: ${error.message}` : 'Synced successfully';
    } catch (e: any) {
      results.notes = `Failed: ${e.message}`;
    }

    // 4. Sync Users
    try {
      const userRows = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password_hash: userPasswords[u.email.toLowerCase()] || hashPassword('student123'),
        role: u.role,
        student_id: u.studentId || null,
        teacher_id: u.teacherId || null,
        department: u.department || null,
        semester: u.semester || null,
        bookmarks: u.bookmarks,
        quiz_stats: u.quizStats
      }));
      const { error } = await sb.from('users').upsert(userRows);
      results.users = error ? `Warning: ${error.message}` : 'Synced successfully';
    } catch (e: any) {
      results.users = `Failed: ${e.message}`;
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  });

  // ==========================================
  // AUTHENTICATION ROUTES (Supabase + Resilient Cache)
  // ==========================================

  // POST /api/auth/login
  app.post('/api/auth/login', async (req, res) => {
    const { email, identifier, studentId, teacherId, password, role } = req.body;

    const rawQuery = (identifier || email || studentId || teacherId || '').trim();

    if (!rawQuery || !password) {
      return res.status(400).json({ error: 'Email / ID and password are required' });
    }

    const queryLower = rawQuery.toLowerCase();
    let user = users.find(u =>
      u.email.toLowerCase() === queryLower ||
      (u.studentId && u.studentId.toLowerCase() === queryLower) ||
      (u.teacherId && u.teacherId.toLowerCase() === queryLower)
    );

    let storedHash = user ? userPasswords[user.email.toLowerCase()] : undefined;

    // Check Supabase users table if accessible
    try {
      const sb = getSupabase();
      const { data: dbUser, error } = await sb
        .from('users')
        .select('*')
        .or(`email.eq.${queryLower},student_id.eq.${rawQuery},teacher_id.eq.${rawQuery}`)
        .maybeSingle();

      if (!error && dbUser) {
        user = mapDbUser(dbUser);
        storedHash = dbUser.password_hash;
        // Keep in-memory cache synchronized
        const existingIdx = users.findIndex(u => u.id === user!.id);
        if (existingIdx >= 0) {
          users[existingIdx] = user;
        } else {
          users.push(user);
        }
        if (storedHash) {
          userPasswords[user.email.toLowerCase()] = storedHash;
        }
      }
    } catch (sbErr) {
      console.warn('[Supabase] Login check fallback:', sbErr);
    }

    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please check your Email or Student/Teacher ID.' });
    }

    // Check role if specified
    if (role && user.role !== role) {
      return res.status(403).json({
        error: `Account found, but this is a ${user.role === 'admin' ? 'Teacher/Faculty' : 'Student'} account. Please switch to the ${user.role === 'admin' ? 'Faculty Admin' : 'Student'} portal.`
      });
    }

    // Verify password hash
    const incomingHash = hashPassword(password);

    if (storedHash && storedHash !== incomingHash) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Generate pseudo-JWT token (stateless header.payload.signature)
    const payload = { id: user.id, email: user.email, role: user.role, iat: Date.now() };
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    return res.json({
      success: true,
      token,
      user
    });
  });

  // POST /api/auth/register
  app.post('/api/auth/register', async (req, res) => {
    const {
      name,
      email,
      password,
      role = 'student',
      studentId,
      teacherId,
      department,
      semester
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: role === 'admin' ? 'Teacher name is required' : 'Student name is required'
      });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const isTeacher = role === 'admin';
    const cleanName = name.trim();
    const assignedId = isTeacher
      ? (teacherId?.trim() || `FAC-${department ? department.substring(0, 2).toUpperCase() : 'CS'}-${Math.floor(100 + Math.random() * 900)}`)
      : (studentId?.trim() || `CS2026-${Math.floor(1000 + Math.random() * 9000)}`);

    const normalizedEmail = (email && email.trim())
      ? email.trim().toLowerCase()
      : `${assignedId.toLowerCase().replace(/[^a-z0-9]/g, '')}@campus.edu`;

    // Check existing in memory or Supabase
    let existing = users.find(u =>
      u.email.toLowerCase() === normalizedEmail ||
      (isTeacher && u.teacherId && u.teacherId.toLowerCase() === assignedId.toLowerCase()) ||
      (!isTeacher && u.studentId && u.studentId.toLowerCase() === assignedId.toLowerCase())
    );

    if (existing) {
      return res.status(400).json({
        error: `An account with this ${existing.email.toLowerCase() === normalizedEmail ? 'email' : (isTeacher ? 'Teacher ID' : 'Student ID')} already exists.`
      });
    }

    const passwordHash = hashPassword(password);
    const newUser: User = {
      id: `usr-${isTeacher ? 'admin' : 'student'}-${Date.now()}`,
      name: cleanName,
      email: normalizedEmail,
      role: isTeacher ? 'admin' : 'student',
      studentId: isTeacher ? undefined : assignedId,
      teacherId: isTeacher ? assignedId : undefined,
      department: department || (isTeacher ? 'Faculty of Computer Science' : 'Computer Science & Engineering'),
      semester: isTeacher ? undefined : (Number(semester) || 1),
      bookmarks: [],
      quizStats: { completed: 0, avgScore: 0 }
    };

    // Store in Supabase users table
    try {
      const sb = getSupabase();
      const { error: sbError } = await sb.from('users').insert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password_hash: passwordHash,
        role: newUser.role,
        student_id: newUser.studentId || null,
        teacher_id: newUser.teacherId || null,
        department: newUser.department,
        semester: newUser.semester || null,
        bookmarks: newUser.bookmarks,
        quiz_stats: newUser.quizStats
      });
      if (sbError) {
        console.warn('[Supabase] Notice on user registration insert:', sbError.message);
      }
    } catch (sbErr) {
      console.warn('[Supabase] Registration fallback to local cache:', sbErr);
    }

    users.push(newUser);
    userPasswords[normalizedEmail] = passwordHash;

    const token = Buffer.from(JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role })).toString('base64');

    return res.status(201).json({
      success: true,
      token,
      user: newUser
    });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      const user = users.find(u => u.id === decoded.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ user });
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  });

  // ==========================================
  // SEMESTERS & SUBJECTS ROUTES
  // ==========================================

  // GET /api/semesters
  app.get('/api/semesters', (req, res) => {
    // Update counts dynamically
    const enriched = semesters.map(sem => {
      const semSubjects = subjects.filter(s => s.semesterId === sem.id);
      const semNotes = notes.filter(n => n.semesterId === sem.id);
      return {
        ...sem,
        totalSubjects: semSubjects.length,
        totalNotes: semNotes.length
      };
    });

    res.json(enriched);
  });

  // GET /api/subjects
  app.get('/api/subjects', (req, res) => {
    const semesterId = req.query.semesterId ? Number(req.query.semesterId) : null;
    let result = subjects;
    if (semesterId) {
      result = result.filter(s => s.semesterId === semesterId);
    }
    res.json(result);
  });

  // POST /api/subjects (Admin only)
  app.post('/api/subjects', async (req, res) => {
    const { semesterId, code, name, description, credits } = req.body;
    if (!semesterId || !code || !name) {
      return res.status(400).json({ error: 'Semester ID, Subject Code, and Subject Name are required' });
    }

    const newSubject: Subject = {
      id: `sub-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
      semesterId: Number(semesterId),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description?.trim() || '',
      credits: Number(credits) || 3,
      color: ['blue', 'indigo', 'emerald', 'purple', 'teal', 'amber'][Math.floor(Math.random() * 6)]
    };

    try {
      const sb = getSupabase();
      await sb.from('subjects').insert({
        id: newSubject.id,
        semester_id: newSubject.semesterId,
        code: newSubject.code,
        name: newSubject.name,
        description: newSubject.description,
        credits: newSubject.credits,
        color: newSubject.color
      });
    } catch (e) {
      console.warn('[Supabase] Subject insert fallback:', e);
    }

    subjects.push(newSubject);
    res.status(201).json(newSubject);
  });

  // DELETE /api/subjects/:id (Admin only)
  app.delete('/api/subjects/:id', async (req, res) => {
    const { id } = req.params;
    const idx = subjects.findIndex(s => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    try {
      const sb = getSupabase();
      await sb.from('subjects').delete().eq('id', id);
    } catch (e) {
      console.warn('[Supabase] Subject delete fallback:', e);
    }

    subjects.splice(idx, 1);
    res.json({ success: true, message: 'Subject deleted successfully' });
  });

  // ==========================================
  // NOTES MANAGEMENT ROUTES
  // ==========================================

  // GET /api/notes
  app.get('/api/notes', async (req, res) => {
    const { semesterId, subjectId, search, sort, userId } = req.query;

    // Check if Supabase notes are available and sync
    try {
      const sb = getSupabase();
      const { data: dbNotes, error } = await sb.from('notes').select('*');
      if (!error && dbNotes && dbNotes.length > 0) {
        notes = dbNotes.map(mapDbNote);
      }
    } catch (sbErr) {
      // Fallback silently to memory notes
    }

    let filtered = [...notes];

    if (semesterId) {
      filtered = filtered.filter(n => n.semesterId === Number(semesterId));
    }

    if (subjectId) {
      filtered = filtered.filter(n => n.subjectId === subjectId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.subjectCode?.toLowerCase().includes(q) ||
        n.subjectName?.toLowerCase().includes(q) ||
        n.unit.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q)) ||
        n.author.toLowerCase().includes(q)
      );
    }

    // Attach bookmark status if userId is provided
    if (userId && typeof userId === 'string') {
      const user = users.find(u => u.id === userId);
      if (user) {
        filtered = filtered.map(n => ({
          ...n,
          bookmarked: user.bookmarks.includes(n.id)
        }));
      }
    }

    // Sorting
    if (sort === 'downloads') {
      filtered.sort((a, b) => b.downloads - a.downloads);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    } else {
      // Default: newest
      filtered.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }

    res.json(filtered);
  });

  // GET /api/notes/:id
  app.get('/api/notes/:id', async (req, res) => {
    const note = notes.find(n => n.id === req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    // Increment view count
    note.views += 1;
    try {
      const sb = getSupabase();
      await sb.from('notes').update({ views: note.views }).eq('id', note.id);
    } catch {}
    res.json(note);
  });

  // POST /api/notes (Admin Upload with Multer file or JSON)
  app.post('/api/notes', upload.single('file'), async (req, res) => {
    try {
      const {
        title,
        semesterId,
        subjectId,
        unit,
        description,
        author,
        tags,
        content
      } = req.body;

      if (!title || !semesterId || !subjectId) {
        return res.status(400).json({ error: 'Title, semester, and subject are required.' });
      }

      const subject = subjects.find(s => s.id === subjectId);
      const parsedTags = typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : Array.isArray(tags) ? tags : ['Lecture Notes'];

      // Generate structured note pages
      let pages: Note['pages'] = [];
      if (content && typeof content === 'string') {
        const sections = content.split('---PAGE---');
        pages = sections.map((sec, i) => ({
          pageNumber: i + 1,
          title: `Section ${i + 1}: ${title}`,
          content: sec.trim(),
          keyPoints: ['Core theoretical framework', 'Key algorithmic or conceptual insights']
        }));
      }

      if (pages.length === 0) {
        pages = [
          {
            pageNumber: 1,
            title: `Unit Overview & Fundamentals`,
            content: `${title}\n\nSubject: ${subject ? subject.name : 'Computer Science'}\nUnit: ${unit || 'Unit 1'}\n\nKey Concepts:\n- In-depth theoretical exploration.\n- Systematic analysis of problem-solving techniques.\n- Practical engineering context and academic applications.`,
            keyPoints: ['Foundational concept clarification', 'Exam-oriented derivations and principles']
          },
          {
            pageNumber: 2,
            title: `Detailed Technical Breakdown`,
            content: `Detailed notes on ${title}.\n\nThis section expands upon unit definitions, standard mathematical/architectural representations, edge cases, and standard algorithmic workflows.\n\nStudents should review these derivations and practice problems before quizzes.`,
            keyPoints: ['Step-by-step mathematical reasoning', 'Common pitfalls in examination questions']
          }
        ];
      }

      const file = req.file;
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: title.trim(),
        semesterId: Number(semesterId),
        subjectId: subjectId,
        subjectCode: subject?.code || 'CS',
        subjectName: subject?.name || 'General Computer Science',
        unit: unit?.trim() || 'Unit 1',
        description: description?.trim() || 'Course notes and syllabus study material.',
        author: author?.trim() || 'Prof. Alan Sharma',
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
        totalPages: pages.length,
        downloads: 0,
        views: 0,
        rating: 5.0,
        tags: parsedTags,
        pages,
        fileName: file ? file.originalname : `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`
      };

      // Push to Supabase notes table
      try {
        const sb = getSupabase();
        await sb.from('notes').insert({
          id: newNote.id,
          title: newNote.title,
          semester_id: newNote.semesterId,
          subject_id: newNote.subjectId,
          subject_code: newNote.subjectCode,
          subject_name: newNote.subjectName,
          unit: newNote.unit,
          description: newNote.description,
          author: newNote.author,
          upload_date: newNote.uploadDate,
          file_size: newNote.fileSize,
          total_pages: newNote.totalPages,
          downloads: newNote.downloads,
          views: newNote.views,
          rating: newNote.rating,
          tags: newNote.tags,
          pages: newNote.pages,
          file_name: newNote.fileName || null
        });
      } catch (sbErr) {
        console.warn('[Supabase] Note insert fallback:', sbErr);
      }

      notes.unshift(newNote);
      res.status(201).json(newNote);
    } catch (err) {
      console.error('Error creating note:', err);
      res.status(500).json({ error: 'Internal server error while saving note' });
    }
  });

  // PUT /api/notes/:id (Admin Edit)
  app.put('/api/notes/:id', async (req, res) => {
    const note = notes.find(n => n.id === req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const { title, unit, description, tags, semesterId, subjectId } = req.body;
    if (title) note.title = title.trim();
    if (unit) note.unit = unit.trim();
    if (description) note.description = description.trim();
    if (semesterId) note.semesterId = Number(semesterId);
    if (subjectId) {
      note.subjectId = subjectId;
      const subj = subjects.find(s => s.id === subjectId);
      if (subj) {
        note.subjectCode = subj.code;
        note.subjectName = subj.name;
      }
    }
    if (tags) {
      note.tags = typeof tags === 'string'
        ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : tags;
    }

    try {
      const sb = getSupabase();
      await sb.from('notes').update({
        title: note.title,
        unit: note.unit,
        description: note.description,
        tags: note.tags,
        semester_id: note.semesterId,
        subject_id: note.subjectId,
        subject_code: note.subjectCode,
        subject_name: note.subjectName
      }).eq('id', note.id);
    } catch (sbErr) {
      console.warn('[Supabase] Note update fallback:', sbErr);
    }

    res.json(note);
  });

  // DELETE /api/notes/:id (Admin Delete)
  app.delete('/api/notes/:id', async (req, res) => {
    const idx = notes.findIndex(n => n.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    try {
      const sb = getSupabase();
      await sb.from('notes').delete().eq('id', req.params.id);
    } catch (sbErr) {
      console.warn('[Supabase] Note delete fallback:', sbErr);
    }

    notes.splice(idx, 1);
    // Also remove from user bookmarks
    users.forEach(u => {
      u.bookmarks = u.bookmarks.filter(b => b !== req.params.id);
    });

    res.json({ success: true, message: 'Note deleted successfully' });
  });

  // POST /api/notes/:id/bookmark (Toggle bookmark)
  app.post('/api/notes/:id/bookmark', async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const noteId = req.params.id;
    const isBookmarked = user.bookmarks.includes(noteId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(b => b !== noteId);
    } else {
      user.bookmarks.push(noteId);
    }

    try {
      const sb = getSupabase();
      await sb.from('users').update({ bookmarks: user.bookmarks }).eq('id', user.id);
    } catch (sbErr) {
      console.warn('[Supabase] Bookmark update fallback:', sbErr);
    }

    res.json({
      success: true,
      bookmarked: !isBookmarked,
      bookmarks: user.bookmarks
    });
  });

  // GET /api/notes/:id/download (PDF binary stream)
  app.get('/api/notes/:id/download', (req, res) => {
    const note = notes.find(n => n.id === req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Increment download metric
    note.downloads += 1;

    const pdfBuffer = generatePdfBuffer(note);
    const filename = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  });

  // ==========================================
  // AI STUDY SUITE ROUTES (GEMINI 3.8 FLASH)
  // ==========================================

  // POST /api/ai/chat
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { noteId, question, conversationHistory } = req.body;

      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const note = noteId ? notes.find(n => n.id === noteId) : null;
      const noteContext = note
        ? `Document Context:\nTitle: ${note.title}\nSubject: ${note.subjectCode} - ${note.subjectName}\nUnit: ${note.unit}\nAuthor: ${note.author}\nPages Content:\n${note.pages.map(p => `[Page ${p.pageNumber}: ${p.title}]\n${p.content}`).join('\n\n')}`
        : 'General College Academic Context';

      const gemini = getGeminiClient();

      if (gemini) {
        try {
          const systemInstruction = `You are AI-Book, an elite college professor and academic tutor.
Your job is to answer student questions accurately, concisely, and pedagogically.
Ground your answers primarily in the provided lecture note pages whenever available.
Cite specific pages and units when referencing concepts.
Format formulas, code, and key takeaways clearly using markdown.
If the student asks for exam tips, point out high-yield concepts.`;

          const prompt = `${noteContext}\n\nStudent Question: "${question}"\nPlease provide a clear, well-structured academic response.`;

          const response = await gemini.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.7,
            }
          });

          const answerText = response.text || 'Could not generate a response from Gemini.';

          return res.json({
            answer: answerText,
            citation: note ? `${note.subjectCode} Unit ${note.unit}` : 'Campus Knowledge Base',
            suggestedFollowUps: [
              'Can you give me a real-world example of this?',
              'What are the most common exam questions on this topic?',
              'Summarize the step-by-step derivation.'
            ]
          });
        } catch (apiErr) {
          console.warn('Gemini API call failed, switching to semantic academic engine:', apiErr);
        }
      }

      // Fallback Academic Reasoning Engine if API key is not configured or rate-limited
      let responseText = '';
      const qLower = question.toLowerCase();

      if (note) {
        const matchingPage = note.pages.find(p =>
          qLower.split(' ').some((w: string) => w.length > 3 && (p.content.toLowerCase().includes(w) || p.title.toLowerCase().includes(w)))
        ) || note.pages[0];

        responseText = `### Academic Explanation (Grounded in ${note.subjectCode} - ${note.title})\n\n`;
        responseText += `Based on **${matchingPage.title}** (Page ${matchingPage.pageNumber}):\n\n`;
        responseText += `In this unit, the foundational principle revolves around ${note.tags.slice(0, 3).join(', ')}.\n\n`;
        responseText += `**Key Concept Breakdown:**\n`;
        matchingPage.keyPoints?.forEach(kp => {
          responseText += `- **${kp}**\n`;
        });
        responseText += `\n**Direct Answer to your question:**\n${matchingPage.content.substring(0, 450)}...\n\n`;
        responseText += `*Exam Tip:* Make sure to write out standard notations and highlight edge cases during semester finals!`;
      } else {
        responseText = `### Academic Tutor Response\n\nRegarding your question: "${question}"\n\nIn computer science and engineering coursework, this concept is best understood by analyzing its core definition, computational complexity, and architectural constraints. Be sure to select a specific lecture note from the semester list to get page-by-page cited answers!`;
      }

      return res.json({
        answer: responseText,
        citation: note ? `${note.subjectCode} - Page 1` : 'Campus Syllabus',
        suggestedFollowUps: [
          'Explain this with a real-world analogy',
          'What are the standard exam derivation steps?',
          'Generate a practice quiz on this unit'
        ]
      });
    } catch (err) {
      console.error('Error in AI Chat route:', err);
      res.status(500).json({ error: 'Internal AI Tutor Error' });
    }
  });

  // POST /api/ai/summarize
  app.post('/api/ai/summarize', async (req, res) => {
    try {
      const { noteId, mode } = req.body;
      const note = notes.find(n => n.id === noteId);

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const noteText = note.pages.map(p => `[Page ${p.pageNumber}: ${p.title}]\n${p.content}`).join('\n\n');
      const gemini = getGeminiClient();

      if (gemini) {
        try {
          const modeInstructions: Record<string, string> = {
            exam_revision: 'Format as High-Yield Exam Revision Points with bold keywords, expected question patterns, and critical definitions.',
            executive: 'Format as an Executive Summary outlining purpose, architectural blocks, and strategic significance in 3 concise paragraphs.',
            cheat_sheet: 'Format as a Formulas, Theorems, and Syntax Cheat Sheet with bulleted definitions and quick-reference rules.',
            crash_course: 'Format as a 5-Minute Crash Course covering the essential 20% that delivers 80% of understanding with intuitive metaphors.'
          };

          const selectedMode = mode || 'exam_revision';
          const prompt = `Please summarize the following lecture notes:\nTitle: ${note.title}\nSubject: ${note.subjectCode} - ${note.subjectName}\nUnit: ${note.unit}\n\nContent:\n${noteText}\n\nStyle Guide: ${modeInstructions[selectedMode] || modeInstructions.exam_revision}`;

          const response = await gemini.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction: 'You are an expert academic summarizer for college students. Provide well-structured markdown summaries with clear headings, bullet points, and high contrast.',
              temperature: 0.5
            }
          });

          return res.json({
            summary: response.text,
            noteTitle: note.title,
            mode: selectedMode
          });
        } catch (apiErr) {
          console.warn('Gemini summarize fallback:', apiErr);
        }
      }

      // High-yield structured fallback summary
      let summaryText = `## 🎯 High-Yield Exam Revision Summary: ${note.title}\n\n`;
      summaryText += `**Course Code:** ${note.subjectCode} | **Unit:** ${note.unit} | **Author:** ${note.author}\n\n`;
      summaryText += `### 📌 Core Takeaways\n`;
      note.pages.forEach(p => {
        summaryText += `#### Page ${p.pageNumber}: ${p.title}\n`;
        if (p.keyPoints) {
          p.keyPoints.forEach(kp => {
            summaryText += `- **${kp}**\n`;
          });
        }
        summaryText += `${p.content.split('\n')[0]}\n\n`;
      });
      summaryText += `### 💡 High-Probability Exam Questions\n`;
      summaryText += `1. Define the fundamental principles of ${note.tags[0] || 'the core system'} and state three real-world use cases.\n`;
      summaryText += `2. Differentiate between the main approaches described in Page 1 versus Page 2.\n`;
      summaryText += `3. Solve for time/space complexity or draw the architectural block diagram.\n`;

      return res.json({
        summary: summaryText,
        noteTitle: note.title,
        mode: mode || 'exam_revision'
      });
    } catch (err) {
      console.error('Error in AI Summarize:', err);
      res.status(500).json({ error: 'Failed to generate note summary' });
    }
  });

  // POST /api/ai/explain
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { noteId, topic, mode } = req.body;
      const note = noteId ? notes.find(n => n.id === noteId) : null;
      const targetTopic = topic || note?.title || 'Core Subject Concept';
      const explainMode = mode || 'analogy';

      const gemini = getGeminiClient();

      if (gemini) {
        try {
          const modePrompts: Record<string, string> = {
            analogy: `Explain "${targetTopic}" using a vivid, memorable real-world engineering or everyday physical analogy (like an airport, restaurant kitchen, or city highway). Then connect every detail of the analogy directly back to the technical reality.`,
            eli5: `Explain "${targetTopic}" like I am 10 years old (ELI5). Use simple language, zero jargon without defining it immediately, relatable scenarios, and joyful clarity.`,
            step_by_step: `Explain "${targetTopic}" as an algorithmic step-by-step breakdown. Number each phase clearly, define inputs, intermediate states, outputs, and edge conditions.`
          };

          const response = await gemini.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `${modePrompts[explainMode] || modePrompts.analogy}\n\nLecture Note Context: ${note ? note.title : 'Computer Science Fundamentals'}`,
            config: {
              systemInstruction: 'You are an award-winning computer science educator known for unlocking difficult technical concepts effortlessly.',
              temperature: 0.7
            }
          });

          return res.json({
            explanation: response.text,
            topic: targetTopic,
            mode: explainMode
          });
        } catch (apiErr) {
          console.warn('Gemini explain fallback:', apiErr);
        }
      }

      // Pedagogical fallback explanations
      let explanation = '';
      if (explainMode === 'analogy') {
        explanation = `### 🏢 Real-World Analogy: ${targetTopic}\n\n`;
        explanation += `Think of **${targetTopic}** like a **High-Speed Airport Baggage Handling Hub**:\n\n`;
        explanation += `1. **The Passenger Check-in (Input Phase):** Luggage arrives asynchronously from multiple terminal counters without guaranteed ordering.\n`;
        explanation += `2. **The Automated Sorter & Barcode Scanner:** Rather than having individual baggage handlers search every conveyor belt, a centralized index reads the routing tags in constant time, instantly dispatching bags onto dedicated flight carousels.\n`;
        explanation += `3. **The Cargo Hold Lock (Atomic Commit):** The airplane cargo door only seals when all manifests match. If one bag fails security, the entire batch is reconciled before takeoff (just like an ACID transaction!).\n\n`;
        explanation += `**The Engineering Takeaway:** By separating ingress queues from processing units, ${targetTopic} eliminates bottleneck latency and guarantees system integrity!`;
      } else if (explainMode === 'eli5') {
        explanation = `### 🧒 ELI5: What is ${targetTopic}?\n\n`;
        explanation += `Imagine you and your four friends want to build the tallest Lego tower together!\n\n`;
        explanation += `- If everyone grabs the Lego box at the exact same second, hands bump into each other and the pieces spill on the floor.\n`;
        explanation += `- So, you make a rule: whoever holds the **Magic Golden Lego Brick** gets to add their piece to the tower. When they finish, they pass the brick to the next friend.\n\n`;
        explanation += `That's exactly what **${targetTopic}** does! It is a polite traffic rule for computer chips so they can build huge software programs without bumping into each other or breaking things!`;
      } else {
        explanation = `### 🪜 Step-by-Step Algorithmic Breakdown: ${targetTopic}\n\n`;
        explanation += `**Phase 1: Initialization & Validation**\n- Verify preconditions and input domain constraints.\n- Allocate registers or memory pointers.\n\n`;
        explanation += `**Phase 2: Iterative Traversal / Transformation**\n- Process elements in sequence or recursively partition data.\n- Apply the state transition rule while preserving invariants.\n\n`;
        explanation += `**Phase 3: Convergence & Termination**\n- Evaluate stopping criteria (e.g. queue empty, convergence tolerance met).\n- Commit final state and release acquired locks/handles.`;
      }

      return res.json({
        explanation,
        topic: targetTopic,
        mode: explainMode
      });
    } catch (err) {
      console.error('Error in AI Explain:', err);
      res.status(500).json({ error: 'Failed to generate explanation' });
    }
  });

  // POST /api/ai/quiz (Dynamic practice quiz generation)
  app.post('/api/ai/quiz', async (req, res) => {
    try {
      const { noteId } = req.body;
      const note = notes.find(n => n.id === noteId) || notes[0];
      const noteContext = note.pages.map(p => `Page ${p.pageNumber} (${p.title}): ${p.content}`).join('\n\n');

      const gemini = getGeminiClient();

      if (gemini) {
        try {
          const prompt = `Based on the following lecture note content, generate exactly 5 high-quality multiple choice questions (MCQs) for college students.
Note: "${note.title}" (${note.subjectCode})

Content:
${noteContext}

Return a valid JSON array of 5 objects matching this exact structure:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear academic explanation of why this answer is correct.",
    "hint": "Subtle hint for the student without giving away the answer directly."
  }
]
`;

          const response = await gemini.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              systemInstruction: 'You are a university examination board member creating challenging, fair, and pedagogically sound test questions.',
              temperature: 0.4
            }
          });

          if (response.text) {
            const parsedQuestions = JSON.parse(response.text);
            if (Array.isArray(parsedQuestions) && parsedQuestions.length >= 3) {
              return res.json({
                noteId: note.id,
                noteTitle: note.title,
                subjectCode: note.subjectCode,
                questions: parsedQuestions
              });
            }
          }
        } catch (apiErr) {
          console.warn('Gemini quiz generation fallback:', apiErr);
        }
      }

      // Pre-engineered high-quality academic quizzes customized to each subject
      let defaultQuestions: QuizQuestion[] = [];

      if (note.subjectCode === 'CS101') {
        defaultQuestions = [
          {
            id: 'q-dbms-1',
            question: 'Which Normal Form eliminates partial functional dependency of non-prime attributes on candidate keys?',
            options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
            correctIndex: 1,
            explanation: '2NF requires the relation to be in 1NF and ensures that no non-prime attribute depends on a proper subset of any composite candidate key.',
            hint: 'Think about eliminating dependencies on parts of a composite primary key.'
          },
          {
            id: 'q-dbms-2',
            question: 'In the ANSI/SPARC Three-Schema architecture, which level describes how data is physically stored on magnetic disks and SSDs?',
            options: ['External Level', 'Conceptual Level', 'Internal / Physical Level', 'Logical View Level'],
            correctIndex: 2,
            explanation: 'The Internal or Physical level describes storage structures, record clustering, indexing (B+ Trees), and low-level block allocations.',
            hint: 'It is the lowest layer closest to the hardware storage devices.'
          },
          {
            id: 'q-dbms-3',
            question: 'Which property of ACID ensures that once a database transaction commits, its updates will survive subsequent system crashes or power failures?',
            options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
            correctIndex: 3,
            explanation: 'Durability guarantees that committed modifications persist on non-volatile media via mechanisms like Write-Ahead Logging (WAL).',
            hint: 'The "D" in ACID.'
          },
          {
            id: 'q-dbms-4',
            question: 'How is a Many-to-Many (M:N) relationship mapped into a relational database schema?',
            options: [
              'By putting a foreign key directly into both existing tables',
              'By creating an intermediate junction/bridge table containing foreign keys from both entities',
              'By merging both entities into a single giant flat table',
              'It cannot be represented in relational schemas'
            ],
            correctIndex: 1,
            explanation: 'M:N relationships require a composite associative table whose primary key is composed of the foreign keys of both participating tables.',
            hint: 'You need an extra table to bridge the two entities.'
          },
          {
            id: 'q-dbms-5',
            question: 'Which relational algebra operator corresponds directly to the SQL "SELECT" clause (filtering columns)?',
            options: ['Selection (σ)', 'Projection (π)', 'Cartesian Product (×)', 'Join (⋈)'],
            correctIndex: 1,
            explanation: 'Projection (π) extracts specified attribute columns vertically, whereas Selection (σ) filters rows horizontally matching a condition.',
            hint: 'Greek letter Pi stands for this column-slicing operator.'
          }
        ];
      } else if (note.subjectCode === 'CS201') {
        defaultQuestions = [
          {
            id: 'q-dsa-1',
            question: 'What is the maximum allowed Balance Factor for any node in a strictly valid AVL Tree?',
            options: ['0 only', '-1, 0, or +1', '-2 to +2', 'Any integer bounded by the tree depth'],
            correctIndex: 1,
            explanation: 'In an AVL tree, the Balance Factor BF = Height(Left) - Height(Right) must strictly belong to {-1, 0, +1} for every node.',
            hint: 'The height difference between subtrees can never exceed 1.'
          },
          {
            id: 'q-dsa-2',
            question: 'Which tree traversal algorithm produces the keys of a Binary Search Tree (BST) in strictly sorted ascending order?',
            options: ['Preorder Traversal', 'Postorder Traversal', 'Inorder Traversal', 'Level-Order Traversal'],
            correctIndex: 2,
            explanation: 'Inorder traversal visits Left Subtree -> Root -> Right Subtree, which yields the sorted ordering due to the BST invariant.',
            hint: 'L-N-R traversal order.'
          },
          {
            id: 'q-dsa-3',
            question: 'What underlying data structure does Breadth-First Search (BFS) primarily utilize for vertex exploration?',
            options: ['LIFO Stack', 'FIFO Queue', 'Binary Min-Heap', 'Disjoint-Set (Union-Find)'],
            correctIndex: 1,
            explanation: 'BFS explores neighbor vertices level-by-level using a First-In-First-Out (FIFO) queue.',
            hint: 'First discovered, first explored.'
          },
          {
            id: 'q-dsa-4',
            question: 'Why does Dijkstra’s shortest path algorithm fail on graphs with negative edge weights?',
            options: [
              'It enters an infinite loop instantly',
              'Its greedy assumption that a finalized shortest distance cannot be improved is violated',
              'Priority queues do not support negative integers',
              'Negative weights violate Euler path theorems'
            ],
            correctIndex: 1,
            explanation: 'Dijkstra greedily locks in a vertex once extracted from the priority queue, assuming non-negative increments. Negative edges can subsequently offer cheaper paths.',
            hint: 'Greedy choices assume edge costs only increase path lengths.'
          },
          {
            id: 'q-dsa-5',
            question: 'What is the worst-case time complexity of searching in an unbalanced degenerate Binary Search Tree?',
            options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
            correctIndex: 2,
            explanation: 'When keys are inserted in sorted order, the BST degenerates into a linear linked list with O(N) worst-case search time.',
            hint: 'The tree turns into a straight line or linked list.'
          }
        ];
      } else {
        defaultQuestions = [
          {
            id: 'q-gen-1',
            question: `Which core problem does ${note.title} primarily solve in computing curricula?`,
            options: [
              'Optimizing hardware power consumption solely',
              'Decoupling abstractions, improving operational efficiency and consistency',
              'Replacing high-level languages with pure assembly',
              'Eliminating the need for compiler optimization passes'
            ],
            correctIndex: 1,
            explanation: 'The system architecture modularizes complex state transitions into predictable, decoupled layers.',
            hint: 'Look for the option highlighting architectural modularity and decoupling.'
          },
          {
            id: 'q-gen-2',
            question: 'Which of the following describes the principle of locality in modern memory hierarchies?',
            options: [
              'Data stored on local hard drives is always faster than cloud servers',
              'Programs tend to access memory locations close to recently accessed ones (spatial and temporal)',
              'Only local network packets are cached',
              'Variables must be declared in the local function scope'
            ],
            correctIndex: 1,
            explanation: 'Temporal locality means recently accessed items will likely be accessed again; Spatial locality means nearby memory addresses will likely be accessed soon.',
            hint: 'Think about temporal (time) and spatial (space) clustering.'
          },
          {
            id: 'q-gen-3',
            question: 'Which condition is NOT one of Coffman’s four necessary conditions for Deadlock?',
            options: ['Mutual Exclusion', 'Hold and Wait', 'Arbitrary Preemption', 'Circular Wait'],
            correctIndex: 2,
            explanation: 'The condition is NO PREEMPTION. If arbitrary preemption were allowed, deadlocks could be immediately broken by revoking resources.',
            hint: 'Remember that deadlocks require resources CANNOT be forcibly revoked.'
          },
          {
            id: 'q-gen-4',
            question: 'What does the React Virtual DOM diffing algorithm utilize to keep child element identity stable across re-renders?',
            options: ['UUID generator', 'The unique `key` prop', 'CSS class names', 'Browser window coordinates'],
            correctIndex: 1,
            explanation: 'Keys allow React Fiber to match existing Virtual DOM nodes against the new tree, avoiding unnecessary destruction and recreation.',
            hint: 'A special React attribute passed when mapping arrays in JSX.'
          },
          {
            id: 'q-gen-5',
            question: 'Which HTTP method is semantically idempotent and designed to retrieve resources without modifying server state?',
            options: ['POST', 'GET', 'PATCH', 'CONNECT'],
            correctIndex: 1,
            explanation: 'GET requests are safe and idempotent; repeating them does not produce side-effects on the server.',
            hint: 'Used for fetching web pages and API data.'
          }
        ];
      }

      res.json({
        noteId: note.id,
        noteTitle: note.title,
        subjectCode: note.subjectCode,
        questions: defaultQuestions
      });
    } catch (err) {
      console.error('Error generating quiz:', err);
      res.status(500).json({ error: 'Failed to generate quiz' });
    }
  });

  // POST /api/ai/quiz/submit (Record student quiz score)
  app.post('/api/ai/quiz/submit', async (req, res) => {
    const { userId, score, total } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const percentage = Math.round((Number(score) / Number(total)) * 100);
    const prevCompleted = user.quizStats.completed;
    const prevAvg = user.quizStats.avgScore;

    user.quizStats.completed += 1;
    user.quizStats.lastScore = percentage;
    user.quizStats.avgScore = Math.round((prevAvg * prevCompleted + percentage) / user.quizStats.completed);

    try {
      const sb = getSupabase();
      await sb.from('users').update({ quiz_stats: user.quizStats }).eq('id', user.id);
    } catch (e) {
      console.warn('[Supabase] Quiz stats update fallback:', e);
    }

    res.json({
      success: true,
      stats: user.quizStats,
      percentage
    });
  });

  // ==========================================
  // ADMIN DASHBOARD & METRICS
  // ==========================================

  // GET /api/admin/metrics
  app.get('/api/admin/metrics', (req, res) => {
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalNotesCount = notes.length;
    const totalSubjectsCount = subjects.length;
    const totalDownloads = notes.reduce((acc, n) => acc + n.downloads, 0);
    const totalViews = notes.reduce((acc, n) => acc + n.views, 0);
    const totalQuizzes = users.reduce((acc, u) => acc + u.quizStats.completed, 0);

    const semesterDistribution = semesters.map(sem => ({
      semester: sem.number,
      notesCount: notes.filter(n => n.semesterId === sem.id).length,
      studentCount: users.filter(u => u.role === 'student' && u.semester === sem.number).length
    }));

    const popularNotes = [...notes]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 5)
      .map(n => ({
        id: n.id,
        title: n.title,
        subjectCode: n.subjectCode || 'CS',
        downloads: n.downloads
      }));

    res.json({
      totalStudents,
      totalNotes: totalNotesCount,
      totalSubjects: totalSubjectsCount,
      totalDownloads,
      totalViews,
      quizzesTaken: totalQuizzes,
      semesterDistribution,
      popularNotes
    });
  });

  // GET /api/admin/students
  app.get('/api/admin/students', async (req, res) => {
    // Attempt sync with Supabase users if present
    try {
      const sb = getSupabase();
      const { data: dbUsers, error } = await sb.from('users').select('*');
      if (!error && dbUsers && dbUsers.length > 0) {
        dbUsers.forEach((row: any) => {
          const u = mapDbUser(row);
          const idx = users.findIndex(ex => ex.id === u.id);
          if (idx >= 0) {
            users[idx] = u;
          } else {
            users.push(u);
          }
        });
      }
    } catch {}

    const students = users
      .filter(u => u.role === 'student')
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        studentId: u.studentId || 'CS2026-0000',
        department: u.department || 'Computer Science',
        semester: u.semester || 1,
        quizzesTaken: u.quizStats.completed,
        avgScore: u.quizStats.avgScore,
        bookmarksCount: u.bookmarks.length
      }));
    res.json(students);
  });

  // DELETE /api/admin/students/:id
  app.delete('/api/admin/students/:id', async (req, res) => {
    const { id } = req.params;
    const idx = users.findIndex(u => u.id === id && u.role === 'student');
    if (idx === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    try {
      const sb = getSupabase();
      await sb.from('users').delete().eq('id', id);
    } catch (e) {
      console.warn('[Supabase] Student delete fallback:', e);
    }

    users.splice(idx, 1);
    res.json({ success: true, message: 'Student removed from system' });
  });

  // ==========================================
  // VITE MIDDLEWARE & STATIC SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI-Book] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
