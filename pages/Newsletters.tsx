
import React, { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Link } from 'react-router-dom';
import NewsletterForm from '../components/NewsletterForm';
import ShareModal from '../components/ShareModal';

interface NewsletterSummary {
  id: string;
  title: string;
  date: string;
  category: string;
  synthesis: string;
  insightCount: number;
}

const Newsletters: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const filters = ['Todos', 'Estratégia', 'Tecnologia', 'Venture Capital', 'Macro'];

  const newsletters: NewsletterSummary[] = [
    {
      id: 'briefing-48',
      title: 'Disrupção e Liderança 4.0',
      date: '12 de Junho, 2024',
      category: 'Estratégia',
      synthesis: 'Como os agentes autônomos e a nova geopolítica dos semicondutores estão redefinindo o valor de mercado.',
      insightCount: 8
    },
    {
      id: 'briefing-47',
      title: 'A Nova Era do Capitalismo Sustentável',
      date: '05 de Junho, 2024',
      category: 'Macro',
      synthesis: 'Aporte recorde em ESG e a transição para economias de baixo carbono no Q3.',
      insightCount: 8
    },
    {
      id: 'briefing-46',
      title: 'O Fim da Criptografia Tradicional',
      date: '28 de Maio, 2024',
      category: 'Tecnologia',
      synthesis: 'Análise do marco da computação quântica e as implicações para a segurança cibernética global.',
      insightCount: 8
    },
    {
      id: 'briefing-45',
      title: 'Startups e a Liquidez de 2024',
      date: '21 de Maio, 2024',
      category: 'Venture Capital',
      synthesis: 'O retorno dos IPOs e as rodadas de investimento em logística e last-mile no Brasil.',
      insightCount: 8
    },
    {
      id: 'briefing-44',
      title: 'Reskilling em Larga Escala',
      date: '14 de Maio, 2024',
      category: 'Estratégia',
      synthesis: 'Preparando a força de trabalho para a colaboração homem-máquina em ambientes industriais.',
      insightCount: 8
    }
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const filteredNewsletters = activeFilter === 'Todos' 
    ? newsletters 
    : newsletters.filter(n => n.category === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" role="status">
        <div className="text-center font-serif text-xl md:text-2xl animate-pulse text-accent tracking-tighter uppercase">
          Acessando Arquivo de Inteligência...
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-16 md:pt-24">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <SectionHeader 
          title="Arquivo de Newsletters" 
          subtitle="Newsletters estratégicas preservadas para consulta tática. Explore as edições recentes antes de assinar nosso terminal premium."
        />

        <nav className="flex gap-4 overflow-x-auto pb-10 mb-16 scrollbar-hide border-b border-gray-100">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`whitespace-nowrap px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                activeFilter === f 
                ? 'bg-accent text-white shadow-xl shadow-accent/20' 
                : 'bg-lightGray text-secondary hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </nav>

        <div className="space-y-10 md:space-y-16">
          {filteredNewsletters.slice(0, 2).map((nl) => (
            <NewsletterCard key={nl.id} nl={nl} />
          ))}

          <div className="bg-primary rounded-[2.5rem] p-6 sm:p-10 md:p-14 lg:p-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-accent/20 transition-all duration-1000"></div>
            <div className="relative z-10 flex flex-col xl:flex-row gap-8 xl:gap-12 items-center">
              <div className="xl:w-1/3 text-center xl:text-left space-y-4">
                <span className="text-accent text-[10px] font-black uppercase tracking-[0.6em] block">Acesso Prioritário</span>
                <h3 className="text-white font-serif text-2xl md:text-4xl font-black uppercase leading-[1.1] tracking-tighter">
                  Receba a Próxima <br className="hidden xl:block" /> Edição no E-mail
                </h3>
                <p className="text-white/40 text-[11px] leading-relaxed italic max-w-sm mx-auto xl:mx-0">
                  Junte-se a 15k+ líderes. Dados sintetizados, sem ruído, diretamente na sua caixa de entrada.
                </p>
              </div>
              <div className="xl:w-2/3 w-full flex justify-center">
                <NewsletterForm variant="slim" />
              </div>
            </div>
          </div>

          {filteredNewsletters.slice(2).map((nl) => (
            <NewsletterCard key={nl.id} nl={nl} />
          ))}
        </div>
      </div>
    </div>
  );
};

const NewsletterCard: React.FC<{ nl: NewsletterSummary }> = ({ nl }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_newsletters') || '[]');
    setIsSaved(saved.includes(nl.id));
  }, [nl.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('saved_newsletters') || '[]');
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter((sid: string) => sid !== nl.id);
    } else {
      newSaved = [...saved, nl.id];
    }
    localStorage.setItem('saved_newsletters', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  const openShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  const newsletterUrl = `${window.location.origin}${window.location.pathname}#/newsletter/${nl.id}`;

  return (
    <div className="relative group">
      <Link 
        to={`/newsletter/${nl.id}`}
        className="flex flex-col md:flex-row gap-8 md:gap-16 p-8 md:p-14 rounded-[2.5rem] bg-lightGray/30 border border-gray-50 hover:bg-white hover:shadow-2xl hover:border-accent/10 transition-all duration-500"
      >
        <div className="md:w-1/4 shrink-0 flex flex-col justify-between">
          <div>
            <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] block mb-4">{nl.category}</span>
            <p className="text-primary/40 text-[11px] font-black uppercase tracking-widest">{nl.date}</p>
          </div>
          <div className="mt-8 md:mt-0">
            <div className="w-10 h-10 rounded-full border border-accent/20 flex items-center justify-center text-accent font-black text-xs">
              {nl.insightCount}
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Insights</p>
          </div>
        </div>

        <div className="md:w-3/4 flex flex-col justify-center gap-4 relative">
          <div className="absolute top-0 right-0 flex gap-2">
            <button 
              onClick={toggleSave}
              title={isSaved ? "Remover dos salvos" : "Salvar edição"}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isSaved ? 'bg-accent border-accent text-white' : 'border-gray-200 text-gray-400 hover:text-accent hover:border-accent'}`}
            >
              <svg className="w-3 h-3" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </button>
            <button 
              onClick={openShare}
              title="Compartilhar"
              className="w-8 h-8 rounded-full border border-gray-200 text-gray-400 hover:text-accent hover:border-accent flex items-center justify-center transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
          </div>

          <h3 className="font-serif text-2xl md:text-4xl font-black text-primary uppercase leading-[1.2] tracking-tighter group-hover:text-accent transition-colors pr-20">
            {nl.title}
          </h3>
          <p className="text-secondary text-lg font-light leading-relaxed italic opacity-70 line-clamp-2">
            "{nl.synthesis}"
          </p>
          <div className="pt-4">
            <span className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary group-hover:text-accent transition-colors">
              Acessar Inteligência
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>
        </div>
      </Link>
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={newsletterUrl} title={nl.title} />
    </div>
  );
};

export default Newsletters;
