
import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", light = false }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="https://empresariodigital.com.br/wp-content/uploads/2025/01/logo-empresario-digital-1.png"
        alt="Empresário Digital"
        className={`h-10 md:h-[58px] w-auto object-contain ${light ? 'brightness-0 invert' : ''}`}
      />
    </div>
  );
};

export default Logo;
