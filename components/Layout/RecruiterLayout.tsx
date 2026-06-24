'use client';

import RecruiterRoute from '@/components/RecruiterRoute';
import MainLayout from './MainLayout';

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RecruiterRoute>
      <MainLayout>
        {children}
      </MainLayout>
    </RecruiterRoute>
  );
}
