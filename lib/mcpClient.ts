
import { NewsItem, Editorial, Video, Columnist } from '../types';

// Mock data generator for simulating n8n MCP output
export const fetchLatestNews = async (category?: string): Promise<NewsItem[]> => {
  const news: NewsItem[] = [];

  if (category && category !== 'Todas') {
    return news.filter(item => item.category === category);
  }
  return news;
};

export const fetchNewsByIds = async (ids: string[]): Promise<NewsItem[]> => {
  const allNews = await fetchLatestNews();
  return allNews.filter(item => ids.includes(item.id));
};

export const fetchEditorials = async (): Promise<Editorial[]> => {
  return [];
};

export const fetchVideos = async (): Promise<Video[]> => {
  return [];
};

export const fetchColumns = async (): Promise<Columnist[]> => {
  return [];
};

/**
 * Busca Global Consolidada
 * Filtra por Notícias, Edições e Vídeos
 */
export const searchGlobal = async (query: string) => {
  if (!query || query.length < 2) return { news: [], editions: [], videos: [] };

  const [news, editions, videos] = await Promise.all([
    fetchLatestNews(),
    fetchEditorials(),
    fetchVideos()
  ]);

  const q = query.toLowerCase();

  return {
    news: news.filter(n => n.title.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)),
    editions: editions.filter(e => e.theme.toLowerCase().includes(q)),
    videos: videos.filter(v => v.title.toLowerCase().includes(q) || v.category.toLowerCase().includes(q))
  };
};
