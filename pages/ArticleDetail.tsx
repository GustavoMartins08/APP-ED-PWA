
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchLatestNews } from '../lib/mcpClient';
import { NewsItem } from '../types';
import ShareModal from '../components/ShareModal';

const ArticleDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFloatingBack, setShowFloatingBack] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const scrollRafId = useRef<number | null>(null);

  const author = {
    name: 'Ricardo Montenegro',
    role: 'Analista Chefe de Estratégia',
    company: 'Empresário Digital',
    bio: 'Ricardo é especialista em inovação disruptiva e transformação digital, com mais de 15 anos de experiência aconselhando C-levels em estratégias de crescimento exponencial.',
    avatarUrl: 'https://i.pravatar.cc/150?u=ricardo'
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRafId.current) cancelAnimationFrame(scrollRafId.current);
      
      scrollRafId.current = requestAnimationFrame(() => {
        setShowFloatingBack(window.scrollY > 400);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafId.current) cancelAnimationFrame(scrollRafId.current);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      window.scrollTo(0, 0);
      const all = await fetchLatestNews();
      const found = all.find(a => a.id === id);
      
      if (found) {
        setArticle(found);
        const saved = JSON.parse(localStorage.getItem('saved_articles') || '[]');
        setIsSaved(saved.includes(id));
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const toggleSave = () => {
    if (!id) return;
    const saved = JSON.parse(localStorage.getItem('saved_articles') || '[]');
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter((sid: string) => sid !== id);
    } else {
      newSaved = [...saved, id];
    }
    localStorage.setItem('saved_articles', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  if (loading) return <div className="p-20 text-center font-serif text-2xl animate-pulse text-accent uppercase tracking-[0.5em]">Processando Relatório...</div>;
  if (!article) return <div className="p-20 text-center text-xl">Artigo não encontrado.</div>;

  const articleUrl = window.location.href;

  return (
    <article className="bg-white relative overflow-hidden pb-32" role="main">
      <button 
        onClick={() => navigate(-1)}
        className={`fixed left-6 md:left-12 top-32 z-50 bg-white/95 backdrop-blur-xl border border-gray-100 p-5 rounded-full shadow-2xl transition-[transform,opacity] duration-500 hover:bg-accent hover:text-white group gpu-accelerated ${showFloatingBack ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12 pointer-events-none'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>

      <div className="container mx-auto px-8 md:px-16 lg:px-32 xl:px-48 py-12 md:py-24">
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
          
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-[13px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-accent transition-colors flex items-center gap-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
              Voltar
            </button>
            <span className="text-accent text-[13px] font-black uppercase tracking-[0.5em]">{article.category}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter text-primary uppercase pb-4">
            {article.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-8 border-y border-gray-100">
            <div className="flex items-center gap-12">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Publicação</span>
                <p className="text-[15px] font-black uppercase tracking-widest text-primary">{article.timestamp}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={toggleSave} 
                className={`flex-grow sm:flex-grow-0 px-8 py-4 rounded-full border-2 text-[10px] md:text-[12px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${isSaved ? 'bg-accent border-accent text-white shadow-xl' : 'border-primary/10 text-primary hover:border-accent hover:text-accent'}`}
              >
                <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                {isSaved ? 'No Acervo' : 'Salvar Relatório'}
              </button>
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="flex-grow sm:flex-grow-0 px-8 py-4 rounded-full border-2 border-primary/10 text-primary hover:border-accent hover:text-accent text-[10px] md:text-[12px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Compartilhar
              </button>
            </div>
          </div>
          
          <div className="aspect-video rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl bg-lightGray gpu-accelerated">
            <img 
              src={article.imageUrl} 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-[filter,transform] duration-1000" 
              alt={article.title}
              decoding="async"
            />
          </div>

          <div className="max-w-3xl mx-auto pt-12 md:pt-20">
            <div className="space-y-12 text-2xl md:text-3xl text-secondary font-light leading-relaxed md:leading-[1.8] tracking-tight">
              <p className="editorial-drop-cap italic font-normal text-primary opacity-90 mb-16">
                {article.excerpt}
              </p>
              
              <div className="space-y-10 opacity-80">
                <p>
                  O cenário macroeconômico global exige, hoje, mais do que simples adaptação; exige uma reconfiguração completa do DNA organizacional. Enquanto modelos tradicionais de gestão se mostram obsoletos diante da velocidade da inteligência artificial, líderes visionários estão utilizando dados sintetizados para antecipar movimentos de mercado antes mesmo que eles se consolidem.
                </p>
                <h2 className="font-serif text-4xl md:text-6xl font-black text-primary leading-[0.9] tracking-tighter uppercase mt-24 mb-12">
                  O Próximo Ciclo de <span className="text-accent italic">Disrupção</span>
                </h2>
                <p>
                  A integração de ecossistemas digitais robustos não é mais uma opção de luxo para grandes corporações, mas sim a espinha dorsal de qualquer operação que pretenda manter relevância no próximo ciclo de inovação.
                </p>
              </div>
            </div>

            <section className="mt-32 pt-24 border-t border-gray-100 flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
              <img 
                src={author.avatarUrl} 
                className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover grayscale shadow-xl gpu-accelerated" 
                alt={author.name}
                loading="lazy"
                decoding="async"
              />
              <div className="space-y-4">
                <span className="text-accent text-[13px] font-black uppercase tracking-[0.5em]">Redação Executiva</span>
                <h4 className="font-serif text-4xl font-black uppercase tracking-tighter text-primary">
                  <Link to={`/colunas?author=${encodeURIComponent(author.name)}`} className="hover:text-accent transition-colors duration-300">
                    {author.name}
                  </Link>
                </h4>
                <p className="text-xl italic opacity-70 font-light leading-relaxed max-w-lg">{author.bio}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={articleUrl} title={article.title} />
    </article>
  );
};

export default ArticleDetail;
