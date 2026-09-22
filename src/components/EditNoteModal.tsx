import React, { useState, useEffect } from 'react';
import { X, Save, Edit2, Loader2 } from 'lucide-react';
import { Note, Semester, Subject } from '../types';

interface EditNoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  semesters: Semester[];
  subjects: Subject[];
  onSave: (id: string, payload: Partial<Note>) => Promise<void>;
}

export const EditNoteModal: React.FC<EditNoteModalProps> = ({
  note,
  isOpen,
  onClose,
  semesters,
  subjects,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [semesterId, setSemesterId] = useState<number>(1);
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setUnit(note.unit);
      setDescription(note.description);
      setTags(note.tags.join(', '));
      setSemesterId(note.semesterId);
      setSubjectId(note.subjectId);
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const availableSubjects = subjects.filter(s => s.semesterId === semesterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(note.id, {
        title: title.trim(),
        unit: unit.trim(),
        description: description.trim(),
        semesterId,
        subjectId,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">Edit Note: {note.title}</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={semesterId}
                onChange={(e) => setSemesterId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              >
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              >
                {availableSubjects.map(s => (
                  <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Note Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Unit / Module</label>
            <input
              type="text"
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
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
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
