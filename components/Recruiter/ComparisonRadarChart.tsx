'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ComparisonRadarChartProps {
  data: {
    skill: string;
    required: number;
    actual: number;
  }[];
}

const ComparisonRadarChart: React.FC<ComparisonRadarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-sm">
        No data available for chart
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <Radar
            name="Required"
            dataKey="required"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.3}
          />
          <Radar
            name="Candidate"
            dataKey="actual"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.5}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '12px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
          <span className="text-xs font-medium text-slate-600">Required</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-medium text-slate-600">Candidate</span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonRadarChart;
