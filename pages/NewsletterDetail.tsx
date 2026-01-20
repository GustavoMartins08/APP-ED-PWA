
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchLatestNews } from '../lib/mcpClient';
import { NewsletterEdition, NewsItem } from '../types';
import NewsletterForm from '../components/NewsletterForm';
import ShareModal from '../components/ShareModal';

const NewsletterDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [edition, setEdition] = useState<NewsletterEdition | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const loadNewsletter = async () => {
      window.scrollTo(0, 0);
      const newsBase = await fetchLatestNews();
      
      const mockItems: NewsItem[] = [
        { 
          ...newsBase[0], 
          id: 'n1', 
          title: 'A Ascensão dos Agentes Autônomos na Gestão de Fundos',
          keyPoints: [
            'IA agora opera 24/7 em mercados secundários sem supervisão humana.',
            'Taxas de corretagem caíram 40% em corretoras que adotaram agentes nativos.',
            'Necessidade urgente de auditoria algorítmica em tempo real.'
          ]
        },
        { 
          ...newsBase[1], 
          id: 'n2', 
          title: 'Semicondutores: A Nova Geopolítica do Poder',
          keyPoints: [
            'China acelera produção doméstica de chips de 7nm.',
            'EUA apertam restrições de exportação para chips de IA de alto desempenho.',
            'Impacto direto no custo de servidores de nuvem para startups brasileiras.'
          ]
        },
        { 
          ...newsBase[2], 
          id: 'n3', 
          title: 'Tokenização de Ativos Reais: O Fim dos Intermediários?',
          keyPoints: [
            'Imóveis fracionados via blockchain batem recorde de liquidez.',
            'Bancos centrais testam integração de CBDCs com protocolos DeFi.',
            'Redução de custos operacionais em transações cross-border.'
          ]
        },
        { 
          ...newsBase[3], 
          id: 'n4', 
          title: 'Computação Quântica e a Quebra da Criptografia Atual',
          keyPoints: [
            'Google anuncia marco na correção de erros quânticos.',
            'Cripto-agilidade torna-se prioridade para segurança cibernética corporativa.',
            'Investimentos em criptografia pós-quântica aumentam 200%.'
          ]
        }
      ];

      const mockEdition: NewsletterEdition = {
        id: id || 'current',
        title: 'Newsletter Estratégica: O Próximo Ciclo de Inovação',
        date: '12 de Junho, 2024',
        coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
        synthesis: 'Compilado técnico dos vetores de disrupção que estão redefinindo as fronteiras da eficiência operacional nesta quinzena.',
        items: mockItems
      };

      setEdition(mockEdition);
      
      const saved = JSON.parse(localStorage.getItem('saved_newsletters') || '[]');
      setIsSaved(saved.includes(id || 'current'));
      
      setLoading(false);
    };
    loadNewsletter();
  }, [id]);

  const toggleSave = () => {
    const nid = id || 'current';
    const saved = JSON.parse(localStorage.getItem('saved_newsletters') || '[]');
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter((sid: string) => sid !== nid);
    } else {
      newSaved = [...saved, nid];
    }
    localStorage.setItem('saved_newsletters', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" role="status">
        <div className="text-center font-serif text-xl md:text-2xl animate-pulse text-accent tracking-tighter uppercase">
          Compilando Insight...
        </div>
      </div>
    );
  }

  if (!edition) return <div className="p-20 text-center">Edição não encontrada.</div>;

  return (
    <div className="bg-white min-h-screen selection:bg-accent selection:text-white">
      <header className="relative h-[65vh] md:h-[75vh] lg:h-[80vh] overflow-hidden flex items-end">
        <img 
          src={edition.coverImage} 
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.3]" 
          alt="Capa"
          decoding="async"
        />
        {/* Ajuste do gradiente para base escura (preta) garantindo legibilidade absoluta */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        <div className="container mx-auto px-6 md:px-12 lg:px-24 pb-12 md:pb-24 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 md:mb-16">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/90 hover:text-accent transition-colors group"
            >
              <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
              Voltar ao Arquivo
            </button>
            <div className="flex gap-4">
               <button 
                 onClick={toggleSave}
                 className={`px-6 md:px-8 py-3 rounded-full border border-white/20 backdrop-blur-md text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${isSaved ? 'bg-accent text-white border-accent' : 'bg-white/5 text-white hover:bg-white/10'}`}
               >
                 <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                 {isSaved ? 'Salva' : 'Salvar Edição'}
               </button>
               <button 
                 onClick={() => setIsShareModalOpen(true)}
                 className="px-6 md:px-8 py-3 rounded-full bg-white/5 border border-white/20 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 flex items-center gap-3"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                 Compartilhar
               </button>
            </div>
          </div>
          
          <div className="max-w-5xl space-y-6 md:space-y-8">
            <span className="inline-block bg-accent text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] px-6 py-2.5 md:px-8 md:py-3 rounded-full shadow-2xl">
              Newsletter Exclusiva
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white uppercase leading-[0.95] md:leading-[1] tracking-tighter">
              {edition.title}
            </h1>
            <div className="flex items-center gap-6 md:gap-8 text-[9px] md:text-[11px] font-black text-white/90 uppercase tracking-[0.4em]">
              <span>{edition.date}</span>
              <span className="w-1.5 h-1.5 bg-accent rounded-full hidden sm:block"></span>
              <span className="hidden sm:block">Fronteiras Digitais</span>
            </div>
          </div>
        </div>
      </header>

      <section className="py-16 md:py-32 bg-lightGray/30 border-b border-gray-100">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl">
            <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.6em] text-accent mb-8 md:mb-10">Abstract Executivo</h2>
            <p className="font-serif text-xl md:text-3xl lg:text-4xl font-black text-primary leading-tight tracking-tight border-l-4 md:border-l-8 border-accent pl-6 md:pl-10">
              "{edition.synthesis}"
            </p>
          </div>
        </div>
      </section>

      <main className="py-20 md:py-32 lg:py-48">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl mx-auto space-y-24 md:space-y-32 lg:space-y-40">
            {edition.items.map((item, index) => (
              <section key={item.id} className="group relative">
                <div className="absolute -left-4 md:-left-24 lg:-left-32 -top-12 md:-top-20 text-[80px] md:text-[150px] lg:text-[180px] font-serif font-black text-gray-100 -z-10 select-none leading-none pointer-events-none opacity-40 group-hover:text-accent/5 transition-colors duration-700">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                <div className="space-y-8 md:space-y-12">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-6 md:pb-8">
                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] text-accent">
                      Análise Estratégica {index + 1}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-primary uppercase leading-[1.1] tracking-tighter group-hover:text-accent transition-all duration-500">
                    <Link to={`/artigo/${item.id}`}>{item.title}</Link>
                  </h3>

                  <div className="aspect-[16/9] md:aspect-[21/9] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-xl md:shadow-2xl bg-lightGray relative gpu-accelerated">
                    <img 
                      src={item.imageUrl} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                      alt={item.title} 
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="max-w-3xl lg:ml-10">
                    <p className="text-secondary text-lg md:text-2xl font-light leading-relaxed opacity-90 mb-8 md:mb-12">
                      {item.excerpt}
                    </p>

                    <div className="bg-lightGray/50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 lg:p-14 border border-gray-200 shadow-sm">
                      <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 md:mb-10 flex items-center gap-3">
                        <span className="w-6 md:w-8 h-[2px] bg-accent"></span>
                        Síntese Tática
                      </h4>
                      <ul className="space-y-4 md:space-y-6">
                        {item.keyPoints?.map((point, i) => (
                          <li key={i} className="flex gap-4 md:gap-6 items-start group/point">
                            <span className="text-accent font-black text-base md:text-xl leading-none mt-0.5 md:mt-1">→</span>
                            <p className="text-primary text-sm md:text-lg lg:text-xl font-medium leading-snug tracking-tight opacity-80 group-hover/point:opacity-100 transition-opacity">
                              {point}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <section className="bg-primary py-24 md:py-48 rounded-t-[4rem] md:rounded-t-[8rem] lg:rounded-t-[12rem] overflow-hidden relative">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10 text-center">
          <h2 className="font-serif text-3xl sm:text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-8 md:mb-12">
            Domine a <br className="hidden sm:block" /> <span className="text-accent">Disrupção</span>
          </h2>
          <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl p-6 md:p-14 lg:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-white/20 shadow-2xl">
            <NewsletterForm variant="card" />
          </div>
        </div>
      </section>
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={window.location.href} title={edition.title} />
    </div>
  );
};

export default NewsletterDetail;
