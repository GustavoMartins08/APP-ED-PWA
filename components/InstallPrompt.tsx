import React, { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Check if app is already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) return;

        // Handle Android/Desktop Installation
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Delay prompt slightly to not annoy user immediately
            setTimeout(() => setIsVisible(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS, just show it based on simple logic (not installed & iOS)
        if (isIosDevice && !isStandalone) {
            setTimeout(() => setIsVisible(true), 3000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:w-96 animate-slide-up">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-5 relative overflow-hidden">

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 pr-6">
                    <div className="bg-primary/5 p-3 rounded-xl shrink-0">
                        <Download className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-gray-900 leading-tight mb-1">
                            Instalar App
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed mb-3">
                            Tenha acesso mais rápido e navegação offline instalando o Empresário Digital na sua tela inicial.
                        </p>

                        {isIOS ? (
                            <div className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-600">
                                <p className="flex items-center gap-2 mb-1 font-semibold">
                                    <span>1. Toque em Compartilhar</span>
                                    <Share className="w-3 h-3" />
                                </p>
                                <p>2. Selecione <span className="font-bold">"Adicionar à Tela de Início"</span></p>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstallClick}
                                className="bg-accent text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-lg shadow-accent/20 w-full"
                            >
                                Instalar Agora
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
