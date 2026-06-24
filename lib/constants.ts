// API Routes
export const API_ROUTES = {
  // Auth
  SIGNUP: '/auth/signup',
  SIGNIN: '/auth/signin',
  SIGNOUT: '/auth/signout',
  REFRESH: '/auth/refresh',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_CODE: '/auth/resend-code',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  DELETE_ACCOUNT: '/auth/account',

  // Profile
  PROFILE: '/profile',
  UPLOAD_RESUME: '/profile/upload-resume',
  DIGITAL_RESUME: '/profile/digital-resume',
  UPDATE_RESUME_SECTION: '/profile/digital-resume/section',

  // Skills
  SKILLS: '/skills',
  SKILL_GAPS: '/skills/gaps',
  READINESS: '/skills/readiness',

  // Internships
  INTERNSHIPS: '/internships',
  INTERNSHIPS_CLASSIFY: '/internships/classify',

  // Projects
  PROJECTS: '/projects',
  GENERATE_PROJECT: '/projects/generate',
  PROJECT_COMPLETE: (id: string) => `/projects/${id}/complete`,
  PROJECT_STATUS: (id: string) => `/projects/${id}/status`,

  // Validation
  VALIDATE_SUBMIT: '/validate/submit',
  VALIDATE_STATUS: (id: string) => `/validate/${id}`,
  VALIDATE_HISTORY: '/validate/history',
  
  // Chat
  CHAT_MESSAGE: '/api/v1/chat/message',

  // SkillGenie v1 (legacy)
  SKILLGENIE_QUESTIONS: '/api/v1/skillgenie/questions',
  SKILLGENIE_ANALYZE: '/api/v1/skillgenie/analyze',
  SKILLGENIE_SUGGEST_PROJECT: '/api/v1/skillgenie/suggest-project',
  SKILLGENIE_VERIFY: '/api/v1/skillgenie/verify',

  // SkillGenie v2 (new unified intelligence)
  SKILLGENIE_CHAT: '/api/v2/skillgenie/chat',
  SKILLGENIE_SESSIONS: '/api/v2/skillgenie/sessions',
  SKILLGENIE_SESSION: (id: string) => `/api/v2/skillgenie/sessions/${id}`,
  SKILLGENIE_ACTION: '/api/v2/skillgenie/action',
  SKILLGENIE_CONTEXT: '/api/v2/skillgenie/context',
  SKILLGENIE_SUGGESTIONS: '/api/v2/skillgenie/suggestions',
  
  // Intelligence
  PREDICT_CAREER_READINESS: (userId: string, targetRole: string) => 
    `/api/v1/intelligence/predict/career-readiness/${userId}/${encodeURIComponent(targetRole)}`,

  // Government Opportunities
  GOVT_OPPORTUNITIES: '/govt-opportunities',
  GOVT_OPPORTUNITY_DETAIL: (id: string) => `/govt-opportunities/${id}`,

  // Portfolio
  PORTFOLIO: (username: string) => `/portfolio/${username}`,

  // Internship detail
  INTERNSHIP_DETAIL: (id: string) => `/internships/${id}`,

  // Opportunities
  OPPORTUNITIES: '/candidates/opportunities',
  OPPORTUNITY_DETAIL: (id: string) => `/candidates/opportunities/${id}`,

  // GitHub
  GITHUB_LINK: '/candidates/github',
  GITHUB_STATUS: '/candidates/github/status',
  GITHUB_REFRESH: '/candidates/github/refresh',

  // Manual project ingestion
  CANDIDATE_PROJECTS: '/candidates/projects',

  // Target roles
  TARGET_ROLES: '/candidates/target-roles',
  SET_TARGET_ROLE: '/candidates/target-role',

  // Quiz
  QUIZ_ATTEMPT: '/quiz/attempt',
  QUIZ_PROFILE: '/quiz/profile',

  // Learning
  LEARNING_PATH: '/learning/path',
  LEARNING_PATHS: '/learning/paths',
  LEARNING_PATH_DELETE: (roleId: string) => `/learning/paths/${roleId}`,
  LEARNING_MILESTONES: '/learning/milestones',
  LEARNING_MILESTONE_SUBMIT: (id: string) => `/learning/milestones/${id}/submit`,
  LEARNING_MILESTONE_ROADMAP: (id: string) => `/learning/milestones/${id}/roadmap`,
  LEARNING_MILESTONE_ASSESSMENT: (id: string) => `/learning/milestones/${id}/assessment`,
  LEARNING_MILESTONE_VERIFY: (id: string) => `/learning/milestones/${id}/verify-assessment`,
  LEARNING_PROGRESS: '/learning/progress',

  // Recruiter
  RECRUITER_PROFILE: '/recruiter/profile',
  RECRUITER_JOBS: '/recruiter/jobs?_t=1',
  RECRUITER_JOB_DETAIL: (id: string) => `/recruiter/jobs/${id}`,
  RECRUITER_JOB_CANDIDATES: (id: string) => `/recruiter/jobs/${id}/candidates`,
  RECRUITER_SHORTLIST: (jobId: string, candidateId: string) => `/recruiter/jobs/${jobId}/candidates/${candidateId}/shortlist`,
  RECRUITER_CANDIDATE_DETAIL: (id: string, jobId?: string) => `/recruiter/candidates/${id}${jobId ? `?job_id=${jobId}` : ''}`,
  RECRUITER_ANALYTICS: '/recruiter/analytics',

  // Application Tracker
  APPLICATIONS: '/applications',
  APPLICATION_STATS: '/applications/stats',
  APPLICATION_DELETE: (id: string) => `/applications/${id}`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_COUNT: '/notifications/count',
  NOTIFICATIONS_READ_ALL: '/notifications/read',
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
} as const;

