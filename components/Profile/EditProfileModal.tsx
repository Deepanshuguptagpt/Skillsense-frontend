'use client';

import { useState } from 'react';
import { X, Save, Loader2, Plus, Trash2, GraduationCap } from 'lucide-react';
import { notify } from '@/hooks/useNotifications';
import type { StudentProfile, Education } from '@/types';

interface EditProfileModalProps {
  profile: StudentProfile;
  onClose: () => void;
  onSave: (updates: Partial<StudentProfile>) => Promise<void>;
}

const emptyEdu = (): Education => ({
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  cgpa: undefined,
  current: false,
});

export default function EditProfileModal({
  profile,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'education'>('personal');

  const [formData, setFormData] = useState({
    name: profile.personalInfo.name || '',
    phone: profile.personalInfo.phone || '',
    location: profile.personalInfo.location || '',
    linkedinUrl: profile.personalInfo.linkedinUrl || '',
    githubUsername: profile.personalInfo.githubUsername || '',
    portfolioUrl: profile.personalInfo.portfolioUrl || '',
    leetcodeUrl: profile.personalInfo.leetcodeUrl || '',
    hackerrankUrl: profile.personalInfo.hackerrankUrl || '',
    codeforcesUrl: profile.personalInfo.codeforcesUrl || '',
    codechefUrl: profile.personalInfo.codechefUrl || '',
  });

  const [education, setEducation] = useState<Education[]>(
    profile.education && profile.education.length > 0
      ? profile.education.map((e) => ({ ...e }))
      : [emptyEdu()]
  );

  const updateEdu = (index: number, field: keyof Education, value: string | number | boolean) => {
    setEducation((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const addEdu = () => setEducation((prev) => [...prev, emptyEdu()]);

  const removeEdu = (index: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        personalInfo: {
          ...profile.personalInfo,
          ...formData,
        },
        education: education.filter((e) => e.institution || e.degree || e.field),
      });
      notify.success('Profile updated successfully!');
      onClose();
    } catch {
      notify.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-2xl max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-shrink-0 border-b border-gray-200 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'personal'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Personal Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'education'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Education
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 p-6">
            {/* ── Personal Info Tab ── */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input w-full" placeholder="Enter your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input w-full" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input w-full" placeholder="City, State" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Social Links</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                      <input type="text" value={formData.linkedinUrl} onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })} className="input w-full" placeholder="linkedin.com/in/username" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Username</label>
                      <input type="text" value={formData.githubUsername} onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })} className="input w-full" placeholder="username" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                      <input type="text" value={formData.portfolioUrl} onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })} className="input w-full" placeholder="yourportfolio.com" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LeetCode URL</label>
                        <input type="text" value={formData.leetcodeUrl} onChange={(e) => setFormData({ ...formData, leetcodeUrl: e.target.value })} className="input w-full" placeholder="leetcode.com/u/username" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HackerRank URL</label>
                        <input type="text" value={formData.hackerrankUrl} onChange={(e) => setFormData({ ...formData, hackerrankUrl: e.target.value })} className="input w-full" placeholder="hackerrank.com/username" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Codeforces URL</label>
                        <input type="text" value={formData.codeforcesUrl} onChange={(e) => setFormData({ ...formData, codeforcesUrl: e.target.value })} className="input w-full" placeholder="codeforces.com/profile/username" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CodeChef URL</label>
                        <input type="text" value={formData.codechefUrl} onChange={(e) => setFormData({ ...formData, codechefUrl: e.target.value })} className="input w-full" placeholder="codechef.com/users/username" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Education Tab ── */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Education</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addEdu}
                    className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Education
                  </button>
                </div>

                {education.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                    <GraduationCap className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No education added yet.</p>
                    <button type="button" onClick={addEdu} className="mt-2 text-sm text-indigo-600 hover:underline">
                      Add your first entry
                    </button>
                  </div>
                )}

                {education.map((edu, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Entry {index + 1}
                      </span>
                      {education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEdu(index)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) => updateEdu(index, 'institution', e.target.value)}
                        className="input w-full text-sm"
                        placeholder="e.g. IIT Delhi, VIT Vellore"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => updateEdu(index, 'degree', e.target.value)}
                          className="input w-full text-sm"
                          placeholder="e.g. B.Tech, MCA"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field || ''}
                          onChange={(e) => updateEdu(index, 'field', e.target.value)}
                          className="input w-full text-sm"
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Year</label>
                        <input
                          type="text"
                          value={edu.startDate || ''}
                          onChange={(e) => updateEdu(index, 'startDate', e.target.value)}
                          className="input w-full text-sm"
                          placeholder="2021"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End Year</label>
                        <input
                          type="text"
                          value={edu.endDate || ''}
                          onChange={(e) => updateEdu(index, 'endDate', e.target.value)}
                          disabled={edu.current}
                          className="input w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="2025"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">CGPA</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={edu.cgpa ?? ''}
                          onChange={(e) =>
                            updateEdu(index, 'cgpa', e.target.value ? parseFloat(e.target.value) : '')
                          }
                          className="input w-full text-sm"
                          placeholder="8.5"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={edu.current}
                        onChange={(e) => {
                          updateEdu(index, 'current', e.target.checked);
                          if (e.target.checked) updateEdu(index, 'endDate', '');
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-gray-600">Currently studying here</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-200 p-6">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
