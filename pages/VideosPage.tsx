
import React, { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { fetchVideos } from '../lib/mcpClient';
import { Video } from '../types';
import ShareModal from '../components/ShareModal';

const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedVideos, setSavedVideos] = useState<string[]>([]);
  const [shareData, setShareData] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  useEffect(() => {
    fetchVideos().then(data => {
      setVideos(data);
      setLoading(false);
    });
    const saved = JSON.parse(localStorage.getItem('saved_videos') || '[]');
    setSavedVideos(saved);
  }, []);

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = savedVideos.includes(id)
      ? savedVideos.filter(sid => sid !== id)
      : [...savedVideos, id];

    setSavedVideos(newSaved);
    localStorage.setItem('saved_videos', JSON.stringify(newSaved));
  };

  const openShare = (e: React.MouseEvent, video: Video) => {
    e.preventDefault();
    e.stopPropagation();
    setShareData({
      isOpen: true,
      url: window.location.href,
      title: video.title
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center font-serif text-xl animate-pulse text-accent uppercase tracking-[0.5em]">
        Sincronizando Terminal...
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-8 md:px-16 lg:px-32 xl:px-48 py-24 md:py-48">
      <SectionHeader
        title="Briefings Visuais"
        subtitle="Conteúdo multimídia de alta densidade sintetizado para o consumo rápido e eficiente."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mt-16 md:mt-24">
        {videos.length > 0 ? (
          videos.map(video => {
            const isSaved = savedVideos.includes(video.id);
            return (
              <div key={video.id} className="group relative bg-black rounded-[3rem] md:rounded-[4rem] overflow-hidden aspect-video shadow-2xl border border-gray-900 cursor-pointer">
                <img
                  src={video.imageUrl}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 grayscale group-hover:grayscale-0"
                  alt={video.title}
                  loading="lazy"
                  decoding="async"
                />

                <div className="absolute inset-0 p-6 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between">
                  <div className="flex justify-between items-start shrink-0">
                    <span className="bg-accent text-white text-[10px] md:text-[11px] font-black px-6 py-2.5 rounded-full uppercase tracking-widest shadow-xl">
                      {video.category}
                    </span>
                    <span className="text-white/50 text-[10px] md:text-[11px] font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg">
                      {video.duration}
                    </span>
                  </div>
                  <div className="space-y-4 md:space-y-6 flex flex-col">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-black text-white uppercase leading-tight tracking-tighter max-w-lg drop-shadow-2xl line-clamp-3">
                      {video.title}
                    </h3>

                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={(e) => toggleSave(e, video.id)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-accent text-white shadow-lg' : 'bg-white/10 text-white hover:bg-accent'}`}
                      >
                        <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        {isSaved ? 'Salvo' : 'Salvar'}
                      </button>
                      <button
                        onClick={(e) => openShare(e, video)}
                        className="flex items-center gap-2.5 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-white hover:bg-accent transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        Compartilhar
                      </button>
                    </div>

                    <button className="flex items-center gap-4 md:gap-6 text-white text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] group-hover:text-accent transition-colors shrink-0">
                      <span className="w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-2xl shrink-0">
                        <svg className="w-5 h-5 md:w-6 md:h-6 fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                      <span className="whitespace-nowrap">Assistir Agora</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-300">Terminal Sincronizado: Nenhum vídeo disponível.</p>
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

export default VideosPage;
