
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Slide {
  id: string;
  theme: 'dark' | 'light';
  type: string;
  title: string;
  subtitle: string;
  link: string;
  cta: string;
  accentTitle?: string;
}

const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const navigate = useNavigate();

  const slides: Slide[] = [
    {
      id: 'newsletter-main',
      theme: 'dark',
      type: 'Newsletter Premium',
      title: 'INTELIGÊNCIA SINTETIZADA',
      subtitle: 'O briefing tático que define o ritmo do mercado global diretamente no seu terminal, sem ruído e com precisão absoluta.',
      link: '/subscribe-premium',
      cta: 'Acessar Terminal'
    },
    {
      id: 'editions-main',
      theme: 'light',
      type: 'Edição Mensal',
      title: 'DOSSIÊS DE ALTO IMPACTO',
      subtitle: 'Mergulhe em análises verticais profundas sobre os vetores que estão moldando o futuro dos negócios e da tecnologia.',
      link: '/edicoes',
      cta: 'Explorar Edições'
    },
    {
      id: 'news-main',
      theme: 'dark',
      type: 'Notícias de Mercado',
      title: 'O PULSO DO MERCADO',
      subtitle: 'Cobertura em tempo real com o rigor analítico que sua tomada de decisão exige para manter a vantagem competitiva.',
      link: '/ultimas-noticias',
      cta: 'Ler Notícias'
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
  };

  const handleDragEnd = (x: number) => {
    if (dragStartX.current === null) return;
    const deltaX = x - dragStartX.current;
    const threshold = 50;
    if (deltaX < -threshold) nextSlide();
    else if (deltaX > threshold) prevSlide();
    dragStartX.current = null;
    setIsDragging(false);
  };

  return (
    <section 
      className={`relative h-[65vh] md:h-[75vh] lg:h-[80vh] w-full overflow-hidden select-none transition-colors duration-1000 ${
        slides[currentSlide].theme === 'dark' ? 'bg-black' : 'bg-white'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); setIsDragging(false); dragStartX.current = null; }}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseUp={(e) => handleDragEnd(e.clientX)}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-center ${
            index === currentSlide ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0'
          }`}
        >
          <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-20">
            <div className={`max-w-4xl transition-all duration-1000 delay-300 transform ${
              index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <span className={`inline-block text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-full mb-6 md:mb-8 shadow-sm ${
                slide.theme === 'dark' ? 'bg-accent text-white' : 'bg-primary text-white'
              }`}>
                {slide.type}
              </span>
              
              <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase leading-[1.1] md:leading-[1] tracking-tighter mb-6 md:mb-8 ${
                slide.theme === 'dark' ? 'text-white' : 'text-primary'
              }`}>
                {slide.title} 
                {slide.accentTitle && (
                  <span className="text-accent block italic mt-1">{slide.accentTitle}</span>
                )}
              </h2>

              <p className={`text-sm sm:text-base md:text-xl lg:text-2xl font-light leading-relaxed max-w-2xl mb-10 md:mb-12 italic ${
                slide.theme === 'dark' ? 'text-white/60' : 'text-primary/60'
              }`}>
                {slide.subtitle}
              </p>

              <button
                onClick={(e) => { e.stopPropagation(); navigate(slide.link); }}
                className={`px-8 py-4 md:px-12 md:py-5 rounded-full text-[10px] md:text-[12px] font-black uppercase tracking-[0.25em] transition-all shadow-xl active:scale-95 flex items-center gap-4 group ${
                  slide.theme === 'dark' 
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
          
          {/* Subtle decoration */}
          <div className={`absolute right-[-5%] top-1/2 -translate-y-1/2 w-[40vh] h-[40vh] md:w-[60vh] md:h-[60vh] rounded-full blur-[80px] md:blur-[120px] opacity-10 md:opacity-20 pointer-events-none transition-colors duration-1000 ${
            slide.theme === 'dark' ? 'bg-accent' : 'bg-primary'
          }`} />
        </div>
      ))}

      {/* Navigation Indicators */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
            className={`group relative h-1 w-10 md:w-16 rounded-full overflow-hidden transition-all ${
              slides[currentSlide].theme === 'dark' ? 'bg-white/10' : 'bg-primary/10'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          >
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-[6000ms] ease-linear ${
                index === currentSlide ? 'w-full bg-accent' : 'w-0'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Minimal Side Controls */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-6 right-6 lg:left-10 lg:right-10 justify-between z-30 pointer-events-none">
        <button 
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          className={`pointer-events-auto w-12 h-12 lg:w-16 lg:h-16 rounded-full border transition-all flex items-center justify-center group ${
            slides[currentSlide].theme === 'dark' 
            ? 'border-white/10 text-white hover:bg-white hover:text-primary' 
            : 'border-primary/10 text-primary hover:bg-primary hover:text-white'
          }`}
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className={`pointer-events-auto w-12 h-12 lg:w-16 lg:h-16 rounded-full border transition-all flex items-center justify-center group ${
            slides[currentSlide].theme === 'dark' 
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
