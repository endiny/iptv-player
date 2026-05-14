import React from 'react';

const modules = import.meta.glob<{ default: React.FC<React.SVGProps<SVGSVGElement>> }>(
  './*.svg',
  { eager: true, query: '?react' }
);

export type IconName = 'prev' | 'next' | 'play' | 'pause' | 'volume' | 'volume-off' | 'fullscreen' | 'spinner';

interface IconProps {
  name: IconName;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = 'h-5 w-5' }) => {
  const mod = modules[`./${name}.svg`];
  if (!mod) return null;
  const SvgComponent = mod.default;
  return <SvgComponent className={className} />;
};
