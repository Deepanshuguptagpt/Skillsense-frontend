'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useNotificationStore } from '@/lib/notifications';
import ResumeReview, { DigitalResumeData } from '@/components/Profile/ResumeReview';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

interface ResumeUploadStepProps {
  onComplete: (data: { extractedSkills: string[]; extractedProfile?: Record<string, any>; digitalResume?: Record<string, any> }) => void;
}

export default function ResumeUploadStep({ onComplete }: ResumeUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [digitalResume, setDigitalResume] = useState<DigitalResumeData | null>(null);
  const [uploadResult, setUploadResult] = useState<{ skills: string[]; profile?: Record<string, any> } | null>(null);
  const { uploadResume, isUploading } = useProfile();
  const { addNotification } = useNotificationStore();
  const { deleteAccount, isDeletingAccount } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
  };

  const handleFileUpload = async (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.type)) {
      addNotification('error', 'Please upload a PDF, DOCX, or TXT file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addNotification('error', 'File size must be less than 10MB');
      return;
    }

    try {
      const response = await uploadResume(file) as any;
      // Backend wraps result in { success, data: {...}, message }
      const result = response?.data || response || {};
      const skills: string[] = result?.extractedSkills || result?.parsedProfile?.skills || [];
      const profile = result?.extractedProfile || {};

      // Build the digital resume preview from the returned structured data
      const dr: DigitalResumeData = result?.digitalResume || {
        personalInfo: profile,
        education: profile?.education || [],
        experience: profile?.experience || [],
        projects: profile?.projects || [],
        certifications: profile?.certifications || [],
        skills: (result?.skills || []).map((s: any) => typeof s === 'string' ? { name: s } : s),
      };

      setUploadResult({ skills, profile });
      setDigitalResume(dr);
    } catch (error) {
      addNotification('error', 'Failed to upload resume. Please try again.');
    }
  };

  // Show review screen after upload
  if (digitalResume && uploadResult) {
    return (
      <ResumeReview
        data={digitalResume}
        onConfirm={() =>
          onComplete({
            extractedSkills: uploadResult.skills,
            extractedProfile: uploadResult.profile,
            digitalResume: digitalResume as any,
          })
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
          <Upload className="h-10 w-10 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
        <p className="text-gray-600">
          AI will parse your resume and build your digital profile
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer ${dragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('resume-upload')?.click()}
      >
        <input
          id="resume-upload"
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-lg font-semibold text-gray-900 mt-4">Extracting with AI...</p>
            <p className="text-sm text-gray-500 mt-1">Parsing skills, experience, and projects</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">
              Drop your resume here or click to browse
            </p>
            <p className="text-sm text-gray-500">PDF, DOCX, or TXT — max 10MB</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => onComplete({ extractedSkills: [], extractedProfile: {} })}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              try {
                await deleteAccount();
              } catch (error) {
                // error is handled by useAuth
              }
            }
          }}
          disabled={isDeletingAccount}
          className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-left">
        {[
          { title: 'Smart Parsing', desc: 'Extracts skills, experience, and projects' },
          { title: 'Review & Edit', desc: 'Confirm what AI extracted before saving' },
          { title: 'Digital Profile', desc: 'Auto-populates your complete profile' },
        ].map(({ title, desc }) => (
          <div key={title} className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
