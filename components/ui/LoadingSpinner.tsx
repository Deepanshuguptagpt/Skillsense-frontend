import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className = '', size = 'md' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 30,
    md: 50,
    lg: 80,
  };
  const pixelSize = sizeMap[size];

  return (
    <div className={`${styles.spinnerContainer} ${className}`}>
      <div 
        className={styles.spinner} 
        style={{ width: pixelSize, height: pixelSize }}
      />
    </div>
  );
}
