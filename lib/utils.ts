import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
}

// Format currency
export function formatCurrency(
  amount: number,
  currency: string = 'INR'
): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate GitHub URL
export function isValidGitHubUrl(url: string): boolean {
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
  return githubRegex.test(url);
}

// Get skill category label
export function getSkillCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    programming_language: 'Programming Language',
    ml_framework: 'ML/DL Framework',
    framework: 'Framework',
    tool: 'Tool',
    vector_db: 'Vector Database',
    database: 'Database',
    domain_knowledge: 'Domain Knowledge',
    methodology: 'Methodology',
    certification: 'Certification',
    soft_skill: 'Soft Skill',
    devops_infra: 'DevOps & Infra',
    web_tech: 'Web Technology',
    misc: 'Miscellaneous',
  };
  return labels[category] || category;
}

// Get match score color
export function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-neutral';
}

// Get match score background
export function getMatchScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200';
  if (score >= 50) return 'bg-yellow-50 border-yellow-200';
  return 'bg-gray-50 border-gray-200';
}

// Get skill status color
export function getSkillStatusColor(status: string): string {
  const colors: Record<string, string> = {
    claimed: 'badge-neutral',
    in_progress: 'badge-warning',
    verified: 'badge-success',
  };
  return colors[status] || 'badge-neutral';
}

// Get project status color
export function getProjectStatusColor(status: string): string {
  const colors: Record<string, string> = {
    suggested: 'badge-neutral',
    accepted: 'badge-primary',
    in_progress: 'badge-warning',
    submitted: 'badge-primary',
    completed: 'badge-success',
  };
  return colors[status] || 'badge-neutral';
}

// Calculate proficiency percentage
export function getProficiencyPercentage(level: number): number {
  return Math.min(Math.max(level, 0), 100);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
