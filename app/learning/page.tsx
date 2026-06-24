'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, Brain, CheckCircle, Clock, Circle, ChevronRight, ChevronDown,
  ExternalLink, AlertCircle, Target, Sparkles, ArrowLeft, XCircle, Loader2,
  Map, GraduationCap, Trophy, Trash2, Check, Lock, Star,
} from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES, APP_ROUTES } from '@/lib/constants';
import { notify } from '@/hooks/useNotifications';
import { useProfile } from '@/hooks/useProfile';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// ── Types ───────────────────────────────────────────────────────────────────

interface LearningPath {
  id: string;
  role_id: string;
  role_name: string;
  role_slug: string;
  generated_at: string;
  total_milestones: number;
  completed_milestones: number;
}

interface Milestone {
  id: string;
  title: string;
  type: 'concept' | 'quiz' | 'project';
  status: 'pending' | 'in_progress' | 'completed';
  order_index: number;
  skill_name: string;
  resource_url?: string;
}

interface RoadmapTopic {
  id: number;
  title: string;
  description: string;
  keyPoints: string[];
  estimatedMinutes: number;
  resources: { title: string; url: string; type: string }[];
}

interface Roadmap {
  skill: string;
  title: string;
  description: string;
  estimatedHours: number;
  topics: RoadmapTopic[];
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const TYPE_ICONS = { concept: BookOpen, quiz: Brain, project: Star };
const TYPE_COLORS = {
  concept: 'text-blue-600 bg-blue-50',
  quiz: 'text-indigo-600 bg-indigo-50',
  project: 'text-amber-600 bg-amber-50',
};
const TYPE_BORDER = {
  concept: 'border-l-blue-400',
  quiz: 'border-l-indigo-400',
  project: 'border-l-amber-400',
};
const TYPE_LABEL = { concept: 'Study', quiz: 'Quiz', project: 'Project' };

function StatusIcon({ status }: { status: Milestone['status'] }) {
  if (status === 'completed') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (status === 'in_progress') return <Clock className="h-4 w-4 text-blue-500" />;
  return <Circle className="h-4 w-4 text-slate-300" />;
}

// ── Assessment Component ────────────────────────────────────────────────────

function AssessmentView({
  milestoneId, skillName, onClose, onPass,
}: {
  milestoneId: string; skillName: string; onClose: () => void; onPass: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{
    score: number; passed: boolean; correct: number; total: number; message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    api.post(API_ROUTES.LEARNING_MILESTONE_ASSESSMENT(milestoneId))
      .then((res) => { setQuestions(res.data?.data?.questions || []); })
      .catch(() => notify.error('Failed to load assessment'))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestoneId]);

  const handleSelect = (idx: number) => {
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

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setIsVerifying(true);
      try {
        const res = await api.post(API_ROUTES.LEARNING_MILESTONE_VERIFY(milestoneId), {
          answers: newAnswers, questions,
        });
        const data = res.data?.data;
        setResult(data);
        if (data?.passed) onPass();
      } catch {
        notify.error('Failed to verify assessment');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="md" className="mb-3" />
        <p className="text-sm text-slate-600">Generating 10 questions for {skillName}...</p>
        <p className="mt-1 text-xs text-slate-400">This may take a few seconds</p>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Brain className="h-10 w-10 animate-pulse text-indigo-500 mb-3" />
        <p className="text-sm text-slate-600">Evaluating your answers...</p>
      </div>
    );
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${result.passed ? 'bg-emerald-100' : 'bg-red-50'}`}>
          {result.passed
            ? <Trophy className="h-10 w-10 text-emerald-500" />
            : <XCircle className="h-10 w-10 text-red-400" />}
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-900">
          {result.passed ? '🎉 Milestone Unlocked!' : 'Keep Practicing'}
        </h3>
        <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">{result.message}</p>
        <div className="mt-6 flex justify-center gap-8">
          <div>
            <div className={`text-4xl font-bold ${result.passed ? 'text-emerald-600' : 'text-red-500'}`}>{result.score}%</div>
            <div className="text-xs text-slate-400 mt-1">Your Score</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-600">{result.correct}/{result.total}</div>
            <div className="text-xs text-slate-400 mt-1">Correct</div>
          </div>
        </div>
        {result.passed && (
          <div className="mt-5 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-xs text-emerald-700 font-medium">
              ✅ Skill evidence updated · Confidence weight upgraded to 0.9
            </p>
          </div>
        )}
        <button onClick={onClose}
          className="mt-6 rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
          {result.passed ? 'Continue Learning' : 'Back to Roadmap'}
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <p className="text-sm text-slate-500 py-4">No questions available.</p>;
  }

  // ── Quiz UI ────────────────────────────────────────────────────────────────
  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;
  const safeCorrectIdx = Math.max(0, Math.min(q.correctAnswer ?? 0, q.options.length - 1));
  const isCorrect = selectedAnswer !== null && selectedAnswer === safeCorrectIdx;
  const correctOptionText = q.options[safeCorrectIdx];
  const difficultyColor = q.difficulty === 'hard' ? 'text-red-500' : q.difficulty === 'medium' ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-900 capitalize">{skillName} Assessment</span>
        </div>
        <div className="flex items-center gap-3">
          {q.difficulty && (
            <span className={`text-xs font-medium capitalize ${difficultyColor}`}>{q.difficulty}</span>
          )}
          <span className="text-sm text-slate-400">Q{currentQ + 1} / {questions.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 mb-5">
        <div className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-slate-900 mb-4 leading-relaxed">{q.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          let btnStyle = 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 cursor-pointer';
          let radioStyle = 'border-slate-300';
          if (showExplanation) {
            if (idx === safeCorrectIdx) {
              btnStyle = 'border-emerald-500 bg-emerald-50 cursor-default';
              radioStyle = 'border-emerald-500 bg-emerald-500';
            } else if (idx === selectedAnswer) {
              btnStyle = 'border-red-400 bg-red-50 cursor-default';
              radioStyle = 'border-red-400 bg-red-400';
            } else {
              btnStyle = 'border-slate-200 bg-slate-50 opacity-50 cursor-default';
            }
          } else if (selectedAnswer === idx) {
            btnStyle = 'border-indigo-500 bg-indigo-50';
            radioStyle = 'border-indigo-500 bg-indigo-500';
          }
          return (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={showExplanation}
              className={`w-full rounded-xl border-2 p-3 text-left text-sm transition-all ${btnStyle}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${radioStyle}`}>
                  {showExplanation && idx === safeCorrectIdx && <CheckCircle className="h-3 w-3 text-white" />}
                  {showExplanation && idx === selectedAnswer && idx !== safeCorrectIdx && <XCircle className="h-3 w-3 text-white" />}
                </div>
                <span className="text-slate-800">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`mt-4 rounded-xl border p-4 text-sm ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-orange-200 bg-orange-50'}`}>
          <div className="flex items-center gap-2 font-semibold mb-1">
            {isCorrect
              ? <><CheckCircle className="h-4 w-4 text-emerald-600" /><span className="text-emerald-700">Correct!</span></>
              : <><XCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-700">Correct answer: <strong>{correctOptionText}</strong></span></>}
          </div>
          {q.explanation && <p className="text-slate-700 leading-relaxed">{q.explanation}</p>}
        </div>
      )}

      <button onClick={handleNext} disabled={selectedAnswer === null}
        className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        {currentQ < questions.length - 1 ? 'Next Question →' : 'Finish & Submit →'}
      </button>
    </div>
  );
}

