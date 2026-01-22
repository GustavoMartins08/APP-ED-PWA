
import React, { useEffect, useState, useRef } from 'react';
import SectionHeader from '../components/SectionHeader';
import NewsCard from '../components/NewsCard';
import NewsletterForm from '../components/NewsletterForm';
import HeroCarousel from '../components/HeroCarousel';
import ScrollLineDivider from '../components/ScrollLineDivider';
import { fetchLatestNews, fetchEditorials, fetchVideos } from '../lib/supabaseClient';
import { NewsItem, Editorial, Video } from '../types';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../components/ShareModal';

const Home: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsletters, setNewsletters] = useState<NewsItem[]>([]);
  const [editorials, setEditorials] = useState<Editorial[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<{ newsletters: string[], videos: string[] }>({ newsletters: [], videos: [] });
  const [shareData, setShareData] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });
  const navigate = useNavigate();

  const newsRef = useRef<HTMLDivElement>(null);
  const newslettersRef = useRef<HTMLDivElement>(null);
  const editorialsRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLDivElement>(null);

  const [scrollStates, setScrollStates] = useState<{ [key: string]: { canScrollLeft: boolean, canScrollRight: boolean } }>({
    news: { canScrollLeft: false, canScrollRight: true },
    newsletters: { canScrollLeft: false, canScrollRight: true },
    editorials: { canScrollLeft: false, canScrollRight: true },
    videos: { canScrollLeft: false, canScrollRight: true }
  });

  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const updateScrollState = (id: string, element: HTMLDivElement) => {
    const canScrollLeft = element.scrollLeft > 20;
    const canScrollRight = element.scrollLeft + element.clientWidth < element.scrollWidth - 20;
    setScrollStates(prev => ({
      ...prev,
      [id]: { canScrollLeft, canScrollRight }
    }));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    (Object.values(sectionRefs.current) as (HTMLDivElement | null)[]).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    const loadData = async () => {
      const [newsData, editorialData, videoData] = await Promise.all([
        fetchLatestNews(),
        fetchEditorials(),
        fetchVideos()
      ]);

      const mainNews = [...newsData, ...newsData.map(n => ({ ...n, id: n.id + '_extra' }))].slice(0, 6);
      setNews(mainNews);

      const mockNewsletters = newsData.map(n => ({
        ...n,
        id: 'nl_' + n.id,
        category: 'Newsletter Semanal',
        title: 'Edição: ' + n.title
      }));
      setNewsletters(mockNewsletters);

      setEditorials(editorialData);
      setVideos(videoData);

      setSavedItems({
        newsletters: JSON.parse(localStorage.getItem('saved_newsletters') || '[]'),
        videos: JSON.parse(localStorage.getItem('saved_videos') || '[]')
      });

      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const refs = [
      { id: 'newsletters', ref: newslettersRef },
      { id: 'news', ref: newsRef },
      { id: 'editorials', ref: editorialsRef },
      { id: 'videos', ref: videosRef }
    ];

    const handlers = refs.map(({ id, ref }) => {
      const el = ref.current;
      if (!el) return null;

      const handler = () => updateScrollState(id, el);
      el.addEventListener('scroll', handler, { passive: true });
      setTimeout(handler, 800);
      return { el, handler };
    });

    return () => {
      handlers.forEach(h => h?.el.removeEventListener('scroll', h.handler));
    };
  }, [loading]);

  const toggleSave = (e: React.MouseEvent, type: 'newsletters' | 'videos', id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const currentList = savedItems[type];
    const newList = currentList.includes(id)
      ? currentList.filter(sid => sid !== id)
      : [...currentList, id];

    const newSavedItems = { ...savedItems, [type]: newList };
    setSavedItems(newSavedItems);
    localStorage.setItem(`saved_${type}`, JSON.stringify(newList));
  };

  const openShare = (e: React.MouseEvent, title: string, path?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setShareData({
      isOpen: true,
      url: path ? `${window.location.origin}${window.location.pathname}#${path}` : window.location.href,
      title
    });
  };

  const preciseScroll = (element: HTMLElement, direction: 'left' | 'right') => {
    const firstChild = element.firstElementChild as HTMLElement;
    if (!firstChild) return;

    const cardWidth = firstChild.offsetWidth;
    const style = window.getComputedStyle(element);
    const gap = parseInt(style.columnGap || style.gap || '0', 10);
    const step = cardWidth + gap;

    const currentScroll = element.scrollLeft;
    const target = direction === 'left'
      ? Math.max(0, Math.round((currentScroll - step) / step) * step)
      : Math.min(element.scrollWidth - element.clientWidth, Math.round((currentScroll + step) / step) * step);

    element.scrollTo({
      left: target,
      behavior: 'smooth'
    });
  };

  const SideScrollIndicator = ({ side, id, onClick, isVisible }: { side: 'left' | 'right', id: string, onClick: () => void, isVisible: boolean }) => {
    return (
      <div
        className={`absolute top-0 h-[80%] ${side === 'left' ? 'left-[-15px] md:left-[-40px]' : 'right-[-15px] md:right-[-40px]'} w-12 md:w-24 z-40 flex items-center ${side === 'left' ? 'justify-start' : 'justify-end'} pointer-events-none transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 ' + (side === 'left' ? '-translate-x-10' : 'translate-x-10')}`}
      >
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
          className={`pointer-events-auto w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/95 backdrop-blur-2xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex items-center justify-center text-primary hover:bg-accent hover:text-white hover:scale-110 active:scale-90 transition-all ${side === 'right' ? 'animate-[subtle-hint_4s_infinite]' : ''}`}
          aria-label={side === 'left' ? "Anterior" : "Próximo"}
        >
          <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={side === 'left' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" role="status">
        <div className="text-center font-serif text-3xl animate-pulse text-accent tracking-tighter uppercase">
          Carregando...
        </div>
      </div>
    );
  }

  const revealClass = (id: string) => `transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform ${visibleSections.has(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`;

  return (
    <div className="space-y-4 md:space-y-8 lg:space-y-12 pb-24 overflow-x-hidden">

      {/* Hero Carousel */}
      <HeroCarousel />

      <ScrollLineDivider />

      {/* Newsletters Section */}
      <section
        id="newsletters-section"
        ref={el => sectionRefs.current['newsletters-section'] = el}
        className={`container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 ${revealClass('newsletters-section')}`}
      >
        <div className="flex flex-col gap-6 mb-12">
          <span className="text-accent text-[12px] md:text-[18px] font-black uppercase tracking-[0.6em] md:tracking-[0.8em] block">Sintese de Valor</span>
          <SectionHeader title="Newsletters" subtitle="O resumo tático condensado em edições de alta densidade para líderes que precisam de clareza imediata e insights profundos." />
          <div className="mt-2">
            <button
              onClick={() => navigate('/subscribe-premium')}
              className="bg-accent text-white px-8 md:px-14 py-4 md:py-6 rounded-full text-[11px] md:text-[14px] font-black uppercase tracking-[0.25em] hover:bg-primary transition-all shadow-xl"
            >
              Assinar Newsletter Premium
            </button>
          </div>
        </div>

        <div className="relative group overflow-visible">
          <SideScrollIndicator side="left" id="newsletters" isVisible={scrollStates.newsletters.canScrollLeft} onClick={() => preciseScroll(newslettersRef.current!, 'left')} />
          <SideScrollIndicator side="right" id="newsletters" isVisible={scrollStates.newsletters.canScrollRight} onClick={() => preciseScroll(newslettersRef.current!, 'right')} />
          <div
            ref={newslettersRef}
            className="flex gap-10 md:gap-16 overflow-x-auto pb-10 snap-x snap-mandatory scroll-smooth scroll-px-0 scrollbar-hide"
          >
            {newsletters.length > 0 ? (
              newsletters.map((nl, idx) => (
                <div key={nl.id} className="w-[85vw] md:w-[500px] shrink-0 snap-start snap-always">
                  <NewsCard item={nl} index={idx} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 border border-dashed border-gray-200 rounded-[2rem]">
                <p className="text-gray-300 font-black uppercase tracking-[0.3em] text-[10px] md:text-[12px]">Nenhuma newsletter disponível.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ScrollLineDivider />

      {/* News Section */}
      <section
        id="news-section"
        ref={el => sectionRefs.current['news-section'] = el}
        className={`container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 ${revealClass('news-section')}`}
      >
        <div className="mb-12">
          <SectionHeader title="Notícias" subtitle="Análises processadas em tempo real por nossa infraestrutura global de dados e inteligência de mercado de alto nível." />
        </div>
        <div className="relative group overflow-visible">
          <SideScrollIndicator side="left" id="news" isVisible={scrollStates.news.canScrollLeft} onClick={() => preciseScroll(newsRef.current!, 'left')} />
          <SideScrollIndicator side="right" id="news" isVisible={scrollStates.news.canScrollRight} onClick={() => preciseScroll(newsRef.current!, 'right')} />
          <div
            ref={newsRef}
            className="flex gap-10 md:gap-16 overflow-x-auto pb-16 snap-x snap-mandatory scroll-smooth scroll-px-0 scrollbar-hide"
          >
            {news.length > 0 ? (
              news.map((item, idx) => (
                <div key={item.id} className="min-w-[80vw] md:min-w-[450px] snap-start snap-always">
                  <NewsCard item={item} index={idx} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 border border-dashed border-gray-200 rounded-[2rem]">
                <p className="text-gray-300 font-black uppercase tracking-[0.3em] text-[10px] md:text-[12px]">Nenhuma notícia publicada ainda.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ScrollLineDivider />

      {/* Editions Section */}
      <section
        id="editions-section"
        ref={el => sectionRefs.current['editions-section'] = el}
        className={`bg-lightGray py-20 md:py-32 overflow-hidden rounded-[5rem] md:rounded-[10rem] mx-4 md:mx-12 ${revealClass('editions-section')}`}
      >
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="mb-12">
            <SectionHeader title="Edições" subtitle="Aprofundamento vertical e dossiês completos sobre setores de disrupção massiva e tendências exponenciais que movem o mundo." />
          </div>
          <div className="relative group overflow-visible">
            <SideScrollIndicator side="left" id="editorials" isVisible={scrollStates.editorials.canScrollLeft} onClick={() => preciseScroll(editorialsRef.current!, 'left')} />
            <SideScrollIndicator side="right" id="editorials" isVisible={scrollStates.editorials.canScrollRight} onClick={() => preciseScroll(editorialsRef.current!, 'right')} />
            <div
              ref={editorialsRef}
              className="flex gap-12 md:gap-20 overflow-x-auto pb-16 snap-x snap-mandatory scroll-smooth scroll-px-0 scrollbar-hide"
            >
              {editorials.length > 0 ? (
                editorials.map((ed, idx) => (
                  <div
                    key={ed.id}
                    className="w-[300px] md:w-[380px] shrink-0 snap-start snap-always group cursor-pointer"
                    onClick={() => navigate(`/edicao/${ed.id}`)}
                  >
                    <div className="aspect-[3/4] rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl mb-12 relative bg-white border border-gray-100">
                      <img
                        src={ed.imageUrl}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                        alt={ed.theme}
                      />
                      <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-white text-primary px-10 py-5 rounded-full text-[12px] font-black uppercase tracking-widest shadow-2xl">Acessar Insight</span>
                      </div>
                    </div>
                    <div className="px-4">
                      <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.5em] text-accent mb-4 block">{ed.monthYear}</span>
                      <h4 className="font-serif text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight group-hover:text-accent transition-colors mb-6">{ed.theme}</h4>

                      <div className="flex flex-wrap gap-3 mb-8">
                        <button
                          onClick={(e) => toggleSave(e, 'newsletters', ed.id)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${savedItems.newsletters.includes(ed.id) ? 'bg-accent text-white shadow-lg' : 'bg-white border border-gray-200 text-primary hover:bg-accent hover:text-white'}`}
                        >
                          <svg className="w-3.5 h-3.5" fill={savedItems.newsletters.includes(ed.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                          {savedItems.newsletters.includes(ed.id) ? 'Salvo' : 'Salvar'}
                        </button>
                        <button
                          onClick={(e) => openShare(e, ed.theme, `/newsletter/${ed.id}`)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 text-primary hover:bg-accent hover:text-white transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                          Compartilhar
                        </button>
                      </div>

                      {ed.summary && (
                        <p className="text-secondary text-base md:text-lg font-light opacity-60 line-clamp-3 leading-relaxed">
                          {ed.summary}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-12 border border-dashed border-gray-300/50 rounded-[2rem]">
                  <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] md:text-[12px]">Nenhum editorial publicado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ScrollLineDivider />

      {/* Videos Section */}
      <section
        id="videos-section"
        ref={el => sectionRefs.current['videos-section'] = el}
        className={`container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 ${revealClass('videos-section')}`}
      >
        <div className="mb-12">
          <SectionHeader title="Vídeos" subtitle="Sintetizados para consumo tático e visual, ideal para a rotina acelerada da liderança decisora que busca eficiência." />
        </div>
        <div className="relative group overflow-visible">
          <SideScrollIndicator side="left" id="videos" isVisible={scrollStates.videos.canScrollLeft} onClick={() => preciseScroll(videosRef.current!, 'left')} />
          <SideScrollIndicator side="right" id="videos" isVisible={scrollStates.videos.canScrollRight} onClick={() => preciseScroll(videosRef.current!, 'right')} />
          <div
            ref={videosRef}
            className="flex gap-10 md:gap-16 overflow-x-auto pb-12 snap-x snap-mandatory scroll-smooth scroll-px-0 scrollbar-hide"
          >
            {videos.length > 0 ? (
              videos.map((video, idx) => (
                <div
                  key={video.id}
                  className="min-w-[85vw] md:min-w-[580px] snap-start snap-always"
                >
                  <div className="group relative bg-black rounded-[2.5rem] md:rounded-[4rem] overflow-hidden aspect-[4/3] sm:aspect-video shadow-2xl border border-gray-900 cursor-pointer">
                    <img
                      src={video.imageUrl}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-1000 grayscale group-hover:grayscale-0"
                      alt={video.title}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />

                    <div className="absolute inset-0 p-8 md:p-12 lg:p-14 flex flex-col justify-between z-10">
                      <div className="flex justify-between items-start gap-4">
                        <span className="bg-accent text-white text-[9px] md:text-[12px] font-black px-5 md:px-7 py-2 md:py-3 rounded-full uppercase tracking-widest shadow-xl">
                          {video.category}
                        </span>
                        <span className="text-white text-[9px] md:text-[12px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/5">
                          {video.duration}
                        </span>
                      </div>

                      <div className="space-y-6 md:space-y-8">
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-black text-white uppercase leading-tight tracking-tighter line-clamp-2 md:line-clamp-3 drop-shadow-xl">
                          {video.title}
                        </h3>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6 pt-2">
                          <button className="flex items-center gap-4 text-white text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em] group-hover:text-accent transition-colors flex-grow sm:flex-grow-0">
                            <span className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-xl">
                              <svg className="w-5 h-5 md:w-7 md:h-7 fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </span>
                            <span className="whitespace-nowrap">Assistir</span>
                          </button>

                          <div className="flex gap-3 md:gap-4 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                            <button
                              onClick={(e) => toggleSave(e, 'videos', video.id)}
                              className={`flex items-center justify-center gap-2.5 w-10 h-10 md:w-12 md:h-12 rounded-full transition-all ${savedItems.videos.includes(video.id) ? 'bg-accent text-white' : 'bg-white/10 text-white hover:bg-accent'}`}
                              aria-label="Salvar"
                            >
                              <svg className="w-4 h-4" fill={savedItems.videos.includes(video.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                            </button>
                            <button
                              onClick={(e) => openShare(e, video.title, '/videos')}
                              className="flex items-center justify-center gap-2.5 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 text-white hover:bg-accent transition-all"
                              aria-label="Compartilhar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 border border-dashed border-gray-200 rounded-[2rem]">
                <p className="text-gray-300 font-black uppercase tracking-[0.3em] text-[10px] md:text-[12px]">Nenhum vídeo disponível no momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ScrollLineDivider />

      {/* Final CTA Section */}
      <section
        id="cta-section"
        ref={el => sectionRefs.current['cta-section'] = el}
        className={`container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 pb-16 ${revealClass('cta-section')}`}
      >
        <div className="bg-primary rounded-[3rem] md:rounded-[8rem] relative group overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute inset-0 bg-accent/5 pointer-events-none group-hover:bg-accent/10 transition-all duration-1000"></div>
          <div className="flex flex-col lg:flex-row items-stretch">
            <div className="lg:w-[60%] p-10 md:p-16 xl:p-20 space-y-12 flex flex-col justify-center relative z-10">
              <div className="space-y-8">
                <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase leading-[0.85] tracking-tighter">
                  Assine a <br />
                  <span className="text-accent block mt-2">Inteligência</span>.
                </h2>
                <p className="text-white/80 text-lg md:text-2xl font-light leading-relaxed max-w-2xl">
                  Junte-se à elite decisória global. Dados sintetizados sem ruído para seu crescimento exponencial.
                </p>
              </div>
              <div className="w-full">
                <NewsletterForm variant="card" theme="dark" />
              </div>
            </div>
            <div className="lg:w-[40%] w-full min-h-[400px] lg:min-h-full relative grayscale group-hover:grayscale-0 transition-all duration-1000 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200"
                alt="Inteligência Estratégica"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 lg:bg-none"></div>
            </div>
          </div>
        </div>
      </section>

      <ShareModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData({ ...shareData, isOpen: false })}
        url={shareData.url}
        title={shareData.title}
      />

      <style>{`
        @keyframes subtle-hint {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Home;
