'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle, Circle, BookOpen, ExternalLink,
  Github, Send, Sparkles, X, Minimize2, Maximize2, Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { notify } from '@/hooks/useNotifications';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Milestone {
  id: number;
  title: string;
  description: string;
  tasks: string[];
  conceptsCovered?: string[];
  estimatedHours?: number;
}

interface AIProject {
  title: string;
  description: string;
  milestones: Milestone[];
  resources?: Array<{ title: string; type: string; url: string; description: string }>;
  estimatedDuration?: string;
  difficulty?: string;
  successCriteria?: string[];
}

interface ChatMsg {
  role: 'user' | 'agent';
  content: string;
}

function ProjectWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const skillsParam = searchParams.get('skills') || searchParams.get('skill') || 'Programming';
  const skillsArray = skillsParam.split(',').map((s) => s.trim()).filter(Boolean);
  const primarySkill = skillsArray[0] || 'Programming';
  const skillsDisplay =
    skillsArray.length > 1
      ? `${skillsArray.slice(0, 2).join(', ')}${skillsArray.length > 2 ? ` +${skillsArray.length - 2} more` : ''}`
      : primarySkill;

  const level = searchParams.get('level') || 'beginner';
  const score = parseInt(searchParams.get('score') || '0', 10);
  const weakAreasRaw = searchParams.get('weakAreas') || '[]';
  let weakAreas: string[] = [];
  try { weakAreas = JSON.parse(decodeURIComponent(weakAreasRaw)); } catch { weakAreas = []; }

  const [project, setProject] = useState<AIProject | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [completedMilestones, setCompletedMilestones] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      role: 'agent',
      content: `Hi! I am your SkillGenie AI mentor. I know you scored ${score}% on ${primarySkill} and I am here to guide you through every milestone. Ask me anything!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch AI-generated project on mount
  useEffect(() => {
    async function fetchProject() {
      setIsLoadingProject(true);
      try {
        const res = await api.post(API_ROUTES.SKILLGENIE_SUGGEST_PROJECT, {
          skill: primarySkill,
          proficiencyLevel: level,
          score,
          weakAreas,
        });
        const data = res.data?.data?.project;
        if (data && data.milestones) {
          setProject(data);
        } else {
          setProject(getDefaultProject());
        }
      } catch {
        setProject(getDefaultProject());
      } finally {
        setIsLoadingProject(false);
      }
    }
    fetchProject();
  }, [primarySkill, level, score]);

  function getDefaultProject(): AIProject {
    return {
      title: `${primarySkill} ${level.charAt(0).toUpperCase() + level.slice(1)} Project`,
      description: `Build a hands-on ${level}-level project to master ${primarySkill} and close your skill gaps.`,
      milestones: [
        { id: 1, title: 'Project Setup', description: 'Set up your project repository and environment', tasks: ['Create GitHub repository', 'Set up project structure', 'Initialize documentation'] },
        { id: 2, title: 'Core Implementation', description: `Implement the main ${primarySkill} features`, tasks: ['Build primary functionality', 'Add required components', 'Apply best practices'] },
        { id: 3, title: 'Testing & Documentation', description: 'Test your work and document the process', tasks: ['Test all functionality', 'Write comprehensive README', 'Add code comments'] },
        { id: 4, title: 'Final Review', description: 'Review and prepare for submission', tasks: ['Code review checklist', 'Verify all requirements', 'Prepare submission'] },
      ],
      estimatedDuration: '7-10 days',
      difficulty: level,
    };
  }

  const milestones = project?.milestones || [];
  const progress = milestones.length > 0 ? (completedMilestones.length / milestones.length) * 100 : 0;
  const allCompleted = milestones.length > 0 && completedMilestones.length === milestones.length;

  const toggleMilestone = (id: number) => {
    setCompletedMilestones((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!allCompleted) return;
    setIsSubmitting(true);
    try {
      // Verify the skill in SkillSense (sets confidence_weight=0.9)
      const res = await api.post(API_ROUTES.SKILLGENIE_VERIFY, {
        skillName: primarySkill,
        score,
      });
      const data = res.data?.data;
      if (data) {
        // Store result for the result page
        try {
          sessionStorage.setItem('skillgenie_result', JSON.stringify({
            verifiedSkills: data.verifiedSkills || [primarySkill],
            totalVerified: data.totalVerified || 1,
          }));
        } catch { /* ignore */ }
        // Invalidate skill graph so dashboard updates
        queryClient.invalidateQueries({ queryKey: ['skills'] });
        queryClient.invalidateQueries({ queryKey: ['readiness'] });
        notify.success(`${primarySkill} verified! Your readiness score will update shortly.`);
        router.push(`/skillgenie/result?skill=${encodeURIComponent(primarySkill)}&status=success`);
      }
    } catch {
      notify.error('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = async (overrideMessage?: string) => {
    const text = (overrideMessage ?? inputMessage).trim();
    if (!text) return;
    setChatMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInputMessage('');
    setIsTyping(true);
    const currentMilestone = milestones.find((m) => !completedMilestones.includes(m.id)) || milestones[milestones.length - 1];
    try {
      const res = await api.post(API_ROUTES.CHAT_MESSAGE, {
        message: text,
        context: {
          mode: 'project_assistant',
          skill: primarySkill,
          level,
          score,
          weakAreas,
          project: {
            title: project?.title || primarySkill,
            description: project?.description || '',
            milestones: milestones.map((m) => ({ ...m, completed: completedMilestones.includes(m.id) })),
          },
          currentMilestone: currentMilestone ? {
            title: currentMilestone.title,
            description: currentMilestone.description,
            tasks: currentMilestone.tasks,
          } : null,
          progress: Math.round(progress),
        },
      });
      const data = res.data;
      setChatMessages((prev) => [
        ...prev,
        { role: 'agent', content: data?.response || 'I am here to help! What would you like to know?' },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'agent', content: `I am here to help with your ${skillsDisplay} project! Ask me anything about the milestones.` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (isLoadingProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4">
            <Sparkles className="h-8 w-8 animate-pulse text-purple-600" />
          </div>
          <p className="font-medium text-gray-700">Generating your personalized project...</p>
          <p className="mt-1 text-sm text-gray-500">AI is crafting a project tailored to your weak areas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="h-4 w-px bg-gray-300" />
              <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                Dashboard
              </button>
              <div className="h-4 w-px bg-gray-300" />
              <div className="text-sm font-medium text-gray-900">
                Skill: <span className="text-sky-600">{skillsDisplay}</span>
              </div>
              {score > 0 && <div className="text-sm text-gray-500">Score: <span className="font-medium">{score}%</span></div>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Progress: {Math.round(progress)}%</span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-gradient-to-r from-purple-600 to-sky-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: project + milestones */}
          <div className="space-y-6 lg:col-span-2">
            {/* Project header */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-sky-600">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900">{project?.title}</h1>
                  <p className="mt-2 text-sm text-gray-600">{project?.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                    {project?.estimatedDuration && <span>Duration: {project.estimatedDuration}</span>}
                    {project?.difficulty && <span className="capitalize">Level: {project.difficulty}</span>}
                  </div>
                  {weakAreas.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">Focus areas:</span>
                      {weakAreas.map((area, i) => (
                        <span key={i} className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">{area}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Project Milestones</h2>
              <div className="space-y-4">
                {milestones.map((milestone, index) => {
                  const isCompleted = completedMilestones.includes(milestone.id);
                  return (
                    <div key={milestone.id} className={`rounded-lg border-2 p-4 transition-all ${isCompleted ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleMilestone(milestone.id)}
                          className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${isCompleted ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-purple-500'}`}
                        >
                          {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={`font-semibold ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                              {index + 1}. {milestone.title}
                            </h3>
                            {milestone.estimatedHours && (
                              <span className="text-xs text-gray-400">{milestone.estimatedHours}h</span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{milestone.description}</p>
                          <ul className="mt-3 space-y-1">
                            {milestone.tasks.map((task, ti) => (
                              <li key={ti} className="flex items-center gap-2 text-sm text-gray-700">
                                <Circle className="h-1.5 w-1.5 fill-current text-gray-400" />
                                {task}
                              </li>
                            ))}
                          </ul>
                          {milestone.conceptsCovered && milestone.conceptsCovered.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {milestone.conceptsCovered.map((c, ci) => (
                                <span key={ci} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{c}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!allCompleted || isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-sky-600 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Verifying skill...</>
              ) : (
                <><Github className="h-5 w-5" />{allCompleted ? 'Submit & Verify Skill (weight=0.9)' : 'Complete All Milestones First'}</>
              )}
            </button>

            {allCompleted && !isSubmitting && (
              <p className="text-center text-xs text-gray-500">
                Submitting will verify <strong>{primarySkill}</strong> in your SkillSense profile with the highest confidence weight (0.9), directly improving your readiness score.
              </p>
            )}
          </div>

          {/* Right: chat + resources */}
          <div className="space-y-6">
            {/* Chat toggle */}
            <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-sky-600">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">SkillGenie AI</h3>
                    <p className="text-xs text-gray-600">Personalized project mentor</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-sky-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg"
                >
                  {isChatOpen ? 'Close Chat' : 'Open Chat'}
                </button>
              </div>
              {!isChatOpen && (
                <p className="mt-3 text-sm text-gray-700">
                  I know your score ({score}%) and weak areas. Ask me anything about your milestones!
                </p>
              )}
            </div>

            {/* Chat window */}
            {isChatOpen && (
              <div className={`flex flex-col rounded-xl border border-gray-200 bg-white shadow-xl transition-all ${isMinimized ? 'h-14' : 'h-[480px]'}`}>
                <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-purple-600 to-sky-600 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-white" />
                    <div>
                      <h3 className="font-semibold text-white">SkillGenie AI</h3>
                      <p className="text-xs text-purple-100">Your personal project mentor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="rounded-lg p-1 text-white hover:bg-white/20">
                      {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setIsChatOpen(false)} className="rounded-lg p-1 text-white hover:bg-white/20">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {!isMinimized && (
                  <>
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-sky-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                            {msg.role === 'agent' && (
                              <div className="mb-1 flex items-center gap-1 text-xs font-medium text-purple-600">
                                <Sparkles className="h-3 w-3" /> SkillGenie
                              </div>
                            )}
                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="rounded-lg bg-gray-100 px-4 py-2">
                            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-purple-600">
                              <Sparkles className="h-3 w-3" /> SkillGenie
                            </div>
                            <div className="flex gap-1">
                              {[0, 150, 300].map((delay) => (
                                <div key={delay} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${delay}ms` }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        {['How do I start?', `Best practices for ${primarySkill}?`, 'Help with current milestone'].map((q) => (
                          <button key={q} onClick={() => sendMessage(q)} className="rounded-full border border-purple-200 bg-white px-3 py-1 text-xs text-purple-700 transition-colors hover:bg-purple-50">{q}</button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 p-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask me anything about your project..."
                          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                        <button
                          onClick={() => sendMessage()}
                          disabled={!inputMessage.trim() || isTyping}
                          className="flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-sky-600 px-4 py-2 text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Resources */}
            {project?.resources && project.resources.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-4">Learning Resources</h2>
                <div className="space-y-3">
                  {project.resources.map((resource, i) => (
                    <a key={i} href={resource.url !== '#' ? resource.url : undefined} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                      <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                        <p className="text-xs text-gray-500">{resource.type} - {resource.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Success criteria */}
            {project?.successCriteria && project.successCriteria.length > 0 && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <h3 className="font-semibold text-green-900 mb-3">Success Criteria</h3>
                <ul className="space-y-2">
                  {project.successCriteria.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-green-800">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="font-semibold text-blue-900">Pro Tips</h3>
              <ul className="mt-3 space-y-2 text-sm text-blue-800">
                <li>- Commit your code regularly to GitHub</li>
                <li>- Write clear documentation as you go</li>
                <li>- Test each milestone before moving on</li>
                <li>- Completing this earns weight=0.9 evidence in SkillSense</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectWorkspacePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ProjectWorkspaceContent />
    </Suspense>
  );
}
