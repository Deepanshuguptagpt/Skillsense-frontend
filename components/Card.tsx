interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div 
      className={`bg-gradient-to-br from-white to-orange-50/30 rounded-2xl p-8 shadow-sm ${hover ? 'hover:shadow-lg transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
