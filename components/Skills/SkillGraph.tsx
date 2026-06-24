'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  Circle,
  Plus,
  Filter,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SkillStatus } from '@/types';
import type { SkillNode, SkillCategory } from '@/types';
import AddSkillModal from './AddSkillModal';
import ConfirmDialog from '@/components/ConfirmDialog';

interface SkillGraphProps {
  skills: SkillNode[];
  onAddSkill?: (skillName: string, category: SkillCategory) => void;
  onDeleteSkill?: (skillId: string) => void;
  isDeletingSkill?: boolean;
}

const statusConfig: Record<
  SkillStatus,
  {
    icon: typeof CheckCircle;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  [SkillStatus.VERIFIED]: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    border: 'border-emerald-200',
    label: 'Verified',
  },
  [SkillStatus.IN_PROGRESS]: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
    border: 'border-amber-200',
    label: 'In Progress',
  },
  [SkillStatus.CLAIMED]: {
    icon: Circle,
    color: 'text-slate-400',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    label: 'Claimed',
  },
};

export default function SkillGraph({
  skills,
  onAddSkill,
  onDeleteSkill,
  isDeletingSkill,
}: SkillGraphProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SkillStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<SkillCategory | 'all'>(
    'all'
  );
  const [deleteTarget, setDeleteTarget] = useState<SkillNode | null>(null);

  const filteredSkills = skills.filter((skill) => {
    if (filterStatus !== 'all' && skill.status !== filterStatus) return false;
    if (filterCategory !== 'all' && skill.category !== filterCategory)
      return false;
    return true;
  });

  const categories = Array.from(new Set(skills.map((s) => s.category)));
  const verifiedCount = skills.filter(
    (s) => s.status === SkillStatus.VERIFIED
  ).length;

  const handleDeleteConfirm = () => {
    if (deleteTarget && onDeleteSkill) {
      onDeleteSkill(deleteTarget.skillId);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="card-glass border border-slate-200">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-200 bg-violet-100 shadow-inner">
            <Sparkles className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-sora text-lg font-bold text-slate-900">
              Your Skills
            </h3>
            <p className="text-sm font-medium text-slate-500">
              {verifiedCount} verified out of {skills.length} total skills
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as SkillStatus | 'all')
          }
          className="focus:border-primary focus:ring-primary/20 rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2"
        >
          <option value="all">All Status</option>
          <option value={SkillStatus.VERIFIED}>Verified</option>
          <option value={SkillStatus.IN_PROGRESS}>In Progress</option>
          <option value={SkillStatus.CLAIMED}>Claimed</option>
        </select>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(e.target.value as SkillCategory | 'all')
          }
          className="focus:border-primary focus:ring-primary/20 rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => {
            const config = statusConfig[skill.status];
            const Icon = config.icon;

            return (
              <div
                key={skill.skillId}
                className={cn(
                  'group relative rounded-2xl border-2 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md',
                  config.border,
                  skill.status === SkillStatus.VERIFIED &&
                    'border-emerald-300/50 shadow-glow-success',
                  skill.status === SkillStatus.IN_PROGRESS &&
                    'border-amber-300/50 shadow-glow-warning'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-slate-900">
                      {skill.name}
                    </h4>
                    <p className="mt-1 w-fit rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                      {skill.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onDeleteSkill && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(skill);
                        }}
                        className="rounded-md p-1 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        title="Remove skill"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </div>
                </div>

                {/* Proficiency Bar */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold">Proficiency</span>
                    <span className="font-bold text-slate-900">
                      {skill.proficiencyLevel}%
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                    <div
                      className={cn(
                        'relative h-full rounded-full transition-all',
                        skill.status === SkillStatus.VERIFIED
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                          : skill.status === SkillStatus.IN_PROGRESS
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-slate-300'
                      )}
                      style={{ width: `${skill.proficiencyLevel}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span
                    className={cn(
                      'rounded-md border bg-white px-2 py-1 text-xs font-bold shadow-sm',
                      config.color,
                      config.border
                    )}
                  >
                    {config.label}
                  </span>
                  {skill.verifiedAt && (
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(skill.verifiedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Source */}
                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Source: {skill.source.replace(/_/g, ' ')}
                </div>

                {/* Verify CTA for unverified skills */}
                {skill.status !== SkillStatus.VERIFIED && (
                  <button
                    onClick={() =>
                      router.push(
                        `/skillgenie/assessment?skill=${encodeURIComponent(skill.name)}`
                      )
                    }
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-purple-600 to-sky-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  >
                    <Sparkles className="h-3 w-3" />
                    Verify with SkillGenie
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Circle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm font-medium text-gray-900">
            No skills found
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Try adjusting your filters or add a new skill
          </p>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <AddSkillModal
          onClose={() => setShowAddModal(false)}
          onAdd={onAddSkill}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Skill"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from your skill graph? This action cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Keep"
        variant="danger"
        isLoading={isDeletingSkill}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
