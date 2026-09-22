import React, { useState } from 'react';
import {
  User as UserIcon,
  BookOpen,
  Award,
  Sparkles,
  Bookmark,
  TrendingUp,
  Clock,
  ArrowRight,
  Eye,
  Download,
  Search,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { Note, Semester, Subject, User } from '../types';

interface StudentDashboardProps {
  currentUser: User;
  notes: Note[];
  semesters: Semester[];
  subjects: Subject[];
  onViewNote: (note: Note) => void;
  onDownloadNote: (note: Note) => void;
  onOpenAiStudy: (note: Note, tab?: 'chat' | 'summarize' | 'explain' | 'quiz') => void;
  onSelectSemester: (semesterId: number) => void;
  onToggleBookmark: (note: Note) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  notes,
  semesters,
  subjects,
  onViewNote,
  onDownloadNote,
  onOpenAiStudy,
  onSelectSemester,
  onToggleBookmark
}) => {
  const [quickQuestion, setQuickQuestion] = useState('');

  // Bookmarked notes
  const bookmarkedNotes = notes.filter(n => currentUser.bookmarks.includes(n.id));

  // Current student semester notes
  const studentSemester = currentUser.semester || 1;
  const currentSemesterNotes = notes.filter(n => n.semesterId === studentSemester);

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestion.trim()) return;
    const targetNote = currentSemesterNotes[0] || notes[0];
    if (targetNote) {
      onOpenAiStudy(targetNote, 'chat');
    }
  };

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/30 shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Academic Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {currentUser.name}!
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                {currentUser.department} • <strong className="text-white font-semibold">Semester {studentSemester}</strong> • ID: <span className="font-mono text-indigo-100">{currentUser.studentId}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectSemester(studentSemester)}
              className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              View Semester {studentSemester} Notes
            </button>
          </div>
        </div>

        {/* Quick Academic Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-xs text-indigo-200 font-medium">Saved Bookmarks</p>
            <p className="text-2xl font-extrabold text-white mt-1">{currentUser.bookmarks.length}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-xs text-indigo-200 font-medium">Quizzes Completed</p>
            <p className="text-2xl font-extrabold text-white mt-1">{currentUser.quizStats.completed}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-xs text-indigo-200 font-medium">Average Quiz Score</p>
            <p className="text-2xl font-extrabold text-white mt-1">{currentUser.quizStats.avgScore}%</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-xs text-indigo-200 font-medium">Enrolled Semester Notes</p>
            <p className="text-2xl font-extrabold text-white mt-1">{currentSemesterNotes.length}</p>
          </div>
        </div>
      </div>

      {/* Quick AI Academic Question Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Instant AI Academic Tutor
          </h3>
        </div>
        <form onSubmit={handleQuickAsk} className="flex gap-2">
          <input
            type="text"
            value={quickQuestion}
            onChange={(e) => setQuickQuestion(e.target.value)}
            placeholder="Ask anything about your syllabus: 'Explain 3NF Normalization', 'Why use B+ Trees?', 'Dijkstra steps'..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <span>Ask Tutor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Bookmarked Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h2 className="text-base font-extrabold text-slate-900">
              My Saved Notes ({bookmarkedNotes.length})
            </h2>
          </div>
          {bookmarkedNotes.length > 0 && (
            <span className="text-xs text-slate-500">Quick exam revision stack</span>
          )}
        </div>

        {bookmarkedNotes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No notes saved to bookmarks yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click the bookmark ribbon icon on any note in the curriculum explorer to pin it here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedNotes.map(note => (
              <div
                key={note.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-extrabold">
                      {note.subjectCode}
                    </span>
                    <button
                      onClick={() => onToggleBookmark(note)}
                      title="Remove Bookmark"
                      className="p-1 text-amber-500 hover:text-slate-400"
                    >
                      <Bookmark className="w-4 h-4 fill-amber-500" />
                    </button>
                  </div>

                  <h3
                    onClick={() => onViewNote(note)}
                    className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors line-clamp-2"
                  >
                    {note.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {note.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{note.unit} • {note.fileSize}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewNote(note)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                    >
                      Read
                    </button>
                    <button
                      onClick={() => onOpenAiStudy(note)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      AI Tutor
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Notes for Student's Semester */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Recommended for Semester {studentSemester}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated notes matching your degree specialization
            </p>
          </div>
          <button
            onClick={() => onSelectSemester(studentSemester)}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>Browse All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentSemesterNotes.slice(0, 3).map(note => (
            <div
              key={note.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                    {note.subjectCode} • {note.unit}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {note.downloads} downloads
                  </span>
                </div>
                <h4
                  onClick={() => onViewNote(note)}
                  className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-2"
                >
                  {note.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {note.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">By {note.author}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDownloadNote(note)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenAiStudy(note, 'quiz')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center gap-1"
                  >
                    <Award className="w-3 h-3" />
                    Quiz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
