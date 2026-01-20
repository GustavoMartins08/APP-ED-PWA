
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-32 pb-16">
      <div className="container mx-auto px-8 md:px-16 lg:px-32 xl:px-48">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
          <div className="md:col-span-2 space-y-10">
            <Logo className="mb-4" />
            <p className="text-secondary max-w-sm text-lg leading-relaxed font-light opacity-85">
              "A inteligência estratégica não é sobre ter mais dados, mas sobre ter a síntese correta no momento decisivo."
            </p>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-10">Explorar</h4>
            <ul className="space-y-5 text-xs font-bold uppercase tracking-widest text-secondary">
              <li><Link to="/ultimas-noticias" className="hover:text-accent transition-colors">Notícias</Link></li>
              <li><Link to="/edicoes" className="hover:text-accent transition-colors">Edições</Link></li>
              <li><Link to="/videos" className="hover:text-accent transition-colors">Vídeos</Link></li>
              <li><Link to="/colunas" className="hover:text-accent transition-colors">Colunistas</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-10">Estratégico</h4>
            <ul className="space-y-5 text-xs font-bold uppercase tracking-widest text-secondary">
              <li><Link to="/newsletters" className="hover:text-accent transition-colors">Newsletters</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Anunciar</Link></li>
              <li><Link to="/perfil" className="hover:text-accent transition-colors">Meu Acervo</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-16 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-gray-600 tracking-[0.4em] uppercase gap-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <p>© 2024 EMPRESÁRIO DIGITAL</p>
            <p className="hidden md:block opacity-30">|</p>
            <p>INTELIGÊNCIA SINTETIZADA</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-accent transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-accent transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
