'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/lib/notifications';

// ── Per-type visual config ────────────────────────────────────────────────────
const CONFIG = {
  success: {
    icon: CheckCircle,
    bar:  'bg-emerald-500',
    bg:   'bg-white border-emerald-200',
    icon_color: 'text-emerald-500',
    text: 'text-slate-800',
  },
  error: {
    icon: AlertCircle,
    bar:  'bg-red-500',
    bg:   'bg-white border-red-200',
    icon_color: 'text-red-500',
    text: 'text-slate-800',
  },
  warning: {
    icon: AlertTriangle,
    bar:  'bg-amber-400',
    bg:   'bg-white border-amber-200',
    icon_color: 'text-amber-500',
    text: 'text-slate-800',
  },
  info: {
    icon: Info,
    bar:  'bg-blue-500',
    bg:   'bg-white border-blue-200',
    icon_color: 'text-blue-500',
    text: 'text-slate-800',
  },
} as const;

export default function NotificationBanner() {
  const { notifications, removeNotification } = useNotificationStore();

  // Show at most 4 at a time (newest on top)
  const visible = [...notifications].reverse().slice(0, 4);

  if (visible.length === 0) return null;

  return (
    <div
      className="fixed right-4 top-5 z-[9999] flex flex-col gap-2.5"
      aria-live="polite"
      aria-label="Notifications"
    >
      {visible.map((n) => {
        const cfg = CONFIG[n.type] ?? CONFIG.info;
        const Icon = cfg.icon;

        return (
          <div
            key={n.id}
            className={cn(
              'relative flex w-[340px] items-start gap-3 overflow-hidden rounded-xl border shadow-lg',
              'animate-in slide-in-from-right-5 fade-in duration-300',
              cfg.bg
            )}
          >
            {/* Left accent bar */}
            <div className={cn('absolute left-0 top-0 h-full w-1 rounded-l-xl', cfg.bar)} />

            <div className="flex flex-1 items-start gap-3 px-4 py-3 pl-5">
              <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', cfg.icon_color)} />
              <p className={cn('flex-1 text-sm font-medium leading-snug', cfg.text)}>
                {n.message}
              </p>
              <button
                onClick={() => removeNotification(n.id)}
                className="ml-1 mt-0.5 flex-shrink-0 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Auto-dismiss progress bar (only when duration is finite) */}
            {n.duration && n.duration > 0 && (
              <div
                className={cn('absolute bottom-0 left-0 h-0.5 rounded-bl-xl', cfg.bar, 'opacity-30')}
                style={{
                  width: '100%',
                  animation: `shrink ${n.duration}ms linear forwards`,
                }}
              />
            )}
          </div>
        );
      })}

      {/* Keyframe for progress bar shrink */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
}
