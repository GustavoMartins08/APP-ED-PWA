import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ElementType;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = "Nenhum item encontrado",
    description = "Nosso terminal de dados não localizou registros para sua busca.",
    icon: Icon = PackageOpen
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                {title}
            </h3>
            <p className="text-sm font-medium text-gray-500 max-w-md leading-relaxed">
                {description}
            </p>
        </div>
    );
};

export default EmptyState;
