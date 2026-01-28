
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsItem, Editorial } from '../types';
import Skeleton from './ui/Skeleton';

interface HeroCarouselProps {
  latestNews?: NewsItem;
  latestNewsletter?: NewsItem;
  latestEditorial?: Editorial;
  isLoading?: boolean;
}

interface Slide {
  id: string;
  theme: 'dark' | 'light';
  type: string;
  title: string;
  subtitle: string;
  link: string;
  cta: string;
  accentTitle?: string;
  customBgColor?: string;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ latestNews, latestNewsletter, latestEditorial, isLoading = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const slides: Slide[] = [
    {
      id: 'newsletter-main',
      theme: 'dark',
      type: latestNewsletter?.category || 'Newsletter Premium',
      title: latestNewsletter?.title || 'INTELIGÊNCIA SINTETIZADA',
      subtitle: latestNewsletter?.excerpt || 'O briefing tático que define o ritmo do mercado global diretamente no seu terminal, sem ruído e com precisão absoluta.',
      link: '/subscribe-premium',
      cta: 'Acessar Terminal'
    },
    {
      id: 'editions-main',
      theme: 'dark',
      type: 'Edição Mensal',
      title: latestEditorial?.theme || 'DOSSIÊS DE ALTO IMPACTO',
      subtitle: latestEditorial?.summary || 'Mergulhe em análises verticais profundas sobre os vetores que estão moldando o futuro dos negócios e da tecnologia.',
      link: latestEditorial ? `/edicao/${latestEditorial.id}` : '/edicoes',
      cta: 'Explorar Edições',
      customBgColor: '#ff2768'
    },
    {
      id: 'news-main',
      theme: 'dark',
      type: latestNews?.category || 'Notícias de Mercado',
      title: latestNews?.title || 'O PULSO DO MERCADO',
      subtitle: latestNews?.excerpt || 'Cobertura em tempo real com o rigor analítico que sua tomada de decisão exige para manter a vantagem competitiva.',
      link: latestNews ? `/noticia/${latestNews.id}` : '/ultimas-noticias',
      cta: 'Ler Notícia'
    },
    {
      id: 'newsletter-60s',
      theme: 'light',
      type: 'Newsletter',
      title: 'ESTEJA À FRENTE.',
      accentTitle: '60 SEGUNDOS.',
      subtitle: 'O briefing tático que sintetiza o que você realmente precisa saber para decidir o futuro da sua operação hoje.',
      link: '/subscribe-premium',
      cta: 'Inscreva-se na Newsletter'
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || isDragging) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, isDragging]);

  const handleDragStart = (x: number) => {
    dragStartX.current = x;
    setIsDragging(true);
    setIsPaused(true);
    setDragOffset(0);
  };

  const handleDragMove = (x: number) => {
    if (!isDragging || dragStartX.current === null) return;
    const delta = x - dragStartX.current;
    setDragOffset(delta);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    // Threshold for swipe (pixels)
    const threshold = 50;

    if (dragOffset < -threshold) {
      nextSlide();
    } else if (dragOffset > threshold) {
      prevSlide();
    }

    setIsDragging(false);
    setDragOffset(0);
    setTimeout(() => setIsPaused(false), 2000); // Resume auto-play after a delay
  };

  // Skeleton Loading View
  if (isLoading) {
    return (
      <section className="relative h-[65vh] md:h-[75vh] lg:h-[80vh] w-full overflow-hidden bg-black flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
        <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-20">
          <div className="max-w-4xl">
            <Skeleton variant="text" className="w-32 h-6 md:h-8 mb-8 bg-gray-800/50" />
            <Skeleton variant="text" className="w-3/4 h-16 md:h-24 mb-4 bg-gray-800/50" />
            <Skeleton variant="text" className="w-1/2 h-16 md:h-24 mb-8 bg-gray-800/50" />
            <Skeleton variant="text" className="w-full max-w-2xl h-4 mb-3 bg-gray-800/50" />
            <Skeleton variant="text" className="w-2/3 max-w-xl h-4 mb-12 bg-gray-800/50" />
            <Skeleton variant="card" className="w-48 h-12 md:h-14 rounded-full bg-gray-800/50" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef as any}
      className={`relative h-[65vh] md:h-[75vh] lg:h-[80vh] w-full overflow-hidden select-none cursor-grab active:cursor-grabbing bg-black`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); if (isDragging) handleDragEnd(); }}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => isDragging && handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
    >
      {slides.map((slide, index) => {
        // Logic to determine position
        let position = 'hidden';
        let xBase = 0;
        let zIndex = 0;

        const isCurrent = index === currentSlide;
        const isNext = index === (currentSlide + 1) % slides.length;
        const isPrev = index === (currentSlide - 1 + slides.length) % slides.length;

        // Wrap logic
        if (isCurrent) {
          position = 'center';
          xBase = 0;
          zIndex = 20;
        } else if (isNext) {
          position = 'next';
          xBase = 100;
          zIndex = 10;
        } else if (isPrev) {
          position = 'prev';
          xBase = -100;
          zIndex = 10;
        }

        // If it's not one of the three, don't render or hide it
        const isVisible = isCurrent || isNext || isPrev;

        // Calculate transform
        // Convert dragOffset to percentage effectively or just pixels
        // Using calc() for mix of % and px
        const transform = isVisible
          ? `translateX(calc(${xBase}% + ${dragOffset}px))`
          : 'translateX(200%)'; // Move far away

        const transition = isDragging
          ? 'none'
          : 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1), opacity 600ms ease-in-out';

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full flex items-center ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{
              transform: transform,
              transition: transition,
              zIndex: zIndex,
              backgroundColor: slide.customBgColor || (slide.theme === 'dark' ? '#000000' : '#ffffff')
            }}
          >
            {/* Content Container */}
            <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-20">
              <div className={`max-w-4xl transition-all duration-700 delay-100 ${isCurrent && !isDragging ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
                {/* Note: I removed the fade-up animation on content during drag to keep it solid attached to the slide */}

                <span className={`inline-block text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-full mb-6 md:mb-8 shadow-sm ${slide.theme === 'dark' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                  {slide.type}
                </span>

                <h2 className={`font-serif text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-6 md:mb-8 ${slide.theme === 'dark' ? 'text-white' : 'text-primary'}`}>
                  {slide.title}
                  {slide.accentTitle && (
                    <span className="text-accent block italic mt-1">{slide.accentTitle}</span>
                  )}
                </h2>

                <p className={`text-sm sm:text-base md:text-xl lg:text-2xl font-light leading-relaxed max-w-2xl mb-10 md:mb-12 italic ${slide.theme === 'dark' ? 'text-white/60' : 'text-primary/60'}`}>
                  {slide.subtitle}
                </p>

                <button
                  onClick={(e) => { e.stopPropagation(); navigate(slide.link); }}
                  className={`px-8 py-4 md:px-12 md:py-5 rounded-full text-[10px] md:text-[12px] font-black uppercase tracking-[0.25em] transition-all shadow-xl active:scale-95 flex items-center gap-4 group ${slide.theme === 'dark'
                    ? 'bg-white text-primary hover:bg-accent hover:text-white'
                    : 'bg-primary text-white hover:bg-accent'
                    }`}
                >
                  {slide.cta}
                  <svg className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Decoration */}
            {!slide.customBgColor && (
              <div className={`absolute right-[-5%] top-1/2 -translate-y-1/2 w-[40vh] h-[40vh] md:w-[60vh] md:h-[60vh] rounded-full blur-[80px] md:blur-[120px] opacity-10 md:opacity-20 pointer-events-none ${slide.theme === 'dark' ? 'bg-accent' : 'bg-primary'}`} />
            )}
          </div>
        );
      })}

      {/* Navigation Indicators */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
            className={`group relative h-1 w-10 md:w-16 rounded-full overflow-hidden transition-all ${slides[currentSlide].theme === 'dark' ? 'bg-white/10' : 'bg-primary/10'}`}
            aria-label={`Ir para slide ${index + 1}`}
          >
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-[6000ms] ease-linear ${index === currentSlide && !isPaused ? 'w-full bg-accent' : 'w-0'} ${index === currentSlide && isPaused ? 'w-full bg-accent opacity-50' : ''}`}
            />
          </button>
        ))}
      </div>

      {/* Side Controls */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-6 right-6 lg:left-10 lg:right-10 justify-between z-30 pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          className={`pointer-events-auto w-12 h-12 lg:w-16 lg:h-16 rounded-full border transition-all flex items-center justify-center group ${slides[currentSlide].theme === 'dark'
            ? 'border-white/10 text-white hover:bg-white hover:text-primary'
            : 'border-primary/10 text-primary hover:bg-primary hover:text-white'
            }`}
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className={`pointer-events-auto w-12 h-12 lg:w-16 lg:h-16 rounded-full border transition-all flex items-center justify-center group ${slides[currentSlide].theme === 'dark'
            ? 'border-white/10 text-white hover:bg-white hover:text-primary'
            : 'border-primary/10 text-primary hover:bg-primary hover:text-white'
            }`}
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

    </section>
  );
};

export default HeroCarousel;
