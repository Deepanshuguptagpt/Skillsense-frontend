'use client';

import Link from 'next/link';
import { Clock, Target, Code } from 'lucide-react';
import { cn, getProjectStatusColor } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/constants';
import type { GeneratedProject } from '@/types';

interface ProjectCardProps {
  project: GeneratedProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const completedMilestones = 0; // TODO: Calculate from actual milestone completion
  const progressPercentage = (completedMilestones / project.milestones.length) * 100;

  return (
    <Link
      href={APP_ROUTES.PROJECT_DETAIL(project.projectId)}
      className="card-hover group block"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {project.description}
          </p>
        </div>
        <span className={cn('badge ml-4', getProjectStatusColor(project.status))}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      {/* Details */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4" />
          <span>{project.targetSkills.length} skills</span>
        </div>
        <div className="flex items-center gap-1">
          <Code className="h-4 w-4" />
          <span className="capitalize">{project.difficulty}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{project.estimatedDuration}</span>
        </div>
      </div>

      {/* Target Skills */}
      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500">Target Skills:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.targetSkills.slice(0, 5).map((skill) => (
            <span key={skill} className="badge badge-primary">
              {skill}
            </span>
          ))}
          {project.targetSkills.length > 5 && (
            <span className="badge badge-neutral">
              +{project.targetSkills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Progress Line */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Progress</span>
          <span>
            {completedMilestones} / {project.milestones.length} milestones
          </span>
        </div>
        <div className="relative h-1 w-full overflow-hidden bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-out relative"
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 0 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="h-1.5 w-1.5 rounded-full bg-white shadow-lg"></div>
                  <div className="absolute inset-0 h-1.5 w-1.5 rounded-full bg-white animate-ping"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
