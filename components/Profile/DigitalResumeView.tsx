'use client';

import { useState } from 'react';
import {
  GraduationCap, Briefcase, Code2, Award, ChevronDown, ChevronUp,
  ExternalLink, Calendar, Building, Sparkles, Edit3, Save, X,
  Plus, Trash2, Check,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useDigitalResume } from '@/hooks/useDigitalResume';
import { notify } from '@/hooks/useNotifications';

// ── Reusable inline text field ────────────────────────────────────────────────
function EditableField({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-0.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
      />
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon, title, count, open, onToggle, onEdit, isEditing,
}: {
  icon: React.ElementType; title: string; count: number;
  open: boolean; onToggle: () => void;
  onEdit?: () => void; isEditing?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left">
        <Icon className="h-4 w-4 text-indigo-500" />
        <span className="text-sm font-bold text-slate-800">{title}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{count}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-auto" />}
      </button>
      {open && onEdit && (
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          className={cn(
            'ml-2 flex-shrink-0 rounded-lg px-2 py-1 text-xs font-semibold transition-colors',
            isEditing
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          )}
        >
          {isEditing ? 'Cancel' : <><Edit3 className="h-3 w-3 inline mr-1" />Edit</>}
        </button>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DigitalResumeView() {
  const { digitalResume, isLoading, hasData, refetch } = useDigitalResume();
  const queryClient = useQueryClient();

  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['education', 'experience', 'projects'])
  );
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());

  // Local edit state
  const [eduDraft, setEduDraft] = useState<any[]>([]);
  const [expDraft, setExpDraft] = useState<any[]>([]);
  const [projDraft, setProjDraft] = useState<any[]>([]);
  const [certDraft, setCertDraft] = useState<any[]>([]);

  const saveMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: any }) => {
      await api.put(API_ROUTES.UPDATE_RESUME_SECTION, { section, data });
    },
    onSuccess: (_, { section }) => {
      notify.success(`${section} updated`);
      queryClient.invalidateQueries({ queryKey: ['digital-resume'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      refetch();
    },
    onError: () => notify.error('Failed to save changes'),
  });

  const toggle = (s: string) => setOpenSections(prev => {
    const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n;
  });

  const startEdit = (section: string, currentData: any[]) => {
    setEditingSections(prev => new Set([...prev, section]));
    if (section === 'education') setEduDraft(JSON.parse(JSON.stringify(currentData)));
    if (section === 'experience') setExpDraft(JSON.parse(JSON.stringify(currentData)));
    if (section === 'projects') setProjDraft(JSON.parse(JSON.stringify(currentData)));
    if (section === 'certifications') setCertDraft(JSON.parse(JSON.stringify(currentData)));
  };

  const cancelEdit = (section: string) => {
    setEditingSections(prev => { const n = new Set(prev); n.delete(section); return n; });
  };

  const saveSection = async (section: string, data: any[]) => {
    await saveMutation.mutateAsync({ section, data });
    cancelEdit(section);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-slate-100" />)}
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
        <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-medium">No structured resume yet</p>
        <p className="text-xs text-slate-400 mt-1">Upload your resume above to auto-populate this section</p>
      </div>
    );
  }

  const edu = digitalResume?.education || [];
  const exp = digitalResume?.experience || [];
  const proj = digitalResume?.projects || [];
  const cert = digitalResume?.certifications || [];

  return (
    <div className="space-y-1 divide-y divide-slate-100">

      {/* ── Education ── */}
      <div className="py-1">
        <SectionHeader
          icon={GraduationCap} title="Education" count={edu.length}
          open={openSections.has('education')} onToggle={() => toggle('education')}
          onEdit={() => editingSections.has('education') ? cancelEdit('education') : startEdit('education', edu)}
          isEditing={editingSections.has('education')}
        />
        {openSections.has('education') && (
          <div className="mt-2 space-y-2 pb-2">
            {editingSections.has('education') ? (
              <>
                {eduDraft.map((e, i) => (
                  <div key={i} className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-indigo-700">Entry {i + 1}</span>
                      <button onClick={() => setEduDraft(d => d.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <EditableField label="Institution" value={e.institution || ''} onChange={v => setEduDraft(d => d.map((x, j) => j === i ? { ...x, institution: v } : x))} />
                    <div className="grid grid-cols-2 gap-2">
                      <EditableField label="Degree" value={e.degree || ''} onChange={v => setEduDraft(d => d.map((x, j) => j === i ? { ...x, degree: v } : x))} />
                      <EditableField label="Field" value={e.field || ''} onChange={v => setEduDraft(d => d.map((x, j) => j === i ? { ...x, field: v } : x))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <EditableField label="Grad Year" value={e.endDate || ''} placeholder="2026" onChange={v => setEduDraft(d => d.map((x, j) => j === i ? { ...x, endDate: v } : x))} />
                      <EditableField label="CGPA" value={e.cgpa || ''} placeholder="8.5" onChange={v => setEduDraft(d => d.map((x, j) => j === i ? { ...x, cgpa: v } : x))} />
                    </div>
                  </div>
                ))}
                <button onClick={() => setEduDraft(d => [...d, { institution: '', degree: '', field: '', endDate: '', cgpa: '' }])}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1">
                  <Plus className="h-3.5 w-3.5" /> Add education entry
                </button>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => saveSection('education', eduDraft)}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                  <button onClick={() => cancelEdit('education')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Cancel</button>
                </div>
              </>
            ) : edu.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">No education entries — click Edit to add.</p>
            ) : edu.map((e) => (
              <div key={e.id} className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-800">{e.institution}</p>
                {(e.degree || e.field) && <p className="text-xs text-slate-500 mt-0.5">{[e.degree, e.field].filter(Boolean).join(' · ')}</p>}
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  {e.endDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{e.endDate}</span>}
                  {e.cgpa && <span>CGPA: {e.cgpa}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Experience ── */}
      <div className="py-1">
        <SectionHeader
          icon={Briefcase} title="Work Experience" count={exp.length}
          open={openSections.has('experience')} onToggle={() => toggle('experience')}
          onEdit={() => editingSections.has('experience') ? cancelEdit('experience') : startEdit('experience', exp)}
          isEditing={editingSections.has('experience')}
        />
        {openSections.has('experience') && (
          <div className="mt-2 space-y-2 pb-2">
            {editingSections.has('experience') ? (
              <>
                {expDraft.map((e, i) => (
                  <div key={i} className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-indigo-700">Entry {i + 1}</span>
                      <button onClick={() => setExpDraft(d => d.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <EditableField label="Company" value={e.company || ''} onChange={v => setExpDraft(d => d.map((x, j) => j === i ? { ...x, company: v } : x))} />
                      <EditableField label="Role" value={e.role || ''} onChange={v => setExpDraft(d => d.map((x, j) => j === i ? { ...x, role: v } : x))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <EditableField label="Start" value={e.startDate || ''} placeholder="Jan 2024" onChange={v => setExpDraft(d => d.map((x, j) => j === i ? { ...x, startDate: v } : x))} />
                      <EditableField label="End" value={e.endDate || ''} placeholder="Jun 2024 or Present" onChange={v => setExpDraft(d => d.map((x, j) => j === i ? { ...x, endDate: v } : x))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-0.5">Description</label>
                      <textarea value={e.description || ''} rows={2}
                        onChange={ev => setExpDraft(d => d.map((x, j) => j === i ? { ...x, description: ev.target.value } : x))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100 resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-0.5">Skills used (comma separated)</label>
                      <input type="text" value={(e.skills || []).join(', ')}
                        onChange={ev => setExpDraft(d => d.map((x, j) => j === i ? { ...x, skills: ev.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) } : x))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100" />
                    </div>
                  </div>
                ))}
                <button onClick={() => setExpDraft(d => [...d, { company: '', role: '', startDate: '', endDate: '', description: '', skills: [] }])}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1">
                  <Plus className="h-3.5 w-3.5" /> Add experience entry
                </button>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => saveSection('experience', expDraft)} disabled={saveMutation.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                  <button onClick={() => cancelEdit('experience')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Cancel</button>
                </div>
              </>
            ) : exp.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">No experience entries — click Edit to add.</p>
            ) : exp.map((e) => (
              <div key={e.id} className="rounded-lg bg-slate-50 px-3 py-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{e.role}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5"><Building className="h-3 w-3" />{e.company}</p>
                  </div>
                  {(e.startDate || e.endDate) && (
                    <p className="flex-shrink-0 text-xs text-slate-400">{[e.startDate, e.endDate].filter(Boolean).join(' – ')}</p>
                  )}
                </div>
                {e.description && <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">{e.description}</p>}
                {e.skills && e.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {e.skills.map((s: string) => <span key={s} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{s}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Projects ── */}
      <div className="py-1">
        <SectionHeader
          icon={Code2} title="Projects" count={proj.length}
          open={openSections.has('projects')} onToggle={() => toggle('projects')}
          onEdit={() => editingSections.has('projects') ? cancelEdit('projects') : startEdit('projects', proj)}
          isEditing={editingSections.has('projects')}
        />
        {openSections.has('projects') && (
          <div className="mt-2 space-y-2 pb-2">
            {editingSections.has('projects') ? (
              <>
                {projDraft.map((p, i) => (
                  <div key={i} className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-indigo-700">Project {i + 1}</span>
                      <button onClick={() => setProjDraft(d => d.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <EditableField label="Project Title" value={p.title || ''} onChange={v => setProjDraft(d => d.map((x, j) => j === i ? { ...x, title: v } : x))} />
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-0.5">Description</label>
                      <textarea value={p.description || ''} rows={2}
                        onChange={ev => setProjDraft(d => d.map((x, j) => j === i ? { ...x, description: ev.target.value } : x))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-0.5">Tech Stack (comma separated)</label>
                      <input type="text" value={(p.techStack || []).join(', ')}
                        onChange={ev => setProjDraft(d => d.map((x, j) => j === i ? { ...x, techStack: ev.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) } : x))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none" />
                    </div>
                    <EditableField label="GitHub URL" value={p.githubUrl || ''} placeholder="https://github.com/..." onChange={v => setProjDraft(d => d.map((x, j) => j === i ? { ...x, githubUrl: v } : x))} />
                  </div>
                ))}
                <button onClick={() => setProjDraft(d => [...d, { title: '', description: '', techStack: [], githubUrl: '' }])}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1">
                  <Plus className="h-3.5 w-3.5" /> Add project
                </button>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => saveSection('projects', projDraft)} disabled={saveMutation.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                  <button onClick={() => cancelEdit('projects')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Cancel</button>
                </div>
              </>
            ) : proj.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">No projects — click Edit to add.</p>
            ) : proj.map((p) => (
              <div key={p.id} className="rounded-lg bg-slate-50 px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                  {p.githubUrl && (
                    <a href={p.githubUrl.startsWith('http') ? p.githubUrl : `https://${p.githubUrl}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 flex-shrink-0 text-xs text-indigo-600 hover:underline">
                      GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {p.description && <p className="mt-1 text-xs text-slate-600 line-clamp-2">{p.description}</p>}
                {p.techStack && p.techStack.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.techStack.map((t: string) => <span key={t} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Certifications ── */}
      {(cert.length > 0 || editingSections.has('certifications')) && (
        <div className="py-1">
          <SectionHeader
            icon={Award} title="Certifications" count={cert.length}
            open={openSections.has('certifications')} onToggle={() => toggle('certifications')}
            onEdit={() => editingSections.has('certifications') ? cancelEdit('certifications') : startEdit('certifications', cert)}
            isEditing={editingSections.has('certifications')}
          />
          {openSections.has('certifications') && (
            <div className="mt-2 space-y-2 pb-2">
              {editingSections.has('certifications') ? (
                <>
                  {certDraft.map((c, i) => (
                    <div key={i} className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-indigo-700">Cert {i + 1}</span>
                        <button onClick={() => setCertDraft(d => d.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      <EditableField label="Certificate Name" value={c.name || ''} onChange={v => setCertDraft(d => d.map((x, j) => j === i ? { ...x, name: v } : x))} />
                      <div className="grid grid-cols-2 gap-2">
                        <EditableField label="Issuer" value={c.issuer || ''} placeholder="Coursera, NPTEL..." onChange={v => setCertDraft(d => d.map((x, j) => j === i ? { ...x, issuer: v } : x))} />
                        <EditableField label="Date" value={c.issueDate || ''} placeholder="2024-01" onChange={v => setCertDraft(d => d.map((x, j) => j === i ? { ...x, issueDate: v } : x))} />
                      </div>
                      <EditableField label="Credential URL" value={c.url || ''} placeholder="https://..." onChange={v => setCertDraft(d => d.map((x, j) => j === i ? { ...x, url: v } : x))} />
                    </div>
                  ))}
                  <button onClick={() => setCertDraft(d => [...d, { name: '', issuer: '', issueDate: '', url: '' }])}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1">
                    <Plus className="h-3.5 w-3.5" /> Add certification
                  </button>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => saveSection('certifications', certDraft)} disabled={saveMutation.isPending}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                      <Save className="h-3.5 w-3.5" /> Save
                    </button>
                    <button onClick={() => cancelEdit('certifications')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Cancel</button>
                  </div>
                </>
              ) : cert.map((c) => (
                <div key={c.id} className="flex items-start justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{c.name}</p>
                    {c.issuer && <p className="text-xs text-slate-500">{c.issuer}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {c.issueDate && <p className="text-xs text-slate-400">{c.issueDate}</p>}
                    {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700"><ExternalLink className="h-3 w-3" /></a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add certifications button when section is empty and not editing */}
      {cert.length === 0 && !editingSections.has('certifications') && (
        <div className="py-2">
          <button
            onClick={() => { setOpenSections(prev => new Set([...prev, 'certifications'])); startEdit('certifications', []); }}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add certifications
          </button>
        </div>
      )}
    </div>
  );
}