// App Routes
export const APP_ROUTES = {
  HOME: '/',
  SIGNUP: '/auth/signup',
  SIGNIN: '/auth/signin',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  INTERNSHIPS: '/internships',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
  SKILLGENIE: '/skillgenie',
  SKILLGENIE_ASSESSMENT: '/skillgenie/assessment',
  SKILLGENIE_PROJECT: '/skillgenie/project',
  SKILLGENIE_RESULT: '/skillgenie/result',
  SKILLGENIE_SUBMIT: '/skillgenie/submit',
  LEARNING: '/learning',
  OPPORTUNITIES: '/opportunities',
  INTERNSHIP_DETAIL: (id: string) => `/internships/${id}`,
  PORTFOLIO: (username: string) => `/u/${username}`,
  RECRUITER_DASHBOARD: '/recruiter/dashboard',
  RECRUITER_JOBS: '/recruiter/jobs',
  RECRUITER_PROFILE: '/recruiter/profile',
} as const;

// Skill Categories
export const SKILL_CATEGORIES = [
  { value: 'programming_language', label: 'Programming Language' },
  { value: 'ml_framework', label: 'ML/DL Framework' },
  { value: 'framework', label: 'Framework' },
  { value: 'tool', label: 'Tool' },
  { value: 'vector_db', label: 'Vector Database' },
  { value: 'database', label: 'Database' },
  { value: 'domain_knowledge', label: 'Domain Knowledge' },
  { value: 'methodology', label: 'Methodology' },
  { value: 'certification', label: 'Certification' },
  { value: 'soft_skill', label: 'Soft Skill' },
  { value: 'devops_infra', label: 'DevOps & Infra' },
  { value: 'web_tech', label: 'Web Technology' },
  { value: 'misc', label: 'Miscellaneous' },
] as const;

// Student Levels
export const STUDENT_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

// Internship Types
export const INTERNSHIP_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

// Project Status
export const PROJECT_STATUSES = [
  { value: 'suggested', label: 'Suggested' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'completed', label: 'Completed' },
] as const;

// File Upload
export const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

export const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const INTERNSHIPS_PAGE_SIZE = 50;

// Cache Times (in milliseconds)
export const CACHE_TIMES = {
  PROFILE: 5 * 60 * 1000, // 5 minutes
  SKILLS: 5 * 60 * 1000, // 5 minutes
  INTERNSHIPS: 60 * 60 * 1000, // 1 hour
  PROJECTS: 5 * 60 * 1000, // 5 minutes
} as const;

// Toast Auto-dismiss Time
export const TOAST_DURATION = 5000; // 5 seconds

// Validation
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
