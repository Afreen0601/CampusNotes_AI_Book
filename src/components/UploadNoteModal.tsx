import React, { useState } from 'react';
import { X, Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { Semester, Subject } from '../types';

interface UploadNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  semesters: Semester[];
  subjects: Subject[];
  onUpload: (formData: FormData) => Promise<void>;
}

export const UploadNoteModal: React.FC<UploadNoteModalProps> = ({
  isOpen,
  onClose,
  semesters,
  subjects,
  onUpload
}) => {
  const [semesterId, setSemesterId] = useState<number>(1);
  const [subjectId, setSubjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('Unit 1');
  const [author, setAuthor] = useState('Prof. Alan Sharma');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('Lecture Notes, Exam Revision');
  const [lectureContent, setLectureContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Subjects for the selected semester
  const availableSubjects = subjects.filter(s => s.semesterId === semesterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) {
      setError('Please fill in Title, Semester, and Subject');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('semesterId', semesterId.toString());
      formData.append('subjectId', subjectId);
      formData.append('unit', unit.trim());
      formData.append('author', author.trim());
      formData.append('description', description.trim());
      formData.append('tags', tags);

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (lectureContent.trim()) {
        formData.append('content', lectureContent.trim());
      }

      await onUpload(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl">
              <Upload className="w-5 h-5 text-amber-100" />
            </span>
            <div>
              <h3 className="text-base font-black tracking-tight">Upload Verified Curriculum Note</h3>
              <p className="text-xs text-amber-100">Add lecture PDFs, exam guides & unit study material</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={semesterId}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setSemesterId(s);
                  const firstSubj = subjects.find(sub => sub.semesterId === s);
                  if (firstSubj) setSubjectId(firstSubj.id);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Course</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Select subject...</option>
                {availableSubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    [{sub.code}] {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Note Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 3: Normalization & Functional Dependencies"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit / Chapter</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Unit 1, Unit 2"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor / Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Prof. Alan Sharma"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive coverage of Boyce-Codd Normal Form and lossless joins..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="DBMS, SQL, Normalization, Exam"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Attach PDF Document (Optional)</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 transition-colors">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="note-file-input"
              />
              <label htmlFor="note-file-input" className="cursor-pointer flex flex-col items-center">
                <FileText className="w-8 h-8 text-amber-500 mb-1" />
                <span className="text-xs font-bold text-slate-700">
                  {selectedFile ? selectedFile.name : 'Click to select PDF notes file or drag here'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PDF format recommended (Max 25MB)
                </span>
              </label>
            </div>
          </div>

          {/* Custom lecture text editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lecture Notes Text & Syllabus Overview
            </label>
            <textarea
              rows={3}
              value={lectureContent}
              onChange={(e) => setLectureContent(e.target.value)}
              placeholder="Enter comprehensive lecture text for the AI Tutor and in-app reader. Use ---PAGE--- to separate into multiple pages..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Publish Curriculum Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
