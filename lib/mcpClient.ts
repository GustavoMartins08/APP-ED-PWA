
import { NewsItem, Editorial, Video, Columnist } from '../types';

// Mock data generator for simulating n8n MCP output
export const fetchLatestNews = async (category?: string): Promise<NewsItem[]> => {
  const news: NewsItem[] = [
    {
      id: '1',
      title: 'O impacto da IA generativa na liderança estratégica de 2024',
      excerpt: 'Descubra como os novos modelos de linguagem estão moldando a tomada de decisão em empresas Fortune 500.',
      category: 'Tecnologia',
      source: 'LinkedIn',
      timestamp: 'Atualizado há 2 horas',
      imageUrl: 'https://picsum.photos/seed/tech1/800/450',
      keyPoints: [
        'Redução de 30% no tempo de análise de dados primários.',
        'Surgimento do cargo de Chief AI Orchestrator.',
        'Risco de viés cognitivo em decisões automatizadas sem supervisão.'
      ]
    },
    {
      id: '2',
      title: 'Por que o Venture Capital está voltando os olhos para a sustentabilidade',
      excerpt: 'Investimentos em ESG batem recorde no primeiro trimestre, sinalizando mudança de paradigma no mercado.',
      category: 'Negócios',
      source: 'Web',
      timestamp: 'Atualizado há 5 horas',
      imageUrl: 'https://picsum.photos/seed/biz1/800/450',
      keyPoints: [
        'Aporte de $12B em tecnologias de captura de carbono no Q1.',
        'Novas regulamentações da UE forçam transparência total na cadeia.',
        'Valuation de empresas "carbon-neutral" 15% acima da média do setor.'
      ]
    },
    {
      id: '3',
      title: 'As 5 startups que prometem revolucionar o setor de logística no Brasil',
      excerpt: 'Inovação em last-mile e drones de entrega são os pilares das rodadas de investimento recentes.',
      category: 'Startups',
      source: 'Reddit',
      timestamp: 'Atualizado há 8 horas',
      imageUrl: 'https://picsum.photos/seed/startup1/800/450',
      keyPoints: [
        'Expansão de centros de distribuição hiper-locais.',
        'Uso de algoritmos de roteirização dinâmica em tempo real.',
        'Integração nativa com meios de pagamento instantâneos (Pix).'
      ]
    },
    {
      id: '4',
      title: 'Reskilling: A necessidade de novos talentos na era da automação',
      excerpt: 'Especialistas discutem como preparar a força de trabalho para colaborar com sistemas autônomos.',
      category: 'Carreira',
      source: 'YouTube',
      timestamp: 'Atualizado há 12 horas',
      imageUrl: 'https://picsum.photos/seed/career1/800/450',
      keyPoints: [
        'Déficit de 1 milhão de profissionais qualificados em IA no país.',
        'Importância crescente das soft-skills (empatia e negociação).',
        'Modelos de educação continuada dentro do ambiente corporativo.'
      ]
    }
  ];
  
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
  return [
    { 
      id: '1', 
      monthYear: 'Janeiro 2024', 
      theme: 'Liderança Consciente', 
      imageUrl: 'https://picsum.photos/seed/ed1/400/600',
      summary: 'Uma análise profunda sobre como a inteligência emocional e a ética tornaram-se os novos pilares da produtividade na era das máquinas autônomas, redefinindo o papel do gestor moderno.'
    },
    { 
      id: '2', 
      monthYear: 'Fevereiro 2024', 
      theme: 'Fronteiras da IA', 
      imageUrl: 'https://picsum.photos/seed/ed2/400/600',
      summary: 'Mergulhe nos bastidores dos novos modelos de linguagem multimodal e entenda como a integração entre texto, visão e áudio está criando assistentes corporativos sem precedentes.'
    },
    { 
      id: '3', 
      monthYear: 'Março 2024', 
      theme: 'Capitalismo de Stakeholders', 
      imageUrl: 'https://picsum.photos/seed/ed3/400/600',
      summary: 'O dossiê definitivo sobre a nova métrica de sucesso: como o lucro agora caminha lado a lado com o impacto social e as rigorosas normas de governança global (ESG).'
    }
  ];
};

export const fetchVideos = async (): Promise<Video[]> => {
  return [
    { id: '1', title: 'Entrevista: O futuro da Fintech com Gabriel Rocha', duration: '15:20', platform: 'YouTube', imageUrl: 'https://picsum.photos/seed/v1/400/225', category: 'Entrevistas' },
    { id: '2', title: 'Como escalar uma startup em 2024', duration: '08:45', platform: 'YouTube', imageUrl: 'https://picsum.photos/seed/v2/400/225', category: 'Análises' },
    { id: '3', title: 'Trends Report: O que esperar do Q3', duration: '12:10', platform: 'YouTube', imageUrl: 'https://picsum.photos/seed/v3/400/225', category: 'Clipes curtos' }
  ];
};

export const fetchColumns = async (): Promise<Columnist[]> => {
  return [
    { id: '1', name: 'Ana Silva', role: 'CEO', company: 'Nexus Tech', avatarUrl: 'https://i.pravatar.cc/150?u=ana', bio: 'Especialista em transformation digital e cultura ágil.' },
    { id: '2', name: 'Marco Aurélio', role: 'Investor', company: 'Vision VC', avatarUrl: 'https://i.pravatar.cc/150?u=marco', bio: 'Focado em SaaS e infraestrutura crítica para startups.' }
  ];
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
