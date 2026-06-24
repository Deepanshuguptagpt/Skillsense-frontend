'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle, Sparkles, Eye } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';
import { ALLOWED_RESUME_TYPES, MAX_RESUME_SIZE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import ResumeReview, { DigitalResumeData } from './ResumeReview';
import { notify } from '@/hooks/useNotifications';

interface ResumeUploadProps {
  onReviewComplete?: () => void;
}

export default function ResumeUpload({ onReviewComplete }: ResumeUploadProps) {
  const { profile, uploadResume, isUploading } = useProfile();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [digitalResume, setDigitalResume] = useState<DigitalResumeData | null>(null);
  const [uploadedSkills, setUploadedSkills] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  const hasResume = profile?.resumeS3Uri || profile?.resumeUploadedAt;

  const validateFile = (file: File): boolean => {
    setError('');
    if (!ALLOWED_RESUME_TYPES.includes(file.type as typeof ALLOWED_RESUME_TYPES[number])) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return false;
    }
    if (file.size > MAX_RESUME_SIZE) {
      setError('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setDigitalResume(null);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const response = await uploadResume(selectedFile) as any;
      // Backend wraps result in { success, data: {...}, message }
      const result = response?.data || response || {};
      const skills: string[] = result?.extractedSkills || [];

      // Build digital resume from returned structured data
      const dr: DigitalResumeData = result?.digitalResume || {
        personalInfo: result?.extractedProfile || {},
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        skills: skills.map((s: string) => ({ name: s })),
      };

      setUploadedSkills(skills);
      setDigitalResume(dr);
      setSelectedFile(null);
    } catch (err) {
      notify.error('Failed to upload resume. Please try again.');
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      // Refresh skills and profile after confirmation
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['digital-resume'] });
      notify.success(`Resume updated — ${uploadedSkills.length} skills extracted`);
      setDigitalResume(null);
      onReviewComplete?.();
    } finally {
      setIsConfirming(false);
    }
  };

  // Show review screen after upload
  if (digitalResume) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Review Extracted Resume</h3>
          <button
            onClick={() => setDigitalResume(null)}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            ← Back
          </button>
        </div>
        <ResumeReview
          data={digitalResume}
          onConfirm={handleConfirm}
          isConfirming={isConfirming}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resume status */}
      {hasResume && !selectedFile && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-900">Resume uploaded</p>
              {profile?.resumeUploadedAt && (
                <p className="text-xs text-emerald-700">
                  {new Date(profile.resumeUploadedAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File selected — show confirm button */}
      {selectedFile ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="rounded-lg p-1 hover:bg-slate-200 flex-shrink-0"
              disabled={isUploading}
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Parsing with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Upload & Parse Resume
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-400">
            You'll review what AI extracted before saving
          </p>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all',
            dragActive
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
          )}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={isUploading}
          />
          <Upload className="h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            {hasResume ? 'Upload a new resume' : 'Drop your resume here'}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">PDF, DOCX, or TXT — max 10MB</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
