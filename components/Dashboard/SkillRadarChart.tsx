'use client';

import { useMemo } from 'react';
import { SkillNode, SkillCategory } from '@/types';
import { TrendingUp } from 'lucide-react';

interface SkillRadarChartProps {
  skills: SkillNode[];
}

export default function SkillRadarChart({ skills }: SkillRadarChartProps) {
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, { label: string; icon: string }> = {
      [SkillCategory.PROGRAMMING_LANGUAGE]: { label: 'Languages', icon: 'PL' },
      [SkillCategory.FRAMEWORK]: { label: 'Frameworks', icon: 'FW' },
      [SkillCategory.TOOL]: { label: 'Tools', icon: 'TL' },
      [SkillCategory.SOFT_SKILL]: { label: 'Soft Skills', icon: 'SS' },
      [SkillCategory.DOMAIN_KNOWLEDGE]: { label: 'Domain', icon: 'DK' },
    };

    const categories = Object.values(SkillCategory);
    return categories.map((category) => {
      const categorySkills = skills.filter((s) => s.category === category);
      const avgProficiency =
        categorySkills.length > 0
          ? categorySkills.reduce((sum, s) => sum + s.proficiencyLevel, 0) /
            categorySkills.length
          : 0;
      return {
        category: categoryMap[category]?.label || category.replace(/_/g, ' '),
        icon: categoryMap[category]?.icon || '--',
        count: categorySkills.length,
        proficiency: avgProficiency,
      };
    }).filter(d => d.count > 0);
  }, [skills]);

  return (
    <div className="card bg-gradient-to-br from-blue-50/50 to-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Skills by Category
        </h3>
        <TrendingUp className="h-5 w-5 text-blue-600" />
      </div>
      
      <div className="space-y-3">
        {categoryData.map((data) => (
          <div key={data.category} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{data.icon}</span>
                <span className="text-sm font-semibold text-gray-700">{data.category}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">{data.count}</span>
                <span className="text-xs text-gray-500 ml-1">skills</span>
              </div>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 group-hover:from-blue-600 group-hover:to-indigo-700"
                style={{ width: `${(data.count / skills.length) * 100}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Avg proficiency: {data.proficiency.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <span className="text-sm text-gray-600">Total: </span>
        <span className="text-lg font-bold text-gray-900">{skills.length}</span>
        <span className="text-sm text-gray-600"> skills across </span>
        <span className="text-lg font-bold text-gray-900">{categoryData.length}</span>
        <span className="text-sm text-gray-600"> categories</span>
      </div>
    </div>
  );
}
