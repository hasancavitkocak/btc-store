'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface ZigzagSectionProps {
  image: string;
  imageAlt: string;
  children: ReactNode;
  reverse?: boolean;
  bgColor?: string;
}

export default function ZigzagSection({ 
  image, 
  imageAlt, 
  children, 
  reverse = false,
  bgColor = '#F9FAFB'
}: ZigzagSectionProps) {
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
      className="relative w-full min-h-[500px] flex items-center justify-center py-20 md:py-32"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className={`flex ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center justify-center gap-8 md:gap-16`}>
          {/* Görsel Tarafı */}
          <div className={`w-full md:w-7/12 flex justify-center transition-all duration-1000 ease-out ${
            isVisible 
              ? 'translate-x-0 opacity-100' 
              : reverse 
                ? 'translate-x-20 opacity-0' 
                : '-translate-x-20 opacity-0'
          }`}>
            <div className="relative w-full max-w-2xl">
              <img
                src={image}
                alt={imageAlt}
                className="w-full h-auto max-h-[600px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* İçerik Tarafı */}
          <div className={`w-full md:w-5/12 flex flex-col justify-center transition-all duration-1000 ease-out delay-300 ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-10 opacity-0'
          }`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}