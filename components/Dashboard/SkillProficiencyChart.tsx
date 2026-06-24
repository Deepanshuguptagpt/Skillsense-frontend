'use client';

import { useMemo } from 'react';
import { SkillNode, SkillStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Award } from 'lucide-react';

interface SkillProficiencyChartProps {
  skills: SkillNode[];
}

export default function SkillProficiencyChart({
  skills,
}: SkillProficiencyChartProps) {
  const topSkills = useMemo(() => {
    return [...skills]
      .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
      .slice(0, 8);
  }, [skills]);

  const getStatusColor = (status: SkillStatus) => {
    switch (status) {
      case SkillStatus.VERIFIED:
        return 'bg-emerald-500';
      case SkillStatus.IN_PROGRESS:
        return 'bg-amber-500';
      case SkillStatus.CLAIMED:
        return 'bg-slate-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: SkillStatus) => {
    switch (status) {
      case SkillStatus.VERIFIED:
        return 'Verified';
      case SkillStatus.IN_PROGRESS:
        return 'In Progress';
      case SkillStatus.CLAIMED:
        return 'Claimed';
      default:
        return status;
    }
  };

  return (
    <div className="card bg-gradient-to-br from-emerald-50/50 to-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Top Skills by Proficiency
        </h3>
        <Award className="h-5 w-5 text-emerald-600" />
      </div>
      <div className="space-y-4">
        {topSkills.map((skill, index) => (
          <div key={skill.skillId} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5">#{index + 1}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {skill.name}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-700">
                {skill.proficiencyLevel}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 group-hover:scale-x-105',
                    getStatusColor(skill.status)
                  )}
                  style={{ width: `${skill.proficiencyLevel}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {getStatusLabel(skill.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
      {skills.length > 8 && (
        <p className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          Showing top 8 of {skills.length} skills
        </p>
      )}
    </div>
  );
}
