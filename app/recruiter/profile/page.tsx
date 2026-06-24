'use client';

import { useEffect, useState } from 'react';
import { Building, User, Briefcase, Save, CheckCircle } from 'lucide-react';
import RecruiterLayout from '@/components/Layout/RecruiterLayout';
import { useRecruiter } from '@/hooks/useRecruiter';
import { RecruiterProfile } from '@/types';

export default function RecruiterProfilePage() {
  const { getProfile, updateProfile, isLoading } = useRecruiter();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ full_name: '', company: '', designation: '' });

  useEffect(() => {
    getProfile().then((p) => {
      if (p) {
        setProfile(p);
        setForm({ full_name: p.full_name, company: p.company, designation: p.designation ?? '' });
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await updateProfile({ fullName: form.full_name, company: form.company, designation: form.designation } as any);
    if (updated) {
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <RecruiterLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-semibold text-slate-900">Recruiter Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your company and contact information.</p>
        </div>

        {/* Avatar */}
        <div className="card flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-bold text-white flex-shrink-0">
            {form.full_name?.charAt(0).toUpperCase() || 'R'}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{form.full_name || 'Your Name'}</p>
            <p className="text-sm text-slate-500">{form.company || 'Your Company'}</p>
            {profile?.verified && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Verified Recruiter
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="card space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                required
                readOnly={!!profile?.full_name}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Your full name"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm transition-all ${!!profile?.full_name ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Company
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                required
                readOnly={!!profile?.company}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company name"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm transition-all ${!!profile?.company ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Designation
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                readOnly={!!profile?.designation}
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g. HR Manager, Tech Lead"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm transition-all ${!!profile?.designation ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'}`}
              />
            </div>
          </div>

          {(!profile?.full_name || !profile?.company || !profile?.designation) && (
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? 'Saved!' : isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>
      </div>
    </RecruiterLayout>
  );
}
