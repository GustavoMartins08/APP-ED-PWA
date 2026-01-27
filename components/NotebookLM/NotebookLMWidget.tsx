import React, { useState } from 'react';
import CollectionsView from './CollectionsView';
import { Sparkles, X } from 'lucide-react';

const NotebookLMWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Expanded View Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-200">
                    <CollectionsView onClose={() => setIsOpen(false)} />
                </div>
            )}

            {/* Mini Card / Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto group flex items-center gap-3 pl-4 pr-5 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-sm">
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">NotebookLM</span>
                        <span className="text-sm font-bold text-gray-800 leading-none group-hover:text-indigo-600 transition-colors">Minhas Coleções</span>
                    </div>
                </button>
            )}
        </div>
    );
};

export default NotebookLMWidget;
