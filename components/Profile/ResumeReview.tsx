'use client';

import { useState } from 'react';
import {
  User, GraduationCap, Briefcase, Code2, Award,
  CheckCircle, Edit3, Plus, Trash2, X, Check,
  ChevronDown, ChevronUp, AlertCircle, Sparkles,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotifications';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PersonalInfo {
  name?: string; phone?: string; location?: string;
  linkedinUrl?: string; githubUsername?: string; portfolioUrl?: string;
}
interface EducationEntry {
  id?: string; institution: string; degree?: string; field?: string;
  startDate?: string; endDate?: string; cgpa?: string;
}
interface ExperienceEntry {
  id?: string; company: string; role: string; startDate?: string;
  endDate?: string; description?: string; skills?: string[];
}
interface ProjectEntry {
  id?: string; title: string; description?: string;
  techStack?: string[]; githubUrl?: string; liveUrl?: string;
}
interface CertificationEntry {
  id?: string; name: string; issuer?: string; issueDate?: string; url?: string;
}
interface SkillEntry {
  name: string; category?: string; proficiency?: number; context?: string;
}

export interface DigitalResumeData {
  personalInfo?: PersonalInfo;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  projects?: ProjectEntry[];
  certifications?: CertificationEntry[];
  skills?: SkillEntry[];
}

interface ResumeReviewProps {
  data: DigitalResumeData;
  onConfirm: () => void;
  onEdit?: (section: string, data: any) => void;
  isConfirming?: boolean;
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  icon: Icon, title, count, children, defaultOpen = true,
}: {
  icon: React.ElementType; title: string; count?: number;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
            <Icon className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <span className="text-sm font-bold text-slate-800">{title}</span>
          {count !== undefined && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {count}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
    </div>
  );
}

// ── Skill badge ───────────────────────────────────────────────────────────────

function SkillBadge({ name, proficiency, context }: SkillEntry) {
  const color =
    proficiency && proficiency >= 75 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : proficiency && proficiency >= 60 ? 'bg-blue-100 text-blue-700 border-blue-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', color)}>
      <span>{name}</span>
      {proficiency && <span className="opacity-60">{proficiency}%</span>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResumeReview({ data, onConfirm, isConfirming }: ResumeReviewProps) {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<DigitalResumeData>(data);

  const updateMutation = useMutation({
    mutationFn: async ({ section, sectionData }: { section: string; sectionData: any }) => {
      await api.put(API_ROUTES.UPDATE_RESUME_SECTION, { section, data: sectionData });
    },
    onSuccess: (_, { section }) => {
      const label = section.charAt(0).toUpperCase() + section.slice(1);
      notify.success(`${label} saved successfully!`);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: () => notify.error('Failed to save changes'),
  });

  const pi = localData.personalInfo || {};
  const education = localData.education || [];
  const experience = localData.experience || [];
  const projects = localData.projects || [];
  const certifications = localData.certifications || [];
  const skills = localData.skills || [];

  const totalSections = [
    education.length > 0,
    experience.length > 0,
    projects.length > 0,
    skills.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">AI parsed your resume successfully</p>
            <p className="text-xs text-indigo-200 mt-0.5">
              We found {skills.length} skills, {education.length} education{education.length !== 1 ? 's' : ''}, {experience.length} experience{experience.length !== 1 ? 's' : ''}, {projects.length} project{projects.length !== 1 ? 's' : ''}.
              Review and confirm below.
            </p>
          </div>
        </div>
      </div>

      {/* Missing data warning */}
      {totalSections < 3 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
          <p className="text-xs text-amber-700">
            Some sections couldn't be extracted. You can add them manually after confirming.
          </p>
        </div>
      )}

      {/* Personal Info */}
      <Section icon={User} title="Personal Info">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Name', value: pi.name },
            { label: 'Phone', value: pi.phone },
            { label: 'Location', value: pi.location },
            { label: 'LinkedIn', value: pi.linkedinUrl },
            { label: 'GitHub', value: pi.githubUsername ? `github.com/${pi.githubUsername}` : null },
            { label: 'Portfolio', value: pi.portfolioUrl },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="font-medium text-slate-700 truncate">{value}</p>
            </div>
          ) : null)}
        </div>
      </Section>

      {/* Education */}
      <Section icon={GraduationCap} title="Education" count={education.length}>
        {education.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No education entries extracted. Add manually after confirming.</p>
        ) : (
          <div className="space-y-3">
            {education.map((edu, i) => (
              <div key={edu.id || i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="font-semibold text-sm text-slate-800">{edu.institution}</p>
                {(edu.degree || edu.field) && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    {[edu.degree, edu.field].filter(Boolean).join(' · ')}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  {edu.endDate && <span>Graduating: {edu.endDate}</span>}
                  {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Experience */}
      <Section icon={Briefcase} title="Work Experience" count={experience.length}>
        {experience.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No experience entries extracted.</p>
        ) : (
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <div key={exp.id || i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{exp.role}</p>
                    <p className="text-xs text-slate-600">{exp.company}</p>
                  </div>
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-xs text-slate-400 flex-shrink-0 ml-2">
                      {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
                    </p>
                  )}
                </div>
                {exp.description && (
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{exp.description}</p>
                )}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exp.skills.map((s) => (
                      <span key={s} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Projects */}
      <Section icon={Code2} title="Projects" count={projects.length}>
        {projects.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No projects extracted.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((proj, i) => (
              <div key={proj.id || i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-slate-800">{proj.title}</p>
                  {proj.githubUrl && (
                    <a href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex-shrink-0">GitHub ↗</a>
                  )}
                </div>
                {proj.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{proj.description}</p>
                )}
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {proj.techStack.map((t) => (
                      <span key={t} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Skills */}
      <Section icon={Sparkles} title="Skills Extracted" count={skills.length}>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 30).map((skill) => (
            <SkillBadge key={skill.name} {...skill} />
          ))}
          {skills.length > 30 && (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
              +{skills.length - 30} more
            </span>
          )}
        </div>
      </Section>

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section icon={Award} title="Certifications" count={certifications.length} defaultOpen={false}>
          <div className="space-y-2">
            {certifications.map((cert, i) => (
              <div key={cert.id || i} className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{cert.name}</p>
                  {cert.issuer && <p className="text-xs text-slate-500">{cert.issuer}</p>}
                </div>
                {cert.issueDate && <p className="text-xs text-slate-400">{cert.issueDate}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Confirm button */}
      <div className="pt-2">
        <button
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
        >
          {isConfirming ? (
            <><span className="animate-spin">⏳</span> Saving...</>
          ) : (
            <><CheckCircle className="h-4 w-4" /> Looks good — Save Profile</>
          )}
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          You can edit any section from your profile page after saving.
        </p>
      </div>
    </div>
  );
}
