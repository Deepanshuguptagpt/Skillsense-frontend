'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Upload, GraduationCap, ArrowLeft, Sparkles, Briefcase, Target, ChevronDown } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useTargetRoles, useSetTargetRole } from '@/hooks/useTargetRole';
import { notify } from '@/hooks/useNotifications';
import { APP_ROUTES } from '@/lib/constants';
import ResumeUploadStep from '@/components/Onboarding/ResumeUploadStep';
import EducationStep from '@/components/Onboarding/EducationStep';

const STEPS = [
  { id: 'resume', title: 'Upload Resume', description: 'Extract your skills', icon: Upload },
  { id: 'education', title: 'Qualification', description: 'Confirm your details', icon: GraduationCap },
];

function SuccessScreen({ skillCount, onGoToDashboard }: { skillCount: number; onGoToDashboard: () => void }) {
  const { data: roles = [] } = useTargetRoles();
  const setTargetRole = useSetTargetRole();
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roleSaved, setRoleSaved] = useState(false);

  const handleRoleSelect = async (roleId: string) => {
    setSelectedRoleId(roleId);
    try {
      await setTargetRole.mutateAsync(roleId);
      setRoleSaved(true);
      const roleName = roles.find(r => r.id === roleId)?.name || 'role';
      notify.success(`Target role set to ${roleName}!`);
    } catch {
      notify.error('Failed to set target role. Please try again.');
    }
  };

  return (
    <div className="text-center py-4">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Created!</h2>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {skillCount > 0
          ? `We found ${skillCount} skills from your resume.`
          : 'Your profile is set up.'}
        {' '}Now pick your target role to unlock your readiness score.
      </p>

      {/* Target role selector */}
      <div className="mb-6 text-left">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          What role are you targeting? *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`rounded-xl border-2 p-3 text-sm font-medium text-left transition-all ${
                selectedRoleId === role.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-700 hover:border-indigo-300'
              }`}
            >
              {role.name}
            </button>
          ))}
        </div>
        {roleSaved && (
          <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Target role saved
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
          <Target className="h-6 w-6 text-indigo-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-indigo-700">{skillCount}</p>
          <p className="text-xs text-indigo-600">Skills found</p>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
          <Briefcase className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-emerald-700">100+</p>
          <p className="text-xs text-emerald-600">Internships</p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
          <Sparkles className="h-6 w-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-700">AI</p>
          <p className="text-xs text-amber-600">Powered</p>
        </div>
      </div>
      <button
        onClick={onGoToDashboard}
        className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
      >
        Go to Dashboard →
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [extractedSkillCount, setExtractedSkillCount] = useState(0);
  const [extractedProfile, setExtractedProfile] = useState<Record<string, any>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();

  useEffect(() => {
    if (profile?.onboardingComplete && !showSuccess) {
      router.push(APP_ROUTES.DASHBOARD);
    }
  }, [profile, router, showSuccess]);

  useEffect(() => {
    if (!user) router.push(APP_ROUTES.SIGNIN);
  }, [user, router]);

  const handleResumeComplete = async ({
    extractedSkills,
    extractedProfile: ep,
    digitalResume: dr,
  }: {
    extractedSkills: string[];
    extractedProfile?: Record<string, any>;
    digitalResume?: Record<string, any>;
  }) => {
    setExtractedSkillCount(extractedSkills.length);
    // Pass the full digital resume so EducationStep can pre-fill from it
    const ep2 = dr || ep || {};
    setExtractedProfile(ep2);
    setCompletedSteps(prev => new Set([...prev, 0]));
    // Always show education step so student can confirm/correct AI-extracted data
    setCurrentStep(1);
  };

  const handleEducationComplete = async () => {
    try {
      await updateProfile({ onboardingComplete: true } as any);
      setCompletedSteps(prev => new Set([...prev, 1]));
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      notify.error('Failed to save your profile. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/logo.png" alt="SkillSense" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-gray-900">Welcome to SkillSense!</h1>
          </div>
          {!showSuccess && (
            <p className="text-gray-500 text-sm">
              {currentStep === 0
                ? 'Upload your resume to get started'
                : 'Review and confirm your education details'}
            </p>
          )}
        </div>

        {/* Step progress */}
        {!showSuccess && (
          <div className="flex items-center mb-8">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isCurrent ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-semibold ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 mb-6 transition-all ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {showSuccess ? (
            <SuccessScreen skillCount={extractedSkillCount} onGoToDashboard={() => router.push(APP_ROUTES.DASHBOARD)} />
          ) : currentStep === 0 ? (
            <ResumeUploadStep onComplete={handleResumeComplete} />
          ) : (
            <EducationStep
              onComplete={handleEducationComplete}
              initialData={extractedProfile}
            />
          )}
        </div>

        {/* Back button on step 2 */}
        {!showSuccess && currentStep === 1 && (
          <div className="mt-4">
            <button
              onClick={() => setCurrentStep(0)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to resume upload
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
