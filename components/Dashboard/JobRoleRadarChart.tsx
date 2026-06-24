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

// Skill keywords that map to each role
const ROLE_SKILL_MAP: Record<string, string[]> = {
  'Software Eng': [
    'python', 'java', 'c++', 'c#', 'algorithms', 'data structures',
    'system design', 'git', 'linux', 'testing', 'oop', 'rest',
  ],
  'Frontend Dev': [
    'react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css',
    'tailwind', 'next.js', 'redux', 'webpack', 'ui', 'ux',
  ],
  'Backend Dev': [
    'node.js', 'python', 'java', 'django', 'fastapi', 'express', 'flask',
    'sql', 'postgresql', 'mongodb', 'redis', 'rest', 'api', 'docker',
  ],
  'Full Stack Dev': [
    'react', 'node.js', 'javascript', 'typescript', 'sql', 'mongodb',
    'rest', 'api', 'html', 'css', 'git', 'docker',
  ],
  'Data Scientist': [
    'python', 'machine learning', 'deep learning', 'tensorflow', 'pytorch',
    'pandas', 'numpy', 'sql', 'statistics', 'data analysis', 'scikit',
    'jupyter', 'visualization', 'nlp',
  ],
  'DevOps Eng': [
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'jenkins',
    'terraform', 'linux', 'bash', 'git', 'monitoring', 'ansible',
  ],
};

interface JobRoleRadarChartProps {
  skills: SkillNode[];
}

function computeRoleReadiness(skills: SkillNode[], roleKeywords: string[]): number {
  if (skills.length === 0) return 0;

  let matchScore = 0;
  let totalWeight = 0;

  for (const keyword of roleKeywords) {
    const match = skills.find(
      (s) =>
        s.name.toLowerCase().includes(keyword) ||
        keyword.includes(s.name.toLowerCase())
    );
    const weight = 1;
    totalWeight += weight;
    if (match) {
      // Weight by proficiency (0–100 scale)
      matchScore += weight * (match.proficiencyLevel / 100);
    }
  }

  // Base score from keyword matches, boosted by how many skills user has overall
  const keywordScore = totalWeight > 0 ? (matchScore / totalWeight) * 100 : 0;
  // Breadth bonus: having more skills generally means more readiness
  const breadthBonus = Math.min(skills.length * 1.5, 20);

  return Math.min(Math.round(keywordScore + breadthBonus), 100);
}

export default function JobRoleRadarChart({ skills }: JobRoleRadarChartProps) {
  const chartData = Object.entries(ROLE_SKILL_MAP).map(([role, keywords]) => ({
    role,
    readiness: computeRoleReadiness(skills, keywords),
    fullMark: 100,
  }));

  const topMatches = [...chartData]
    .sort((a, b) => b.readiness - a.readiness)
    .slice(0, 3)
    .map((item) => ({
      role: item.role,
      matchScore: item.readiness,
      missingSkills: Math.max(0, Math.ceil((100 - item.readiness) / 10)),
    }));

  if (skills.length === 0) {
    return (
      <div className="card">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-slate-900">AI-Preferred Job Roles</h3>
        </div>
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-400">Add skills to see your career readiness scores</p>
        </div>
      </div>
    );
  }

  if (skills.length < 3) {
    return (
      <div className="card">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-slate-900">AI-Preferred Job Roles</h3>
        </div>
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-400">Add {3 - skills.length} more skill{3 - skills.length === 1 ? '' : 's'} to unlock role matching</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI-Preferred Job Roles</h3>
        <p className="mt-1 text-sm text-gray-600">
          Your readiness score for different career paths
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="role" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
          />
          <Radar
            name="Readiness Score"
            dataKey="readiness"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value: number) => [`${value}%`, 'Readiness']}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Top Matches</h4>
        {topMatches.map((match, index) => (
          <div
            key={match.role}
            className="flex items-center justify-between rounded-lg bg-gradient-to-r from-orange-50 to-purple-50 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-orange-400 text-sm font-bold text-white">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{match.role}</p>
                <p className="text-xs text-gray-600">
                  {match.missingSkills === 0
                    ? 'All skills matched'
                    : `~${match.missingSkills} skill${match.missingSkills > 1 ? 's' : ''} to learn`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{match.matchScore}%</p>
              <p className="text-xs text-gray-600">Ready</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
