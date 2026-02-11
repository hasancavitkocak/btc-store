'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import Container from './Container';

interface ZigzagSectionProps {
  image: string;
  imageAlt: string;
  children: ReactNode;
  reverse?: boolean;
}

export default function ZigzagSection({ image, imageAlt, children, reverse = false }: ZigzagSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className={`relative w-full min-h-[600px] flex items-center ${reverse ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-gray-50 to-white overflow-hidden`}
    >
      <div className={`absolute inset-0 ${reverse ? 'md:left-0 md:right-1/2' : 'md:left-1/2 md:right-0'} transition-all duration-1000 ease-out ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : reverse 
            ? '-translate-x-full opacity-0' 
            : 'translate-x-full opacity-0'
      }`}>
        <div className="relative w-full h-full">
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-${reverse ? 'l' : 'r'} from-transparent via-transparent to-gray-50 md:to-white`} />
        </div>
      </div>

      <div className="relative z-10 w-full">
        <div className={`flex ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center`}>
          <div className="w-full md:w-1/2 py-16 md:py-24">
            <div className={`bg-white/95 backdrop-blur-sm md:bg-transparent rounded-3xl p-8 md:p-0 shadow-xl md:shadow-none ${reverse ? 'md:pr-16 md:pl-8' : 'md:pl-8 md:pr-16'} transition-all duration-1000 ease-out delay-300 ${
              isVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-10 opacity-0'
            }`}>
              {children}
            </div>
          </div>
          <div className="hidden md:block md:w-1/2" />
        </div>
      </div>
    </div>
  );
}