import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { searchGlobal, UnifiedSearchResult } from '../lib/supabaseClient';
import { getOptimizedImageUrl } from '../lib/imageUtils';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UnifiedSearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Debounce search
    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            const data = await searchGlobal(query);
            setResults(data);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
        setQuery('');
        setResults(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="container mx-auto px-6 md:px-12 py-8 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4 text-primary">
                        <Search className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Terminal Search</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-all"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Input */}
                <div className="relative mb-16">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Digite para buscar..."
                        className="w-full bg-transparent border-b-2 border-gray-100 text-3xl md:text-5xl lg:text-6xl font-serif font-black uppercase text-primary placeholder-gray-200 focus:outline-none focus:border-accent py-8 transition-colors"
                    />
                    {loading && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-accent animate-spin" />
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="flex-grow overflow-y-auto pb-20 scrollbar-hide">
                    {!results && !loading && query && (
                        <div className="text-center py-20 opacity-40">
                            <p className="text-sm font-black uppercase tracking-[0.2em] mb-2">Pressione Enter para buscar</p>
                            <p className="font-serif text-2xl">Buscando por "{query}"...</p>
                        </div>
                    )}

                    {results && (
                        <div className="space-y-16">
                            {/* Notícias */}
                            {results.news.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-black text-accent uppercase tracking-[0.4em] mb-8">Notícias & Artigos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {results.news.map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleNavigate(`/artigo/${item.id}`)}
                                                className="group cursor-pointer flex gap-6 items-start p-4 hover:bg-gray-50 rounded-3xl transition-all"
                                            >
                                                <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                                                    {item.imageUrl && (
                                                        <img src={getOptimizedImageUrl(item.imageUrl, 200)} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</span>
                                                    <h4 className="font-serif text-lg font-black leading-tight uppercase mt-2 mb-2 group-hover:text-accent transition-colors">{item.title}</h4>
                                                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-primary/50">
                                                        Ler agora <ArrowRight className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Editoriais */}
                            {results.editions.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-black text-accent uppercase tracking-[0.4em] mb-8">Editoriais</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {results.editions.map(ed => (
                                            <div
                                                key={ed.id}
                                                onClick={() => handleNavigate(`/edicao/${ed.id}`)}
                                                className="group cursor-pointer"
                                            >
                                                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden mb-4 relative">
                                                    <img src={getOptimizedImageUrl(ed.imageUrl, 400)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                                                </div>
                                                <h4 className="font-serif text-sm font-black uppercase leading-tight">{ed.theme}</h4>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Vídeos */}
                            {results.videos.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-black text-accent uppercase tracking-[0.4em] mb-8">Vídeos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {results.videos.map(video => (
                                            <div
                                                key={video.id}
                                                onClick={() => handleNavigate(`/videos`)} // Idealmente teria detalhe do vídeo ou scroll to
                                                className="group cursor-pointer"
                                            >
                                                <div className="aspect-video rounded-[2rem] overflow-hidden mb-4 relative">
                                                    <img src={getOptimizedImageUrl(video.imageUrl, 400)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-all">
                                                            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <h4 className="font-serif text-sm font-black uppercase leading-tight line-clamp-2">{video.title}</h4>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Empty State */}
                            {query && !loading && results.news.length === 0 && results.editions.length === 0 && results.videos.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[3rem]">
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum resultado encontrado no terminal.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchOverlay;
