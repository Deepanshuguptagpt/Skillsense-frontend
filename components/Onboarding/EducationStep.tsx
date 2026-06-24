'use client';

import { useState } from 'react';
import { GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useNotificationStore } from '@/lib/notifications';
import type { Education } from '@/types';

interface EducationStepProps {
  onComplete: () => void;
  initialData?: Record<string, any>;
}

const DEGREE_OPTIONS = [
  'Bachelor of Technology (B.Tech)',
  'Bachelor of Engineering (B.E.)',
  'Bachelor of Computer Applications (BCA)',
  'Bachelor of Science (B.Sc)',
  'Master of Technology (M.Tech)',
  'Master of Computer Applications (MCA)',
  'Master of Science (M.Sc)',
  'Diploma',
  'Other',
];

const FIELD_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Other',
];

export default function EducationStep({ onComplete, initialData }: EducationStepProps) {
  const prefill = initialData?.education?.[0];
  const wasPreFilled = !!(prefill?.institution || prefill?.degree || prefill?.field);

  const [institution, setInstitution] = useState(prefill?.institution || '');
  const [degree, setDegree] = useState(prefill?.degree || '');
  const [field, setField] = useState(prefill?.field || '');
  const [gradYear, setGradYear] = useState(
    prefill?.endDate ? new Date(prefill.endDate).getFullYear().toString() : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateProfile } = useProfile();
  const { addNotification } = useNotificationStore();

  const handleSubmit = async () => {
    if (!institution.trim() || !degree || !field || !gradYear) {
      addNotification('error', 'Please fill in all qualification fields');
      return;
    }

    const education: Education[] = [{
      institution: institution.trim(),
      degree,
      field,
      startDate: `${parseInt(gradYear) - (degree.includes('Master') || degree.includes('M.') ? 2 : 4)}-06`,
      endDate: `${gradYear}-12`,
      current: false,
    }];

    setIsSubmitting(true);
    try {
      await updateProfile({ education } as any);
      addNotification('success', 'Qualification details saved');
      onComplete();
    } catch {
      addNotification('error', 'Failed to save qualification details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Just call onComplete — the parent onboarding page sets onboardingComplete
    onComplete();
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <GraduationCap className="h-14 w-14 text-purple-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Qualification Details</h2>
        <p className="text-gray-500 text-sm">
          {wasPreFilled
            ? 'AI extracted these details — please review and confirm'
            : 'Please fill in your education details'}
        </p>      </div>

      {/* Pre-fill notice */}
      {wasPreFilled && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-green-50 border border-green-200 p-3">
          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800">Some details were pre-filled from your resume — please verify them.</p>
        </div>
      )}

      {/* Not-extracted notice */}
      {!wasPreFilled && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">We couldn't find education details in your resume. Please fill them in below.</p>
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Institution / University *</label>
          <input
            type="text"
            value={institution}
            onChange={e => setInstitution(e.target.value)}
            placeholder="e.g., Indian Institute of Technology"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
          <select
            value={degree}
            onChange={e => setDegree(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select degree</option>
            {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
          <select
            value={field}
            onChange={e => setField(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select field</option>
            {FIELD_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year of Graduation *</label>
          <input
            type="number"
            min="2020"
            max="2030"
            value={gradYear}
            onChange={e => setGradYear(e.target.value)}
            placeholder="e.g., 2026"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
          ) : 'Complete Setup →'}
        </button>
      </div>
    </div>
  );
}
