'use client';

import React from 'react';

interface SkillGapHighlightProps {
  skills: {
    skill_name: string;
    severity: 'critical' | 'moderate' | 'minor' | 'none';
    mandatory: boolean;
  }[];
}

const SkillGapHighlight: React.FC<SkillGapHighlightProps> = ({ skills }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => {
        let style = "bg-slate-100 text-slate-700";
        if (skill.severity === 'critical') style = "bg-red-50 text-red-700 border-red-100";
        else if (skill.severity === 'moderate') style = "bg-amber-50 text-amber-700 border-amber-100";
        else if (skill.severity === 'none') style = "bg-emerald-50 text-emerald-700 border-emerald-100";

        return (
          <div 
            key={skill.skill_name}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${style}`}
          >
            {skill.skill_name}
            {skill.mandatory && skill.severity !== 'none' && (
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60"></span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SkillGapHighlight;
