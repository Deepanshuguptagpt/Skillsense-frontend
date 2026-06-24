'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, CheckCircle } from 'lucide-react';
import { ProjectStatus } from '@/types';
import type { GeneratedProject } from '@/types';
import { useProjects } from '@/hooks/useProjects';
import { notify } from '@/hooks/useNotifications';

interface GenerateProjectModalProps {
  onClose: () => void;
  onAccept?: (project: GeneratedProject) => void;
  preselectedSkills?: string[];
}

export default function GenerateProjectModal({
  onClose,
  onAccept,
  preselectedSkills = [],
}: GenerateProjectModalProps) {
  const [targetSkills, setTargetSkills] = useState<string[]>(preselectedSkills);
  const [newSkill, setNewSkill] = useState('');
  const [studentLevel, setStudentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [timeCommitment, setTimeCommitment] = useState('2-3 weeks');
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [error, setError] = useState('');
  
  const { generateProject, isGenerating, updateStatusAsync, isUpdatingStatus } = useProjects();

  const handleAddSkill = () => {
    if (newSkill.trim() && !targetSkills.includes(newSkill.trim())) {
      setTargetSkills([...targetSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setTargetSkills(targetSkills.filter((s) => s !== skill));
  };

  const handleGenerate = async () => {
    setError('');

    if (targetSkills.length === 0) {
      setError('Please add at least one target skill');
      return;
    }

    try {
      // Use the hook's generateProject function
      generateProject(
        {
          targetSkills,
          studentLevel,
          timeCommitment,
        },
        {
          onSuccess: (project) => {
            setGeneratedProject(project);
          },
          onError: (err) => {
            console.error('Project generation error:', err);
            setError('Failed to generate project. Please try again.');
          },
        }
      );
    } catch (err) {
      console.error('Project generation error:', err);
      setError('Failed to generate project. Please try again.');
    }
  };

  const handleRegenerate = () => {
    setGeneratedProject(null);
  };

  const handleAccept = async () => {
    if (generatedProject) {
      const pId = generatedProject.projectId || (generatedProject as any).project_id;
      if (!pId) {
        setError('Project ID is missing. Cannot accept project.');
        return;
      }
      
      try {
        await updateStatusAsync({ projectId: pId, status: ProjectStatus.IN_PROGRESS });
        notify.success('Project accepted! Starting your learning journey.');
        if (onAccept) {
          onAccept(generatedProject);
        }
        onClose();
      } catch (err) {
        console.error('Failed to accept project:', err);
        setError('Failed to accept project. Please try again.');
        notify.error('Failed to accept project. Please try again.');
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Generate Learning Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!generatedProject ? (
          /* Generation Form */
          <div className="mt-6 space-y-6">
            {/* Target Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Target Skills
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add a skill..."
                  className="input flex-1"
                  disabled={isGenerating}
                />
                <button
                  onClick={handleAddSkill}
                  className="btn-secondary"
                  disabled={isGenerating}
                >
                  Add
                </button>
              </div>
              {targetSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {targetSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-primary/70"
                        disabled={isGenerating}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Student Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Level
              </label>
              <select
                value={studentLevel}
                onChange={(e) => setStudentLevel(e.target.value as typeof studentLevel)}
                className="input mt-2"
                disabled={isGenerating}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Time Commitment */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time Commitment
              </label>
              <select
                value={timeCommitment}
                onChange={(e) => setTimeCommitment(e.target.value)}
                className="input mt-2"
                disabled={isGenerating}
              >
                <option value="1 week">1 week</option>
                <option value="2-3 weeks">2-3 weeks</option>
                <option value="1 month">1 month</option>
                <option value="2+ months">2+ months</option>
              </select>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || targetSkills.length === 0}
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Project
                </>
              )}
            </button>
          </div>
        ) : (
          /* Generated Project Preview */
          <div className="mt-6 space-y-6">
            {/* Project Info */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-900">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Project Generated!</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {generatedProject.title}
              </h3>
              <p className="mt-2 text-gray-700">
                {generatedProject.description}
              </p>
            </div>

            {/* Objectives */}
            <div>
              <h4 className="font-semibold text-gray-900">Objectives</h4>
              <ul className="mt-2 space-y-1">
                {generatedProject.objectives.map((obj, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Milestones */}
            <div>
              <h4 className="font-semibold text-gray-900">Milestones</h4>
              <div className="mt-2 space-y-2">
                {generatedProject.milestones.map((milestone) => (
                  <div
                    key={milestone.milestoneId}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <p className="font-medium text-gray-900">
                      {milestone.order}. {milestone.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {milestone.description}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Estimated: {milestone.estimatedHours} hours
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRegenerate}
                className="btn-secondary flex flex-1 items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
              <button
                onClick={handleAccept}
                disabled={isUpdatingStatus}
                className="btn-primary flex flex-1 items-center justify-center gap-2"
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Accept Project
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
