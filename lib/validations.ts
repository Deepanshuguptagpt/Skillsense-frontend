import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from './constants';

// Auth Schemas
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter Valid email address error'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .regex(
      PASSWORD_REGEX,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string(),
  qualification: z.string().min(2, 'Qualification is required'),
  location: z.string().min(2, 'Location is required'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  resume: z.any().optional(), // File upload handled separately
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const signinSchema = z.object({
  email: z.string().email('Enter Valid email address error'),
  password: z.string().min(1, 'Password is required'),
});

// Profile Schemas
export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter Valid email address error'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUsername: z.string().optional(),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const educationSchema = z.object({
  institution: z.string().min(2, 'Institution name is required'),
  degree: z.string().min(2, 'Degree is required'),
  field: z.string().min(2, 'Field of study is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  current: z.boolean(),
});

export const experienceSchema = z.object({
  company: z.string().min(2, 'Company name is required'),
  role: z.string().min(2, 'Role is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  skills: z.array(z.string()),
});

// Skill Schemas
export const addSkillSchema = z.object({
  skillName: z.string().min(2, 'Skill name must be at least 2 characters'),
  category: z.enum([
    'programming_language',
    'ml_framework',
    'framework',
    'tool',
    'vector_db',
    'database',
    'domain_knowledge',
    'methodology',
    'certification',
    'soft_skill',
    'devops_infra',
    'web_tech',
    'misc',
  ]),
  proficiencyLevel: z.number().min(0).max(100).optional(),
});

// Project Schemas
export const generateProjectSchema = z.object({
  targetSkills: z
    .array(z.string())
    .min(1, 'Select at least one skill to learn'),
  studentLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  timeCommitment: z.string().optional(),
  preferences: z
    .object({
      domain: z.string().optional(),
      techStack: z.array(z.string()).optional(),
      projectType: z.string().optional(),
    })
    .optional(),
});

export const submitProjectSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  githubRepoUrl: z
    .string()
    .url('Invalid URL')
    .regex(
      /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/,
      'Must be a valid GitHub repository URL'
    ),
  description: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// Types inferred from schemas
export type SignupFormData = z.infer<typeof signupSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
export type ExperienceFormData = z.infer<typeof experienceSchema>;
export type AddSkillFormData = z.infer<typeof addSkillSchema>;
export type GenerateProjectFormData = z.infer<typeof generateProjectSchema>;
export type SubmitProjectFormData = z.infer<typeof submitProjectSchema>;
