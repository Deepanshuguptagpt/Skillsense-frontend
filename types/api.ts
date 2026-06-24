// API Request/Response Types

// Auth
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  role?: 'candidate' | 'recruiter';
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  userId?: string;
  user?: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
  message?: string;
  error?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Profile
export interface UploadResumeResponse {
  success: boolean;
  s3Uri?: string;
  parsedProfile?: {
    name: string;
    email: string;
    phone?: string;
    education: unknown[];
    experience: unknown[];
    skills: string[];
    projects: unknown[];
    certifications: unknown[];
  };
  message?: string;
  error?: string;
}

// Skills
export interface AddSkillRequest {
  skillName: string;
  category: string;
  proficiencyLevel?: number;
}

// Projects
export interface GenerateProjectRequest {
  targetSkills: string[];
  studentLevel: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment?: string;
  preferences?: {
    domain?: string;
    techStack?: string[];
    projectType?: string;
  };
}

export interface UpdateProjectStatusRequest {
  status: 'accepted' | 'in_progress' | 'submitted' | 'completed';
}

// Validation
export interface SubmitProjectRequest {
  projectId: string;
  githubRepoUrl: string;
  description?: string;
  additionalNotes?: string;
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
