'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { SkillNode } from '@/types';

interface SkillSpiderChartProps {
  skills: SkillNode[];
}

export default function SkillSpiderChart({ skills }: SkillSpiderChartProps) {
  const categoryData = skills.reduce((acc, skill) => {
    const category = skill.category.replace(/_/g, ' ');
    if (!acc[category]) acc[category] = { total: 0, count: 0 };
    acc[category].total += skill.proficiencyLevel;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const chartData = Object.entries(categoryData).map(([category, data]) => ({
    category,
    proficiency: Math.round(data.total / data.count),
    fullMark: 100,
  }));

  if (chartData.length === 0) {
    return (
      <div className="card">
        <h3 className="font-sora text-base font-bold text-slate-900">Skill Proficiency Map</h3>
        <div className="mt-4 flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-400">Add at least 3 skills to see your proficiency map</p>
        </div>
      </div>
    );
  }

  if (chartData.length < 3) {
    return (
      <div className="card">
        <h3 className="font-sora text-base font-bold text-slate-900">Skill Proficiency Map</h3>
        <div className="mt-4 flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-400">
            Add {3 - chartData.length} more skill categor{3 - chartData.length === 1 ? 'y' : 'ies'} to unlock this chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="font-sora text-lg font-bold text-slate-900">Skill Proficiency Map</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Your skill proficiency across different categories
        </p>
      </div>
      <ResponsiveContainer width="100%" height={420}>
        <RadarChart data={chartData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Proficiency"
            dataKey="proficiency"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.45}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '8px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              fontSize: '13px',
            }}
            formatter={(value: number) => [`${value}%`, 'Proficiency']}
          />
          <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '13px', fontWeight: 600 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
