
import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col mb-10 md:mb-14 gap-5">
      <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85] uppercase tracking-tighter text-primary">
        {title}
      </h2>
      {subtitle && (
        <p className="text-secondary text-2xl md:text-3xl lg:text-4xl tracking-tight max-w-4xl font-light leading-snug opacity-90 border-l-4 border-accent/30 pl-8 md:pl-12">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
