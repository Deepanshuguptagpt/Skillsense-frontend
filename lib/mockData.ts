import {
  StudentProfile,
  SkillGraph,
  ClassifiedInternships,
  GeneratedProject,
  UserRole,
  SkillStatus,
  SkillCategory,
  SkillSource,
  ProjectStatus,
} from '@/types';

// Mock User
export const mockUser = {
  userId: 'user-123',
  email: 'rahul.kumar@example.com',
  name: 'Rahul Kumar',
  role: 'student',
};

// Mock Profile
export const mockProfile: StudentProfile = {
  userId: 'user-123',
  personalInfo: {
    name: 'Rahul Kumar',
    email: 'rahul.kumar@example.com',
    phone: '+91 9876543210',
    location: 'Bangalore, India',
    linkedinUrl: 'https://linkedin.com/in/rahulkumar',
    githubUsername: 'rahulkumar',
    portfolioUrl: 'https://rahulkumar.dev',
  },
  education: [
    {
      institution: 'Indian Institute of Technology, Delhi',
      degree: 'Bachelor of Technology',
      field: 'Computer Science',
      startDate: '2021-08-01',
      endDate: '2025-05-31',
      cgpa: 8.5,
      current: true,
    },
  ],
  experience: [
    {
      company: 'Tech Startup Inc',
      role: 'Software Engineering Intern',
      description:
        'Developed REST APIs using Node.js and Express. Worked on React frontend.',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      current: false,
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    },
  ],
  projects: [
    {
      projectId: 'proj-1',
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce application with payment integration',
      githubUrl: 'https://github.com/rahulkumar/ecommerce',
      liveUrl: 'https://myecommerce.com',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      validated: false,
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      issueDate: '2024-01-15',
      credentialUrl: 'https://aws.amazon.com/verification/123',
    },
  ],
  resumeS3Uri: 's3://skillsense-resumes/user-123/resume.pdf',
  resumeUploadedAt: '2024-02-01T10:00:00Z',
  role: UserRole.CANDIDATE,
  onboardingComplete: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-02-01T10:00:00Z',
  lastLoginAt: '2024-03-04T12:00:00Z',
};

// Mock Skill Graph
export const mockSkillGraph: SkillGraph = {
  userId: 'user-123',
  skills: [
    {
      skillId: 'skill-1',
      name: 'JavaScript',
      category: SkillCategory.PROGRAMMING_LANGUAGE,
      status: SkillStatus.VERIFIED,
      proficiencyLevel: 85,
      verifiedAt: '2024-02-15T10:00:00Z',
      validationId: 'val-1',
      source: SkillSource.PROJECT,
      relatedSkills: ['skill-2', 'skill-3'],
    },
    {
      skillId: 'skill-2',
      name: 'React',
      category: SkillCategory.FRAMEWORK,
      status: SkillStatus.VERIFIED,
      proficiencyLevel: 80,
      verifiedAt: '2024-02-15T10:00:00Z',
      validationId: 'val-1',
      source: SkillSource.PROJECT,
      relatedSkills: ['skill-1'],
    },
    {
      skillId: 'skill-3',
      name: 'Node.js',
      category: SkillCategory.FRAMEWORK,
      status: SkillStatus.VERIFIED,
      proficiencyLevel: 75,
      verifiedAt: '2024-02-15T10:00:00Z',
      validationId: 'val-1',
      source: SkillSource.RESUME,
      relatedSkills: ['skill-1'],
    },
    {
      skillId: 'skill-4',
      name: 'Python',
      category: SkillCategory.PROGRAMMING_LANGUAGE,
      status: SkillStatus.CLAIMED,
      proficiencyLevel: 60,
      source: SkillSource.RESUME,
      relatedSkills: [],
    },
    {
      skillId: 'skill-5',
      name: 'Docker',
      category: SkillCategory.TOOL,
      status: SkillStatus.IN_PROGRESS,
      proficiencyLevel: 40,
      source: SkillSource.MANUAL,
      relatedSkills: [],
    },
  ],
  totalSkills: 5,
  verifiedSkills: 3,
  lastUpdated: '2024-02-15T10:00:00Z',
};

