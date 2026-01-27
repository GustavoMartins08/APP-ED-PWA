
import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 relative z-10 shadow-2xl animate-slide-up md:animate-fade-scale border border-gray-100 gpu-accelerated overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent/20 overflow-hidden">
          <div className="h-full bg-accent animate-loading-bar w-24 will-change-transform gpu-accelerated"></div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h3 className="font-serif text-2xl font-black uppercase tracking-tighter">Compartilhar</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-primary transition-colors p-2">
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-lightGray hover:bg-[#0077b5] hover:text-white transition-all duration-300 group">
            <svg className="w-6 h-6 text-[#0077b5] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">LinkedIn</span>
          </button>
          <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, '_blank')} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-lightGray hover:bg-[#25D366] hover:text-white transition-all duration-300 group">
            <svg className="w-6 h-6 text-[#25D366] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.52.909 3.197 1.389 4.908 1.39h.005c5.451 0 9.887-4.435 9.889-9.886.001-2.64-1.026-5.123-2.895-6.994s-4.354-2.896-6.994-2.897c-5.454 0-9.89 4.435-9.892 9.887-.001 1.745.459 3.45 1.332 4.956l-1.015 3.704 3.785-.993zm11.274-7.404c-.26-.13-1.536-.758-1.772-.844-.236-.086-.407-.13-.578.13s-.664.844-.812 1.018-.299.196-.559.066c-.26-.13-1.097-.404-2.09-1.289-.771-.688-1.291-1.538-1.442-1.798-.15-.26-.016-.4.114-.53.117-.117.26-.303.39-.455.129-.152.172-.26.259-.433.086-.173.043-.325-.022-.455s-.578-1.39-.792-1.905c-.208-.502-.436-.433-.578-.44-.148-.007-.318-.008-.488-.008s-.448.064-.682.316c-.234.252-.894.874-.894 2.132s.914 2.468 1.041 2.641c.127.173 1.797 2.744 4.354 3.843.608.261 1.083.417 1.454.535.611.194 1.166.167 1.605.101.49-.073 1.536-.628 1.752-1.234.216-.606.216-1.125.151-1.234s-.234-.196-.494-.326z" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
          </button>
          <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank')} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-lightGray hover:bg-black hover:text-white transition-all duration-300 group">
            <svg className="w-6 h-6 text-primary group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Twitter (X)</span>
          </button>
          <button onClick={() => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank')} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-lightGray hover:bg-[#0088cc] hover:text-white transition-all duration-300 group">
            <svg className="w-6 h-6 text-[#0088cc] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0C5.346 0 0 5.346 0 11.944s5.346 11.944 11.944 11.944 11.944-5.346 11.944-11.944S18.542 0 11.944 0zm5.811 8.281l-1.994 9.407c-.15.674-.55.842-1.115.525l-3.037-2.238-1.465 1.409c-.162.162-.298.298-.611.298l.218-3.091 5.626-5.082c.245-.218-.053-.339-.379-.122L7.054 13.98l-3.001-.937c-.652-.204-.666-.652.136-.965l11.728-4.52c.542-.196 1.017.13.838.723z" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Telegram</span>
          </button>
        </div>

        <button
          onClick={handleCopyLink}
          className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 ${isCopied ? 'bg-green-500 text-white shadow-xl shadow-green-200' : 'bg-primary text-white hover:bg-accent'
            }`}
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 animate-[subtlePulse_0.5s_ease-in-out]" strokeWidth={3} />
              Link Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" strokeWidth={2.5} />
              Copiar Link Direto
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
