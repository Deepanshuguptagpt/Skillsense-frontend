import React from 'react';

interface GradientSkeletonProps {
  variant?: 'rectangle' | 'circle' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  width?: string;
  height?: string;
}

export const GradientSkeleton: React.FC<GradientSkeletonProps> = ({
  variant = 'rectangle',
  size = 'md',
  className = '',
  width,
  height,
}) => {
  const sizeClasses = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-12',
    full: 'h-full w-full',
  };

  const variantClasses = {
    rectangle: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded',
  };

  const baseClasses = 'gradient-skeleton';
  const appliedSize = size !== 'full' ? sizeClasses[size] : sizeClasses.full;
  const appliedVariant = variantClasses[variant];

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClasses} ${appliedSize} ${appliedVariant} ${className}`}
      style={style}
      role="status"
      aria-busy="true"
      aria-label="Loading content"
    />
  );
};

// Preset skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`card ${className}`}>
    <GradientSkeleton size="lg" className="mb-4" />
    <GradientSkeleton size="md" className="mb-2" width="80%" />
    <GradientSkeleton size="sm" width="60%" />
  </div>
);

export const SkeletonProjectCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`card ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <GradientSkeleton size="md" width="60%" />
      <GradientSkeleton variant="circle" width="40px" height="40px" />
    </div>
    <GradientSkeleton size="sm" className="mb-2" width="90%" />
    <GradientSkeleton size="sm" className="mb-4" width="70%" />
    <div className="flex gap-2">
      <GradientSkeleton size="sm" width="80px" />
      <GradientSkeleton size="sm" width="100px" />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({ 
  count = 3, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonProjectCard key={i} />
    ))}
  </div>
);
