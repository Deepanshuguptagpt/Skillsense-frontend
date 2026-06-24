interface SkillBarProps {
  name: string;
  percentage: number;
}

export default function SkillBar({ name, percentage }: SkillBarProps) {
  // Determine gradient based on skill level
  const getGradient = (percent: number) => {
    if (percent >= 70) {
      return 'from-purple-500 to-pink-500'; // Strong skills
    } else {
      return 'from-orange-400 to-pink-400'; // Weaker skills
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700 font-medium">{name}</span>
        <span className="text-gray-600 font-semibold">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getGradient(percentage)} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
