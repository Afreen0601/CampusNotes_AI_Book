import React from 'react';
import { BookOpen, Sparkles, UserCheck, ShieldCheck, LogIn, LogOut, LayoutDashboard, Compass, Database } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'notes' | 'dashboard' | 'admin' | 'ai';
  onSelectTab: (tab: 'notes' | 'dashboard' | 'admin' | 'ai') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenDemoStudent: () => void;
  onOpenDemoAdmin: () => void;
  onOpenDatabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenLogin,
  onLogout,
  onOpenDemoStudent,
  onOpenDemoAdmin,
  onOpenDatabaseModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('notes')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">AI-Book</span>
                <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-indigo-200/60">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Notes
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Semester-Wise Digital Academic Repository</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            <button
              onClick={() => onSelectTab('notes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Notes Explorer
            </button>

            {currentUser?.role === 'student' && (
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Student Dashboard
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onSelectTab('admin')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Admin Dashboard
              </button>
            )}

            <button
              onClick={() => onSelectTab('ai')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Study Suite
            </button>
          </nav>

          {/* User Auth & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Database Status Button */}
            <button
              onClick={onOpenDatabaseModal}
              title="Supabase Database Status & Sync"
              className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline font-bold">Supabase</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            {!currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-xs text-slate-500">
                  <span>Demo:</span>
                  <button
                    onClick={onOpenDemoStudent}
                    className="text-xs font-semibold text-indigo-600 hover:underline px-1 py-0.5 rounded hover:bg-indigo-50"
                  >
                    Student
                  </button>
                  <span>•</span>
                  <button
                    onClick={onOpenDemoAdmin}
                    className="text-xs font-semibold text-amber-600 hover:underline px-1 py-0.5 rounded hover:bg-amber-50"
                  >
                    Admin
                  </button>
                </div>

                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    currentUser.role === 'admin' ? 'bg-amber-600' : 'bg-indigo-600'
                  }`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      {(currentUser.studentId || currentUser.teacherId) && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600 font-semibold">
                          {currentUser.studentId || currentUser.teacherId}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      {currentUser.role === 'admin' ? (
                        <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" /> Teacher / Faculty
                        </span>
                      ) : (
                        <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                          <UserCheck className="w-2.5 h-2.5" /> Sem {currentUser.semester || 1} Student
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-200/80"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onSelectTab('notes')}
            className={`px-2.5 py-1 rounded-lg font-medium ${activeTab === 'notes' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-600'}`}
          >
            Notes
          </button>
          {currentUser?.role === 'student' && (
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-2.5 py-1 rounded-lg font-medium ${activeTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-600'}`}
            >
              Dashboard
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`px-2.5 py-1 rounded-lg font-medium ${activeTab === 'admin' ? 'text-amber-700 bg-amber-50 font-bold' : 'text-slate-600'}`}
            >
              Admin
            </button>
          )}
          <button
            onClick={() => onSelectTab('ai')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 ${activeTab === 'ai' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-600'}`}
          >
            <Sparkles className="w-3 h-3 text-indigo-500" /> AI Suite
          </button>
        </div>
      </div>
    </header>
  );
};
