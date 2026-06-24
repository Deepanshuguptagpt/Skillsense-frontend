'use client';

import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface MatchReasoningCardProps {
  scoreBreakdown: {
    classification: string;
    missing_mandatory: number;
    skill_details: {
      skill_name: string;
      severity: string;
      contribution: number;
    }[];
  };
}

const MatchReasoningCard: React.FC<MatchReasoningCardProps> = ({ scoreBreakdown }) => {
  const details = scoreBreakdown?.skill_details || [];
  const strengths = details.filter(s => s.severity === 'none' && s.skill_name);
  const gaps = details.filter(s => s.severity !== 'none' && s.skill_name);

  return (
    <div className="card bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/30 border-indigo-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="h-20 w-20 text-indigo-600" />
      </div>

      <div className="flex items-center gap-3 mb-6 relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-100">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">AI Match Intelligence</h3>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
            Predictive Eligibility Analysis
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h4 className="text-sm font-semibold text-slate-800">Key Strengths</h4>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.slice(0, 3).map(s => (
                <li key={s.skill_name} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>
                    Mastery in <strong>{s.skill_name}</strong> contributes significantly to readiness.
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">No significant strengths identified yet.</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <h4 className="text-sm font-semibold text-slate-800">Improvement Gaps</h4>
          </div>
          {gaps.length > 0 ? (
            <ul className="space-y-2">
              {gaps.slice(0, 3).map(s => (
                <li key={s.skill_name} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>
                    Skill gap in <strong>{s.skill_name}</strong> is a {s.severity} risk.
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 italic">
              Candidate perfectly aligns with job requirements.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Eligibility Status</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter ${
            scoreBreakdown.classification === 'eligible' 
              ? 'bg-emerald-100 text-emerald-700' 
              : scoreBreakdown.classification === 'almost-eligible'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {scoreBreakdown.classification.replace('-', ' ')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatchReasoningCard;
