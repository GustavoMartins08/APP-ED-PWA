
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import { fetchEditorials } from '../lib/mcpClient';
import { Editorial } from '../types';
import ShareModal from '../components/ShareModal';

const Editions: React.FC = () => {
  const [editorials, setEditorials] = useState<Editorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedEditions, setSavedEditions] = useState<string[]>([]);
  const [shareData, setShareData] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEditorials().then(data => {
      setEditorials(data);
      setLoading(false);
    });
    const saved = JSON.parse(localStorage.getItem('saved_newsletters') || '[]');
    setSavedEditions(saved);
  }, []);

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = savedEditions.includes(id)
      ? savedEditions.filter(sid => sid !== id)
      : [...savedEditions, id];

    setSavedEditions(newSaved);
    localStorage.setItem('saved_newsletters', JSON.stringify(newSaved));
  };

  const openShare = (e: React.MouseEvent, ed: Editorial) => {
    e.preventDefault();
    e.stopPropagation();
    setShareData({
      isOpen: true,
      url: `${window.location.origin}${window.location.pathname}#/newsletter/${ed.id}`,
      title: ed.theme
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center font-serif text-xl animate-pulse text-accent uppercase tracking-[0.5em]">
        Acessando Arquivos...
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-8 md:px-16 lg:px-32 xl:px-48 py-24 md:py-48">
      <SectionHeader
        title="Edições Editoriais"
        subtitle="Análises verticais profundas sobre os pilares que sustentam a economia digital global."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20 mt-16 md:mt-24">
        {editorials.length > 0 ? (
          editorials.map(ed => {
            const isSaved = savedEditions.includes(ed.id);
            return (
              <div
                key={ed.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/newsletter/${ed.id}`)}
              >
                <div className="relative aspect-[3/4] mb-8 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:shadow-accent/20 group-hover:-translate-y-4">
                  <img
                    src={ed.imageUrl}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                    alt={ed.theme}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                  <div className="absolute inset-0 flex flex-col justify-end p-10 translate-y-4 group-hover:translate-y-0 transition-transform">
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em] mb-3">{ed.monthYear}</span>
                    <h3 className="text-3xl font-serif font-black text-white uppercase leading-[1.1] tracking-tighter mb-6">{ed.theme}</h3>

                    <div className="flex flex-wrap gap-3 mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                      <button
                        onClick={(e) => toggleSave(e, ed.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-accent text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        <svg className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        {isSaved ? 'Salvo' : 'Salvar'}
                      </button>
                      <button
                        onClick={(e) => openShare(e, ed)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-[9px] font-black uppercase tracking-widest"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        Compartilhar
                      </button>
                    </div>

                    {ed.summary && (
                      <p className="text-white/70 text-[12px] md:text-[14px] font-light italic mb-8 line-clamp-3 leading-relaxed max-w-[280px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {ed.summary}
                      </p>
                    )}

                    <button className="bg-white text-primary w-fit px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-2xl">
                      Desbloquear Edição
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-300">Nenhuma edição encontrada no acervo.</p>
          </div>
        )}
      </div>
      <ShareModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData({ ...shareData, isOpen: false })}
        url={shareData.url}
        title={shareData.title}
      />
    </div>
  );
};

export default Editions;
