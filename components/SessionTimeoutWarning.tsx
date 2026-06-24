'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

const WARNING_BEFORE_MS = 2 * 60 * 1000; // Show warning 2 min before expiry
const CHECK_INTERVAL_MS = 30 * 1000;     // Check every 30 seconds

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export default function SessionTimeoutWarning() {
  const { accessToken, refreshToken, setAuth, user } = useAuthStore();
  const { signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkExpiry = useCallback(() => {
    if (!accessToken) return;
    const expiry = getTokenExpiry(accessToken);
    if (!expiry) return;

    const msLeft = expiry - Date.now();
    if (msLeft <= 0) {
      // Already expired — sign out
      signOut();
      return;
    }
    if (msLeft <= WARNING_BEFORE_MS) {
      setShowWarning(true);
      setSecondsLeft(Math.floor(msLeft / 1000));
    } else {
      setShowWarning(false);
    }
  }, [accessToken, signOut]);

  // Check on mount and every 30s
  useEffect(() => {
    checkExpiry();
    const interval = setInterval(checkExpiry, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkExpiry]);

  // Countdown when warning is shown
  useEffect(() => {
    if (!showWarning) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          signOut();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showWarning, signOut]);

  const handleStayLoggedIn = async () => {
    if (!refreshToken || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await api.post(API_ROUTES.REFRESH, { refreshToken });
      const newAccessToken = res.data.accessToken;
      const newRefreshToken = res.data.refreshToken;
      if (newAccessToken && user) {
        setAuth(user, newAccessToken, newRefreshToken || refreshToken);
        setShowWarning(false);
      }
    } catch {
      signOut();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!showWarning || !accessToken) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = minutes > 0
    ? `${minutes}m ${seconds}s`
    : `${seconds}s`;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 w-full max-w-sm px-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Session expiring soon</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your session expires in <span className="font-bold">{timeStr}</span>
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleStayLoggedIn}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Stay logged in'}
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
