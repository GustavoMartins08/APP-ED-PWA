import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { searchGlobal } from '../lib/supabaseClient';

const RESULTS_PER_PAGE = 3;

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ news: any[], editions: any[], videos: any[] }>({ news: [], editions: [], videos: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Pagination States
  const [visibleNews, setVisibleNews] = useState(RESULTS_PER_PAGE);
  const [visibleEditions, setVisibleEditions] = useState(RESULTS_PER_PAGE);
  const [visibleVideos, setVisibleVideos] = useState(RESULTS_PER_PAGE);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('auth_user');
    setIsLoggedIn(!!user);
  }, [location.pathname]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        closeAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSearch = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(true);
  };

  const toggleMenu = () => {
    setIsSearchOpen(false);
    setIsMenuOpen(!isMenuOpen);
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  // Autofocus search input
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 250);
      document.body.style.overflow = 'hidden';
    } else {
      if (!isMenuOpen) document.body.style.overflow = 'unset';
      setSearchQuery('');
      setSearchResults({ news: [], editions: [], videos: [] });
      resetPagination();
    }
  }, [isSearchOpen, isMenuOpen]);

  const resetPagination = () => {
    setVisibleNews(RESULTS_PER_PAGE);
    setVisibleEditions(RESULTS_PER_PAGE);
    setVisibleVideos(RESULTS_PER_PAGE);
  };

  // Handle live search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchGlobal(searchQuery);
        setSearchResults(results);
        resetPagination();
        setIsSearching(false);
      } else {
        setSearchResults({ news: [], editions: [], videos: [] });
        resetPagination();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Notícias', path: '/ultimas-noticias' },
    { name: 'Newsletters', path: '/newsletters' },
    { name: 'Edições', path: '/edicoes' },
    { name: 'Vídeos', path: '/videos' },
    { name: 'Colunas', path: '/colunas' },
    { name: 'Sobre Nós', path: '/sobre' },
    { name: 'Contato', path: '/contact' },
  ];

  useEffect(() => {
    closeAll();
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-2xl border-b border-gray-100/50" role="banner">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 py-4 md:py-6 flex items-center justify-between relative z-[110] gap-4">
          <Link
            to="/"
            className="group transition-transform hover:scale-[1.02] active:scale-95 shrink-0"
            onClick={closeAll}
            aria-label="Ir para a Home"
          >
            <Logo className="w-auto h-7 md:h-11" />
          </Link>

          {/* Desktop Nav - Optimized for 8 links */}
          <nav className="hidden lg:flex items-center flex-grow justify-end" aria-label="Navegação Principal">
            <div className="flex items-center space-x-3 xl:space-x-5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[8.5px] xl:text-[10px] font-black uppercase tracking-[0.15em] xl:tracking-[0.2em] transition-[color,transform] hover:text-accent relative py-2 whitespace-nowrap ${location.pathname === link.path ? 'text-accent' : 'text-primary/70 hover:text-primary'
                    }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent" />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 xl:gap-5 border-l border-gray-100 ml-4 xl:ml-7 pl-4 xl:pl-7">
              <button
                onClick={openSearch}
                className="text-primary/60 hover:text-accent p-2 rounded-full transition-all hover:bg-lightGray flex items-center gap-2 group"
                aria-label="Abrir Pesquisa"
              >
                <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <kbd className="hidden 2xl:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-white px-1.5 font-sans text-[9px] font-medium text-gray-400 group-hover:border-accent group-hover:text-accent transition-colors">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              <Link
                to={isLoggedIn ? "/perfil" : "/login"}
                className={`p-2 rounded-full transition-colors ${location.pathname === (isLoggedIn ? '/perfil' : '/login') ? 'text-accent' : 'text-primary/60 hover:text-primary'}`}
                aria-label={isLoggedIn ? "Meu Perfil" : "Fazer Login"}
              >
                <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              <Link to="/newsletters" className="bg-primary text-white px-4 xl:px-7 py-2.5 rounded-full text-[8.5px] xl:text-[9px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-[background-color,transform] shadow-lg active:scale-95 whitespace-nowrap">
                Assinar
              </Link>
            </div>
          </nav>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              onClick={openSearch}
              className="w-11 h-11 flex items-center justify-center text-primary/80 hover:text-accent transition-colors active:scale-90"
              aria-label="Abrir Pesquisa"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              className="w-11 h-11 flex items-center justify-center text-primary/80 focus:outline-none relative z-[1001] active:scale-90"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              <div className="w-6 h-4 flex flex-col justify-between items-end relative">
                <span className={`block h-0.5 bg-current transition-[transform,width,opacity] duration-300 origin-right ${isMenuOpen ? 'w-[1.4rem] -rotate-45 -translate-y-[0.1rem] translate-x-[0.1rem]' : 'w-full'}`} />
                <span className={`block h-0.5 bg-current transition-[transform,width,opacity] duration-200 ${isMenuOpen ? 'opacity-0 scale-0' : 'w-2/3 opacity-100'}`} />
                <span className={`block h-0.5 bg-current transition-[transform,width,opacity] duration-300 origin-right ${isMenuOpen ? 'w-[1.4rem] rotate-45 translate-y-[0.1rem] translate-x-[0.1rem]' : 'w-1/2'}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY - Performance Optimized */}
      <div
        className={`fixed inset-0 z-[1000] bg-white transition-[transform,opacity] duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] flex flex-col will-change-composite gpu-accelerated ${isSearchOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="container mx-auto px-6 md:px-12 lg:px-24 py-6 md:py-10 border-b border-gray-100 flex items-center justify-between">
            <Logo className="h-6 md:h-10 opacity-30" />
            <button
              onClick={closeAll}
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-accent transition-colors p-3 -mr-3"
            >
              Fechar <span className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-gray-100 flex items-center justify-center bg-lightGray/50">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </span>
            </button>
          </div>

          <div className="container mx-auto px-6 md:px-12 lg:px-24 flex-grow overflow-y-auto py-10 md:py-16">
            <div className="max-w-5xl mx-auto">
              <div className="relative mb-10 md:mb-16">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Pesquisar..."
                  className="w-full bg-transparent border-b-2 md:border-b-4 border-primary text-2xl sm:text-4xl md:text-7xl font-serif font-black uppercase tracking-tighter py-4 md:py-6 focus:outline-none placeholder:text-gray-100 transition-colors focus:border-accent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery.length > 0 && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-gray-300 hover:text-accent"
                  >
                    <svg className="w-6 h-6 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
                {isSearching && (
                  <div className="absolute left-0 -bottom-1">
                    <span className="h-0.5 md:h-1 bg-accent animate-[loading_1.5s_infinite] block w-24"></span>
                  </div>
                )}
              </div>

              {searchQuery.length >= 2 ? (
                <div
                  key={JSON.stringify(searchResults)}
                  className={`grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 transition-opacity duration-500 ${isSearching ? 'opacity-40' : 'opacity-100'}`}
                >
                  {[
                    { title: 'Insights', data: searchResults.news, visible: visibleNews, setVisible: setVisibleNews, path: '/artigo/' },
                    { title: 'Dossiês', data: searchResults.editions, visible: visibleEditions, setVisible: setVisibleEditions, path: '/newsletter/' },
                    { title: 'Briefings', data: searchResults.videos, visible: visibleVideos, setVisible: setVisibleVideos, path: '/videos' }
                  ].map((col, idx) => (
                    <div key={col.title} className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{col.title} ({col.data.length})</h3>
                      <div className="space-y-5">
                        {col.data.slice(0, col.visible).map((item, i) => (
                          <Link
                            key={item.id}
                            to={col.path === '/videos' ? col.path : `${col.path}${item.id}`}
                            className="block group animate-fade-in opacity-0"
                            style={{
                              animationDelay: `${(idx * 150) + (i * 40)}ms`,
                              animationFillMode: 'both'
                            }}
                          >
                            <h4 className="font-serif text-base md:text-xl font-black uppercase leading-tight tracking-tighter group-hover:text-accent transition-colors duration-300">
                              {item.title || item.theme}
                            </h4>
                          </Link>
                        ))}
                      </div>
                      {col.data.length > col.visible && (
                        <button
                          onClick={() => col.setVisible(prev => prev + RESULTS_PER_PAGE)}
                          className="text-[9px] font-black uppercase tracking-[0.3em] text-accent hover:text-primary transition-colors flex items-center gap-2 pt-1"
                        >
                          Ver mais (+{col.data.length - col.visible})
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="animate-fade-in">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-6 md:mb-10">Sugestões de Pesquisa</h3>
                  <div className="flex flex-wrap gap-2.5 md:gap-4">
                    {['IA Generativa', 'Venture Capital', 'ESG', 'Semicondutores', 'SaaS', 'Web3', 'M&A', 'Logística'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-5 py-3 md:px-7 md:py-4 rounded-full bg-lightGray text-[9px] md:text-[11px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-[background-color,color,transform] duration-300 border border-gray-100/50 active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY - Refactored for smooth performance */}
      <div
        className={`lg:hidden fixed inset-0 z-[999] bg-white transition-[transform,opacity,visibility] duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] will-change-transform gpu-accelerated ${isMenuOpen ? 'translate-y-0 opacity-100 visible pointer-events-auto' : 'translate-y-full opacity-0 invisible pointer-events-none'
          }`}
      >
        <div className="flex flex-col h-full w-full bg-white pt-24 md:pt-32 pb-10 px-8 md:px-16 overflow-hidden">
          {/* Main Links - Reorganized for better spacing */}
          <nav className="flex flex-col flex-grow justify-center space-y-3 md:space-y-4 text-center">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-2xl sm:text-3xl md:text-4xl font-serif font-black uppercase tracking-tighter transition-[transform,opacity,color] duration-500 block active:scale-95 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  } ${location.pathname === link.path ? 'text-accent' : 'text-primary/90 hover:text-accent'}`}
                style={{
                  transitionDelay: isMenuOpen ? `${index * 40 + 200}ms` : '0ms',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={closeAll}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Quick Actions at Bottom */}
          <div
            className={`mt-auto pt-8 border-t border-gray-100 transition-[transform,opacity] duration-700 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            style={{ transitionDelay: isMenuOpen ? '550ms' : '0ms' }}
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Link
                to={isLoggedIn ? "/perfil" : "/login"}
                className="bg-lightGray p-4 md:p-6 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 active:scale-95 transition-[background-color,transform] group"
                onClick={closeAll}
              >
                <svg className="w-5 h-5 text-primary/40 group-hover:text-accent transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">{isLoggedIn ? 'Perfil' : 'Entrar'}</span>
              </Link>
              <Link
                to="/newsletters"
                className="bg-accent/5 p-4 md:p-6 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 active:scale-95 transition-[background-color,transform] group"
                onClick={closeAll}
              >
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-accent">Assinar</span>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[8px] font-black uppercase tracking-[0.3em] text-gray-300">
              <p>© 2024 Empresário Digital</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-accent transition-colors duration-300">LinkedIn</a>
                <a href="#" className="hover:text-accent transition-colors duration-300">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translate3d(-100%, 0, 0); }
          100% { transform: translate3d(500%, 0, 0); }
        }
      `}</style>
    </>
  );
};

export default Header;