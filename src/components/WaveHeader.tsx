import React from 'react';

interface WaveHeaderProps {
  title?: string;
  subtitle?: string;
}

const WaveHeader: React.FC<WaveHeaderProps> = ({ title = 'Welcome', subtitle = '' }) => {
  return (
    <div className="relative">
      {/* Gradient background */}
      <div className="h-48 sm:h-56 bg-gradient-to-br from-primary/90 to-orange-400" />
      {/* Wavy bottom using SVG */}
      <svg
        className="absolute bottom-0 left-0 right-0 translate-y-[1px]"
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,64 C160,96 320,112 480,96 C640,80 800,32 960,40 C1120,48 1280,104 1440,80 L1440,120 L0,120 Z"
          fill="url(#grad)"
        />
        <defs>
          <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(251, 113, 133, 0.95)" />
            <stop offset="100%" stopColor="rgba(249, 115, 22, 0.85)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header text (optional) */}
      {(title || subtitle) && (
        <div className="absolute inset-0 flex flex-col items-start justify-end px-6 pb-6 text-white">
          {title && (
            <h1 className="text-2xl font-semibold tracking-tight font-heading">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm opacity-90 font-body">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WaveHeader;