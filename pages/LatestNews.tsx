
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import SectionHeader from '../components/SectionHeader';
import { fetchLatestNews } from '../lib/mcpClient';
import { NewsItem } from '../types';

const ITEMS_PER_PAGE = 4;
const TOTAL_PAGES_SIMULATED = 5;

const LatestNews: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sincronização com a URL
  const activeCategory = searchParams.get('category') || 'Todas';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const categories = ['Todas', 'Negócios', 'Startups', 'Inovação', 'Carreira', 'Tecnologia', 'IA', 'Mercado'];

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      // Simulando delay de rede e busca baseada em categoria
      const data = await fetchLatestNews(activeCategory);
      
      // Como o mock retorna sempre os mesmos itens, simulamos a paginação 
      // alterando levemente os IDs e títulos para feedback visual de mudança
      const paginatedData = data.map(item => ({
        ...item,
        id: `${item.id}-p${currentPage}`,
        title: currentPage > 1 ? `[Pág ${currentPage}] ${item.title}` : item.title
      }));

      setNews(paginatedData);
      setLoading(false);
      
      // Scroll suave para o topo ao trocar de página
      if (currentPage > 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    loadContent();
  }, [activeCategory, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > TOTAL_PAGES_SIMULATED) return;
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleCategoryChange = (cat: string) => {
    const newParams = new URLSearchParams();
    newParams.set('category', cat);
    newParams.set('page', '1'); // Reseta para página 1 ao trocar categoria
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-8 md:px-16 lg:px-32 xl:px-48 py-24 md:py-48">
      <SectionHeader 
        title="Notícias" 
        subtitle="O pulso estratégico do mercado global atualizado em tempo real com precisão tática." 
      />

      {/* Categorias */}
      <nav className="flex gap-4 overflow-x-auto pb-10 mb-20 scrollbar-hide scroll-mask will-change-composite" aria-label="Categorias">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`whitespace-nowrap px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${
              activeCategory === cat ? 'bg-accent text-white shadow-2xl' : 'bg-lightGray text-secondary hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Grid de Notícias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 min-h-[600px] will-change-composite">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-lightGray aspect-[16/10] rounded-[3rem]" />
          ))
        ) : (
          news.map((item, index) => (
            <div key={item.id}>
              <NewsCard item={item} index={index} />
            </div>
          ))
        )}
      </div>

      {/* Paginação Robusta */}
      <div className="mt-24 md:mt-40 border-t border-gray-100 pt-16 flex flex-col items-center gap-12">
        <div className="flex items-center gap-4 sm:gap-8 md:gap-12">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`flex items-center gap-4 text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] transition-all ${
              currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-primary hover:text-accent group'
            }`}
          >
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border border-gray-100 flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30' : 'group-hover:border-accent group-hover:bg-accent group-hover:text-white shadow-sm'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </div>
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="flex items-center gap-4">
            {[...Array(TOTAL_PAGES_SIMULATED)].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-10 h-10 md:w-14 md:h-14 font-serif text-lg md:text-2xl font-black rounded-xl transition-all ${
                    currentPage === p 
                    ? 'bg-primary text-white scale-110 shadow-xl' 
                    : 'text-gray-300 hover:text-primary hover:bg-lightGray'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === TOTAL_PAGES_SIMULATED || loading}
            className={`flex items-center gap-4 text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] transition-all ${
              currentPage === TOTAL_PAGES_SIMULATED ? 'text-gray-200 cursor-not-allowed' : 'text-primary hover:text-accent group'
            }`}
          >
            <span className="hidden sm:inline">Próximo</span>
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border border-gray-100 flex items-center justify-center transition-all ${currentPage === TOTAL_PAGES_SIMULATED ? 'opacity-30' : 'group-hover:border-accent group-hover:bg-accent group-hover:text-white shadow-sm'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">
          Página {currentPage} de {TOTAL_PAGES_SIMULATED} • Terminal Sincronizado
        </p>
      </div>
    </div>
  );
};

export default LatestNews;
