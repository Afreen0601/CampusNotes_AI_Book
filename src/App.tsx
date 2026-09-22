import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SemesterNotesExplorer } from './components/SemesterNotesExplorer';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PdfViewerModal } from './components/PdfViewerModal';
import { AiStudyModal } from './components/AiStudyModal';
import { LoginModal } from './components/LoginModal';
import { UploadNoteModal } from './components/UploadNoteModal';
import { EditNoteModal } from './components/EditNoteModal';
import { SupabaseModal } from './components/SupabaseModal';
import { Note, Semester, Subject, User, AdminMetrics, UserRole } from './types';
import { DEMO_STUDENT, DEMO_ADMIN, INITIAL_SEMESTERS, INITIAL_SUBJECTS, INITIAL_NOTES } from './data/seedData';
import {
  fetchSemesters,
  fetchSubjects,
  fetchNotes,
  fetchAdminMetrics,
  fetchAdminStudents,
  toggleBookmark,
  uploadNote,
  updateNote,
  deleteNote,
  createSubject,
  deleteSubject,
  deleteAdminStudent,
  getNoteDownloadUrl,
  AdminStudentItem
} from './services/api';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campusnotes_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_STUDENT;
      }
    }
    // Default to student for instant engagement
    return DEMO_STUDENT;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('campusnotes_token') || 'demo-token';
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'notes' | 'dashboard' | 'admin' | 'ai'>('notes');

  // Core Data State
  const [semesters, setSemesters] = useState<Semester[]>(INITIAL_SEMESTERS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [adminStudents, setAdminStudents] = useState<AdminStudentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Explorer Filters
  const [selectedSemesterId, setSelectedSemesterId] = useState<number>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginInitialRole, setLoginInitialRole] = useState<UserRole>('student');
  const [pdfModalNote, setPdfModalNote] = useState<Note | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalNote, setAiModalNote] = useState<Note | null>(null);
  const [aiInitialTab, setAiInitialTab] = useState<'chat' | 'summarize' | 'explain' | 'quiz'>('chat');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalNote, setEditModalNote] = useState<Note | null>(null);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Synchronize localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('campusnotes_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('campusnotes_user');
      localStorage.removeItem('campusnotes_token');
    }
  }, [currentUser]);

  // Load Data from API
  const refreshData = async () => {
    try {
      const [sems, subs, nts] = await Promise.all([
        fetchSemesters().catch(() => INITIAL_SEMESTERS),
        fetchSubjects().catch(() => INITIAL_SUBJECTS),
        fetchNotes({ userId: currentUser?.id }).catch(() => INITIAL_NOTES)
      ]);
      setSemesters(sems);
      setSubjects(subs);
      setNotes(nts);

      if (currentUser?.role === 'admin') {
        const [met, stds] = await Promise.all([
          fetchAdminMetrics().catch(() => null),
          fetchAdminStudents().catch(() => [])
        ]);
        setAdminMetrics(met);
        setAdminStudents(stds);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser?.role, currentUser?.id]);

  // Handlers
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('campusnotes_token', token);
    showToast(`Welcome, ${user.name}! Switched to ${user.role === 'admin' ? 'Admin' : 'Student'} mode.`);
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
      if (user.semester) {
        setSelectedSemesterId(user.semester);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setActiveTab('notes');
    showToast('Signed out successfully.');
  };

  const handleQuickDemoStudent = () => {
    setCurrentUser(DEMO_STUDENT);
    setActiveTab('dashboard');
    showToast('Logged in as Demo Student (Sarah Jenkins).');
  };

  const handleQuickDemoAdmin = () => {
    setCurrentUser(DEMO_ADMIN);
    setActiveTab('admin');
    showToast('Logged in as Faculty Admin (Prof. Alan Sharma).');
  };

  const handleToggleBookmark = async (note: Note) => {
    if (!currentUser) {
      setLoginInitialRole('student');
      setLoginModalOpen(true);
      return;
    }

    try {
      const res = await toggleBookmark(note.id, currentUser.id);
      setCurrentUser(prev => prev ? { ...prev, bookmarks: res.bookmarks } : null);
      showToast(res.bookmarked ? `Saved "${note.title}" to bookmarks!` : `Removed "${note.title}" from bookmarks.`);
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, bookmarked: res.bookmarked } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadNote = (note: Note) => {
    const url = getNoteDownloadUrl(note.id);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Increment download count locally
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, downloads: n.downloads + 1 } : n));
    showToast(`Downloading verified PDF: ${note.title}`);
  };

  const handleOpenAiStudy = (note: Note, tab: 'chat' | 'summarize' | 'explain' | 'quiz' = 'chat') => {
    setAiModalNote(note);
    setAiInitialTab(tab);
    setAiModalOpen(true);
  };

  const handleUploadNewNote = async (formData: FormData) => {
    const created = await uploadNote(formData);
    setNotes(prev => [created, ...prev]);
    showToast(`Published note: "${created.title}"`);
    refreshData();
  };

  const handleSaveEditedNote = async (id: string, payload: Partial<Note>) => {
    const updated = await updateNote(id, payload);
    setNotes(prev => prev.map(n => n.id === id ? updated : n));
    showToast(`Updated note: "${updated.title}"`);
  };

  const handleDeleteNote = async (note: Note) => {
    if (confirm(`Are you sure you want to delete note "${note.title}"?`)) {
      await deleteNote(note.id);
      setNotes(prev => prev.filter(n => n.id !== note.id));
      showToast(`Deleted note: "${note.title}"`);
      refreshData();
    }
  };

  const handleAddSubject = async (payload: { semesterId: number; code: string; name: string; credits?: number; description?: string }) => {
    const created = await createSubject(payload);
    setSubjects(prev => [...prev, created]);
    showToast(`Added subject: [${created.code}] ${created.name}`);
    refreshData();
  };

  const handleDeleteSubject = async (id: string) => {
    await deleteSubject(id);
    setSubjects(prev => prev.filter(s => s.id !== id));
    showToast('Subject deleted successfully');
    refreshData();
  };

  const handleDeleteStudent = async (id: string) => {
    await deleteAdminStudent(id);
    setAdminStudents(prev => prev.filter(s => s.id !== id));
    showToast('Student removed from directory');
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'ai') {
            const defaultNote = notes[0];
            if (defaultNote) {
              handleOpenAiStudy(defaultNote, 'chat');
            }
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenLogin={() => {
          setLoginInitialRole('student');
          setLoginModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenDemoStudent={handleQuickDemoStudent}
        onOpenDemoAdmin={handleQuickDemoAdmin}
        onOpenDatabaseModal={() => setSupabaseModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading AI-Book Curriculum...</p>
          </div>
        ) : (
          <>
            {/* VIEW 1: CURRICULUM NOTES EXPLORER */}
            {activeTab === 'notes' && (
              <SemesterNotesExplorer
                semesters={semesters}
                subjects={subjects}
                notes={notes}
                selectedSemesterId={selectedSemesterId}
                onSelectSemester={(id) => setSelectedSemesterId(id)}
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={(id) => setSelectedSubjectId(id)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                currentUser={currentUser}
                onViewNote={(note) => setPdfModalNote(note)}
                onDownloadNote={handleDownloadNote}
                onOpenAiStudy={(note, initialTab) => handleOpenAiStudy(note, initialTab || 'chat')}
                onToggleBookmark={handleToggleBookmark}
                onOpenUploadModal={() => setUploadModalOpen(true)}
                onEditNote={(note) => setEditModalNote(note)}
                onDeleteNote={handleDeleteNote}
              />
            )}

            {/* VIEW 2: STUDENT DASHBOARD */}
            {activeTab === 'dashboard' && currentUser && (
              <StudentDashboard
                currentUser={currentUser}
                notes={notes}
                semesters={semesters}
                subjects={subjects}
                onViewNote={(note) => setPdfModalNote(note)}
                onDownloadNote={handleDownloadNote}
                onOpenAiStudy={(note, tab) => handleOpenAiStudy(note, tab || 'chat')}
                onSelectSemester={(semId) => {
                  setSelectedSemesterId(semId);
                  setActiveTab('notes');
                }}
                onToggleBookmark={handleToggleBookmark}
              />
            )}

            {/* VIEW 3: FACULTY ADMIN DASHBOARD */}
            {activeTab === 'admin' && currentUser?.role === 'admin' && (
              <AdminDashboard
                currentUser={currentUser}
                metrics={adminMetrics}
                notes={notes}
                semesters={semesters}
                subjects={subjects}
                students={adminStudents}
                onUploadNote={() => setUploadModalOpen(true)}
                onEditNote={(note) => setEditModalNote(note)}
                onDeleteNote={handleDeleteNote}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                onDeleteStudent={handleDeleteStudent}
                onViewNote={(note) => setPdfModalNote(note)}
                onOpenDatabaseModal={() => setSupabaseModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="font-extrabold text-slate-800">AI-Book</span>
            <span>— College Digital Notes Sharing & Intelligent Study System</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Powered by Google Gemini 3.8 Flash • Verified Academic Course Curriculum
          </p>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={loginInitialRole}
      />

      {pdfModalNote && (
        <PdfViewerModal
          note={pdfModalNote}
          onClose={() => setPdfModalNote(null)}
          onDownload={handleDownloadNote}
          onOpenAiStudy={(n) => handleOpenAiStudy(n, 'chat')}
          isBookmarked={currentUser?.bookmarks.includes(pdfModalNote.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {aiModalNote && (
        <AiStudyModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          note={aiModalNote}
          allNotes={notes}
          onSelectNote={(newNote) => setAiModalNote(newNote)}
          currentUser={currentUser}
          initialTab={aiInitialTab}
          onUserStatsUpdated={(newStats) => {
            setCurrentUser(prev => prev ? { ...prev, quizStats: newStats } : null);
          }}
        />
      )}

      <UploadNoteModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        semesters={semesters}
        subjects={subjects}
        onUpload={handleUploadNewNote}
      />

      <EditNoteModal
        note={editModalNote}
        isOpen={!!editModalNote}
        onClose={() => setEditModalNote(null)}
        semesters={semesters}
        subjects={subjects}
        onSave={handleSaveEditedNote}
      />

      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => {
          setSupabaseModalOpen(false);
          refreshData();
        }}
      />
    </div>
  );
}
