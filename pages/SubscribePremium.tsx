
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveNewsletterSubscription } from '../lib/supabaseClient';

const SubscribePremium: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const result = await saveNewsletterSubscription(formData);
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        // Redireciona para a home após 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error('Falha no processamento');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Ocorreu um erro ao processar sua assinatura. Tente novamente.');
    }
  };

  const inputClasses = "w-full bg-transparent border-b-2 border-primary/10 px-0 py-4 text-primary font-bold placeholder:text-gray-200 focus:outline-none focus:border-accent transition-all text-base md:text-lg mb-2";
  const labelClasses = "text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 block mb-1";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        <div className="flex justify-end items-center mb-16 md:mb-24">
          <button
            onClick={() => navigate(-1)}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-accent flex items-center gap-3 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Voltar
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center space-y-8 animate-fade-in py-20">
            <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-accent/30 animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="font-serif text-4xl md:text-7xl font-black text-primary uppercase tracking-tighter leading-none">
              Bem-vindo ao <br /> <span className="text-accent">Próximo Nível</span>
            </h1>
            <p className="text-secondary text-lg md:text-2xl font-light leading-relaxed max-w-2xl mx-auto">
              {message}. Redirecionando você para o terminal em instantes...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 md:gap-24">
            <div className="lg:col-span-2 space-y-10 md:space-y-12">
              <div className="space-y-6">
                <span className="text-accent text-[11px] md:text-[14px] font-black uppercase tracking-[0.6em] block">Inscrição Premium</span>
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black text-primary uppercase leading-[0.9] tracking-tighter">
                  Sua Dose <br /> Diária de <br /> <span className="text-accent">Clareza</span>.
                </h1>
                <p className="text-secondary text-lg md:text-xl font-light leading-relaxed opacity-60">
                  Acesse briefings sintetizados, análises profundas de mercado e o pulso da economia digital antes de todos.
                </p>
              </div>

              <div className="space-y-6 pt-10 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-primary">Dossiês Semanais Exclusivos</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-primary">Terminal de Alerta em Tempo Real</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-primary">Acesso a Comunidade Decisora</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-lightGray/30 p-8 md:p-14 rounded-[3rem] border border-gray-50 shadow-sm backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 mb-8">
                  <div>
                    <label className={labelClasses}>Nome</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Roberto"
                      className={inputClasses}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Sobrenome</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Costa"
                      className={inputClasses}
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className={labelClasses}>E-mail Corporativo</label>
                  <input
                    required
                    type="email"
                    placeholder="roberto@empresa.com.br"
                    className={inputClasses}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="mb-8">
                  <label className={labelClasses}>WhatsApp para Briefings</label>
                  <input
                    required
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className={inputClasses}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 mb-12">
                  <div>
                    <label className={labelClasses}>Cargo</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: CTO"
                      className={inputClasses}
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Empresa</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Startup S.A."
                      className={inputClasses}
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full bg-primary text-white font-black uppercase tracking-[0.4em] py-6 md:py-8 rounded-2xl text-[11px] md:text-[14px] transition-all flex items-center justify-center gap-4 ${status === 'loading' ? 'opacity-50 cursor-wait' : 'hover:bg-accent hover:scale-[1.01] active:scale-95 shadow-2xl shadow-primary/10'
                    }`}
                >
                  {status === 'loading' ? 'Processando...' : 'Obter Acesso Premium'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>

                {status === 'error' && (
                  <p className="mt-6 text-accent text-[10px] font-black uppercase tracking-widest text-center">{message}</p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribePremium;
