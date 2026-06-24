'use client';

import { useState } from 'react';
import { Bell, CheckCheck, ExternalLink, Sparkles, Briefcase, Clock, CheckCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useNotifications, AppNotification } from '@/hooks/useNotifications';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  skill_verified: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  new_match: { icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  deadline: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  shortlisted: { icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-50' },
  system: { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();
  const router = useRouter();

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) markOneRead(notif.id);
    if (notif.link) {
      router.push(notif.link);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No notifications yet</p>
                  <p className="text-xs text-slate-300 mt-1">Verify a skill or get shortlisted to see alerts here</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        'flex items-start gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-slate-50',
                        !notif.read && 'bg-indigo-50/40'
                      )}
                    >
                      <div className={cn('flex-shrink-0 rounded-full p-1.5 mt-0.5', cfg.bg)}>
                        <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn('text-xs font-semibold leading-tight', notif.read ? 'text-slate-700' : 'text-slate-900')}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">{timeAgo(notif.createdAt)}</span>
                          {notif.link && (
                            <span className="flex items-center gap-0.5 text-xs text-indigo-500">
                              <ExternalLink className="h-3 w-3" /> View
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2">
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
