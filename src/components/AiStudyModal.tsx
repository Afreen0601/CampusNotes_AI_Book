import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  MessageSquare,
  FileText,
  HelpCircle,
  Award,
  Send,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { Note, QuizQuestion, User } from '../types';
import {
  askAiChatbot,
  summarizeNote,
  explainConcept,
  generateQuiz,
  submitQuizScore
} from '../services/api';

interface AiStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  allNotes: Note[];
  onSelectNote: (note: Note) => void;
  currentUser: User | null;
  onUserStatsUpdated?: (stats: User['quizStats']) => void;
  initialTab?: 'chat' | 'summarize' | 'explain' | 'quiz';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  citation?: string;
  suggestedFollowUps?: string[];
}

export const AiStudyModal: React.FC<AiStudyModalProps> = ({
  isOpen,
  onClose,
  note,
  allNotes,
  onSelectNote,
  currentUser,
  onUserStatsUpdated,
  initialTab = 'chat'
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'summarize' | 'explain' | 'quiz'>(initialTab);

  // Sync initial tab when changed from props
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // CHATBOT STATE
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // SUMMARIZER STATE
  const [summaryMode, setSummaryMode] = useState<'exam_revision' | 'executive' | 'cheat_sheet' | 'crash_course'>('exam_revision');
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  // EXPLAINER STATE
  const [explainMode, setExplainMode] = useState<'analogy' | 'eli5' | 'step_by_step'>('analogy');
  const [explainTopic, setExplainTopic] = useState('');
  const [explainText, setExplainText] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  // QUIZ STATE
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Reset or load initial chat on note switch
  useEffect(() => {
    if (note) {
      setExplainTopic(note.title);
      setChatMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello! I am your AI academic tutor for **${note.title}** (${note.subjectCode}, ${note.unit}).\n\nAsk me anything about the theoretical principles, formulas, exam problems, or ask for a practice quiz!`,
          citation: `${note.subjectCode} Syllabus`,
          suggestedFollowUps: [
            `What are the high-yield exam topics in this unit?`,
            `Explain the core concept step-by-step`,
            `What are common student misconceptions here?`
          ]
        }
      ]);
      setSummaryText(null);
      setExplainText(null);
      setQuizQuestions([]);
      setQuizSubmitted(false);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
    }
  }, [note?.id]);

  if (!isOpen || !note) return null;

  // CHAT HANDLERS
  const handleSendQuestion = async (query?: string) => {
    const q = (query || inputQuestion).trim();
    if (!q || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setChatLoading(true);

    try {
      const data = await askAiChatbot({
        noteId: note.id,
        question: q
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer,
        citation: data.citation,
        suggestedFollowUps: data.suggestedFollowUps
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err: unknown) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `Error connecting to AI tutor: ${err instanceof Error ? err.message : 'Please try again.'}`
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // SUMMARIZER HANDLERS
  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryText(null);
    try {
      const data = await summarizeNote(note.id, summaryMode);
      setSummaryText(data.summary);
    } catch (err: unknown) {
      setSummaryText(`Failed to generate summary: ${err instanceof Error ? err.message : 'Please retry.'}`);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (summaryText) {
      navigator.clipboard.writeText(summaryText);
      setSummaryCopied(true);
      setTimeout(() => setSummaryCopied(false), 2000);
    }
  };

  // EXPLAINER HANDLERS
  const handleGenerateExplanation = async () => {
    setExplainLoading(true);
    setExplainText(null);
    try {
      const data = await explainConcept({
        noteId: note.id,
        topic: explainTopic.trim() || note.title,
        mode: explainMode
      });
      setExplainText(data.explanation);
    } catch (err: unknown) {
      setExplainText(`Failed to generate explanation: ${err instanceof Error ? err.message : 'Please retry.'}`);
    } finally {
      setExplainLoading(false);
    }
  };

  // QUIZ HANDLERS
  const handleLoadQuiz = async () => {
    setQuizLoading(true);
    setQuizQuestions([]);
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowHints({});

    try {
      const data = await generateQuiz(note.id);
      setQuizQuestions(data.questions);
    } catch (err) {
      console.error('Quiz loading failed', err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectQuizOption = (optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleFinishQuiz = async () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    if (currentUser) {
      try {
        const res = await submitQuizScore(currentUser.id, score, quizQuestions.length);
        if (onUserStatsUpdated) {
          onUserStatsUpdated(res.stats);
        }
      } catch (err) {
        console.error('Failed to submit score', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between border-b border-indigo-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/90 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white tracking-tight">AI Academic Study Suite</span>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              {/* Note context pill */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-amber-400 font-mono">[{note.subjectCode}]</span>
                <span className="text-xs text-slate-300 truncate max-w-md">{note.title}</span>
                <span className="text-[11px] text-slate-400">• {note.unit}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Note selector dropdown */}
            <select
              value={note.id}
              onChange={(e) => {
                const found = allNotes.find(n => n.id === e.target.value);
                if (found) onSelectNote(found);
              }}
              className="hidden sm:block text-xs bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {allNotes.map(n => (
                <option key={n.id} value={n.id} className="text-slate-900">
                  {n.subjectCode} - {n.title.substring(0, 30)}...
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Lecture Chatbot
          </button>

          <button
            onClick={() => setActiveTab('summarize')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'summarize'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Note Summarizer
          </button>

          <button
            onClick={() => setActiveTab('explain')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'explain'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Concept Explainer
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            Practice Quiz
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* ===================================== */}
          {/* TAB 1: AI CHATBOT                    */}
          {/* ===================================== */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col justify-between max-w-3xl mx-auto">
              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white shadow-xs rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
                      }`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wide">
                          <Sparkles className="w-3.5 h-3.5" /> AI-Book Study Tutor
                        </div>
                      )}

                      <div className="whitespace-pre-line">
                        {msg.text}
                      </div>

                      {msg.citation && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>Grounded Source: <strong>{msg.citation}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Suggested follow-up prompt pills */}
                    {msg.suggestedFollowUps && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                        {msg.suggestedFollowUps.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendQuestion(prompt)}
                            className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200 transition-all text-left"
                          >
                            + {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 w-48 text-xs text-slate-500 shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Analyzing notes...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendQuestion();
                  }}
                  placeholder={`Ask questions about ${note.title}...`}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm focus:outline-none text-slate-800 placeholder-slate-400"
                />
                <button
                  onClick={() => handleSendQuestion()}
                  disabled={!inputQuestion.trim() || chatLoading}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===================================== */}
          {/* TAB 2: NOTE SUMMARIZER               */}
          {/* ===================================== */}
          {activeTab === 'summarize' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Choose Summary Format</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    { id: 'exam_revision', label: 'Exam High-Yield', desc: 'Formulas & Definitions' },
                    { id: 'executive', label: 'Executive Brief', desc: '3-Paragraph Overview' },
                    { id: 'cheat_sheet', label: 'Quick Cheat Sheet', desc: 'Rules & Theorems' },
                    { id: 'crash_course', label: '5-Min Crash Course', desc: 'Intuitive 80/20 Rule' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSummaryMode(m.id as any)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        summaryMode === m.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight">{m.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {summaryLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Synthesizing Notes with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      Generate {summaryMode.replace('_', ' ').toUpperCase()} Summary
                    </>
                  )}
                </button>
              </div>

              {summaryText && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5" /> AI Generated Summary ({summaryMode})
                    </span>
                    <button
                      onClick={handleCopySummary}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100"
                    >
                      {summaryCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {summaryCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                    {summaryText}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================== */}
          {/* TAB 3: CONCEPT EXPLAINER             */}
          {/* ===================================== */}
          {activeTab === 'explain' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 mb-1">Concept Explainer Engine</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Break down difficult university topics using psychological analogies, plain-English ELI5, or step-by-step algorithms.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Concept or Topic</label>
                    <input
                      type="text"
                      value={explainTopic}
                      onChange={(e) => setExplainTopic(e.target.value)}
                      placeholder="e.g. ACID Transactions, B+ Tree indexing, Normalization..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Explanation Persona</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'analogy', title: 'Real-World Analogy', sub: 'Airports, Kitchens & Traffic' },
                        { id: 'eli5', title: 'ELI5 (Plain English)', sub: 'Zero confusing jargon' },
                        { id: 'step_by_step', title: 'Step-by-Step Walkthrough', sub: 'Inputs, logic & outputs' },
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setExplainMode(m.id as any)}
                          className={`p-3 rounded-xl text-left border transition-all ${
                            explainMode === m.id
                              ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <p className="text-xs font-bold leading-tight">{m.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{m.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateExplanation}
                    disabled={explainLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {explainLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Consulting Pedagogical AI...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4 text-amber-300" />
                        Explain "{explainTopic || note.title}"
                      </>
                    )}
                  </button>
                </div>
              </div>

              {explainText && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="whitespace-pre-line text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {explainText}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================== */}
          {/* TAB 4: PRACTICE QUIZ                 */}
          {/* ===================================== */}
          {activeTab === 'quiz' && (
            <div className="max-w-2xl mx-auto">
              {quizQuestions.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Dynamic Examination Practice Quiz</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Generate 5 multiple-choice questions automatically synthesized from <strong>{note.title}</strong> to test your retention and exam preparedness.
                  </p>

                  <button
                    onClick={handleLoadQuiz}
                    disabled={quizLoading}
                    className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                  >
                    {quizLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Quiz Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-indigo-200" />
                        Start 5-Question Quiz
                      </>
                    )}
                  </button>
                </div>
              ) : quizSubmitted ? (
                /* QUIZ RESULT CARD */
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-md">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100">
                    <Award className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">Quiz Completed!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your test score for {note.subjectCode} - {note.unit}
                  </p>

                  <div className="my-6 p-4 rounded-2xl bg-slate-50 inline-block border border-slate-200">
                    <span className="text-4xl font-black text-indigo-600">
                      {quizScore} / {quizQuestions.length}
                    </span>
                    <p className="text-xs font-bold text-slate-600 mt-1">
                      {Math.round((quizScore / quizQuestions.length) * 100)}% Mastery Score
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6">
                    {quizScore >= 4
                      ? 'Outstanding performance! You have thoroughly mastered this unit.'
                      : 'Good effort! Review the study notes once more and retry to secure top marks.'}
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleLoadQuiz}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => setActiveTab('summarize')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Review Summary
                    </button>
                  </div>
                </div>
              ) : (
                /* ACTIVE QUIZ QUESTION */
                (() => {
                  const currentQ = quizQuestions[currentQuestionIndex];
                  const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
                  const selectedOpt = selectedAnswers[currentQuestionIndex];
                  const isCorrect = selectedOpt === currentQ.correctIndex;

                  return (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                      {/* Progress header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Question {currentQuestionIndex + 1} of {quizQuestions.length}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100)}% Completed
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                        />
                      </div>

                      {/* Question Text */}
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                        {currentQ.question}
                      </h4>

                      {/* Options */}
                      <div className="space-y-2.5">
                        {currentQ.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          const isOptionCorrect = currentQ.correctIndex === optIdx;

                          let optionStyle = 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700';

                          if (hasAnswered) {
                            if (isOptionCorrect) {
                              optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                            } else if (isOptionSelected && !isOptionCorrect) {
                              optionStyle = 'border-red-400 bg-red-50 text-red-900';
                            } else {
                              optionStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectQuizOption(optIdx)}
                              disabled={hasAnswered}
                              className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm text-left transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                  hasAnswered && isOptionCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : hasAnswered && isOptionSelected
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>

                              {hasAnswered && isOptionCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              )}
                              {hasAnswered && isOptionSelected && !isOptionCorrect && (
                                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Hint section */}
                      {currentQ.hint && !hasAnswered && (
                        <div className="pt-2">
                          {showHints[currentQuestionIndex] ? (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <span>{currentQ.hint}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowHints(prev => ({ ...prev, [currentQuestionIndex]: true }))}
                              className="text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              Show Study Hint
                            </button>
                          )}
                        </div>
                      )}

                      {/* Explanation box when answered */}
                      {hasAnswered && (
                        <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                          isCorrect
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                        }`}>
                          <p className="font-bold mb-1">
                            {isCorrect ? '✅ Correct Answer!' : '💡 Academic Explanation:'}
                          </p>
                          <p>{currentQ.explanation}</p>
                        </div>
                      )}

                      {/* Next / Submit Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                          disabled={currentQuestionIndex === 0}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30"
                        >
                          Previous Question
                        </button>

                        {currentQuestionIndex < quizQuestions.length - 1 ? (
                          <button
                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                            disabled={!hasAnswered}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                          >
                            <span>Next Question</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={handleFinishQuiz}
                            disabled={!hasAnswered}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                          >
                            <span>Submit Quiz</span>
                            <Award className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
