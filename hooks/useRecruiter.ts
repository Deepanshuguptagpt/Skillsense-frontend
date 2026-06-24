'use client';

import { useState } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { RecruiterJob, CandidateMatch, CandidateProfileDetail, RecruiterProfile } from '@/types';
import { useNotificationStore } from '@/lib/notifications';

export const useRecruiter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  const getProfile = async (): Promise<RecruiterProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(API_ROUTES.RECRUITER_PROFILE);
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<RecruiterProfile>): Promise<RecruiterProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put(API_ROUTES.RECRUITER_PROFILE, data);
      addNotification('success', 'Profile updated successfully');
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      addNotification('error', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getJobs = async (): Promise<RecruiterJob[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(API_ROUTES.RECRUITER_JOBS);
      return response.data || [];
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getJobDetail = async (jobId: string): Promise<RecruiterJob | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(API_ROUTES.RECRUITER_JOB_DETAIL(jobId));
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createJob = async (data: any): Promise<RecruiterJob | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(API_ROUTES.RECRUITER_JOBS, data);
      addNotification('success', 'Job posted successfully');
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      addNotification('error', msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getJobCandidates = async (jobId: string): Promise<CandidateMatch[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(API_ROUTES.RECRUITER_JOB_CANDIDATES(jobId));
      return response.data || [];
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const shortlistCandidate = async (jobId: string, candidateId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(API_ROUTES.RECRUITER_SHORTLIST(jobId, candidateId));
      addNotification('success', 'Candidate shortlisted');
      return true;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      addNotification('error', msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCandidateDetail = async (candidateId: string, jobId?: string): Promise<CandidateProfileDetail | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(API_ROUTES.RECRUITER_CANDIDATE_DETAIL(candidateId, jobId));
      return response.data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getProfile,
    updateProfile,
    getJobs,
    getJobDetail,
    createJob,
    getJobCandidates,
    shortlistCandidate,
    getCandidateDetail,
  };
};
