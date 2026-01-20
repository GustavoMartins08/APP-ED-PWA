
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { NewsItem } from '../types';
import ShareModal from './ShareModal';

interface NewsCardProps {
  item: NewsItem;
  variant?: 'horizontal' | 'vertical';
  index?: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, variant = 'vertical', index = 0 }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_articles') || '[]');
    setIsSaved(saved.includes(item.id));
  }, [item.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('saved_articles') || '[]');
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter((id: string) => id !== item.id);
    } else {
      newSaved = [...saved, item.id];
    }
    localStorage.setItem('saved_articles', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  const isNewsletter = item.category === 'Newsletter Semanal' || item.id.startsWith('nl_');
  const basePath = isNewsletter ? '/newsletter' : '/artigo';
  const detailLink = `${basePath}/${item.id}`;
  const articleUrl = `${window.location.origin}${window.location.pathname}#${detailLink}`;

  if (variant === 'horizontal') {
    return (
      <div 
        ref={cardRef}
        className={`relative group overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        <Link to={detailLink} className="flex flex-col sm:flex-row gap-6 md:gap-10 items-start relative z-0">
          <div className="w-full sm:w-2/5 md:w-1/3 aspect-video sm:aspect-[4/3] md:aspect-square lg:aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shrink-0 shadow-sm bg-gray-100 relative gpu-accelerated">
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-[filter,transform] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]" 
            />
          </div>
          <div className="flex-grow pt-2 sm:pt-0">
            <span className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em] text-accent mb-3 block">
              {item.category}
            </span>
            <h3 className="font-serif text-xl md:text-2xl font-black mb-3 group-hover:text-accent transition-colors duration-300 leading-[1.2] uppercase tracking-tighter">
              {item.title}
            </h3>
            <p className="text-secondary text-base md:text-lg line-clamp-2 leading-relaxed mb-6 font-light opacity-70">
              {item.excerpt}
            </p>
            <div className="flex items-center justify-between border-t border-gray-100 pt-5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.timestamp}</span>
              <div className="flex gap-4">
                <button 
                  onClick={toggleSave} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-accent'}`}
                >
                  <svg className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  <span className="hidden sm:inline">{isSaved ? 'Salvo' : 'Salvar'}</span>
                </button>
                <button 
                  onClick={handleShareClick} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-accent transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  <span className="hidden sm:inline">Compartilhar</span>
                </button>
              </div>
            </div>
          </div>
        </Link>
        <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={articleUrl} title={item.title} />
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className={`h-full flex flex-col rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group shadow-sm border border-gray-100 hover:shadow-2xl hover:border-accent/10 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white gpu-accelerated ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      style={{ transitionDelay: `${index % 4 * 100}ms` }}
    >
      <Link to={detailLink} className="block h-full flex flex-col">
        <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center grayscale group-hover:grayscale-0 group-hover:scale-110 transition-[filter,transform] duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]" 
          />
        </div>
        
        <div className="px-8 md:px-12 py-10 md:py-14 flex flex-col flex-grow">
          <span className="text-[11px] md:text-[14px] font-black uppercase tracking-[0.4em] text-accent mb-5 block">
            {item.category}
          </span>
          
          <h3 className="font-serif text-2xl md:text-3xl font-black mb-5 md:mb-7 group-hover:text-accent transition-colors duration-300 leading-[1.2] uppercase tracking-tighter text-primary">
            {item.title}
          </h3>
          
          <p className="text-secondary text-lg md:text-xl line-clamp-3 leading-relaxed mb-8 md:mb-10 font-light opacity-70">
            {item.excerpt}
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <button 
              onClick={toggleSave} 
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-accent text-white shadow-lg' : 'bg-lightGray text-primary hover:bg-accent hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              {isSaved ? 'Salvo' : 'Salvar'}
            </button>
            <button 
              onClick={handleShareClick} 
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-lightGray text-primary hover:bg-accent hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Compartilhar
            </button>
          </div>
          
          <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-widest text-gray-400">
              {item.timestamp}
            </span>
            <div className="flex items-center gap-3 text-accent text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              {isNewsletter ? 'Ler Edição' : 'Ler Análise'} <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </div>
        </div>
      </Link>
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={articleUrl} title={item.title} />
    </div>
  );
};

export default NewsCard;
