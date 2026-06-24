import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { useNotificationStore } from '@/lib/notifications';
import { API_ROUTES, APP_ROUTES } from '@/lib/constants';
import type { SignUpRequest, SignInRequest, AuthResponse } from '@/types/api';

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  // Sign Up Mutation
  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpRequest) => {
      const response = await api.post<AuthResponse>(API_ROUTES.SIGNUP, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // If backend returns tokens (auto-login after signup), set auth and redirect based on role
      if (data.user && data.accessToken && data.refreshToken) {
        setAuth(data.user, data.accessToken, data.refreshToken);
        addNotification('success', 'Account created successfully');
        if (data.user.role === 'recruiter') {
          router.push(APP_ROUTES.RECRUITER_DASHBOARD);
        } else {
          router.push(APP_ROUTES.ONBOARDING);
        }
      } else {
        addNotification('success', data.message || 'Verification code sent to your email.');
        // Redirect to email verification page
        router.push(`${APP_ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(variables.email)}`);
      }
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  // Sign In Mutation
  const signInMutation = useMutation({
    mutationFn: async (data: SignInRequest) => {
      const response = await api.post<AuthResponse>(API_ROUTES.SIGNIN, data);
      return response.data;
    },
    onSuccess: async (data) => {
      if (data.user && data.accessToken && data.refreshToken) {
        setAuth(data.user, data.accessToken, data.refreshToken);
        addNotification('success', 'Signed in successfully');

        // Route based on role
        if (data.user.role === 'recruiter') {
          // Check if recruiter profile is set up
          try {
            const recProfile = await api.get(API_ROUTES.RECRUITER_PROFILE, {
              headers: { Authorization: `Bearer ${data.accessToken}` }
            });
            const rp = recProfile.data?.data;
            // If no company set, go to profile setup first
            if (!rp?.company) {
              router.push('/recruiter/profile');
            } else {
              router.push('/recruiter/dashboard');
            }
          } catch {
            router.push('/recruiter/dashboard');
          }
          return;
        }

        // Candidate: check onboarding
        try {
          const profileResponse = await api.get(API_ROUTES.PROFILE, {
            headers: { Authorization: `Bearer ${data.accessToken}` }
          });
          const profile = profileResponse.data?.data;
          if (profile && !profile.onboardingComplete) {
            router.push(APP_ROUTES.ONBOARDING);
          } else {
            router.push(APP_ROUTES.DASHBOARD);
          }
        } catch {
          router.push(APP_ROUTES.DASHBOARD);
        }
      }
    },
    onError: (error, variables) => {
      const errorMsg = getErrorMessage(error);
      addNotification('error', errorMsg);
      // If email is not verified, redirect to verify-email page
      if (errorMsg.toLowerCase().includes('not verified')) {
        router.push(`${APP_ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(variables.email)}`);
      }
    },
  });

  // Sign Out Mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(API_ROUTES.SIGNOUT);
      return response.data;
    },
    onSuccess: () => {
      clearAuth();
      addNotification('success', 'Signed out successfully');
      router.push('/landing'); // Redirect to landing page
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  // Verify Email Mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await api.post<AuthResponse>(API_ROUTES.VERIFY_EMAIL, data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.user && data.accessToken && data.refreshToken) {
        setAuth(data.user, data.accessToken, data.refreshToken);
        addNotification('success', 'Email verified and signed in successfully!');
        if (data.user.role === 'recruiter') {
          router.push('/recruiter/dashboard');
        } else {
          router.push(APP_ROUTES.ONBOARDING);
        }
      } else {
        addNotification('success', 'Email verified successfully. Please sign in.');
        router.push(APP_ROUTES.SIGNIN);
      }
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  // Resend Verification Code Mutation
  const resendCodeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post<{ success: boolean; message: string }>(
        API_ROUTES.RESEND_CODE,
        { email }
      );
      return response.data;
    },
    onSuccess: (data) => {
      addNotification('success', data.message || 'Verification code resent successfully!');
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  // Forgot Password Mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post<{ success: boolean; message: string }>(
        API_ROUTES.FORGOT_PASSWORD,
        { email }
      );
      return response.data;
    },
    onSuccess: (data) => {
      addNotification('success', data.message || 'Password reset link sent');
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; code: string; new_password: string }) => {
      const response = await api.post<{ success: boolean; message: string }>(
        API_ROUTES.RESET_PASSWORD,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      addNotification('success', data.message || 'Password reset successful');
      router.push(APP_ROUTES.SIGNIN);
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  // Delete Account Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete<{ success: boolean; message: string }>(API_ROUTES.DELETE_ACCOUNT);
      return response.data;
    },
    onSuccess: (data) => {
      clearAuth();
      addNotification('success', data.message || 'Account successfully deleted');
      router.push('/landing'); // Redirect to landing page
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  return {
    isAuthenticated,
    user,
    signUp: signUpMutation.mutateAsync,
    signIn: signInMutation.mutate,
    signOut: signOutMutation.mutate,
    verifyEmail: verifyEmailMutation.mutateAsync,
    resendCode: resendCodeMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isSigningUp: signUpMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isResendingCode: resendCodeMutation.isPending,
    isRequestingReset: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
    verifyEmailError: verifyEmailMutation.error,
    resetSignInError: signInMutation.reset,
    resetSignUpError: signUpMutation.reset,
  };
}
