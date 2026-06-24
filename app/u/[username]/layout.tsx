import type { Metadata } from 'next';

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = params.username;
  const displayName = username
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${displayName} — SkillSense Portfolio`,
    description: `View ${displayName}'s verified skills, GitHub projects, quiz scores, and internship readiness on SkillSense.`,
    openGraph: {
      title: `${displayName} — SkillSense Portfolio`,
      description: `Verified skills, GitHub projects, and career readiness profile for ${displayName}.`,
      type: 'profile',
      siteName: 'SkillSense',
    },
    twitter: {
      card: 'summary',
      title: `${displayName} — SkillSense Portfolio`,
      description: `Verified skills and career readiness profile for ${displayName}.`,
    },
  };
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
