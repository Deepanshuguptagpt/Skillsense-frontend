import Link from 'next/link';

interface GradientButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function GradientButton({ 
  href, 
  children, 
  variant = 'primary',
  className = '' 
}: GradientButtonProps) {
  if (variant === 'primary') {
    return (
      <Link
        href={href}
        className={`inline-block px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-2xl font-semibold hover:shadow-xl transition-all transform hover:scale-105 ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`inline-block px-8 py-4 border-2 border-purple-300 text-purple-600 rounded-2xl font-semibold hover:bg-purple-50 transition-all ${className}`}
    >
      {children}
    </Link>
  );
}
