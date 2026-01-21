import { createClient } from '@supabase/supabase-js';
import { NewsletterSubscription, AdvertiserInquiry, NewsItem, Editorial, Video, Columnist } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// --- Form Submissions ---

export const saveNewsletterSubscription = async (data: NewsletterSubscription) => {
    try {
        const dbData = {
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            active: true
        };

        const { error } = await supabase
            .from('newsletter_subscriptions')
            .insert([dbData]);

        if (error) {
            if (error.code === '23505') {
                return { success: true, message: 'Email já cadastrado!' };
            }
            throw error;
        }

        return { success: true, message: 'Inscrição realizada com sucesso!' };
    } catch (error) {
        console.error('Error saving subscription:', error);
        return { success: false, message: 'Erro ao salvar inscrição.' };
    }
};

export const saveAdvertiserInquiry = async (data: AdvertiserInquiry) => {
    try {
        const dbData = {
            first_name: data.firstName,
            last_name: data.lastName,
            job_title: data.jobTitle,
            company: data.company,
            email: data.email,
            interest_area: data.interestArea,
            message: data.message
        };

        const { error } = await supabase
            .from('advertiser_inquiries')
            .insert([dbData]);

        if (error) throw error;

        return { success: true, message: 'Contato enviado com sucesso!' };
    } catch (error) {
        console.error('Error saving inquiry:', error);
        return { success: false, message: 'Erro ao enviar contato.' };
    }
};

// --- Data Fetching ---

export const searchGlobal = async (query: string) => {
    try {
        const searchTerm = `%${query}%`;

        const [news, editions, videos] = await Promise.all([
            supabase
                .from('news_items')
                .select('*')
                .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
                .limit(5),

            supabase
                .from('editorials')
                .select('*')
                .or(`theme.ilike.${searchTerm},summary.ilike.${searchTerm}`)
                .limit(5),

            supabase
                .from('videos')
                .select('*')
                .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
                .limit(5)
        ]);

        // Map results to frontend types
        const mappedNews = (news.data || []).map(mapNewsItem);
        const mappedEditions = (editions.data || []).map(mapEditorial);
        const mappedVideos = (videos.data || []).map(mapVideo);

        return {
            news: mappedNews,
            editions: mappedEditions,
            videos: mappedVideos
        };
    } catch (error) {
        console.error('Search error:', error);
        return { news: [], editions: [], videos: [] };
    }
};

export const fetchLatestNews = async (category?: string): Promise<NewsItem[]> => {
    let query = supabase
        .from('news_items')
        .select(`
      *,
      author:columnists(*)
    `)
        .order('published_at', { ascending: false });

    if (category && category !== 'Todas') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching news:', error);
        return [];
    }

    return (data || []).map(item => ({
        ...mapNewsItem(item),
        author: item.author ? mapColumnist(item.author) : undefined
    }));
};

export const fetchEditorials = async (): Promise<Editorial[]> => {
    const { data, error } = await supabase
        .from('editorials')
        .select('*')
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error fetching editorials:', error);
        return [];
    }

    return (data || []).map(mapEditorial);
};

export const fetchVideos = async (): Promise<Video[]> => {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error fetching videos:', error);
        return [];
    }

    return (data || []).map(mapVideo);
};

export const fetchColumns = async (): Promise<Columnist[]> => {
    const { data, error } = await supabase
        .from('columnists')
        .select('*');

    if (error) {
        console.error('Error fetching columnists:', error);
        return [];
    }

    return (data || []).map(mapColumnist);
};

export const fetchNewsByIds = async (ids: string[]): Promise<NewsItem[]> => {
    const { data, error } = await supabase
        .from('news_items')
        .select(`
      *,
      author:columnists(*)
    `)
        .in('id', ids);

    if (error) {
        console.error('Error fetching news by ids:', error);
        return [];
    }

    return (data || []).map(item => ({
        ...mapNewsItem(item),
        author: item.author ? mapColumnist(item.author) : undefined
    }));
};

// --- Mappers ---

const mapNewsItem = (item: any): NewsItem => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    category: item.category,
    source: item.source,
    timestamp: item.published_at,
    imageUrl: item.image_url,
    content: item.content,
    keyPoints: item.key_points
});

const mapEditorial = (item: any): Editorial => ({
    id: item.id,
    monthYear: item.month_year,
    theme: item.theme,
    imageUrl: item.image_url,
    summary: item.summary
});

const mapVideo = (item: any): Video => ({
    id: item.id,
    title: item.title,
    duration: item.duration,
    platform: item.platform,
    imageUrl: item.image_url,
    category: item.category
});

const mapColumnist = (item: any): Columnist => ({
    id: item.id,
    name: item.name,
    role: item.role,
    company: item.company,
    avatarUrl: item.avatar_url,
    bio: item.bio
});
