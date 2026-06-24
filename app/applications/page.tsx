'use client';

import { useState } from 'react';
import { Bookmark, Send, Star, XCircle, Trash2, ExternalLink, Building2, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';
import { useApplications, Application } from '@/hooks/useApplications';
import { cn } from '@/lib/utils';

const COLUMNS: { status: Application['status']; label: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
  { status: 'saved', label: 'Saved', icon: Bookmark, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  { status: 'applied', label: 'Applied', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { status: 'shortlisted', label: 'Shortlisted', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { status: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
];

function ApplicationCard({ app, onDelete, onStatusChange }: {
  app: Application;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, internshipId: string, title: string, company: string, status: string, url?: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{app.internshipTitle}</p>
          <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <Building2 className="h-3 w-3" /> {app.company}
          </p>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <button
                  onClick={() => { onDelete(app.id); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {app.notes && (
        <p className="mt-2 text-xs text-slate-500 line-clamp-2 italic">{app.notes}</p>
      )}

      {app.appliedAt && (
        <p className="mt-2 text-xs text-slate-400">
          Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        {/* Move to next status */}
        {app.status === 'saved' && (
          <button
            onClick={() => onStatusChange(app.id, app.internshipId, app.internshipTitle, app.company, 'applied', app.applicationUrl)}
            className="flex-1 rounded-lg bg-blue-50 border border-blue-200 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Mark Applied →
          </button>
        )}
        {app.status === 'applied' && (
          <button
            onClick={() => onStatusChange(app.id, app.internshipId, app.internshipTitle, app.company, 'shortlisted', app.applicationUrl)}
            className="flex-1 rounded-lg bg-amber-50 border border-amber-200 px-2 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
          >
            Shortlisted →
          </button>
        )}
        {app.applicationUrl && (
          <a
            href={app.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const { applications, stats, isLoading, upsertApplication, deleteApplication } = useApplications();

  const handleStatusChange = (
    _id: string,
    internshipId: string,
    title: string,
    company: string,
    status: string,
    url?: string
  ) => {
    upsertApplication({
      internship_id: internshipId,
      internship_title: title,
      company,
      status,
      application_url: url,
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <div className="gradient-skeleton h-8 w-48 rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="gradient-skeleton h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Application Tracker</h1>
              <p className="mt-1 text-sm text-slate-500">Track your internship applications from saved to shortlisted</p>
            </div>
            <Link
              href="/internships"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Browse Internships
            </Link>
          </div>

          {/* Stats row */}
          {stats && (
            <div className="mt-4 flex flex-wrap gap-4">
              {[
                { label: 'Saved', value: stats.saved, color: 'text-slate-600' },
                { label: 'Applied', value: stats.applied, color: 'text-blue-600' },
                { label: 'Shortlisted', value: stats.shortlisted, color: 'text-amber-600' },
                { label: 'Rejected', value: stats.rejected, color: 'text-red-500' },
                { label: 'Total', value: stats.total, color: 'text-indigo-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm text-slate-600">
                  <span className={cn('font-bold text-lg', color)}>{value}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty state */}
        {applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center">
            <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-base font-semibold text-slate-700 mb-1">No applications tracked yet</h2>
            <p className="text-sm text-slate-500 mb-6">
              Save or mark internships as applied from the Internships page to track them here.
            </p>
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Browse Internships →
            </Link>
          </div>
        ) : (
          /* Kanban board */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map(({ status, label, icon: Icon, color, bg, border }) => {
              const columnApps = applications.filter(a => a.status === status);
              return (
                <div key={status} className={cn('rounded-xl border p-4', bg, border)}>
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-4 w-4', color)} />
                      <span className={cn('text-sm font-semibold', color)}>{label}</span>
                    </div>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', bg, color, 'border', border)}>
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {columnApps.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-white/50 p-4 text-center">
                        <p className="text-xs text-slate-400">No {label.toLowerCase()} applications</p>
                      </div>
                    ) : (
                      columnApps.map(app => (
                        <ApplicationCard
                          key={app.id}
                          app={app}
                          onDelete={deleteApplication}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
