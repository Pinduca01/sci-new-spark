import React from 'react';

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  shineColor?: string[];
}

// Minimal shiny border separator inspired by Magic UI "shine-border"
// Renders a thin animated gradient bar that works well atop sticky headers.
export const ShineBorder: React.FC<ShineBorderProps> = ({ className = '', shineColor }) => {
  const colors = shineColor && shineColor.length >= 2
    ? shineColor
    : ['#f97316', '#8b5cf6', '#06b6d4'];

  const style: React.CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
  };

  return (
    <div
      className={`w-full h-[2px] opacity-80 ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export default ShineBorder;