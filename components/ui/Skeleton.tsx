import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'card' | 'text' | 'circle' | 'rect';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
    const baseClasses = "animate-pulse bg-gray-200/50";
    const variants = {
        card: "rounded-2xl",
        text: "rounded-md h-4 w-full",
        circle: "rounded-full",
        rect: "rounded-lg"
    };

    return <div className={`${baseClasses} ${variants[variant]} ${className}`} />;
};

export default Skeleton;
