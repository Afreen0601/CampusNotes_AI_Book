import React, { useState } from 'react';
import {
  X,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Check,
  Copy,
  Bookmark,
  BookOpen
} from 'lucide-react';
import { Note } from '../types';

interface PdfViewerModalProps {
  note: Note | null;
  onClose: () => void;
  onDownload: (note: Note) => void;
  onOpenAiStudy: (note: Note) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (note: Note) => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  note,
  onClose,
  onDownload,
  onOpenAiStudy,
  isBookmarked,
  onToggleBookmark
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const totalPages = note.pages.length || 1;
  const activePageData = note.pages[currentPage - 1] || note.pages[0];

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleCopyPage = () => {
    if (activePageData) {
      navigator.clipboard.writeText(
        `# ${activePageData.title}\n\n${activePageData.content}\n\nKey Points:\n` +
        (activePageData.keyPoints?.map(kp => `- ${kp}`).join('\n') || '')
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4">
      <div className="relative w-full max-w-5xl h-[94vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-100">
        {/* Top Control Bar */}
        <div className="bg-slate-800/90 border-b border-slate-700/80 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          {/* Note Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/80 flex items-center justify-center text-white shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {note.subjectCode}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                  {note.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {note.unit} • {note.author} • {note.fileSize}
              </p>
            </div>
          </div>

          {/* Viewer Tools (Page navigation & Zoom) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Page navigation */}
            <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-1 text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300 text-[11px] px-1 font-mono">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bookmark button */}
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(note)}
                title={isBookmarked ? 'Saved in bookmarks' : 'Bookmark Note'}
                className={`p-2 rounded-xl border transition-all ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-amber-400'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            {/* AI Tutor shortcut */}
            <button
              onClick={() => onOpenAiStudy(note)}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="hidden sm:inline">AI Study Tutor</span>
            </button>

            {/* Download PDF button */}
            <button
              onClick={() => onDownload(note)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              title="Download Verified PDF"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden md:inline">Download</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/80 transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Document Canvas Viewport */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-8 overflow-y-auto flex justify-center">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-3xl min-h-[750px] bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 transition-transform duration-150 flex flex-col justify-between relative border border-slate-200"
          >
            {/* Top Page Header (Academic Header) */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6">
                <div>
                  <span className="text-[11px] font-extrabold tracking-wider text-indigo-700 uppercase">
                    Department of Computer Science & Engineering
                  </span>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 mt-0.5">
                    {activePageData?.title || note.title}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">
                    {note.subjectCode} - {note.unit}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Semester {note.semesterId} Curriculum
                  </p>
                </div>
              </div>

              {/* Page Subtitle / Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-6 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <span>Instructor / Author: <strong className="text-slate-700">{note.author}</strong></span>
                <span>Verified Syllabus Reference</span>
                <button
                  onClick={handleCopyPage}
                  className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy Page'}
                </button>
              </div>

              {/* Main Content Body */}
              <div className="space-y-4 text-sm leading-relaxed text-slate-800 font-normal">
                {activePageData?.content.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Key Highlights / Exam Takeaways Box */}
              {activePageData?.keyPoints && activePageData.keyPoints.length > 0 && (
                <div className="mt-8 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">
                    <BookOpen className="w-3.5 h-3.5" />
                    Key Exam & Theoretical Highlights:
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {activePageData.keyPoints.map((point, ptIdx) => (
                      <li key={ptIdx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Page Footer */}
            <div className="pt-6 mt-8 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>AI-Book Digital Repository • Verified Academic Copy</span>
              <span className="font-bold text-slate-600 font-mono">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
