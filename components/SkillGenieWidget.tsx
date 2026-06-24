'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles, X, Send, Minimize2, Maximize2,
  ChevronRight, Loader2, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSkillGenie, SGMessage } from '@/hooks/useSkillGenie';
import { useAuthStore } from '@/lib/auth';

// Pages where widget should NOT appear
const EXCLUDED_PATHS = ['/landing', '/auth/signin', '/auth/signup', '/auth/verify-email',
  '/auth/forgot-password', '/auth/reset-password', '/skillgenie'];

// Map current page to context for SkillGenie
function getPageContext(pathname: string): Record<string, unknown> {
  if (pathname.startsWith('/internships')) return { page: 'internships' };
  if (pathname.startsWith('/dashboard')) return { page: 'dashboard' };
  if (pathname.startsWith('/profile')) return { page: 'profile' };
  if (pathname.startsWith('/projects')) return { page: 'projects' };
  if (pathname.startsWith('/learning')) return { page: 'learning' };
  return { page: 'other' };
}

// Renders **bold** markdown
function MsgContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
        )
      )}
    </span>
  );
}

export default function SkillGenieWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pageContext = getPageContext(pathname);
  const { messages, isTyping, sendMessage, sgContext, proactiveSuggestions } =
    useSkillGenie();

  // Auto-scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Don't show on excluded paths or for recruiters
  if (
    EXCLUDED_PATHS.some((p) => pathname.startsWith(p)) ||
    user?.role === 'recruiter' ||
    pathname.startsWith('/recruiter')
  ) {
    return null;
  }

  // Send greeting when first opened
  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    if (!hasGreeted && messages.length === 0) {
      setHasGreeted(true);
      // Send a silent context message to get a personalized greeting
      sendMessage('hello', { pageContext });
    }
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input, { pageContext });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (s: string) => {
    sendMessage(s, { pageContext });
  };

  const openFullPage = () => {
    router.push('/skillgenie');
    setIsOpen(false);
  };

  // Unread indicator — show pulse when widget is closed and there are suggestions
  const showPulse = !isOpen && proactiveSuggestions.length > 0;

  return (
    <>
      {/* ── Floating button ── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open SkillGenie"
        >
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
            {/* Button */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl transition-all duration-200 group-hover:scale-110">
              <Sparkles className="h-6 w-6 text-white" />
              {/* Pulse indicator */}
              {showPulse && (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                </span>
              )}
            </div>
          </div>
          {/* Tooltip */}
          <div className="pointer-events-none absolute bottom-full right-0 mb-2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap shadow-lg">
              SkillGenie AI
              <div className="absolute right-4 top-full -mt-px border-4 border-transparent border-t-slate-900" />
            </div>
          </div>
        </button>
      )}

      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200',
            isMinimized ? 'h-14 w-80' : 'h-[520px] w-96'
          )}
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">SkillGenie</p>
                {!isMinimized && sgContext?.readiness_score !== undefined && sgContext.readiness_score !== null && (
                  <p className="text-xs text-indigo-200">
                    {sgContext.readiness_score}% readiness · {sgContext.target_role || 'No target role'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={openFullPage}
                title="Open full SkillGenie"
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              >
                {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                {/* Empty state with suggestions */}
                {messages.length === 0 && !isTyping && (
                  <div className="space-y-2 pt-2">
                    <p className="text-center text-xs font-medium text-slate-400">
                      Ask me anything about your career
                    </p>
                    {proactiveSuggestions.slice(0, 3).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(s)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        {s}
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Message list */}
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    onSuggestion={handleSuggestion}
                    onRedirect={(path) => { router.push(path); setIsOpen(false); }}
                  />
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="mr-1.5 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-2 shadow-sm">
                      <div className="flex gap-1">
                        {[0, 120, 240].map((d) => (
                          <div key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
                            style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 border-t border-slate-200 bg-white p-3 rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    disabled={isTyping}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isTyping ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function MessageBubble({
  msg,
  onSuggestion,
  onRedirect,
}: {
  msg: SGMessage;
  onSuggestion: (s: string) => void;
  onRedirect: (path: string) => void;
}) {
  return (
    <div>
      <div className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
        {msg.role === 'assistant' && (
          <div className="mr-1.5 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
        )}
        <div className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
          msg.role === 'user'
            ? 'rounded-br-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
            : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800 shadow-sm'
        )}>
          <MsgContent content={msg.content} />
        </div>
      </div>

      {/* Suggestions */}
      {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
        <div className="ml-7 mt-1.5 flex flex-wrap gap-1">
          {msg.suggestions.slice(0, 3).map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestion(s)}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Redirect */}
      {msg.role === 'assistant' && msg.redirect && (
        <div className="ml-7 mt-1.5">
          <button
            onClick={() => onRedirect(msg.redirect!)}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Go there <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
