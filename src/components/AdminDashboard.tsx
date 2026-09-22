import React, { useState } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  FileText,
  Users,
  BookOpen,
  Download,
  Eye,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  TrendingUp,
  Award,
  Sparkles,
  FolderPlus,
  Database
} from 'lucide-react';
import { Note, Semester, Subject, User, AdminMetrics } from '../types';
import { AdminStudentItem } from '../services/api';

interface AdminDashboardProps {
  currentUser: User;
  metrics: AdminMetrics | null;
  notes: Note[];
  semesters: Semester[];
  subjects: Subject[];
  students: AdminStudentItem[];
  onUploadNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (note: Note) => void;
  onAddSubject: (payload: { semesterId: number; code: string; name: string; credits?: number; description?: string }) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  onViewNote: (note: Note) => void;
  onOpenDatabaseModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  metrics,
  notes,
  semesters,
  subjects,
  students,
  onUploadNote,
  onEditNote,
  onDeleteNote,
  onAddSubject,
  onDeleteSubject,
  onDeleteStudent,
  onViewNote,
  onOpenDatabaseModal
}) => {
  const [activeSection, setActiveSection] = useState<'notes' | 'subjects' | 'students'>('notes');
  const [notesSearch, setNotesSearch] = useState('');
  const [notesSemesterFilter, setNotesSemesterFilter] = useState<number | 'all'>('all');

  // New subject form state
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjSem, setNewSubjSem] = useState(1);
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCredits, setNewSubjCredits] = useState(3);
  const [newSubjDesc, setNewSubjDesc] = useState('');
  const [subjLoading, setSubjLoading] = useState(false);

  // Filter notes
  const filteredNotes = notes.filter(n => {
    if (notesSemesterFilter !== 'all' && n.semesterId !== notesSemesterFilter) return false;
    if (notesSearch.trim()) {
      const q = notesSearch.toLowerCase().trim();
      return (
        n.title.toLowerCase().includes(q) ||
        n.subjectCode?.toLowerCase().includes(q) ||
        n.unit.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjCode || !newSubjName) return;
    setSubjLoading(true);
    try {
      await onAddSubject({
        semesterId: newSubjSem,
        code: newSubjCode.trim().toUpperCase(),
        name: newSubjName.trim(),
        credits: newSubjCredits,
        description: newSubjDesc.trim()
      });
      setShowAddSubject(false);
      setNewSubjCode('');
      setNewSubjName('');
      setNewSubjDesc('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create subject');
    } finally {
      setSubjLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2 border border-amber-500/30">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Campus Faculty Administrative Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Academic Notes & Curriculum Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Logged in as <strong className="text-white">{currentUser.name}</strong> • Teacher ID: <span className="font-mono text-amber-300 font-semibold">{currentUser.teacherId || 'FAC-CS-101'}</span> • {currentUser.department || 'Faculty of Computer Science'}. Manage university curriculum notes, semester subjects, verified PDF distributions, and student records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenDatabaseModal && (
              <button
                onClick={onOpenDatabaseModal}
                className="px-3.5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase DB</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            )}
            <button
              onClick={onUploadNote}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              Upload Curriculum Note
            </button>
          </div>
        </div>

        {/* High-level metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-amber-200/80 font-medium">Total Students</p>
            <p className="text-xl font-black text-white mt-0.5">{metrics?.totalStudents ?? students.length}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-amber-200/80 font-medium">Curriculum Notes</p>
            <p className="text-xl font-black text-white mt-0.5">{notes.length}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-amber-200/80 font-medium">Active Subjects</p>
            <p className="text-xl font-black text-white mt-0.5">{subjects.length}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-amber-200/80 font-medium">PDF Downloads</p>
            <p className="text-xl font-black text-white mt-0.5">{metrics?.totalDownloads ?? 420}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-amber-200/80 font-medium">Document Views</p>
            <p className="text-xl font-black text-white mt-0.5">{metrics?.totalViews ?? 1250}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] text-amber-200/80 font-medium">Quizzes Taken</p>
            <p className="text-xl font-black text-white mt-0.5">{metrics?.quizzesTaken ?? 85}</p>
          </div>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveSection('notes')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSection === 'notes'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Manage Notes ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('subjects')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSection === 'subjects'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Semester Subjects ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('students')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSection === 'students'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Directory ({students.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: NOTES MANAGEMENT                              */}
      {/* ======================================================== */}
      {activeSection === 'notes' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Filter toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                  placeholder="Search title, subject, author..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={notesSemesterFilter}
                onChange={(e) => setNotesSemesterFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Semesters</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onUploadNote}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Upload Note
            </button>
          </div>

          {/* Notes table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Subject & Unit</th>
                  <th className="py-3 px-4">Note Title</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4 text-center">Downloads</th>
                  <th className="py-3 px-4 text-center">Views</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotes.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-indigo-900 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[11px] mr-1.5">
                        {n.subjectCode}
                      </span>
                      <span className="text-slate-500 font-normal">{n.unit}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate">
                      {n.title}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      Semester {n.semesterId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      {n.author}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {n.downloads}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {n.views}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewNote(n)}
                          title="Preview Document"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditNote(n)}
                          title="Edit Note Details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteNote(n)}
                          title="Delete Note"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: SUBJECTS & SEMESTER MANAGEMENT                */}
      {/* ======================================================== */}
      {activeSection === 'subjects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Curriculum Subjects Directory</h3>
              <p className="text-xs text-slate-500">Manage courses and academic modules per semester</p>
            </div>
            <button
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              {showAddSubject ? 'Cancel' : 'Add New Subject'}
            </button>
          </div>

          {/* Add Subject Drawer/Form */}
          {showAddSubject && (
            <form onSubmit={handleCreateSubject} className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Create New Subject
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={newSubjSem}
                    onChange={(e) => setNewSubjSem(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={newSubjCode}
                    onChange={(e) => setNewSubjCode(e.target.value)}
                    placeholder="e.g. CS303"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newSubjName}
                    onChange={(e) => setNewSubjName(e.target.value)}
                    placeholder="e.g. Distributed Systems"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newSubjCredits}
                    onChange={(e) => setNewSubjCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newSubjDesc}
                  onChange={(e) => setNewSubjDesc(e.target.value)}
                  placeholder="Brief syllabus outline..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subjLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  {subjLoading ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          )}

          {/* Subjects Grid by Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(s => {
              const notesCount = notes.filter(n => n.subjectId === s.id).length;

              return (
                <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-xs font-black font-mono">
                        {s.code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Semester {s.semesterId} • {s.credits} Credits
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{s.name}</h4>
                    {s.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {notesCount} uploaded {notesCount === 1 ? 'note' : 'notes'}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete subject ${s.code} (${s.name})?`)) {
                          onDeleteSubject(s.id);
                        }
                      }}
                      title="Delete Subject"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: STUDENT DIRECTORY                             */}
      {/* ======================================================== */}
      {activeSection === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Registered College Students
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {students.length} active students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Campus Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Semester</th>
                  <th className="py-3 px-4 text-center">Quizzes Done</th>
                  <th className="py-3 px-4 text-center">Avg Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(std => (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {std.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-indigo-700 whitespace-nowrap">
                      {std.studentId}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {std.email}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {std.department}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-semibold">
                      Sem {std.semester}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {std.quizzesTaken}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">
                      {std.avgScore}%
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm(`Remove student ${std.name} (${std.email})?`)) {
                            onDeleteStudent(std.id);
                          }
                        }}
                        title="Remove Student"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
