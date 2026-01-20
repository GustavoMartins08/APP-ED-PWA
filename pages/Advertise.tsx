
import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { AdvertiserInquiry } from '../types';
import { saveAdvertiserInquiry } from '../lib/supabaseClient';

const Advertise: React.FC = () => {
  const [formData, setFormData] = useState<AdvertiserInquiry>({
    firstName: '',
    lastName: '',
    jobTitle: '',
    company: '',
    email: '',
    interestArea: 'Branded Content',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const result = await saveAdvertiserInquiry(formData);
      if (result.success) {
        setStatus('success');
        setFeedback(result.message);
      } else {
        throw new Error();
      }
    } catch (err) {
      setStatus('error');
      setFeedback('Ocorreu um erro na transmissão. Por favor, tente novamente.');
    }
  };

  const inputClasses = "w-full bg-lightGray border-b-2 border-primary/10 px-0 py-3 md:py-4 text-primary font-bold placeholder:text-gray-300 focus:outline-none focus:border-accent transition-all text-sm md:text-base mb-1 md:mb-2";
  const labelClasses = "text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-1";

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-32">
      {/* 1. HERO SECTION */}
      <section className="pt-16 md:pt-48 pb-12 md:pb-32 container mx-auto px-6 md:px-16 lg:px-24">
        <div className="max-w-5xl">
          <span className="text-accent text-[9px] md:text-[12px] font-black uppercase tracking-[0.6em] mb-6 md:mb-8 block">Parcerias Estratégicas</span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-primary uppercase leading-[0.9] md:leading-[0.85] tracking-tighter mb-8 md:mb-12">
            Sua Marca no <br className="hidden md:block" /> <span className="italic text-accent">Epicentro</span> das Decisões.
          </h1>
          <p className="text-secondary text-base md:text-3xl font-light leading-relaxed italic opacity-70 max-w-3xl">
            Conecte-se com a audiência mais qualificada do país: líderes, investidores e tomadores de decisão que projetam o futuro.
          </p>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-primary py-20 md:py-40 -mx-6 px-6 md:-mx-16 md:px-16 lg:-mx-24 lg:px-24 mb-20 md:mb-32 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-accent/10 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-32 relative z-10">
          <div className="space-y-2 md:space-y-4">
            <h4 className="font-serif text-5xl md:text-8xl font-black text-white tracking-tighter">15K+</h4>
            <p className="text-white/40 text-[9px] md:text-[12px] font-black uppercase tracking-[0.5em]">Assinantes C-Level</p>
          </div>
          <div className="space-y-2 md:space-y-4">
            <h4 className="font-serif text-5xl md:text-8xl font-black text-accent tracking-tighter italic">4.2%</h4>
            <p className="text-white/40 text-[9px] md:text-[12px] font-black uppercase tracking-[0.5em]">Taxa de Abertura (CTR)</p>
          </div>
          <div className="space-y-2 md:space-y-4">
            <h4 className="font-serif text-5xl md:text-8xl font-black text-white tracking-tighter">BRL 2B</h4>
            <p className="text-white/40 text-[9px] md:text-[12px] font-black uppercase tracking-[0.5em]">Poder de Compra Agregado</p>
          </div>
        </div>
      </section>

      {/* 3. MAIN FORM SECTION */}
      <section className="container mx-auto px-6 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-16 md:gap-32">
          <div className="lg:w-1/3 space-y-10 md:space-y-12">
            <div>
              <h3 className="font-serif text-2xl md:text-5xl font-black uppercase tracking-tighter mb-4 md:mb-6 leading-tight">Inicie o <br className="hidden md:block" /> Diálogo</h3>
              <p className="text-secondary text-sm md:text-xl font-light italic leading-relaxed opacity-60">
                Preencha as credenciais corporativas ao lado para receber nosso Media Kit 2024 e uma proposta personalizada.
              </p>
            </div>
            
            <div className="space-y-6 md:space-y-8 pt-8 border-t border-gray-100">
              <div>
                <span className="block text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 mb-1 md:mb-2">E-mail Direto</span>
                <p className="text-primary font-bold text-xs md:text-sm">comercial@empresariodigital.com.br</p>
              </div>
              <div>
                <span className="block text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 mb-1 md:mb-2">Unidade Sede</span>
                <p className="text-primary font-bold text-xs md:text-sm">São Paulo • SP, Brasil</p>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            {status === 'success' ? (
              <div className="bg-lightGray p-10 md:p-24 rounded-[2.5rem] md:rounded-[3.5rem] text-center animate-in zoom-in duration-500 border border-accent/20">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 shadow-2xl shadow-accent/20">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="font-serif text-2xl md:text-5xl font-black text-primary uppercase tracking-tighter mb-4 md:mb-6">Mensagem Recebida</h3>
                <p className="text-secondary text-base md:text-lg font-light italic leading-relaxed mb-10 md:mb-12 max-w-md mx-auto">{feedback}</p>
                <button onClick={() => setStatus('idle')} className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-accent border-b-2 border-accent/20 pb-1 md:pb-2 hover:text-primary hover:border-primary transition-all">Enviar outra solicitação</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-lightGray/30 p-6 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-gray-50 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12 mb-6 md:mb-8">
                  <div className="space-y-1">
                    <label className={labelClasses}>Nome</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ex: João" 
                      className={inputClasses} 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClasses}>Sobrenome</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ex: Silva" 
                      className={inputClasses} 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12 mb-6 md:mb-8">
                  <div className="space-y-1">
                    <label className={labelClasses}>Cargo</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ex: CEO, Diretor" 
                      className={inputClasses} 
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClasses}>Empresa</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ex: Nexus Corp" 
                      className={inputClasses} 
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mb-8 md:mb-12">
                  <label className={labelClasses}>E-mail que deseja ser contatado</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="voce@empresa.com.br" 
                    className={inputClasses} 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="mb-8 md:mb-12">
                  <label className={labelClasses}>Área de Interesse</label>
                  <select 
                    className={inputClasses}
                    value={formData.interestArea}
                    onChange={(e) => setFormData({...formData, interestArea: e.target.value})}
                  >
                    <option>Branded Content</option>
                    <option>Display Premium</option>
                    <option>Sponsorship de Newsletter</option>
                    <option>Eventos & Roundtable</option>
                    <option>Outros</option>
                  </select>
                </div>

                <div className="mb-10 md:mb-16">
                  <label className={labelClasses}>Briefing Adicional (Opcional)</label>
                  <textarea 
                    rows={3}
                    placeholder="Conte-nos brevemente..." 
                    className={`${inputClasses} resize-none`}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full bg-primary text-white font-black uppercase tracking-[0.4em] py-5 md:py-8 rounded-xl md:rounded-2xl text-[10px] md:text-[13px] transition-all flex items-center justify-center gap-4 ${
                    status === 'loading' ? 'opacity-50 cursor-wait' : 'hover:bg-accent hover:scale-[1.01] active:scale-95 shadow-2xl shadow-primary/10'
                  }`}
                >
                  {status === 'loading' ? 'Transmitindo...' : 'Solicitar Proposta'}
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>

                {status === 'error' && (
                  <p className="mt-4 md:mt-6 text-accent text-[8px] md:text-[10px] font-black uppercase tracking-widest text-center">{feedback}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Advertise;
