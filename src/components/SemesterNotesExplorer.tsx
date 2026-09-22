import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Sparkles,
  Bookmark,
  Calendar,
  User as UserIcon,
  PlusCircle,
  Edit2,
  Trash2,
  FileText,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import { Note, Semester, Subject, User } from '../types';

interface SemesterNotesExplorerProps {
  semesters: Semester[];
  subjects: Subject[];
  notes: Note[];
  selectedSemesterId: number;
  onSelectSemester: (id: number) => void;
  selectedSubjectId: string | null;
  onSelectSubject: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  currentUser: User | null;
  onViewNote: (note: Note) => void;
  onDownloadNote: (note: Note) => void;
  onOpenAiStudy: (note: Note, initialTab?: 'chat' | 'summarize' | 'explain' | 'quiz') => void;
  onToggleBookmark: (note: Note) => void;
  onOpenUploadModal?: () => void;
  onEditNote?: (note: Note) => void;
  onDeleteNote?: (note: Note) => void;
}

export const SemesterNotesExplorer: React.FC<SemesterNotesExplorerProps> = ({
  semesters,
  subjects,
  notes,
  selectedSemesterId,
  onSelectSemester,
  selectedSubjectId,
  onSelectSubject,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  currentUser,
  onViewNote,
  onDownloadNote,
  onOpenAiStudy,
  onToggleBookmark,
  onOpenUploadModal,
  onEditNote,
  onDeleteNote
}) => {
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);

  // Active semester subjects
  const semesterSubjects = subjects.filter(s => s.semesterId === selectedSemesterId);

  // Active semester object
  const activeSemester = semesters.find(s => s.id === selectedSemesterId);

  // Apply filters
  const filteredNotes = notes.filter(n => {
    // Semester match
    if (n.semesterId !== selectedSemesterId) return false;

    // Subject match
    if (selectedSubjectId && n.subjectId !== selectedSubjectId) return false;

    // Bookmarked filter
    if (filterBookmarkedOnly && currentUser && !currentUser.bookmarks.includes(n.id)) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.subjectCode?.toLowerCase().includes(q) ||
        n.subjectName?.toLowerCase().includes(q) ||
        n.unit.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header / Semester Overview */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Curriculum Notes & Syllabus
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Browse academic lecture notes and syllabus resources organized by semester and subject.
            </p>
          </div>

          {/* Quick Action Button for Admin */}
          {currentUser?.role === 'admin' && onOpenUploadModal && (
            <div className="shrink-0">
              <button
                onClick={onOpenUploadModal}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Note</span>
              </button>
            </div>
          )}
        </div>

        {/* Semester Selection Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-600">
              Select Semester
            </span>
            <span className="text-xs text-slate-500">
              Current: <strong className="text-slate-800 font-semibold">{activeSemester?.name || `Semester ${selectedSemesterId}`}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {semesters.map(sem => {
              const isSelected = sem.id === selectedSemesterId;
              const semNotesCount = notes.filter(n => n.semesterId === sem.id).length;

              return (
                <button
                  key={sem.id}
                  onClick={() => {
                    onSelectSemester(sem.id);
                    onSelectSubject(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{sem.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {semNotesCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Subject Chips for Selected Semester */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {activeSemester?.name} Subjects:
            </span>
            <span className="text-xs text-slate-400">
              ({semesterSubjects.length} courses available)
            </span>
          </div>

          {currentUser && (
            <button
              onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
              className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                filterBookmarkedOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${filterBookmarkedOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>My Saved Notes ({currentUser.bookmarks.length})</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* "All Subjects" chip */}
          <button
            onClick={() => onSelectSubject(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedSubjectId === null
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Subjects ({notes.filter(n => n.semesterId === selectedSemesterId).length})
          </button>

          {/* Individual Subjects */}
          {semesterSubjects.map(subj => {
            const isSubjSelected = selectedSubjectId === subj.id;
            const count = notes.filter(n => n.subjectId === subj.id).length;

            return (
              <button
                key={subj.id}
                onClick={() => onSelectSubject(isSubjSelected ? null : subj.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border flex items-center gap-2 ${
                  isSubjSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isSubjSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-indigo-700'
                }`}>
                  {subj.code}
                </span>
                <span>{subj.name}</span>
                <span className={`text-[10px] ${isSubjSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, topics, units, tags..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          >
            <option value="newest">Newest Uploads</option>
            <option value="downloads">Most Downloaded</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No notes found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No notes match your current filters for {activeSemester?.name}. Try clearing search terms or selecting another subject.
          </p>
          {(searchQuery || selectedSubjectId || filterBookmarkedOnly) && (
            <button
              onClick={() => {
                onSearchChange('');
                onSelectSubject(null);
                setFilterBookmarkedOnly(false);
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map(note => {
            const isBookmarked = currentUser?.bookmarks.includes(note.id);

            return (
              <div
                key={note.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Note Card Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[11px] border border-indigo-100">
                        {note.subjectCode || 'CS'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">
                        {note.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {currentUser && (
                        <button
                          onClick={() => onToggleBookmark(note)}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Note'}
                          className={`p-1.5 rounded-lg transition-all ${
                            isBookmarked
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                              : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                        </button>
                      )}

                      {currentUser?.role === 'admin' && (
                        <div className="flex items-center gap-0.5">
                          {onEditNote && (
                            <button
                              onClick={() => onEditNote(note)}
                              title="Edit Note Details"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteNote && (
                            <button
                              onClick={() => onDeleteNote(note)}
                              title="Delete Note"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <h4
                    onClick={() => onViewNote(note)}
                    className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors line-clamp-2 leading-snug"
                  >
                    {note.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {note.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {note.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-medium bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Metadata & Footer */}
                <div className="px-5 pt-3 pb-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      {note.author}
                    </span>
                    <span>{note.totalPages} pages • {note.fileSize}</span>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onViewNote(note)}
                      className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Read</span>
                    </button>

                    <button
                      onClick={() => onDownloadNote(note)}
                      className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => onOpenAiStudy(note)}
                      className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs shadow-indigo-200"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                      <span>AI Tutor</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
