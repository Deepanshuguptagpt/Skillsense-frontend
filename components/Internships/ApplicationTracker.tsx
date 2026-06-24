'use client';

import { useState } from 'react';
import { Bookmark, Send, Star, XCircle, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApplications } from '@/hooks/useApplications';

interface ApplicationTrackerProps {
  internshipId: string;
  internshipTitle: string;
  company: string;
  applicationUrl?: string;
  compact?: boolean;
}

const STATUS_CONFIG = {
  saved: {
    label: 'Saved',
    icon: Bookmark,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    activeColor: 'bg-slate-700 text-white border-slate-700',
  },
  applied: {
    label: 'Applied',
    icon: Send,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-600 text-white border-blue-600',
  },
  shortlisted: {
    label: 'Shortlisted',
    icon: Star,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    activeColor: 'bg-amber-500 text-white border-amber-500',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-red-50 text-red-600 border-red-200',
    activeColor: 'bg-red-500 text-white border-red-500',
  },
  withdrawn: {
    label: 'Withdrawn',
    icon: XCircle,
    color: 'bg-gray-50 text-gray-500 border-gray-200',
    activeColor: 'bg-gray-500 text-white border-gray-500',
  },
} as const;

type Status = keyof typeof STATUS_CONFIG;

export default function ApplicationTracker({
  internshipId,
  internshipTitle,
  company,
  applicationUrl,
  compact = false,
}: ApplicationTrackerProps) {
  const { getStatusForInternship, upsertApplication, deleteApplication, applications, isUpserting } = useApplications();
  const [open, setOpen] = useState(false);

  const currentStatus = getStatusForInternship(internshipId);
  const currentApp = applications.find(a => a.internshipId === internshipId);

  const handleSelect = (status: Status) => {
    if (currentStatus === status) {
      // Toggle off — remove application
      if (currentApp) deleteApplication(currentApp.id);
    } else {
      upsertApplication({
        internship_id: internshipId,
        internship_title: internshipTitle,
        company,
        status,
        application_url: applicationUrl,
      });
    }
    setOpen(false);
  };

  if (compact) {
    // Compact mode: just a small status badge/button
    const cfg = currentStatus ? STATUS_CONFIG[currentStatus] : null;
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
            cfg ? cfg.activeColor : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
          )}
        >
          {cfg ? (
            <>
              <cfg.icon className="h-3 w-3" />
              {cfg.label}
            </>
          ) : (
            <>
              <Bookmark className="h-3 w-3" />
              Track
            </>
          )}
          <ChevronDown className="h-3 w-3" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
              {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([status, cfg]) => (
                <button
                  key={status}
                  onClick={() => handleSelect(status)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50',
                    currentStatus === status ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700'
                  )}
                >
                  <cfg.icon className="h-3.5 w-3.5" />
                  {cfg.label}
                  {currentStatus === status && <Check className="h-3 w-3 ml-auto text-indigo-600" />}
                </button>
              ))}
              {currentStatus && (
                <button
                  onClick={() => { if (currentApp) deleteApplication(currentApp.id); setOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 border-t border-slate-100"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full mode: row of status buttons
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([status, cfg]) => {
        const isActive = currentStatus === status;
        return (
          <button
            key={status}
            onClick={() => handleSelect(status)}
            disabled={isUpserting}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              isActive ? cfg.activeColor : cfg.color + ' hover:opacity-80'
            )}
          >
            <cfg.icon className="h-3 w-3" />
            {cfg.label}
            {isActive && <Check className="h-3 w-3" />}
          </button>
        );
      })}
    </div>
  );
}
