'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { SkillNode } from '@/types';
import { Code2, Zap, Wrench, Brain, MessageSquare, TrendingUp, Award, Database, Laptop, BookOpen, Globe } from 'lucide-react';

interface SkillDistributionCardProps {
  skills: SkillNode[];
}

const CATEGORY_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  'programming_language': { color: '#3b82f6', icon: Code2,         label: 'Languages'      },
  'ml_framework':         { color: '#f43f5e', icon: Brain,         label: 'ML Frameworks'  },
  'framework':            { color: '#8b5cf6', icon: Zap,           label: 'Frameworks'     },
  'tool':                 { color: '#64748b', icon: Wrench,        label: 'Tools'          },
  'vector_db':            { color: '#0d9488', icon: Database,      label: 'Vector DBs'     },
  'database':             { color: '#06b6d4', icon: Database,      label: 'Databases'      },
  'domain_knowledge':     { color: '#f59e0b', icon: BookOpen,      label: 'Domain Knowledge'},
  'methodology':          { color: '#10b981', icon: TrendingUp,    label: 'Methodologies'  },
  'certification':        { color: '#eab308', icon: Award,         label: 'Certifications' },
  'soft_skill':           { color: '#ec4899', icon: MessageSquare, label: 'Soft Skills'    },
  'devops_infra':         { color: '#f97316', icon: Globe,         label: 'DevOps & Infra' },
  'web_tech':             { color: '#0ea5e9', icon: Laptop,        label: 'Web Tech'       },
  'misc':                 { color: '#94a3b8', icon: TrendingUp,    label: 'Misc'           },
};
const DEFAULT_COLOR = '#64748b';

function getProfLabel(score: number) {
  if (score >= 80) return { text: 'Expert',       cls: 'text-violet-600 bg-violet-50 border-violet-200' };
  if (score >= 60) return { text: 'Intermediate', cls: 'text-blue-600   bg-blue-50   border-blue-200'   };
  if (score >= 40) return { text: 'Beginner',     cls: 'text-amber-600  bg-amber-50  border-amber-200'  };
  return                   { text: 'Novice',       cls: 'text-slate-500  bg-slate-50  border-slate-200'  };
}

export default function SkillDistributionCard({ skills }: SkillDistributionCardProps) {
  if (!skills || skills.length === 0) return null;

  // Aggregate per category
  const catMap: Record<string, { total: number; count: number }> = {};
  skills.forEach((s) => {
    const key = s.category;
    if (!catMap[key]) catMap[key] = { total: 0, count: 0 };
    catMap[key].total += s.proficiencyLevel;
    catMap[key].count += 1;
  });

  const barData = Object.entries(catMap).map(([key, val]) => ({
    key,
    label: CATEGORY_CONFIG[key]?.label ?? key.replace(/_/g, ' '),
    avg: Math.round(val.total / val.count),
    count: val.count,
    color: CATEGORY_CONFIG[key]?.color ?? DEFAULT_COLOR,
  })).sort((a, b) => b.avg - a.avg);

  // Top 5 skills
  const topSkills = [...skills]
    .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
    .slice(0, 5);

  const overallAvg = Math.round(skills.reduce((s, k) => s + k.proficiencyLevel, 0) / skills.length);
  const { text: overallLabel, cls: overallCls } = getProfLabel(overallAvg);

  return (
    <div className="card flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-sora text-base font-bold text-slate-900">Skill Distribution</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Average proficiency by category</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-400">Overall avg.</p>
            <p className="font-sora text-2xl font-extrabold text-slate-800">{overallAvg}%</p>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${overallCls}`}>
              {overallLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
              fontWeight: 600,
            }}
            formatter={(value: number, _: string, props: any) => [
              `${value}% avg · ${props.payload.count} skill${props.payload.count !== 1 ? 's' : ''}`,
              props.payload.label,
            ]}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
            {barData.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Category legend */}
      <div className="flex flex-wrap gap-2">
        {barData.map((d) => {
          const Icon = CATEGORY_CONFIG[d.key]?.icon ?? TrendingUp;
          return (
            <div
              key={d.key}
              className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1"
            >
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-[10px] font-semibold text-slate-600">{d.label}</span>
              <span className="text-[10px] font-bold" style={{ color: d.color }}>{d.count}</span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Top 5 skills */}
      <div>
        <div className="mb-2.5 flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-amber-500" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Top Skills</p>
        </div>
        <div className="space-y-2">
          {topSkills.map((skill, idx) => {
            const cfg = CATEGORY_CONFIG[skill.category];
            const color = cfg?.color ?? DEFAULT_COLOR;
            return (
              <div
                key={skill.name}
                className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 transition-colors hover:border-violet-200 hover:bg-violet-50/40"
              >
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
                >
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">
                  {skill.name}
                </span>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${skill.proficiencyLevel}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-bold text-slate-600">
                    {skill.proficiencyLevel}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
