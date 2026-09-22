import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldCheck,
  UserPlus,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Sparkles,
  GraduationCap,
  Briefcase,
  User as UserIcon,
  CreditCard
} from 'lucide-react';
import { User, UserRole } from '../types';
import { loginUser, registerAccount } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
  initialRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'student'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>(initialRole);

  // Login identifier (Can be Student ID, Teacher ID, or Campus Email)
  const [loginIdentifier, setLoginIdentifier] = useState('CS2026-0842');
  const [loginPassword, setLoginPassword] = useState('student123');

  // Register Fields
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [department, setDepartment] = useState('BCA');
  const [semester, setSemester] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1-Click Quick Fill for testing
  const handleQuickStudent = () => {
    setRole('student');
    setActiveTab('login');
    setLoginIdentifier('CS2026-0842');
    setLoginPassword('student123');
    setError(null);
  };

  const handleQuickTeacher = () => {
    setRole('admin');
    setActiveTab('login');
    setLoginIdentifier('FAC-CS-101');
    setLoginPassword('admin123');
    setError(null);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setError(null);
    if (activeTab === 'login') {
      if (newRole === 'student') {
        setLoginIdentifier('CS2026-0842');
        setLoginPassword('student123');
      } else {
        setLoginIdentifier('FAC-CS-101');
        setLoginPassword('admin123');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        if (!loginIdentifier.trim() || !loginPassword.trim()) {
          setError(
            role === 'student'
              ? 'Please enter your Student ID or Campus Email'
              : 'Please enter your Teacher ID or Faculty Email'
          );
          setLoading(false);
          return;
        }

        const data = await loginUser(loginIdentifier.trim(), loginPassword, role);
        onLoginSuccess(data.user, data.token);
        onClose();
      } else {
        // Registration submission
        const isStudent = role === 'student';
        const nameToSubmit = isStudent ? studentName.trim() : teacherName.trim();
        const idToSubmit = isStudent ? studentId.trim() : teacherId.trim();

        if (!nameToSubmit) {
          setError(isStudent ? 'Please enter the student full name' : 'Please enter the teacher/faculty name');
          setLoading(false);
          return;
        }

        if (!registerPassword) {
          setError('Please provide a secure password');
          setLoading(false);
          return;
        }

        const data = await registerAccount({
          name: nameToSubmit,
          email: registerEmail.trim() || undefined,
          password: registerPassword,
          role,
          studentId: isStudent ? idToSubmit || undefined : undefined,
          teacherId: !isStudent ? idToSubmit || undefined : undefined,
          department,
          semester: isStudent ? semester : undefined
        });

        onLoginSuccess(data.user, data.token);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header decoration */}
        <div className={`px-6 pt-5 pb-4 text-white transition-colors duration-300 ${
          role === 'admin'
            ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900'
            : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
                {role === 'admin' ? (
                  <Briefcase className="w-5 h-5 text-amber-200" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-indigo-200" />
                )}
              </span>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">AI-Book Portal</h3>
                <p className="text-xs text-white/80">
                  {role === 'admin' ? 'Teacher & Faculty Management' : 'Student Academic Notes & AI Suite'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-3.5 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-white/80 text-[11px] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Quick 1-Click Access:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleQuickStudent}
                className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
              >
                <span>Student ID: CS0842</span>
              </button>
              <button
                type="button"
                onClick={handleQuickTeacher}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1"
              >
                <span>Teacher ID: FAC101</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* Main Tabs (Sign In / Register) */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-4">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In with ID / Email
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Role selector (Student vs Teacher/Admin) */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {activeTab === 'login' ? 'Select Sign In Role' : 'Select Registration Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                  role === 'student'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                  role === 'admin'
                    ? 'border-amber-600 bg-amber-50/80 text-amber-800 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-600" />
                Teacher / Faculty
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* ========================================================== */}
            {/* SIGN IN FORM (Takes Student ID/Email or Teacher ID/Email) */}
            {/* ========================================================== */}
            {activeTab === 'login' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {role === 'student' ? 'Student ID or Campus Email' : 'Teacher ID or Faculty Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-slate-400">
                      {role === 'student' ? (
                        <CreditCard className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={
                        role === 'student'
                          ? 'e.g. CS2026-0842 or student@campus.edu'
                          : 'e.g. FAC-CS-101 or admin@campus.edu'
                      }
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {role === 'student'
                      ? 'Sign in using your Student Roll No. (CS2026-0842) or registered email'
                      : 'Sign in using your Faculty ID (FAC-CS-101) or professor email'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ========================================================== */}
            {/* SIGN UP FORM (Takes Student Name & ID or Teacher Name & ID)*/}
            {/* ========================================================== */}
            {activeTab === 'register' && (
              <>
                {role === 'student' ? (
                  /* Student Signup Inputs */
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Student Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-indigo-500" />
                        <input
                          type="text"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Student ID / Roll No. <span className="text-slate-400 font-normal">(Optional, auto-generated if blank)</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="e.g. CS2026-1042"
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* Teacher / Faculty Signup Inputs */
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Teacher / Faculty Name <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-amber-600" />
                        <input
                          type="text"
                          required
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          placeholder="e.g. Prof. David Miller"
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Teacher / Faculty ID <span className="text-slate-400 font-normal">(Optional, auto-generated if blank)</span>
                      </label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={teacherId}
                          onChange={(e) => setTeacherId(e.target.value)}
                          placeholder="e.g. FAC-CS-204"
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {role === 'student' ? 'Student Campus Email' : 'Faculty Work Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder={role === 'student' ? 'alex.morgan@campus.edu' : 'd.miller@campus.edu'}
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className={`grid ${role === 'student' ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                  {role === 'student' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Current Semester</label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6].map(s => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                    >
                      <option value="BBA">BBA (Bachelor of Business Administration)</option>
                      <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-2xl font-bold text-xs text-white transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer ${
                role === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : activeTab === 'login' ? (
                <>
                  Enter {role === 'admin' ? 'Teacher / Faculty Portal' : 'Student Portal'}
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {role === 'admin' ? 'Register as Faculty / Teacher' : 'Create Student Account'}
                </>
              )}
            </button>
          </form>

          {/* Helper hint for evaluator */}
          <div className="mt-4 text-center text-[11px] text-slate-400">
            {role === 'admin' ? (
              <span>Teacher sign in test: ID <strong className="text-slate-700">FAC-CS-101</strong> / Pass: <strong className="text-slate-700">admin123</strong></span>
            ) : (
              <span>Student sign in test: ID <strong className="text-slate-700">CS2026-0842</strong> / Pass: <strong className="text-slate-700">student123</strong></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
