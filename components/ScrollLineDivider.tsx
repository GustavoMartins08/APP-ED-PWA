
import React from 'react';

const ScrollLineDivider: React.FC = () => {
  return (
    <div className="flex justify-center w-full py-4 md:py-8 overflow-hidden pointer-events-none">
      <div className="relative h-16 md:h-24 w-[1px] bg-gradient-to-b from-accent/40 via-accent/10 to-transparent">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-accent shadow-[0_0_8px_#ff2768] animate-scroll-line" />
      </div>
    </div>
  );
};

export default ScrollLineDivider;
