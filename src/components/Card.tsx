import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const hoverClass = hover ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-lg transition-all duration-300 ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
