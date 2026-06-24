import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import type { DigitalResumeData } from '@/components/Profile/ResumeReview';

interface DigitalResumeResponse {
  personalInfo?: Record<string, string | null>;
  education?: Array<{
    id: string; institution: string; degree?: string; field?: string;
    startDate?: string; endDate?: string; cgpa?: string;
  }>;
  experience?: Array<{
    id: string; company: string; role: string; startDate?: string;
    endDate?: string; description?: string; skills?: string[];
  }>;
  projects?: Array<{
    id: string; title: string; description?: string;
    techStack?: string[]; githubUrl?: string; liveUrl?: string;
  }>;
  certifications?: Array<{
    id: string; name: string; issuer?: string; issueDate?: string; url?: string;
  }>;
  resumePath?: string | null;
  uploadedAt?: string | null;
}

export function useDigitalResume() {
  const { data, isLoading, refetch } = useQuery<DigitalResumeResponse>({
    queryKey: ['digital-resume'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: DigitalResumeResponse }>(
        API_ROUTES.DIGITAL_RESUME
      );
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const hasData = data && (
    (data.education && data.education.length > 0) ||
    (data.experience && data.experience.length > 0) ||
    (data.projects && data.projects.length > 0)
  );

  return { digitalResume: data, isLoading, hasData: !!hasData, refetch };
}
