import { useRegisterSW } from 'virtual:pwa-register/react';
import React from 'react';

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <div className="ContainerToast">
            {(offlineReady || needRefresh) && (
                <div className="fixed bottom-5 right-5 z-50 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 flex flex-col gap-3 max-w-sm animate-fade-in">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                            {offlineReady ? 'App pronto para uso offline' : 'Nova versão disponível'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {offlineReady
                                ? 'Você pode usar este aplicativo mesmo sem internet.'
                                : 'Clique no botão abaixo para atualizar.'}
                        </p>
                    </div>

                    <div className="flex gap-2 mt-1">
                        {needRefresh && (
                            <button
                                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition-colors"
                                onClick={() => updateServiceWorker(true)}
                            >
                                Atualizar agora
                            </button>
                        )}
                        <button
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300 transition-colors"
                            onClick={close}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReloadPrompt;