// Mock Classified Internships
export const mockClassifiedInternships: ClassifiedInternships = {
  eligible: [
    {
      internship: {
        internshipId: 'int-1',
        title: 'Frontend Developer Intern',
        company: 'Google',
        description:
          'Work on cutting-edge web applications using React and TypeScript.',
        requiredSkills: [
          { name: 'JavaScript', proficiencyLevel: 70, mandatory: true },
          { name: 'React', proficiencyLevel: 70, mandatory: true },
          { name: 'TypeScript', proficiencyLevel: 60, mandatory: false },
        ],
        preferredSkills: ['Redux', 'Next.js'],
        duration: '6 months',
        stipend: { amount: 50000, currency: 'INR', period: 'monthly' },
        location: 'Bangalore',
        type: 'hybrid',
        applicationDeadline: '2026-04-15T23:59:59Z',
        startDate: '2026-05-01T00:00:00Z',
        daysUntilDeadline: 90,
        isDeadlineSoon: false,
        applicationUrl: 'https://careers.google.com/apply/123',
        status: 'active',
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z',
      },
      matchScore: 85,
      missingSkills: [],
      matchedSkills: ['JavaScript', 'React'],
      recommendation: 'Great match! Apply now.',
    },
  ],
  almostEligible: [
    {
      internship: {
        internshipId: 'int-2',
        title: 'Full Stack Developer Intern',
        company: 'Microsoft',
        description: 'Build scalable applications using modern tech stack.',
        requiredSkills: [
          { name: 'JavaScript', proficiencyLevel: 70, mandatory: true },
          { name: 'React', proficiencyLevel: 70, mandatory: true },
          { name: 'Node.js', proficiencyLevel: 70, mandatory: true },
          { name: 'PostgreSQL', proficiencyLevel: 60, mandatory: true },
        ],
        preferredSkills: ['AWS', 'Docker'],
        duration: '6 months',
        stipend: { amount: 60000, currency: 'INR', period: 'monthly' },
        location: 'Hyderabad',
        type: 'onsite',
        applicationDeadline: '2026-04-20T23:59:59Z',
        startDate: '2026-05-15T00:00:00Z',
        daysUntilDeadline: 90,
        isDeadlineSoon: false,
        status: 'active',
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z',
      },
      matchScore: 65,
      missingSkills: [
        {
          skillName: 'PostgreSQL',
          required: true,
          currentProficiency: 0,
          targetProficiency: 60,
          priority: 'high',
        },
      ],
      matchedSkills: ['JavaScript', 'React', 'Node.js'],
      recommendation: 'Learn PostgreSQL to become eligible.',
    },
  ],
  notEligible: [
    {
      internship: {
        internshipId: 'int-3',
        title: 'Machine Learning Intern',
        company: 'Amazon',
        description: 'Work on ML models and data pipelines.',
        requiredSkills: [
          { name: 'Python', proficiencyLevel: 80, mandatory: true },
          { name: 'TensorFlow', proficiencyLevel: 70, mandatory: true },
          { name: 'PyTorch', proficiencyLevel: 70, mandatory: true },
          { name: 'SQL', proficiencyLevel: 60, mandatory: true },
        ],
        preferredSkills: ['Kubernetes', 'AWS SageMaker'],
        duration: '6 months',
        stipend: { amount: 70000, currency: 'INR', period: 'monthly' },
        location: 'Bangalore',
        type: 'remote',
        applicationDeadline: '2026-04-30T23:59:59Z',
        startDate: '2026-06-01T00:00:00Z',
        daysUntilDeadline: 90,
        isDeadlineSoon: false,
        status: 'active',
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z',
      },
      matchScore: 25,
      missingSkills: [
        {
          skillName: 'TensorFlow',
          required: true,
          currentProficiency: 0,
          targetProficiency: 70,
          priority: 'high',
        },
        {
          skillName: 'PyTorch',
          required: true,
          currentProficiency: 0,
          targetProficiency: 70,
          priority: 'high',
        },
        {
          skillName: 'SQL',
          required: true,
          currentProficiency: 0,
          targetProficiency: 60,
          priority: 'high',
        },
      ],
      matchedSkills: ['Python'],
      recommendation: 'Build ML skills through projects.',
    },
  ],
};

// Mock Projects
export const mockProjects: GeneratedProject[] = [
  {
    projectId: 'proj-gen-1',
    userId: 'user-123',
    title: 'Build a PostgreSQL-backed Task Manager',
    description:
      'Create a full-stack task management application with user authentication, CRUD operations, and PostgreSQL database.',
    objectives: [
      'Learn PostgreSQL database design',
      'Implement CRUD operations',
      'Build RESTful APIs',
      'Create responsive UI',
    ],
    targetSkills: ['PostgreSQL', 'SQL', 'Database Design'],
    techStack: [
      {
        category: 'backend',
        technology: 'Node.js',
        version: '18.x',
        purpose: 'Server runtime',
      },
      {
        category: 'database',
        technology: 'PostgreSQL',
        version: '15.x',
        purpose: 'Primary database',
      },
      {
        category: 'frontend',
        technology: 'React',
        version: '18.x',
        purpose: 'User interface',
      },
    ],
    milestones: [
      {
        milestoneId: 'ms-1',
        title: 'Database Schema Design',
        description: 'Design and implement PostgreSQL schema',
        tasks: [
          'Create users table',
          'Create tasks table with foreign keys',
          'Add indexes for performance',
          'Write migration scripts',
        ],
        estimatedHours: 8,
        order: 1,
      },
      {
        milestoneId: 'ms-2',
        title: 'Backend API Development',
        description: 'Build RESTful APIs with Express',
        tasks: [
          'Set up Express server',
          'Implement authentication',
          'Create CRUD endpoints',
          'Add input validation',
        ],
        estimatedHours: 12,
        order: 2,
      },
      {
        milestoneId: 'ms-3',
        title: 'Frontend Development',
        description: 'Build React UI',
        tasks: [
          'Create login/signup pages',
          'Build task list component',
          'Implement task creation form',
          'Add task editing and deletion',
        ],
        estimatedHours: 10,
        order: 3,
      },
    ],
    validationCriteria: [
      {
        criterionId: 'vc-1',
        criterion: 'Database schema is properly normalized',
        weight: 30,
        checkType: 'ai',
      },
      {
        criterionId: 'vc-2',
        criterion: 'All CRUD operations work correctly',
        weight: 40,
        checkType: 'automated',
      },
      {
        criterionId: 'vc-3',
        criterion: 'Code follows best practices',
        weight: 30,
        checkType: 'ai',
      },
    ],
    resources: [
      {
        type: 'documentation',
        title: 'PostgreSQL Official Docs',
        url: 'https://www.postgresql.org/docs/',
        description: 'Complete PostgreSQL documentation',
      },
      {
        type: 'tutorial',
        title: 'Node.js + PostgreSQL Tutorial',
        url: 'https://node-postgres.com/',
        description: 'Learn to use PostgreSQL with Node.js',
      },
    ],
    difficulty: 'intermediate',
    estimatedDuration: '3-4 weeks',
    status: ProjectStatus.SUGGESTED,
    createdAt: '2024-03-04T10:00:00Z',
    updatedAt: '2024-03-04T10:00:00Z',
  },
];
