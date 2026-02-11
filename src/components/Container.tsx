import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Container({ children, className = '', noPadding = false }: ContainerProps) {
  return (
    <div className={`max-w-7xl mx-auto ${noPadding ? '' : 'px-4 sm:px-6 lg:px-8'} ${className}`}>
      {children}
    </div>
  );
}
