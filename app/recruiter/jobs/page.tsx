'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Plus, X, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useRecruiter } from '@/hooks/useRecruiter';
import { useTargetRoles } from '@/hooks/useTargetRole';
import { RecruiterJob } from '@/types';
import RecruiterLayout from '@/components/Layout/RecruiterLayout';

export default function RecruiterJobsPage() {
  const router = useRouter();
  const { getJobs, createJob, isLoading } = useRecruiter();
  const { data: targetRoles = [] } = useTargetRoles();
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    roleType: '',
    description: '',
    durationValue: '',
    durationUnit: 'Months',
    stipend: '',
    deadline: '',
    requiredSkills: [{ name: '', proficiencyLevel: 60, mandatory: true, weight: 1.0 }]
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const data = await getJobs();
    setJobs(data);
  };

  const handleAddSkill = () => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, { name: '', proficiencyLevel: 60, mandatory: true, weight: 1.0 }]
    }));
  };

  const handleSkillChange = (index: number, field: string, value: string | number | boolean) => {
    const newSkills = [...formData.requiredSkills];
    (newSkills[index] as Record<string, string | number | boolean>)[field] = value;
    setFormData({ ...formData, requiredSkills: newSkills });
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = formData.requiredSkills.filter((_, i) => i !== index);
    setFormData({ ...formData, requiredSkills: newSkills });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      roleType: formData.roleType,
      description: formData.description,
      duration: formData.durationValue ? `${formData.durationValue} ${formData.durationUnit}` : undefined,
      stipend: formData.stipend,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      requiredSkills: formData.requiredSkills.map(s => ({
        name: s.name,
        proficiencyLevel: parseInt(s.proficiencyLevel as unknown as string),
        mandatory: s.mandatory,
        weight: parseFloat(s.weight as unknown as string)
      }))
    };

    const newJob = await createJob(payload);
    if (newJob) {
      setIsModalOpen(false);
      setFormData({
        title: '',
        roleType: 'frontend-engineer',
        description: '',
        durationValue: '',
        durationUnit: 'Months',
        stipend: '',
        deadline: '',
        requiredSkills: [{ name: '', proficiencyLevel: 60, mandatory: true, weight: 1.0 }]
      });
      fetchJobs();
    }
  };

  return (
    <RecruiterLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Job Postings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and track your published internship opportunities.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            Create Posting
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="card group hover:border-indigo-200 transition-all cursor-pointer overflow-hidden border-slate-100" onClick={() => router.push(`/recruiter/jobs/${job.id}/candidates`)}>                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      job.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">{job.title}</h3>
                  <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-tighter">{job.role_type.replace('-', ' ')}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-xs font-medium text-slate-500">
                    {job.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {job.duration}
                      </div>
                    )}
                    {job.deadline && (
                      <div className="flex items-center gap-1 text-red-500">
                        <Clock className="h-3.5 w-3.5" />
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    )}
                    {job.stipend && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {job.stipend}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Posted {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-500 line-clamp-3 mb-6 min-h-[60px]">
                    {job.description || 'No description provided for this job posting.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-50">
                    {job.required_skills?.slice(0, 3).map((skill: { name: string }) => (
                      <span key={skill.name} className="px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600">
                        {skill.name}
                      </span>
                    ))}
                    {(job.required_skills?.length || 0) > 3 && (
                      <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400">
                        +{(job.required_skills?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : !isLoading ? (
            <div className="col-span-full py-20 card text-center">
              <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No Job Postings Yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Create your first job posting to start receiving AI-ranked candidate matches.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all"
              >
                Get Started
              </button>
            </div>
          ) : null}
        </div>

        {/* Create Job Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Create Internship Posting</h2>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter font-bold">New Opportunity</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-400 hover:text-slate-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Job Title</label>
                    <input 
                      required
                      placeholder="e.g. Full Stack Developer Intern"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Target Role</label>
                    <select
                      required
                      value={formData.roleType}
                      onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    >
                      <option value="" disabled>Select a role...</option>
                      {targetRoles.map((role) => (
                        <option key={role.id} value={role.slug}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Duration</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        min="1"
                        placeholder="e.g. 6"
                        value={formData.durationValue}
                        onChange={(e) => setFormData({ ...formData, durationValue: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      />
                      <select
                        value={formData.durationUnit}
                        onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                        className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      >
                        <option value="Months">Months</option>
                        <option value="Years">Years</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Stipend</label>
                    <input 
                      placeholder="e.g. ₹25,000 / month"
                      value={formData.stipend}
                      onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Application Deadline</label>
                    <input 
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Job Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Briefly describe the internship role and responsibilities..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Required Skills Mapping</label>
                    <button 
                      type="button" 
                      onClick={handleAddSkill}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Skill
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.requiredSkills.map((skill, idx) => (
                      <div key={idx} className="flex gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Skill Name</label>
                          <input 
                            required
                            placeholder="e.g. React"
                            value={skill.name}
                            onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                        <div className="w-20 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Level %</label>
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={skill.proficiencyLevel}
                            onChange={(e) => handleSkillChange(idx, 'proficiencyLevel', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2 pb-2 px-1">
                          <input 
                            type="checkbox"
                            checked={skill.mandatory}
                            onChange={(e) => handleSkillChange(idx, 'mandatory', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter cursor-pointer">Mandatory</label>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSkill(idx)}
                          className="p-2.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 rounded-2xl bg-slate-900 font-bold text-white shadow-lg hover:bg-slate-800 transition-all text-sm disabled:opacity-50"
                  >
                    {isLoading ? 'Publishing...' : 'Publish Job Posting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}
