'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Award, TrendingUp, ArrowRight } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSkillGraph } from '@/hooks/useSkillGraph';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

function ValidationResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const skill = searchParams.get('skill') || 'Programming';
  const status = searchParams.get('status') || 'success';
  const { skills } = useSkillGraph();

  const [showConfetti, setShowConfetti] = useState(false);
  const [resultData, setResultData] = useState<{ verifiedSkills?: string[]; totalVerified?: number } | null>(null);

  useEffect(() => {
    if (status === 'success') {
      // Invalidate skills cache so dashboard/profile reflect the verified skill
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      // Read result from sessionStorage if available
      try {
        const stored = sessionStorage.getItem('skillgenie_result');
        if (stored) {
          setResultData(JSON.parse(stored));
          sessionStorage.removeItem('skillgenie_result');
        }
      } catch { /* ignore */ }
    }
  }, [status, queryClient]);

  const isSuccess = status === 'success';
  const verifiedSkillsList = resultData?.verifiedSkills || skills.filter(s => s.verifiedAt).map(s => s.name);
  const totalVerified = resultData?.totalVerified ?? verifiedSkillsList.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <div className="absolute inset-0 animate-pulse">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute h-2 w-2 animate-bounce rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][
                    Math.floor(Math.random() * 4)
                  ],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-8 py-16">
        <div className="text-center">
          {/* Icon */}
          <div
            className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${isSuccess
                ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-200'
                : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-200'
              }`}
          >
            {isSuccess ? (
              <CheckCircle className="h-12 w-12 text-white" />
            ) : (
              <XCircle className="h-12 w-12 text-white" />
            )}
          </div>

          {/* Title */}
          <h1 className="mt-8 text-4xl font-bold text-gray-900">
            {isSuccess ? 'Skill Successfully Verified!' : 'Verification Failed'}
          </h1>

          {/* Description */}
          <p className="mt-4 text-lg text-gray-600">
            {isSuccess
              ? `Congratulations! You've successfully verified your ${skill} skill.`
              : `Your ${skill} project didn't meet the verification criteria. Don't worry, you can try again!`}
          </p>
        </div>

        {/* Result Card */}
        <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          {isSuccess ? (
            <>
              {/* Success Content */}
              <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-6">
                <Award className="h-8 w-8 flex-shrink-0 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    {skill} - Verified
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Your skill has been validated and added to your profile
                  </p>
                </div>
              </div>

              {/* Verified Skills List */}
              <div className="mt-8">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Your Verified Skills
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {verifiedSkillsList.map((skillName, index) => (
                    <div
                      key={index}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${skillName === skill
                          ? 'bg-gradient-to-r from-purple-600 to-primary text-white shadow-md'
                          : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {skillName === skill && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {skillName}
                      {skillName === skill && (
                        <span className="ml-1 text-xs opacity-90">NEW</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* What's Next */}
              <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h3 className="font-semibold text-blue-900">
                  What's Next?
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-blue-800">
                  <li>• Your profile has been updated with the verified skill</li>
                  <li>• You now have access to more internship opportunities</li>
                  <li>• Check your dashboard for newly eligible positions</li>
                  <li>• Continue building skills to unlock more opportunities</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Failure Content */}
              <div className="flex items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6">
                <XCircle className="h-8 w-8 flex-shrink-0 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    Verification Incomplete
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Your project needs some improvements before verification
                  </p>
                </div>
              </div>

              {/* Feedback */}
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900">
                  Areas for Improvement
                </h3>
                <ul className="mt-4 space-y-3">
                  {[
                    'Code quality and structure could be improved',
                    'Some required features are missing',
                    'Documentation needs to be more comprehensive',
                  ].map((feedback, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                      <span className="text-sm text-gray-700">{feedback}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Encouragement */}
              <div className="mt-8 rounded-lg border border-purple-200 bg-purple-50 p-6">
                <h3 className="font-semibold text-purple-900">
                  Keep Going!
                </h3>
                <p className="mt-2 text-sm text-purple-800">
                  Learning is a journey. Review the feedback, improve your project,
                  and submit again. You've got this!
                </p>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-primary px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all"
          >
            Return to SkillSense Dashboard
            <ArrowRight className="h-5 w-5" />
          </button>
          {!isSuccess && (
            <button
              onClick={() => router.push(`/skillgenie/project?skill=${encodeURIComponent(skill)}`)}
              className="flex-1 rounded-lg border-2 border-primary bg-white px-8 py-4 font-semibold text-primary hover:bg-blue-50 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>

        {/* Stats Card */}
        {isSuccess && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {totalVerified}
              </div>
              <div className="mt-1 text-sm text-gray-600">Verified Skills</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="text-3xl font-bold text-green-600">+1</div>
              <div className="mt-1 text-sm text-gray-600">
                Newly Verified
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{skills.length}</div>
              <div className="mt-1 text-sm text-gray-600">Total Skills</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ValidationResultPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <ValidationResultContent />
    </Suspense>
  );
}
