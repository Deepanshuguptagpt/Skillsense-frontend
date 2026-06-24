'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, Target, Code, Calendar } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { useProject } from '@/hooks/useProjects';
import { cn, getProjectStatusColor } from '@/lib/utils';
import { SkeletonList } from '@/components/GradientSkeleton';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { data: project, isLoading, error } = useProject(projectId);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 p-6">
          <SkeletonList count={1} />
          <div className="mt-6">
            <SkeletonList count={3} />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !project) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
            <p className="mt-2 text-gray-600">The project you are looking for does not exist.</p>
            <button onClick={() => router.push('/projects')} className="btn-primary mt-6">
              Back to Projects
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl space-y-6 p-6">
          {/* Header */}
          <button 
            onClick={() => router.push('/projects')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>
          
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <p className="mt-2 text-gray-600">{project.description}</p>
              </div>
              <span className={cn('badge', getProjectStatusColor(project.status))}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4 border-t border-gray-100 pt-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="font-medium text-gray-900">{project.targetSkills.length}</span> skills
              </div>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="capitalize">{project.difficulty || 'Intermediate'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{project.estimatedDuration || '1 week'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Target Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.targetSkills.map((skill) => (
                  <span key={skill} className="badge badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Objectives */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Objectives</h2>
            <ul className="mt-4 space-y-3">
              {project.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Milestones */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
            <div className="mt-4 space-y-4">
              {project.milestones.map((milestone) => (
                <div key={milestone.milestoneId} className="rounded-lg border border-gray-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">
                      {milestone.order || 1}. {milestone.title}
                    </h3>
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                      {milestone.estimatedHours} hours
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{milestone.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
