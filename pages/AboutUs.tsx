
import React from 'react';
import SectionHeader from '../components/SectionHeader';
import { useNavigate } from 'react-router-dom';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero Section */}
      <section className="pt-24 md:pt-48 pb-20 md:pb-40 container mx-auto px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl">
          <span className="text-accent text-[11px] md:text-[14px] font-black uppercase tracking-[0.8em] mb-10 block animate-fade-in">Manifesto Editorial</span>
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-primary uppercase leading-[0.85] tracking-tighter mb-12 md:mb-20 animate-fade-in will-change-composite">
            Sintetizar o <span className="text-accent italic">Ruído</span>, <br />
            Potencializar a <span className="border-b-4 md:border-b-8 border-accent">Visão</span>.
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start animate-fade-in opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <p className="text-secondary text-xl md:text-3xl font-light leading-relaxed italic opacity-85">
              O Empresário Digital nasceu da urgência. Em um mundo saturado de informação superficial, a liderança decisora precisava de um terminal de inteligência que filtrasse o essencial do irrelevante.
            </p>
            <p className="text-primary text-base md:text-xl font-medium leading-relaxed md:pt-2">
              Não somos apenas uma revista. Somos um ecossistema de curadoria estratégica que combina automação de ponta com sensibilidade analítica humana. Nossa missão é entregar a síntese tática necessária para que C-levels e fundadores naveguem na economia exponencial com clareza absoluta.
            </p>
          </div>
        </div>
      </section>

      {/* Values / Pillars */}
      <section className="bg-primary py-24 md:py-48 rounded-[4rem] md:rounded-[10rem] mx-4 md:mx-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
            <div className="space-y-6">
              <span className="text-accent font-serif text-6xl md:text-8xl font-black italic block">01</span>
              <h3 className="text-white font-serif text-3xl md:text-4xl font-black uppercase tracking-tighter">Alta Densidade</h3>
              <p className="text-white/50 text-base md:text-lg font-light leading-relaxed italic">
                Cada frase é processada para carregar o máximo de valor estratégico. Eliminamos o ruído, preservamos o sinal.
              </p>
            </div>
            <div className="space-y-6">
              <span className="text-accent font-serif text-6xl md:text-8xl font-black italic block">02</span>
              <h3 className="text-white font-serif text-3xl md:text-4xl font-black uppercase tracking-tighter">Independência</h3>
              <p className="text-white/50 text-base md:text-lg font-light leading-relaxed italic">
                Nossa linha editorial é guiada por dados e fatos, sem amarras corporativas ou vieses de mercado tradicionais.
              </p>
            </div>
            <div className="space-y-6">
              <span className="text-accent font-serif text-6xl md:text-8xl font-black italic block">03</span>
              <h3 className="text-white font-serif text-3xl md:text-4xl font-black uppercase tracking-tighter">Vanguarda</h3>
              <p className="text-white/50 text-base md:text-lg font-light leading-relaxed italic">
                Investigamos as fronteiras da IA, biotecnologia e novos modelos de capital antes que eles se tornem mainstream.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-32 md:py-56 text-center">
        <h2 className="font-serif text-4xl md:text-7xl font-black text-primary uppercase tracking-tighter mb-12">Pronto para o <span className="text-accent italic">Próximo Nível?</span></h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => navigate('/newsletters')}
            className="w-full sm:w-auto bg-accent text-white px-12 py-6 rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-xl active:scale-95"
          >
            Assinar Inteligência Premium
          </button>
          <button 
            onClick={() => navigate('/contact')}
            className="w-full sm:w-auto border-2 border-primary text-primary px-12 py-6 rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all active:scale-95"
          >
            Falar com a Redação
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
