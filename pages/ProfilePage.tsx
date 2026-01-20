
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import NewsCard from '../components/NewsCard';
import { fetchNewsByIds } from '../lib/mcpClient';
import { NewsItem, User } from '../types';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [savedArticles, setSavedArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const authUser = localStorage.getItem('auth_user');
    if (!authUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(authUser));
    
    const loadSaved = async () => {
      const savedIds = JSON.parse(localStorage.getItem('saved_articles') || '[]');
      if (savedIds.length > 0) {
        const data = await fetchNewsByIds(savedIds);
        setSavedArticles(data);
      }
      setLoading(false);
    };
    loadSaved();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center font-serif text-xl animate-pulse text-accent uppercase tracking-[0.5em]">
        Abrindo Acervo Pessoal...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Profile Header */}
      <section className="pt-24 md:pt-40 pb-16 md:pb-24 bg-lightGray/30 border-b border-gray-100">
        <div className="container mx-auto px-6 md:px-16 lg:px-24">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-12">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="w-24 h-24 md:w-40 md:h-40 bg-accent rounded-full flex items-center justify-center text-white font-serif font-black text-4xl md:text-7xl shadow-2xl">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="space-y-3">
                <span className="text-accent text-[11px] font-black uppercase tracking-[0.6em] block">Membro Premium</span>
                <h1 className="font-serif text-4xl md:text-7xl font-black text-primary uppercase tracking-tighter leading-none">
                  {user?.name}
                </h1>
                <p className="text-secondary text-base md:text-xl font-light italic opacity-60">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-accent border-b-2 border-gray-100 hover:border-accent transition-all pb-2 mb-2"
            >
              Encerrar Sessão
            </button>
          </div>
        </div>
      </section>

      {/* Saved Content */}
      <section className="py-20 md:py-32 container mx-auto px-6 md:px-16 lg:px-24">
        <SectionHeader 
          title="Meu Acervo" 
          subtitle="Seus artigos salvos para consulta tática e revisão estratégica."
        />

        {savedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 mt-16 md:mt-24">
            {savedArticles.map(item => (
              <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <NewsCard item={item} variant="vertical" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 md:py-40 text-center border-2 border-dashed border-gray-100 rounded-[3rem] mt-16 md:mt-24">
            <p className="text-gray-400 text-sm font-black uppercase tracking-[0.4em] mb-8">Você ainda não salvou relatórios no seu acervo.</p>
            <button 
              onClick={() => navigate('/ultimas-noticias')}
              className="bg-primary text-white px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-all"
            >
              Explorar Notícias
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
