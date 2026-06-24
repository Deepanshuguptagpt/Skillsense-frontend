'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import ChatWidget from './ChatWidget';

// Pages where ChatWidget should NOT appear based on URL
const EXCLUDED_PATHS = [
  '/landing',
  '/auth/signup',
  '/auth/signin',
];

export default function ConditionalChatWidget() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  // Don't show ChatWidget on excluded paths or for recruiters
  if (
    EXCLUDED_PATHS.includes(pathname) || 
    pathname.startsWith('/recruiter') || 
    user?.role === 'recruiter'
  ) {
    return null;
  }

  return <ChatWidget />;
}
