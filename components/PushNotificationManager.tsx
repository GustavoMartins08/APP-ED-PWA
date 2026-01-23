import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

const PushNotificationManager: React.FC = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert('Seu navegador não suporta notificações.');
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            // Here we would ideally get the FCM token and save to user profile
            console.log('Notification permission granted!');

            // Register Service Worker for push if not already
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                console.log('Service Worker ready for push:', registration);
            }
        }
    };

    if (permission === 'granted' || permission === 'denied') return null;

    return (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-serif font-bold text-primary">Ativar Notificações</h4>
                    <p className="text-xs text-gray-500">Receba alertas sobre novas edições e breaking news.</p>
                </div>
            </div>
            <button
                onClick={requestPermission}
                className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-full hover:bg-accent transition-colors"
            >
                Ativar
            </button>
        </div>
    );
};

export default PushNotificationManager;
