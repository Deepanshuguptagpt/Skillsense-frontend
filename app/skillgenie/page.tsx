'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles, Send, ArrowLeft, BookOpen, Map, Briefcase,
  Target, TrendingUp, Loader2, ChevronRight, Zap, Plus,
  Trash2, Edit3, MessageSquare, Menu, X, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSkillGenie, useSkillGenieSessions, SGSession } from '@/hooks/useSkillGenie';
import { APP_ROUTES } from '@/lib/constants';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

// ── Quick action chips ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: BookOpen, label: 'Learn a skill',    prompt: 'Help me learn a new skill for my target role' },
  { icon: Map,      label: 'Get a roadmap',    prompt: 'Create a learning roadmap for me' },
  { icon: Briefcase,label: 'Internships',      prompt: 'Show my internship matches and eligibility' },
  { icon: Target,   label: 'Interview prep',   prompt: 'Help me prepare for interviews' },
];

// ── Sidebar session item ──────────────────────────────────────────────────────
function SessionItem({
  session, isActive, onSelect, onRename, onDelete,
}: {
  session: SGSession; isActive: boolean;
  onSelect: () => void; onRename: (t: string) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    if (draft.trim() && draft.trim() !== session.title) onRename(draft.trim());
    setEditing(false);
  };

  return (
    <div
      onClick={!editing ? onSelect : undefined}
      className={cn(
        'group relative flex items-start gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer transition-all select-none',
        isActive ? 'bg-white/20' : 'hover:bg-white/10'
      )}
    >
      <MessageSquare className={cn('mt-0.5 h-3.5 w-3.5 flex-shrink-0', isActive ? 'text-white' : 'text-indigo-300')} />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(session.title); setEditing(false); } }}
            onClick={e => e.stopPropagation()}
            className="w-full bg-white/20 rounded px-1.5 py-0.5 text-xs text-white outline-none border border-white/30"
          />
        ) : (
          <>
            <p className={cn('truncate text-xs font-medium leading-snug', isActive ? 'text-white' : 'text-indigo-100')}>
              {session.title || 'New conversation'}
            </p>
            {session.last_message && (
              <p className="truncate text-[10px] text-indigo-400 mt-0.5">{session.last_message}</p>
            )}
          </>
        )}
      </div>

      {/* hover actions */}
      {!editing && (
        <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); setEditing(true); }}
            className="rounded p-1 hover:bg-white/20 text-indigo-300 hover:text-white transition-colors" title="Rename">
            <Edit3 className="h-3 w-3" />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            className="rounded p-1 hover:bg-red-400/30 text-indigo-300 hover:text-red-300 transition-colors" title="Delete">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Markdown bold renderer ────────────────────────────────────────────────────
function MsgContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{p}</span>
      )}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function SkillGeniePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode         = searchParams.get('mode') || 'general';
  const skillParam   = searchParams.get('skill') || '';
  const internshipParam = searchParams.get('internship') || '';
  const qParam       = searchParams.get('q') || '';
  const scoreParam   = searchParams.get('score') || '';
  const weakAreasParam = searchParams.get('weakAreas') || '';

  const [sidebarOpen,     setSidebarOpen]     = useState(true);
  const hasAutoStartedRef = useRef(false);
  const [input,           setInput]           = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();

  const {
    messages, isTyping, sendMessage, startNewChat, loadSession, sgContext, proactiveSuggestions,
  } = useSkillGenie(mode, activeSessionId);

  const {
    sessions, isLoading: sessionsLoading,
    createSession, renameSession, deleteSession, isCreating,
  } = useSkillGenieSessions();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-start flows from URL params
  useEffect(() => {
    if (hasAutoStartedRef.current) return;
    if (mode === 'unlock' && skillParam) {
      hasAutoStartedRef.current = true;
      sendMessage(`Help me unlock ${skillParam}`, {
        mode: 'skill_unlock', skillContext: skillParam,
        internshipContext: internshipParam || undefined,
      });
    } else if (mode === 'unlock_assistance' && skillParam) {
      hasAutoStartedRef.current = true;
      let weakAreasStr = 'unknown areas';
      try {
        if (weakAreasParam) weakAreasStr = JSON.parse(weakAreasParam).join(', ');
      } catch (e) {}
      sendMessage(`I just took an assessment for ${skillParam} and scored ${scoreParam}%. My weak areas are: ${weakAreasStr}. Help me improve so I can unlock my target internship!`, {
        mode: 'skill_unlock_assistance', skillContext: skillParam,
        internshipContext: internshipParam || undefined,
      });
    } else if (qParam && mode === 'general') {
      hasAutoStartedRef.current = true;
      sendMessage(qParam);
    }
  }, [mode, skillParam, internshipParam, qParam, sendMessage, scoreParam, weakAreasParam]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isTyping) return;
    sendMessage(input, { mode: mode !== 'general' ? mode : undefined });
    setInput('');
  }, [input, isTyping, sendMessage, mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleNewChat = () => {
    // Clear messages + reset session ref in hook
    startNewChat();
    // Also reset local active session so the header shows "New conversation"
    setActiveSessionId(undefined);
    hasAutoStartedRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelectSession = async (sessionId: string) => {
    // Load messages into hook (also sets activeSessionIdRef inside the hook)
    await loadSession(sessionId);
    // Keep page state in sync
    setActiveSessionId(sessionId);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    if (activeSessionId === sessionId) {
      startNewChat();
      setActiveSessionId(undefined);
    }
  };

  // Group sessions by date label (Today / Yesterday / date)
  const grouped = sessions.reduce<Record<string, SGSession[]>>((acc, s) => {
    const d = new Date(s.updated_at).toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const label = d === today ? 'Today' : d === yesterday ? 'Yesterday'
      : new Date(s.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    (acc[label] = acc[label] || []).push(s);
    return acc;
  }, {});

  const isEmpty = messages.length === 0 && !isTyping;
  const activeSession = sessions.find(s => s.session_id === activeSessionId);

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className={cn(
        'flex flex-col flex-shrink-0 bg-gradient-to-b from-indigo-700 via-indigo-800 to-violet-900 transition-all duration-200',
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">SkillGenie</span>
          </div>
          <button onClick={handleNewChat} disabled={isCreating} title="New chat"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-white disabled:opacity-50">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/20">
          {sessionsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-300" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <MessageSquare className="h-8 w-8 text-indigo-400/50 mx-auto mb-2" />
              <p className="text-xs text-indigo-400">No conversations yet.</p>
              <p className="text-xs text-indigo-500 mt-1">Start chatting to save sessions.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([label, group]) => (
              <div key={label}>
                <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  {label}
                </p>
                {group.map(s => (
                  <SessionItem
                    key={s.session_id}
                    session={s}
                    isActive={activeSessionId === s.session_id}
                    onSelect={() => handleSelectSession(s.session_id)}
                    onRename={title => renameSession({ sessionId: s.session_id, title })}
                    onDelete={() => handleDeleteSession(s.session_id)}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* User context footer */}
        {sgContext?.name && (
          <div className="border-t border-white/10 px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white flex-shrink-0">
                {sgContext.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{sgContext.name}</p>
                <p className="text-[10px] text-indigo-300">
                  {sgContext.readiness_score != null ? `${sgContext.readiness_score}% readiness` : 'Set a target role'}
                  {sgContext.target_role ? ` · ${sgContext.target_role}` : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ══════════ MAIN AREA ══════════ */}
      <div className="flex flex-1 flex-col min-w-0 bg-white">

        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center gap-3 border-b border-slate-200 bg-white/90 backdrop-blur-sm px-4 py-3 h-14">
          {/* Sidebar toggle */}
          <button onClick={() => setSidebarOpen(v => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <Menu className="h-4 w-4" />
          </button>

          {/* Back to dashboard */}
          <button onClick={() => router.push(APP_ROUTES.DASHBOARD)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>

          <span className="text-slate-200">|</span>

          {/* Session title */}
          <span className="text-sm font-semibold text-slate-700 truncate flex-1 min-w-0">
            {activeSession?.title || 'New conversation'}
          </span>

          {/* Skill unlock badge */}
          {(mode === 'unlock' || mode === 'unlock_assistance') && skillParam && (
            <div className="flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 flex-shrink-0">
              <Zap className="h-3 w-3" /> {mode === 'unlock_assistance' ? 'Improving:' : 'Unlocking:'} {skillParam}
            </div>
          )}

          {/* Context pills */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {sgContext?.target_role && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                <Target className="h-3 w-3" />{sgContext.target_role}
              </span>
            )}
            {sgContext?.readiness_score != null && (
              <span className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                sgContext.readiness_score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                sgContext.readiness_score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
              )}>
                <TrendingUp className="h-3 w-3" />{sgContext.readiness_score}%
              </span>
            )}
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 pb-4">

            {/* ── Empty state ── */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {mode === 'unlock' && skillParam
                    ? `Let's unlock ${skillParam}!`
                    : mode === 'unlock_assistance' && skillParam
                    ? `Let's improve your ${skillParam}!`
                    : `Hi${sgContext?.name ? `, ${sgContext.name.split(' ')[0]}` : ''}! I'm SkillGenie`}
                </h1>
                <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
                  {mode === 'unlock' && skillParam
                    ? `I'll guide you step by step to verify ${skillParam} and unlock more internship eligibility.`
                    : mode === 'unlock_assistance' && skillParam
                    ? `I'll help you strengthen your weak areas in ${skillParam} based on your assessment.`
                    : 'Your AI career assistant. Ask me anything — learn skills, plan roadmaps, prep for interviews, or understand your profile.'}
                </p>

                {/* Proactive suggestions */}
                {proactiveSuggestions.length > 0 && (
                  <div className="mt-7 w-full max-w-lg">
                    <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-slate-400">Suggested for you</p>
                    <div className="space-y-2">
                      {proactiveSuggestions.slice(0, 4).map((s, i) => (
                        <button key={i} onClick={() => sendMessage(s)}
                          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                          {s}
                          <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick action buttons */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {QUICK_ACTIONS.map(a => (
                    <button key={a.label} onClick={() => sendMessage(a.prompt)}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                      <a.icon className="h-3.5 w-3.5" />{a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Messages ── */}
            <div className="space-y-5">
              {messages.map(msg => (
                <div key={msg.id}>
                  <div className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'assistant' && (
                      <div className="mr-2.5 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'rounded-br-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                        : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800 shadow-sm'
                    )}>
                      <MsgContent content={msg.content} />
                    </div>
                  </div>

                  {/* Suggestion chips */}
                  {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="ml-9 mt-2 flex flex-wrap gap-1.5">
                      {msg.suggestions.slice(0, 4).map((s, i) => (
                        <button key={i} onClick={() => sendMessage(s)}
                          className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Redirect CTA */}
                  {msg.role === 'assistant' && msg.redirect && (
                    <div className="ml-9 mt-2">
                      <button onClick={() => router.push(msg.redirect!)}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
                        Go there now <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="mr-2.5 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                          style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-4 py-3">
            {/* Quick action chips when chat is active */}
            {!isEmpty && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map(a => (
                  <button key={a.label} onClick={() => sendMessage(a.prompt)}
                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">
                    <a.icon className="h-3 w-3" />{a.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === 'unlock' && skillParam
                    ? `Ask me about ${skillParam}...`
                    : 'Ask me anything about your career...'
                }
                disabled={isTyping}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
              <button onClick={handleSend} disabled={!input.trim() || isTyping}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-center text-xs text-slate-400">
              SkillGenie has full context of your skills, gaps, and target role
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkillGeniePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SkillGeniePageContent />
    </Suspense>
  );
}
