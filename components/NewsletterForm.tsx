
import React, { useState } from 'react';
import { saveNewsletterSubscription } from '../lib/supabaseClient';
import { NewsletterSubscription } from '../types';

interface NewsletterFormProps {
  variant?: 'full' | 'card' | 'slim';
  theme?: 'light' | 'dark';
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ variant = 'full', theme = 'dark' }) => {
  const [formData, setFormData] = useState<NewsletterSubscription>({ 
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
        setFormData({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', company: '' });
      } else {
        throw new Error('Falha na sincronização');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Falha na Transmissão: Verifique sua conexão e tente novamente.');
    }
  };

  const isDark = theme === 'dark';

  const inputBaseClasses = variant === 'slim' 
    ? "w-full border rounded-lg px-4 py-2.5 transition-all text-[13px]"
    : "w-full border rounded-xl px-4 py-3 md:px-6 md:py-4 transition-all font-medium text-sm";

  const themeClasses = isDark
    ? "bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/40 focus:ring-accent/50 focus:border-accent/50"
    : "bg-lightGray border-gray-200 text-primary placeholder:text-gray-400 focus:ring-accent/20 focus:border-accent";

  const inputClasses = `${inputBaseClasses} ${themeClasses} focus:outline-none focus:ring-2`;

  if (status === 'success') {
    return (
      <div className={`${variant === 'slim' ? 'py-4' : 'p-6 md:p-10'} text-center animate-in zoom-in duration-500 bg-white/5 rounded-3xl border border-accent/20 w-full max-w-2xl mx-auto`}>
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className={`${isDark ? 'text-white' : 'text-primary'} text-base font-black uppercase tracking-tighter mb-1`}>Acesso Liberado</h3>
        <p className={`${isDark ? 'text-white/50' : 'text-secondary/60'} text-[11px] italic leading-relaxed max-w-xs mx-auto`}>{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${variant === 'slim' ? 'space-y-3' : 'space-y-4'} w-full max-w-4xl`}>
      {variant === 'slim' ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input 
              required
              type="text" 
              placeholder="Nome Completo"
              className={inputClasses}
              value={`${formData.firstName} ${formData.lastName}`.trim()}
              onChange={(e) => {
                const parts = e.target.value.split(' ');
                setFormData({...formData, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || ''});
              }}
            />
            <input 
              required
              type="email" 
              placeholder="E-mail Corporativo"
              className={inputClasses}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input 
              required
              type="tel" 
              placeholder="WhatsApp"
              className={inputClasses}
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <input 
              required
              type="text" 
              placeholder="Cargo"
              className={inputClasses}
              value={formData.jobTitle}
              onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
            />
            <input 
              required
              type="text" 
              placeholder="Empresa"
              className={inputClasses}
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="bg-accent text-white font-black uppercase tracking-[0.2em] py-4 rounded-lg text-[10px] md:text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/10 disabled:opacity-50 sm:col-span-2 lg:col-span-1"
            >
              {status === 'loading' ? 'Assinando...' : 'Assinar Agora'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <input required type="text" placeholder="Nome" className={inputClasses} value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            <input required type="text" placeholder="Sobrenome" className={inputClasses} value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <input required type="email" placeholder="E-mail Corporativo" className={inputClasses} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input required type="tel" placeholder="Telefone / WhatsApp" className={inputClasses} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <input required type="text" placeholder="Cargo" className={inputClasses} value={formData.jobTitle} onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} />
            <input required type="text" placeholder="Empresa" className={inputClasses} value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
          </div>
          <button 
            type="submit" 
            disabled={status === 'loading'} 
            className="w-full bg-accent text-white font-black uppercase tracking-[0.25em] md:tracking-[0.3em] py-4 md:py-5 rounded-xl text-[10px] md:text-[11px] hover:scale-[1.01] active:scale-95 transition-all focus:ring-4 focus:ring-accent/20 shadow-xl shadow-accent/10 disabled:opacity-50 mt-2"
          >
            {status === 'loading' ? 'Sincronizando...' : 'Solicitar Acesso Premium'}
          </button>
        </div>
      )}
      
      {status === 'error' && (
        <div className={`mt-2 p-3 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${isDark ? 'bg-accent/10 border-accent/20' : 'bg-accent/5 border-accent/10'}`}>
          <p className="text-accent text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] text-center leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </form>
  );
};

export default NewsletterForm;
