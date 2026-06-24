'use client';

import { X, CheckCircle, XCircle, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/constants';
import type { InternshipMatch } from '@/types';
import ApplicationTracker from './ApplicationTracker';

interface InternshipDetailModalProps {
  match: InternshipMatch;
  onClose: () => void;
}

export default function InternshipDetailModal({
  match,
  onClose,
}: InternshipDetailModalProps) {
  const router = useRouter();
  const { internship, matchScore, missingSkills, matchedSkills } = match;

  // Deadline urgency
  const daysLeft = internship.daysUntilDeadline;
  const deadlineUrgent = internship.isDeadlineSoon;
  const deadlineLabel = daysLeft === null
    ? 'Rolling / No fixed deadline'
    : daysLeft === 0
      ? 'Closes today!'
      : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left to apply`;

  const handleUnlockWithSkillGenie = () => {
    // Navigate to SkillGenie assessment with missing skills
    const skillsParam = missingSkills.map((s) => typeof s === 'string' ? s : s.skillName).join(',');
    router.push(`${APP_ROUTES.SKILLGENIE_ASSESSMENT}?skills=${encodeURIComponent(skillsParam)}&mode=unlock&internship=${encodeURIComponent(internship.internshipId)}`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 capitalize">
                {internship.category || internship.type}
              </span>
            </div>
            <h2 className="font-sora text-xl font-bold text-slate-900 leading-tight">
              {internship.title}
            </h2>
            <p className="mt-1 text-base font-semibold text-slate-600">{internship.company}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Match Score + Eligibility */}
        <div className={cn(
          "mt-6 rounded-2xl p-5",
          matchScore >= 80 ? 'bg-emerald-50 border border-emerald-100' :
          matchScore >= 55 ? 'bg-amber-50 border border-amber-100' :
          'bg-slate-50 border border-slate-200'
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Match Score</p>
              <p className={cn(
                "mt-1 text-4xl font-extrabold font-sora",
                matchScore >= 80 ? 'text-emerald-700' :
                matchScore >= 55 ? 'text-amber-700' : 'text-slate-700'
              )}>
                {matchScore}%
              </p>
              <span className={cn(
                "mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold",
                matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                matchScore >= 55 ? 'bg-amber-100 text-amber-700' :
                'bg-slate-200 text-slate-600'
              )}>
                {matchScore >= 80 ? '✓ You are eligible' : matchScore >= 55 ? '≈ Almost eligible' : 'Building towards eligibility'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills Matched</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {matchedSkills.length} / {internship.requiredSkills.length}
              </p>
              <div className="mt-2 h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={cn(
                    "h-full rounded-full",
                    matchScore >= 80 ? 'bg-emerald-500' :
                    matchScore >= 55 ? 'bg-amber-400' : 'bg-slate-400'
                  )}
                  style={{ width: `${internship.requiredSkills.length > 0 ? (matchedSkills.length / internship.requiredSkills.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900">About the Role</h3>
          <p className="mt-2 text-gray-700">{internship.description}</p>
        </div>

        {/* Deadline Urgency Banner */}
        {deadlineUrgent && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-red-700">{deadlineLabel}</span>
          </div>
        )}

        {/* Active Window Timeline */}
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Active Window
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Apply by</p>
              <p className={cn(
                'text-sm font-bold',
                deadlineUrgent ? 'text-red-600' : 'text-gray-900'
              )}>
                {internship.applicationDeadline
                  ? new Date(internship.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Rolling'}
              </p>
              {!deadlineUrgent && daysLeft !== null && (
                <p className="text-xs text-gray-400 mt-0.5">{daysLeft}d remaining</p>
              )}
              {deadlineUrgent && daysLeft !== null && (
                <p className="text-xs text-red-500 font-semibold mt-0.5">{deadlineLabel}</p>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-0.5 w-12 bg-indigo-300 rounded" />
              <span className="text-xs text-indigo-400">then</span>
              <div className="h-0.5 w-12 bg-indigo-300 rounded" />
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Starts</p>
              <p className="text-sm font-bold text-gray-900">
                {internship.startDate
                  ? new Date(internship.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'TBD'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{internship.duration}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Location</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{internship.location}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Work Mode</p>
            <p className="mt-1 text-sm font-medium text-slate-800 capitalize">{internship.type}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Duration</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{internship.duration}</p>
          </div>
          {internship.stipend && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stipend</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {internship.stipend.display || `${formatCurrency(internship.stipend.amount)}/${internship.stipend.period}`}
              </p>
            </div>
          )}
          {internship.eligibilityCriteria && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Eligibility</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{internship.eligibilityCriteria}</p>
            </div>
          )}
        </div>

        {/* Matched Skills */}
        {matchedSkills.length > 0 && (
          <div className="mt-6">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <CheckCircle className="h-5 w-5 text-success" />
              Skills You Have
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {matchedSkills.map((skill) => (
                <span key={skill} className="badge badge-success">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="mt-6">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <XCircle className="h-5 w-5 text-danger" />
              Skills to Build
            </h3>
            <div className="mt-3 space-y-3">
              {missingSkills.map((skill) => (
                <div
                  key={skill.skillName}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {skill.skillName}
                      {skill.required && (
                        <span className="ml-2 text-xs text-danger">
                          (Required)
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span>Current: {skill.currentProficiency}%</span>
                      <span>→</span>
                      <span>Target: {skill.targetProficiency}%</span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'badge',
                      skill.priority === 'high'
                        ? 'badge-danger'
                        : skill.priority === 'medium'
                          ? 'badge-warning'
                          : 'badge-neutral'
                    )}
                  >
                    {skill.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 space-y-3">
          {/* Application tracker — track status right from modal */}
          <ApplicationTracker
            internshipId={internship.internshipId}
            internshipTitle={internship.title}
            company={internship.company}
            applicationUrl={internship.applicationUrl}
            compact={false}
          />

          <div className="flex gap-3">
            {missingSkills.length > 0 && (
              <button
                onClick={handleUnlockWithSkillGenie}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-lg"
              >
                Unlock with SkillGenie
              </button>
            )}
            {internship.applicationUrl && (
              <a
                href={internship.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg"
              >
                <ExternalLink className="h-4 w-4" />
                Apply Now
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
