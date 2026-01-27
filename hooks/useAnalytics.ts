
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const useAnalytics = () => {
    const location = useLocation();
    const sessionId = useRef<string>('');

    useEffect(() => {
        // Initialize or retrieve session ID
        let currentSession = sessionStorage.getItem('analytics_session_id');
        if (!currentSession) {
            currentSession = uuidv4();
            sessionStorage.setItem('analytics_session_id', currentSession);
        }
        sessionId.current = currentSession;
    }, []);

    useEffect(() => {
        const trackPageView = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                // Determine device type (simple check)
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                const deviceType = isMobile ? 'mobile' : 'desktop';

                await supabase.from('analytics_page_views').insert({
                    user_id: user?.id || null,
                    session_id: sessionId.current || sessionStorage.getItem('analytics_session_id'),
                    path: location.pathname + location.search,
                    referrer: document.referrer || null,
                    device_type: deviceType
                });

                // Increment view count if viewing a news item
                // Path format expected: /noticia/:id or similar
                // We assume the ID is the last segment if it looks like a UUID
                // But for generic increment, we might need more specific logic or leave it to the specific page component.
                // However, the spec says "Increment ... each time a news is loaded".
                // Ideally this is done by the NewsDetail component fetch, but doing it here centrally
                // requires parsing the URL. Let's stick to page_views for now. 
                // The implementation plan says "Update Tables (news_items) ... increment via RPC".
                // I will leave the specific news increment to the page fetching logic OR do it here if I can parse the ID.

            } catch (error) {
                console.error('Error tracking page view:', error);
            }
        };

        if (sessionId.current || sessionStorage.getItem('analytics_session_id')) {
            trackPageView();
        } else {
            // Retry once if session ID wasn't ready (race condition safe-ish)
            setTimeout(trackPageView, 500);
        }

    }, [location]);

    const trackEvent = async (eventName: string, eventLabel?: string, metadata?: object) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('analytics_events').insert({
                user_id: user?.id || null,
                event_name: eventName,
                event_label: eventLabel,
                metadata: metadata
            });
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    };

    return { trackEvent };
};