// ── Roadmap Component ────────────────────────────────────────────────────────

function RoadmapView({ milestoneId, skillName, onStartAssessment }: {
  milestoneId: string; skillName: string; onStartAssessment: () => void;
}) {
  const { data: roadmap, isLoading } = useQuery<Roadmap>({
    queryKey: ['milestone-roadmap', milestoneId],
    queryFn: async () => {
      const res = await api.post(API_ROUTES.LEARNING_MILESTONE_ROADMAP(milestoneId));
      return res.data?.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Sparkles className="h-8 w-8 animate-pulse text-indigo-500 mb-3" />
        <p className="text-sm text-slate-600">Building your roadmap for {skillName}...</p>
        <p className="mt-1 text-xs text-slate-400">This may take a few seconds</p>
      </div>
    );
  }

  if (!roadmap?.topics) {
    return <p className="text-sm text-slate-500 py-4">Failed to load roadmap. Try refreshing.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Roadmap header */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1">
          <Map className="h-4 w-4" /> {roadmap.title}
        </div>
        <p className="text-xs text-slate-500">{roadmap.description}</p>
        {roadmap.estimatedHours > 0 && (
          <p className="mt-1.5 text-xs text-indigo-500 font-medium">⏱ ~{roadmap.estimatedHours} hours to complete</p>
        )}
      </div>

      {/* Topics */}
      <div className="space-y-2">
        {roadmap.topics.map((topic, idx) => (
          <div key={topic.id || idx} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">{topic.title}</h4>
                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{topic.description}</p>
                {topic.keyPoints?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {topic.keyPoints.map((kp, ki) => (
                      <span key={ki} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{kp}</span>
                    ))}
                  </div>
                )}
                {topic.resources?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {topic.resources.map((r, ri) => (
                      <a key={ri} href={r.url !== '#' ? r.url : undefined}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                        <ExternalLink className="h-3 w-3" /> {r.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment CTA */}
      <div className="pt-2">
        <button onClick={onStartAssessment}
          className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
          <GraduationCap className="h-4 w-4" /> Take Assessment — 10 Questions
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">Score 60% or higher to complete this milestone</p>
      </div>
    </div>
  );
}

// ── Completed Milestone Row ──────────────────────────────────────────────────

function CompletedMilestoneRow({ milestone }: { milestone: Milestone }) {
  const Icon = TYPE_ICONS[milestone.type] || BookOpen;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
        <Icon className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{milestone.title}</p>
        <p className="text-xs text-slate-400">{milestone.skill_name}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <CheckCircle className="h-4 w-4 text-emerald-500" />
        <span className="text-xs font-medium text-emerald-600">Done</span>
      </div>
    </div>
  );
}

// ── Active Milestone Card ───────────────────────────────────────────────────

function ActiveMilestoneCard({
  milestone, index, activeMilestoneCount,
  expandedId, assessingId,
  onMilestoneClick, onStartAssessing, onCloseAssessment, onPassAssessment,
}: {
  milestone: Milestone;
  index: number;
  activeMilestoneCount: number;
  expandedId: string | null;
  assessingId: string | null;
  onMilestoneClick: (id: string) => void;
  onStartAssessing: (id: string) => void;
  onCloseAssessment: () => void;
  onPassAssessment: () => void;
}) {
  const Icon = TYPE_ICONS[milestone.type] || BookOpen;
  const iconClass = TYPE_COLORS[milestone.type] || 'text-slate-600 bg-slate-100';
  const borderClass = TYPE_BORDER[milestone.type] || 'border-l-slate-300';
  const isExpanded = expandedId === milestone.id;
  const isAssessing = assessingId === milestone.id;
  const isNext = index === 0; // first non-completed milestone is "up next"

  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 ${borderClass} bg-white overflow-hidden transition-all`}>
      {/* Header */}
      <button onClick={() => onMilestoneClick(milestone.id)}
        className="w-full p-4 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors">
        <div className={`flex-shrink-0 rounded-lg p-2 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-slate-900">{milestone.title}</p>
            {isNext && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600">Up Next</span>
            )}
            {milestone.status === 'in_progress' && !isNext && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">In Progress</span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              {TYPE_LABEL[milestone.type] || milestone.type}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{milestone.skill_name}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusIcon status={milestone.status} />
          {isExpanded
            ? <ChevronDown className="h-4 w-4 text-slate-400" />
            : <ChevronRight className="h-4 w-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-4">
          {isAssessing
            ? <AssessmentView
                milestoneId={milestone.id}
                skillName={milestone.skill_name}
                onClose={onCloseAssessment}
                onPass={onPassAssessment}
              />
            : <RoadmapView
                milestoneId={milestone.id}
                skillName={milestone.skill_name}
                onStartAssessment={() => onStartAssessing(milestone.id)}
              />}
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function LearningPage() {
  const queryClient = useQueryClient();
  const { profile, isLoading: profileLoading } = useProfile();
  const hasTargetRole = !profileLoading && (!!profile?.targetRoleId || !!profile?.targetRoleName);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assessingId, setAssessingId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const pathsQuery = useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: LearningPath[] }>(API_ROUTES.LEARNING_PATHS);
      return res.data.data || [];
    },
  });

  const paths = pathsQuery.data || [];

  useEffect(() => {
    if (!selectedRoleId && paths.length > 0) {
      const targetPath = paths.find(p => p.role_id === profile?.targetRoleId);
      setSelectedRoleId(targetPath ? targetPath.role_id : paths[0].role_id);
    }
  }, [paths, profile?.targetRoleId, selectedRoleId]);

  const milestonesQuery = useQuery({
    queryKey: ['learning-milestones', selectedRoleId],
    enabled: selectedRoleId !== null || (!pathsQuery.isLoading && paths.length === 0),
    queryFn: async () => {
      const url = selectedRoleId
        ? `${API_ROUTES.LEARNING_MILESTONES}?role_id=${selectedRoleId}`
        : API_ROUTES.LEARNING_MILESTONES;
      const res = await api.get<{ success: boolean; data: Milestone[] }>(url);
      return res.data.data || [];
    },
  });

  const generatePathMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(API_ROUTES.LEARNING_PATH, {});
      return res.data;
    },
    onSuccess: (data) => {
      const generatedPath = data?.data;
      if (generatedPath) {
        const roleId: string = generatedPath.role_id;
        setSelectedRoleId(roleId);
        const milestoneList = (generatedPath.milestones || []).map((m: {
          id: string; skill_name: string; title: string; type: string;
          status: string; order_index: number; resource_url: string;
        }) => ({
          id: m.id, skill_name: m.skill_name, title: m.title,
          type: m.type, status: m.status, order_index: m.order_index,
          resource_url: m.resource_url, has_roadmap: false,
        }));
        queryClient.setQueryData(['learning-milestones', roleId], milestoneList);
      }
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      queryClient.invalidateQueries({ queryKey: ['learning-milestones'] });
      notify.success('Learning path generated! Start working through your milestones.');
    },
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        notify.error('Please set a target role on your profile first, then try again.');
      } else {
        notify.error('Failed to generate learning path. Please try again in a moment.');
      }
    },
  });

  const deletePathMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const res = await api.delete(API_ROUTES.LEARNING_PATH_DELETE(roleId));
      return res.data;
    },
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      queryClient.invalidateQueries({ queryKey: ['learning-milestones'] });
      queryClient.invalidateQueries({ queryKey: ['learning-progress'] });
      const remaining = paths.filter(p => p.role_id !== roleId);
      setSelectedRoleId(remaining.length > 0 ? remaining[0].role_id : null);
      setExpandedId(null);
      setAssessingId(null);
      notify.success('Learning path deleted successfully.');
    },
    onError: () => notify.error('Failed to delete learning path. Please try again.'),
  });

  const milestones = milestonesQuery.data || [];
  const activeMilestones = milestones.filter(m => m.status !== 'completed');
  const completedMilestones = milestones.filter(m => m.status === 'completed');
  const total = milestones.length;
  const completed = completedMilestones.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleMilestoneClick = (id: string) => {
    if (assessingId === id) return;
    setAssessingId(null);
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePassAssessment = () => {
    setAssessingId(null);
    setExpandedId(null);
    queryClient.invalidateQueries({ queryKey: ['learning-milestones'] });
    queryClient.invalidateQueries({ queryKey: ['learning-progress'] });
    queryClient.invalidateQueries({ queryKey: ['skills'] });
    queryClient.invalidateQueries({ queryKey: ['readiness'] });
  };

  if (profileLoading || pathsQuery.isLoading || milestonesQuery.isLoading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto space-y-4 p-6">
          <div className="gradient-skeleton h-8 w-48 rounded-lg" />
          <div className="gradient-skeleton h-4 w-64 rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="gradient-skeleton h-20 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        {/* Breadcrumb & Header */}
        <div className="mb-2 flex items-center text-sm font-medium text-slate-500">
          <Link href={APP_ROUTES.DASHBOARD} className="hover:text-indigo-600 transition-colors">Learning</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-indigo-600">{paths.find(p => p.role_id === selectedRoleId)?.role_name || 'Learning Path'}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Learning Path</h1>
          {paths.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <select
                  value={selectedRoleId || ''}
                  onChange={(e) => { setSelectedRoleId(e.target.value); setExpandedId(null); setAssessingId(null); }}
                  className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {paths.map(p => (
                    <option key={p.role_id} value={p.role_id}>{p.role_name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                onClick={() => {
                  if (selectedRoleId && confirm('Delete this learning path and all its milestones?')) {
                    deletePathMutation.mutate(selectedRoleId);
                  }
                }}
                disabled={deletePathMutation.isPending}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {deletePathMutation.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* No target role warning */}
        {!hasTargetRole && total === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Set a target role first</p>
              <p className="text-xs text-amber-700 mt-1">Your learning path is built around your target role's skill requirements.</p>
              <Link href={APP_ROUTES.PROFILE}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors">
                <Target className="h-3.5 w-3.5" /> Set Target Role
              </Link>
            </div>
          </div>
        )}

        {/* Empty state */}
        {total === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-4" />
            <h2 className="text-base font-semibold text-slate-700 mb-1">No learning path yet</h2>
            <p className="text-sm text-slate-500 mb-6">
              {hasTargetRole
                ? 'Generate a personalized path based on your skill gaps.'
                : 'Set a target role on your profile, then generate your learning path.'}
            </p>
            {hasTargetRole ? (
              <button onClick={() => generatePathMutation.mutate()} disabled={generatePathMutation.isPending}
                className="btn-primary">
                {generatePathMutation.isPending ? 'Generating...' : 'Generate Learning Path'}
              </button>
            ) : (
              <Link href={APP_ROUTES.PROFILE} className="btn-primary inline-flex items-center gap-2">
                <Target className="h-4 w-4" /> Go to Profile
              </Link>
            )}
            {generatePathMutation.isError && (
              <p className="mt-3 text-xs text-red-600">Generation failed — check your profile has a target role and try again.</p>
            )}
          </div>
        ) : (
          <>
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mb-12">
              <div className="flex flex-col sm:flex-row">
                <div className="p-8 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50">
                  {/* Circular Progress Dial */}
                  <div className="relative h-32 w-32">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="fill-transparent stroke-slate-200" strokeWidth="12" />
                      <circle cx="50" cy="50" r="40" className="fill-transparent stroke-indigo-600 transition-all duration-1000 ease-out" 
                        strokeWidth="12" strokeDasharray={`${total > 0 ? (completed / total) * 251.2 : 0} 251.2`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-900">{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider">PROGRESS</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-center relative z-10">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{paths.find(p => p.role_id === selectedRoleId)?.role_name || 'Learning'} Path</h2>
                  <p className="text-sm text-slate-600 max-w-md mb-6">
                    Master the art of this role from front to back with our industry-vetted curriculum and interactive milestones.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      <span className="text-xs font-semibold text-slate-700">{total} Milestones</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-semibold text-slate-700">{completed} Completed</span>
                    </div>
                  </div>
                </div>
                {/* Background watermark */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.03] pointer-events-none hidden sm:block">
                  <GraduationCap className="h-64 w-64" />
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {completedMilestones.length > 0 && activeMilestones.length > 0 && (
                <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 text-center sm:text-left">
                  <p className="text-xs font-medium text-slate-500">
                    {activeMilestones.length} remaining · keep going!
                  </p>
                </div>
              )}
            </div>

            {/* Milestones list with dotted timeline */}
            <div className="relative pl-4 sm:pl-8 pb-12">
              {/* Vertical dotted line */}
              <div className="absolute top-4 bottom-0 left-[23px] sm:left-[39px] w-px border-l-2 border-dotted border-slate-200" />

              <div className="space-y-6">
                {milestones.map((milestone) => {
                  const isExpanded = expandedId === milestone.id;
                  const isAssessing = assessingId === milestone.id;
                  const isCompleted = milestone.status === 'completed';
                  const isPending = milestone.status === 'pending';
                  const isInProgress = milestone.status === 'in_progress';
                  
                  // Card styling based on status
                  let cardStyle = "border-slate-200 bg-white";
                  if (isPending) cardStyle = "border-slate-100 bg-slate-50/50 opacity-80";
                  if (isInProgress) cardStyle = "border-indigo-600 bg-white shadow-md shadow-indigo-100";
                  
                  // Node styling
                  let nodeColor = 'border-slate-200 bg-white';
                  if (isCompleted) nodeColor = 'border-emerald-500 bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-50';
                  if (isInProgress) nodeColor = 'border-indigo-600 bg-white ring-4 ring-indigo-50';

                  return (
                    <div key={milestone.id} className="relative group">
                      {/* Timeline Node */}
                      <div className={`absolute -left-[30px] sm:-left-[46px] top-6 flex h-5 w-5 items-center justify-center rounded-full border-[3px] z-10 transition-colors ${nodeColor}`}>
                        {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>

                      {/* Milestone Card */}
                      <div className={`rounded-2xl border ${cardStyle} overflow-hidden transition-all duration-300`}>
                        {/* Milestone header */}
                        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${
                                isCompleted ? 'bg-emerald-100 text-emerald-700' :
                                isInProgress ? 'bg-indigo-100 text-indigo-700' :
                                'bg-slate-200 text-slate-500'
                              }`}>
                                {isCompleted ? 'COMPLETED' : isInProgress ? 'IN PROGRESS' : 'PENDING'}
                              </span>
                              <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                <Clock className="h-3 w-3" /> {milestone.type === 'concept' ? '12h' : milestone.type === 'project' ? '40h' : '2h'} Estimated
                              </span>
                            </div>
                            <h3 className={`text-lg font-bold mb-1 ${isPending ? 'text-slate-500' : 'text-slate-900'}`}>{milestone.title}</h3>
                            <p className={`text-sm ${isPending ? 'text-slate-400' : 'text-slate-600'}`}>{milestone.skill_name} — Understand and master the key concepts.</p>
                          </div>
                          
                          {/* Right Side Action */}
                          <div className="flex sm:flex-col items-center justify-between sm:justify-center sm:items-end gap-3 mt-4 sm:mt-0 min-w-[140px]">
                            {isCompleted ? (
                              <>
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-bold">Verified 100%</span>
                                </div>
                                <button onClick={() => handleMilestoneClick(milestone.id)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                  {isExpanded ? 'Close Material' : 'Review Material'}
                                </button>
                              </>
                            ) : isInProgress ? (
                              <button onClick={() => handleMilestoneClick(milestone.id)} className="w-full sm:w-auto rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
                                {isExpanded ? 'Close Lesson' : 'Continue Lesson'}
                              </button>
                            ) : (
                              <button onClick={() => handleMilestoneClick(milestone.id)} className="w-full sm:w-auto rounded-xl border-2 border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-colors">
                                {isExpanded ? 'Close' : 'Take Assessment'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar for In Progress */}
                        {isInProgress && !isExpanded && (
                          <div className="h-1.5 w-full bg-indigo-50">
                            <div className="h-full bg-indigo-600 w-1/3 rounded-r-full"></div>
                          </div>
                        )}

                        {/* Expanded content */}
                        {isExpanded && !isCompleted && (
                          <div className="border-t border-slate-100 bg-white p-6">
                            {isAssessing ? (
                              <AssessmentView
                                milestoneId={milestone.id}
                                skillName={milestone.skill_name}
                                onClose={() => { setAssessingId(null); setExpandedId(null); }}
                                onPass={handlePassAssessment}
                              />
                            ) : (
                              <RoadmapView
                                milestoneId={milestone.id}
                                skillName={milestone.skill_name}
                                onStartAssessment={() => setAssessingId(milestone.id)}
                              />
                            )}
                          </div>
                        )}

                        {/* Expanded content for Completed */}
                        {isExpanded && isCompleted && (
                          <div className="border-t border-slate-100 bg-slate-50 p-6">
                            <RoadmapView
                                milestoneId={milestone.id}
                                skillName={milestone.skill_name}
                                onStartAssessment={() => {}} // Can't retake if passed
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
