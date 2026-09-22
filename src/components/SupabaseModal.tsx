import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Download,
  ExternalLink,
  X,
  Layers,
  Users,
  BookOpen,
  FileText
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DatabaseStatus {
  connected: boolean;
  message: string;
  projectId: string;
  tablesStatus?: Record<string, boolean>;
  recordsInCache?: {
    users: number;
    notes: number;
    subjects: number;
    semesters: number;
  };
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<Record<string, string> | null>(null);
  const [sqlSchema, setSqlSchema] = useState<string>('');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({
        connected: false,
        message: 'Could not connect to database status endpoint',
        projectId: 'odajnpjdimuqagmdcrpt'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async () => {
    try {
      const res = await fetch('/api/database/schema');
      const text = await res.text();
      setSqlSchema(text);
    } catch {
      setSqlSchema('-- Failed to load schema');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      fetchSchema();
    }
  }, [isOpen]);

  const handleCopySchema = async () => {
    if (!sqlSchema) return;
    try {
      await navigator.clipboard.writeText(sqlSchema);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([sqlSchema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase-schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncData = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/database/sync', { method: 'POST' });
      const data = await res.json();
      setSyncResult(data.results || { status: 'Synced' });
      await fetchStatus();
    } catch (err: any) {
      setSyncResult({ error: err.message || 'Sync operation failed' });
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Supabase Database Integration</h2>
              <p className="text-xs text-slate-500">
                Connected Project: <span className="font-mono font-bold text-emerald-700">odajnpjdimuqagmdcrpt</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Connection Status Banner */}
        <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {status?.connected ? 'Supabase Connected & Active' : 'Supabase Client Initialized'}
                </p>
                <p className="text-xs text-slate-500">{status?.message || 'Connecting to Supabase...'}</p>
              </div>
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-white transition-all text-xs flex items-center gap-1 border border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Tables Status Matrix */}
          <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Users className="w-3.5 h-3.5 text-indigo-500" /> users
              </span>
              {status?.tablesStatus?.users ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> notes
              </span>
              {status?.tablesStatus?.notes ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> subjects
              </span>
              {status?.tablesStatus?.subjects ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Layers className="w-3.5 h-3.5 text-purple-500" /> semesters
              </span>
              {status?.tablesStatus?.semesters ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>
          </div>
        </div>

        {/* Sync Data Action */}
        <div className="mt-5 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Synchronize Data to Supabase</h3>
              <p className="text-xs text-slate-500">
                Push all student & admin accounts, semesters, subjects, and digital notes directly into Supabase tables.
              </p>
            </div>
            <button
              onClick={handleSyncData}
              disabled={syncing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing Tables...' : 'Sync All Data Now'}</span>
            </button>
          </div>

          {syncResult && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-100 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Sync Execution Results:</p>
              {Object.entries(syncResult).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="font-mono text-slate-600 capitalize">{key}:</span>
                  <span className={`font-semibold ${String(val).includes('Error') || String(val).includes('Failed') ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions for SQL Schema */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Database Schema & RLS Setup</h3>
              <p className="text-xs text-slate-500">
                Execute this SQL script once in your Supabase Dashboard SQL Editor to initialize tables and security rules.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySchema}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
              </button>
              <button
                onClick={handleDownloadSchema}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 text-slate-300 font-mono text-[11px] p-3.5 rounded-xl max-h-40 overflow-y-auto border border-slate-800">
            <pre className="whitespace-pre-wrap">{sqlSchema ? sqlSchema.slice(0, 1000) + '...' : 'Loading SQL Schema...'}</pre>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>
              1. Open Supabase Dashboard → 2. Go to <strong>SQL Editor</strong> → 3. Paste & Click <strong>Run</strong>
            </span>
            <a
              href={`https://supabase.com/dashboard/project/odajnpjdimuqagmdcrpt/sql`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              Open SQL Editor <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
