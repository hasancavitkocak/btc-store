import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: 'white' | 'gray';
}

export default function Section({ children, className = '', background = 'white' }: SectionProps) {
  const bgClass = background === 'gray' ? 'bg-gray-50' : 'bg-white';

  return (
    <section className={`py-12 sm:py-16 ${bgClass} ${className}`}>
      {children}
    </section>
  );
}
