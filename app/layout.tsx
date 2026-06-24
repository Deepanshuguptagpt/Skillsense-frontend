import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import Providers from '@/components/Providers';
import NotificationBanner from '@/components/NotificationBanner';
import SessionTimeoutWarning from '@/components/SessionTimeoutWarning';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

export const metadata: Metadata = {
  title: 'SkillSense - AI-Powered Employability Platform',
  description:
    'Build skills, unlock opportunities, and land your dream internship',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body
        className={`${inter.className} min-h-screen bg-background text-slate-900 antialiased`}
      >
        <Providers>
          {children}
          <NotificationBanner />
          <SessionTimeoutWarning />
        </Providers>
      </body>
    </html>
  );
}
