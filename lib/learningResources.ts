/**
 * Frontend learning resources helper.
 * Maps skill names to curated free resources shown on milestone cards.
 */

interface Resource {
  title: string;
  url: string;
  platform: string;
  free: boolean;
}

const RESOURCES: Record<string, Resource[]> = {
  'data structures': [
    { title: 'DSA by Abdul Bari', url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', platform: 'YouTube', free: true },
    { title: 'Striver\'s DSA Sheet', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', platform: 'TakeUForward', free: true },
    { title: 'LeetCode DSA Study Plan', url: 'https://leetcode.com/study-plan/data-structure/', platform: 'LeetCode', free: true },
  ],
  'algorithms': [
    { title: 'NeetCode 150', url: 'https://neetcode.io/practice', platform: 'NeetCode', free: true },
    { title: 'Algorithms — Princeton', url: 'https://www.coursera.org/learn/algorithms-part1', platform: 'Coursera', free: true },
    { title: 'Codeforces Practice', url: 'https://codeforces.com/', platform: 'Codeforces', free: true },
  ],
  'system design': [
    { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', platform: 'GitHub', free: true },
    { title: 'Gaurav Sen — System Design', url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX', platform: 'YouTube', free: true },
    { title: 'ByteByteGo', url: 'https://bytebytego.com/', platform: 'ByteByteGo', free: true },
  ],
  'python': [
    { title: 'Python for Everybody', url: 'https://www.coursera.org/specializations/python', platform: 'Coursera', free: true },
    { title: 'Automate the Boring Stuff', url: 'https://automatetheboringstuff.com/', platform: 'Free Book', free: true },
    { title: 'Real Python', url: 'https://realpython.com/', platform: 'Real Python', free: true },
  ],
  'java': [
    { title: 'Java MOOC — Helsinki', url: 'https://java-programming.mooc.fi/', platform: 'MOOC.fi', free: true },
    { title: 'Java Brains', url: 'https://www.youtube.com/c/JavaBrainsChannel', platform: 'YouTube', free: true },
  ],
  'c++': [
    { title: 'LearnCPP.com', url: 'https://www.learncpp.com/', platform: 'LearnCPP', free: true },
    { title: 'CP with C++ — Codeforces', url: 'https://codeforces.com/blog/entry/23054', platform: 'Codeforces', free: true },
  ],
  'machine learning': [
    { title: 'ML Specialization — Andrew Ng', url: 'https://www.coursera.org/specializations/machine-learning-introduction', platform: 'Coursera', free: true },
    { title: 'Fast.ai Practical DL', url: 'https://course.fast.ai/', platform: 'Fast.ai', free: true },
    { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', platform: 'Kaggle', free: true },
  ],
  'deep learning': [
    { title: 'Deep Learning Specialization', url: 'https://www.coursera.org/specializations/deep-learning', platform: 'Coursera', free: true },
    { title: 'Karpathy — Zero to Hero', url: 'https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ', platform: 'YouTube', free: true },
  ],
  'react': [
    { title: 'React Official Docs', url: 'https://react.dev/learn', platform: 'React Docs', free: true },
    { title: 'Full Stack Open', url: 'https://fullstackopen.com/en/', platform: 'MOOC.fi', free: true },
  ],
  'javascript': [
    { title: 'JavaScript.info', url: 'https://javascript.info/', platform: 'JS.info', free: true },
    { title: 'The Odin Project', url: 'https://www.theodinproject.com/', platform: 'Odin Project', free: true },
  ],
  'sql': [
    { title: 'LeetCode SQL 50', url: 'https://leetcode.com/studyplan/top-sql-50/', platform: 'LeetCode', free: true },
    { title: 'SQLZoo', url: 'https://sqlzoo.net/', platform: 'SQLZoo', free: true },
  ],
  'cloud computing': [
    { title: 'AWS Cloud Practitioner', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/', platform: 'AWS', free: true },
    { title: 'Google Cloud Skills Boost', url: 'https://cloudskillsboost.google/', platform: 'Google Cloud', free: true },
  ],
  'git': [
    { title: 'Learn Git Branching', url: 'https://learngitbranching.js.org/', platform: 'Interactive', free: true },
    { title: 'GitHub Skills', url: 'https://skills.github.com/', platform: 'GitHub', free: true },
  ],
  'mathematics': [
    { title: '3Blue1Brown — Linear Algebra', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', platform: 'YouTube', free: true },
    { title: 'Khan Academy Math', url: 'https://www.khanacademy.org/math', platform: 'Khan Academy', free: true },
  ],
  'embedded systems': [
    { title: 'Neso Academy — Embedded C', url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm', platform: 'YouTube', free: true },
  ],
  'cybersecurity': [
    { title: 'TryHackMe Beginner Path', url: 'https://tryhackme.com/path/outline/beginner', platform: 'TryHackMe', free: true },
    { title: 'Google Cybersecurity Cert', url: 'https://www.coursera.org/professional-certificates/google-cybersecurity', platform: 'Coursera', free: true },
  ],
};

export function getResources(skillName: string): Resource[] {
  const normalized = skillName.toLowerCase().trim();

  // Direct match
  if (RESOURCES[normalized]) return RESOURCES[normalized];

  // Partial match
  for (const [key, resources] of Object.entries(RESOURCES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return resources;
    }
  }

  // Generic fallback
  return [
    {
      title: `Search "${skillName}" on YouTube`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skillName + ' tutorial')}`,
      platform: 'YouTube',
      free: true,
    },
    {
      title: `"${skillName}" on Coursera`,
      url: `https://www.coursera.org/search?query=${encodeURIComponent(skillName)}`,
      platform: 'Coursera',
      free: true,
    },
  ];
}
