// Enums
export enum UserRole {
  CANDIDATE = 'candidate',
  RECRUITER = 'recruiter',
  ADMIN = 'admin',
}

export enum SkillStatus {
  CLAIMED = 'claimed',
  IN_PROGRESS = 'in_progress',
  VERIFIED = 'verified',
}

export enum SkillCategory {
  PROGRAMMING_LANGUAGE = 'programming_language',
  ML_FRAMEWORK = 'ml_framework',
  FRAMEWORK = 'framework',
  TOOL = 'tool',
  VECTOR_DB = 'vector_db',
  DATABASE = 'database',
  DOMAIN_KNOWLEDGE = 'domain_knowledge',
  METHODOLOGY = 'methodology',
  CERTIFICATION = 'certification',
  SOFT_SKILL = 'soft_skill',
  DEVOPS_INFRA = 'devops_infra',
  WEB_TECH = 'web_tech',
  MISC = 'misc',
}

export enum SkillSource {
  RESUME = 'resume',
  PROJECT = 'project',
  VALIDATION = 'validation',
  MANUAL = 'manual',
}

export enum ProjectStatus {
  SUGGESTED = 'suggested',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  COMPLETED = 'completed',
}

export enum ValidationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PASSED = 'passed',
  FAILED = 'failed',
  NEEDS_REVISION = 'needs_revision',
}

// Core Types
export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUsername?: string;
  portfolioUrl?: string;
  leetcodeUrl?: string;
  hackerrankUrl?: string;
  codeforcesUrl?: string;
  codechefUrl?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  cgpa?: number;
  current: boolean;
}

export interface Experience {
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  skills: string[];
}

export interface Project {
  projectId: string;
  title: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  skills: string[];
  validated: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface GitHubProject {
  repo_name: string;
  repo_url: string;
  summary: string;
  tech_stack: string[];
  skills: { name: string; category: string }[];
  project_type: string;
  stars: number;
}

export interface StudentProfile {
  userId: string;
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  resumeS3Uri?: string;
  resumeUploadedAt?: string;
  role: UserRole;
  onboardingComplete: boolean;
  targetRoleId?: string;
  targetRoleName?: string;
  githubProjects?: GitHubProject[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface SkillNode {
  skillId: string;
  name: string;
  category: SkillCategory;
  status: SkillStatus;
  proficiencyLevel: number;
  verifiedAt?: string;
  validationId?: string;
  source: SkillSource;
  relatedSkills: string[];
}

export interface SkillGraph {
  userId: string;
  skills: SkillNode[];
  totalSkills: number;
  verifiedSkills: number;
  lastUpdated: string;
}

export interface RequiredSkill {
  name: string;
  proficiencyLevel: number;
  mandatory: boolean;
  weight?: number;
}

export interface Internship {
  internshipId: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: RequiredSkill[];
  preferredSkills: string[];
  duration: string;
  stipend?: {
    amount: number;
    currency: string;
    period: 'monthly' | 'total';
    display?: string;
  };
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  applicationDeadline: string | null;
  startDate: string | null;
  endDate?: string;
  daysUntilDeadline: number | null;
  isDeadlineSoon: boolean;
  applicationUrl?: string;
  status: 'active' | 'closed' | 'draft';
  category?: string;
  subcategory?: string;
  tags?: string[];
  benefits?: string[];
  eligibilityCriteria?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillGap {
  skillName: string;
  required: boolean;
  currentProficiency: number;
  targetProficiency: number;
  priority: 'high' | 'medium' | 'low';
}

export interface InternshipMatch {
  internship: Internship;
  matchScore: number;
  missingSkills: (SkillGap | string)[];
  matchedSkills: string[];
  recommendation?: string;
}

export interface ClassifiedInternships {
  eligible: InternshipMatch[];
  almostEligible: InternshipMatch[];
  notEligible: InternshipMatch[];
}

export interface Milestone {
  milestoneId?: string;
  title: string;
  description: string;
  tasks: string[];
  estimatedHours: number;
  order?: number;
}

export interface ValidationCriterion {
  criterionId?: string;
  criterion: string;
  weight: number;
  checkType: 'automated' | 'manual' | 'ai';
  checkDetails?: string;
}

export interface Resource {
  type: 'documentation' | 'tutorial' | 'video' | 'article' | 'tool';
  title: string;
  url: string;
  description?: string;
}

export interface GeneratedProject {
  projectId: string;
  userId: string;
  title: string;
  description: string;
  objectives: string[];
  targetSkills: string[];
  techStack: {
    category: 'frontend' | 'backend' | 'database' | 'devops' | 'other';
    technology: string;
    version?: string;
    purpose: string;
  }[];
  milestones: Milestone[];
  validationCriteria: ValidationCriterion[];
  resources: Resource[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  status: ProjectStatus;
  submissionId?: string;
  githubRepoUrl?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillScore {
  skillName: string;
  targetProficiency: number;
  achievedProficiency: number;
  score: number;
  verified: boolean;
  evidence: string[];
}

export interface ValidationFeedback {
  strengths: string[];
  improvements: string[];
  detailedComments: string;
  nextSteps?: string[];
}

export interface ValidationResult {
  validationId: string;
  userId: string;
  projectId: string;
  status: ValidationStatus;
  overallScore: number;
  skillScores: SkillScore[];
  verifiedSkills: string[];
  feedback: ValidationFeedback;
  validatedAt: string;
}

// Recruiter Types
export interface RecruiterProfile {
  id: string;
  user_id: string;
  full_name: string;
  company: string;
  designation?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface RequiredSkillIn {
  name: string;
  proficiency_level: number;
  mandatory: boolean;
  weight: number;
}

export interface RecruiterJob {
  id: string;
  recruiter_id: string;
  title: string;
  description?: string;
  role_type: string;
  required_skills: RequiredSkillIn[];
  duration?: string;
  stipend?: string;
  deadline?: string;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface CandidateMatch {
  candidate_id: string;
  user_id: string;
  name: string;
  email: string;
  match_score: number;
  score_breakdown: any;
  shortlisted: boolean;
  applied: boolean;
  applied_at?: string;
}

export interface CandidateProfileDetail {
  candidate_id: string;
  user_id: string;
  name: string;
  email: string;
  college?: string;
  graduation_year?: number;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  skill_count: number;
  verified_skill_count: number;
  readiness_score?: number;
  readiness_classification?: string;
  match_score?: number;
  match_score_breakdown?: any;
}
