'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle, XCircle, Sparkles, Brain,
  TrendingUp, AlertCircle, BarChart3, Rocket, BadgeCheck, Briefcase,
} from 'lucide-react';
import api from '@/lib/api';
import { API_ROUTES, APP_ROUTES } from '@/lib/constants';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { notify } from '@/hooks/useNotifications';

export const dynamic = 'force-dynamic';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Analysis {
  proficiencyLevel: string;
  proficiencyScore: number;
  summary: string;
  strengths: string[];
  weakAreas: string[];
  recommendation: string;
  nextSteps: string[];
  score: number;
  skill: string;
}

function fallbackQuestions(skill: string): Question[] {
  return [
    { id: 1, question: `What is a fundamental concept in ${skill}?`, options: ['Basic syntax and structure', 'Advanced optimization', 'Enterprise patterns', 'Legacy maintenance'], correctAnswer: 0, explanation: `Understanding basic syntax is the foundation of ${skill}.` },
    { id: 2, question: `Which is a common use case for ${skill}?`, options: ['Building scalable applications', 'Managing hardware', 'Designing physical products', 'Market research'], correctAnswer: 0, explanation: `${skill} is widely used for building scalable software applications.` },
    { id: 3, question: `What is an important best practice in ${skill}?`, options: ['Ignoring documentation', 'Writing clean maintainable code', 'Avoiding testing', 'Using deprecated features'], correctAnswer: 1, explanation: 'Clean, maintainable code is a universal best practice.' },
    { id: 4, question: `How do you learn ${skill} effectively?`, options: ['Only reading theory', 'Memorising syntax', 'Building hands-on projects', 'Avoiding community resources'], correctAnswer: 2, explanation: 'Hands-on projects accelerate learning by applying concepts in practice.' },
    { id: 5, question: `Why is ${skill} valuable in the job market?`, options: ["It's rarely used", 'It solves real-world problems', "It's only for beginners", 'No practical applications'], correctAnswer: 1, explanation: `${skill} is valued because it directly solves real-world problems.` },
  ];
}

function SkillAssessmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const rawSkillsParam = searchParams.get('skills') || searchParams.get('skill') || 'Programming';
  const skillsParam = rawSkillsParam.includes('[object') ? 'Programming' : rawSkillsParam;
  const skillsArray = skillsParam.split(',').map((s) => s.trim()).filter(Boolean);
  const primarySkill = skillsArray[0] || 'Programming';
  const skillsDisplay = skillsArray.length > 1
    ? `${skillsArray.slice(0, 2).join(', ')}${skillsArray.length > 2 ? ` +${skillsArray.length - 2} more` : ''}`
    : primarySkill;

  const modeParam = searchParams.get('mode');
  const internshipId = searchParams.get('internship');
  const unlocksCount = parseInt(searchParams.get('unlocks') || '0', 10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoadingQuestions(true);
      try {
        const res = await api.post(API_ROUTES.SKILLGENIE_QUESTIONS, { skill: primarySkill, level: 'intermediate' });
        const fetched: Question[] = res.data?.data?.questions;
        if (fetched && fetched.length >= 3) {
          setQuestions(fetched);
        } else {
          setQuestions(fallbackQuestions(primarySkill));
        }
      } catch {
        setQuestions(fallbackQuestions(primarySkill));
      } finally {
        setIsLoadingQuestions(false);
      }
    }
    fetchQuestions();
  }, [primarySkill]);

  const handleAnswerSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setShowExplanation(false);
    setSelectedAnswer(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered — calculate score
      const correct = newAnswers.reduce(
        (count, ans, i) => (ans === questions[i].correctAnswer ? count + 1 : count), 0
      );
      const finalScore = Math.round((correct / questions.length) * 100);
      setIsAnalyzing(true);

      try {
        // 1. Record quiz attempt (updates SkillNode confidence weight)
        await api.post(API_ROUTES.QUIZ_ATTEMPT, {
          skill_name: primarySkill,
          answers: newAnswers,
          questions: questions,
          score: finalScore,
        });

        // 2. Get AI analysis
        const res = await api.post(API_ROUTES.SKILLGENIE_ANALYZE, {
          skill: primarySkill,
          answers: newAnswers,
          questions: questions,
          score: finalScore,
        });
        setAnalysis(res.data?.data || null);
        setIsAnalyzing(false);

        // 3. If passing score (≥50%), verify the skill
        if (finalScore >= 50) {
          setIsVerifying(true);
          try {
            await api.post(API_ROUTES.SKILLGENIE_VERIFY, {
              skillName: primarySkill,
              score: finalScore,
              validationId: `quiz_${Date.now()}`,
            });
            setIsVerified(true);
            // Invalidate all skill-related queries so dashboard updates
            queryClient.invalidateQueries({ queryKey: ['skills'] });
            queryClient.invalidateQueries({ queryKey: ['readiness'] });
            queryClient.invalidateQueries({ queryKey: ['internships'] });
            queryClient.invalidateQueries({ queryKey: ['skillgenie-context'] });
            notify.success(`${primarySkill} verified! Your readiness score has been updated.`);
          } catch {
            // Verify call failed — still show results, skill stays claimed
          } finally {
            setIsVerifying(false);
          }
        }
      } catch {
        setIsAnalyzing(false);
        // Fallback analysis
        const level = finalScore >= 80 ? 'advanced' : finalScore >= 50 ? 'intermediate' : 'beginner';
        setAnalysis({
          proficiencyLevel: level,
          proficiencyScore: finalScore,
          summary: `You scored ${finalScore}% on the ${primarySkill} assessment.`,
          strengths: ['Foundational understanding'],
          weakAreas: ['Advanced concepts', 'Real-world application'],
          recommendation: `${level}_project`,
          nextSteps: [`Practice ${primarySkill} with projects`, 'Study documentation', 'Build portfolio projects'],
          score: finalScore,
          skill: primarySkill,
        });
      }
    }
  };

  const handleContinueToProject = () => {
    if (!analysis) return;
    const level = analysis.proficiencyLevel === 'advanced' ? 'advanced'
      : analysis.proficiencyLevel === 'intermediate' ? 'intermediate' : 'beginner';
    const weakAreas = encodeURIComponent(JSON.stringify(analysis.weakAreas));
    router.push(
      `/skillgenie/project?skills=${encodeURIComponent(skillsParam)}&level=${level}&score=${analysis.score}&weakAreas=${weakAreas}`
    );
  };

  if (isLoadingQuestions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        <div className="text-center">
          <LoadingSpinner size="md" className="mx-auto mb-4" />
          <p className="font-medium text-gray-700">Generating personalized questions for {primarySkill}...</p>
          <p className="mt-1 text-sm text-gray-500">Our AI is crafting skill-specific questions just for you</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing || isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <Brain className="h-8 w-8 animate-pulse text-purple-600" />
          </div>
          <p className="mt-4 font-medium text-gray-700">
            {isVerifying ? `Verifying ${primarySkill}...` : 'Analyzing your proficiency...'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {isVerifying
              ? 'Updating your skill graph and readiness score'
              : 'AI is evaluating your answers to determine your skill level'}
          </p>
        </div>
      </div>
    );
  }

  // Show analysis result
  if (analysis) {
    const levelColors: Record<string, string> = {
      beginner: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      intermediate: 'text-blue-600 bg-blue-50 border-blue-200',
      advanced: 'text-green-600 bg-green-50 border-green-200',
    };
    const levelColor = levelColors[analysis.proficiencyLevel] || levelColors.intermediate;
    const passed = analysis.score >= 50;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-8 py-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">

            {/* Verified banner — shown when skill was verified */}
            {isVerified && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <BadgeCheck className="h-7 w-7 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="font-bold text-emerald-800">{primarySkill} is now Verified ✓</p>
                  <p className="text-sm text-emerald-600">
                    Confidence weight updated to 0.8 — your readiness score has improved.
                    {modeParam === 'unlock' && unlocksCount > 0 && (
                      <span className="font-bold ml-1 text-emerald-700">You've unlocked {unlocksCount} more internship{unlocksCount > 1 ? 's' : ''}!</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Not passing banner */}
            {!passed && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="font-bold text-amber-800">Score below 50% — skill not yet verified</p>
                  <p className="text-sm text-amber-600">Study the areas below and retake to verify your skill.</p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
                <Brain className="h-10 w-10 text-purple-600" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-gray-900">Assessment Results</h1>
              <p className="mt-2 text-gray-600">{primarySkill}</p>
            </div>

            {/* Score + Level */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                <div className="text-4xl font-bold text-purple-600">{analysis.score}%</div>
                <div className="mt-1 text-sm text-gray-600">Quiz Score</div>
              </div>
              <div className={`rounded-xl border p-4 text-center ${levelColor}`}>
                <div className="text-2xl font-bold capitalize">{analysis.proficiencyLevel}</div>
                <div className="mt-1 text-sm">Proficiency Level</div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-700">
                <Sparkles className="h-4 w-4" /> AI Analysis
              </div>
              <p className="mt-2 text-sm text-gray-700">{analysis.summary}</p>
            </div>

            {/* Strengths & Weak Areas */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                  <CheckCircle className="h-4 w-4" /> Strengths
                </div>
                <ul className="mt-2 space-y-1">
                  {analysis.strengths.map((s, i) => <li key={i} className="text-sm text-green-800">• {s}</li>)}
                </ul>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                  <AlertCircle className="h-4 w-4" /> Areas to Improve
                </div>
                <ul className="mt-2 space-y-1">
                  {analysis.weakAreas.map((w, i) => <li key={i} className="text-sm text-orange-800">• {w}</li>)}
                </ul>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <TrendingUp className="h-4 w-4" /> Your Learning Path
              </div>
              <ol className="mt-2 space-y-1">
                {analysis.nextSteps.map((step, i) => <li key={i} className="text-sm text-blue-800">{i + 1}. {step}</li>)}
              </ol>
            </div>

            {/* CTA buttons */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {modeParam === 'unlock' ? (
                <>
                  <button
                    onClick={() => router.push(APP_ROUTES.INTERNSHIPS)}
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-indigo-300 bg-indigo-600 px-5 py-4 text-center font-semibold text-white hover:bg-indigo-700 transition-all"
                  >
                    <Briefcase className="h-6 w-6" />
                    <span className="text-sm font-bold">Back to Internships</span>
                    <span className="text-xs text-indigo-200 font-normal">
                      {passed ? 'View your new matches' : 'Explore other opportunities'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      const weakAreas = encodeURIComponent(JSON.stringify(analysis.weakAreas));
                      router.push(`/skillgenie?mode=unlock_assistance&skill=${encodeURIComponent(primarySkill)}&internship=${encodeURIComponent(internshipId || '')}&score=${analysis.score}&weakAreas=${weakAreas}`);
                    }}
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-purple-200 bg-white px-5 py-4 text-center font-semibold text-purple-700 hover:bg-purple-50 transition-all"
                  >
                    <Brain className="h-6 w-6" />
                    <span className="text-sm font-bold">Get Personalized Help</span>
                    <span className="text-xs text-purple-500 font-normal">Talk to SkillGenie</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Go to Dashboard — primary action */}
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-indigo-300 bg-indigo-600 px-5 py-4 text-center font-semibold text-white hover:bg-indigo-700 transition-all"
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm font-bold">Back to Dashboard</span>
                    <span className="text-xs text-indigo-200 font-normal">
                      {isVerified ? 'See your updated readiness score' : 'Continue your career journey'}
                    </span>
                  </button>

                  {/* Continue to project or retry */}
                  {passed ? (
                    <button
                      onClick={handleContinueToProject}
                      className="flex flex-col items-center gap-2 rounded-xl border-2 border-purple-200 bg-white px-5 py-4 text-center font-semibold text-purple-700 hover:bg-purple-50 transition-all"
                    >
                      <Rocket className="h-6 w-6" />
                      <span className="text-sm font-bold">Build a Project</span>
                      <span className="text-xs text-purple-500 font-normal">Strengthen your skill further</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => { setAnalysis(null); setCurrentQuestion(0); setAnswers([]); setIsVerified(false); }}
                      className="flex flex-col items-center gap-2 rounded-xl border-2 border-amber-200 bg-white px-5 py-4 text-center font-semibold text-amber-700 hover:bg-amber-50 transition-all"
                    >
                      <Brain className="h-6 w-6" />
                      <span className="text-sm font-bold">Retake Quiz</span>
                      <span className="text-xs text-amber-500 font-normal">Score ≥50% to verify your skill</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz UI
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const q = questions[currentQuestion];
  const isCorrect = selectedAnswer !== null && selectedAnswer === q.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="h-4 w-px bg-gray-300" />
              <div className="text-sm font-medium text-gray-900">
                Skill: <span className="text-sky-600">{skillsDisplay}</span>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-gradient-to-r from-purple-600 to-sky-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
              <Sparkles className="h-4 w-4" /> {skillsDisplay}
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">{q.question}</h2>
          </div>

          <div className="space-y-3">
            {q.options.map((option, idx) => {
              let style = 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50';
              if (showExplanation) {
                if (idx === q.correctAnswer) style = 'border-green-500 bg-green-50';
                else if (idx === selectedAnswer) style = 'border-red-400 bg-red-50';
                else style = 'border-gray-200 bg-gray-50 opacity-60';
              } else if (selectedAnswer === idx) {
                style = 'border-blue-500 bg-blue-50';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={showExplanation}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${showExplanation && idx === q.correctAnswer ? 'border-green-500 bg-green-500'
                        : showExplanation && idx === selectedAnswer ? 'border-red-400 bg-red-400'
                          : selectedAnswer === idx ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                      {showExplanation && idx === q.correctAnswer && <CheckCircle className="h-4 w-4 text-white" />}
                      {showExplanation && idx === selectedAnswer && idx !== q.correctAnswer && <XCircle className="h-4 w-4 text-white" />}
                      {!showExplanation && selectedAnswer === idx && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <span className="font-medium text-gray-900">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation after answer */}
          {showExplanation && q.explanation && (
            <div className={`mt-4 rounded-lg border p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                {isCorrect
                  ? <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-green-700">Correct!</span></>
                  : <><XCircle className="h-4 w-4 text-orange-600" /><span className="text-orange-700">Not quite</span></>
                }
              </div>
              <p className="mt-1 text-sm text-gray-700">{q.explanation}</p>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question →' : 'Finish & Analyze'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SkillAssessmentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <SkillAssessmentContent />
    </Suspense>
  );
}
