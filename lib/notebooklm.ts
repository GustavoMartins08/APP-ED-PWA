export interface Source {
    id: string;
    title: string;
    type: 'pdf' | 'url' | 'text' | 'youtube';
    date: string;
}

export interface Notebook {
    id: string;
    title: string;
    summary: string;
    sources: Source[];
    audioOverviewUrl?: string; // URL for the generated audio summary
    lastUpdated: string;
}

export interface Collection {
    id: string;
    title: string;
    description: string;
    notebooks: Notebook[];
    theme: 'blue' | 'green' | 'purple' | 'orange';
}

// Mock Data
export const MOCK_COLLECTIONS: Collection[] = [
    {
        id: 'c1',
        title: 'Tendências de Mercado 2024',
        description: 'Análise aprofundada sobre as principais mudanças no varejo e e-commerce.',
        theme: 'blue',
        notebooks: [
            {
                id: 'n1',
                title: 'Impacto da IA no Varejo',
                summary: 'Resumo sobre como a inteligência artificial está moldando a experiência do cliente e a logística.',
                lastUpdated: '2024-03-15',
                sources: [
                    { id: 's1', title: 'Relatório McKinsey 2024', type: 'pdf', date: '2024-03-10' },
                    { id: 's2', title: 'TechCrunch Article', type: 'url', date: '2024-03-12' }
                ]
            },
            {
                id: 'n2',
                title: 'Comportamento do Consumidor',
                summary: 'Mudanças nos hábitos de compra da Geração Z.',
                lastUpdated: '2024-03-14',
                sources: [
                    { id: 's3', title: 'Pesquisa Global GfK', type: 'pdf', date: '2024-02-28' }
                ]
            }
        ]
    },
    {
        id: 'c2',
        title: 'Investigação: Setor Energético',
        description: 'Coleta de dados sobre energias renováveis e políticas públicas.',
        theme: 'green',
        notebooks: [
            {
                id: 'n3',
                title: 'Energia Solar no Brasil',
                summary: 'Levantamento de dados sobre incentivos fiscais e crescimento da malha solar.',
                lastUpdated: '2024-03-10',
                sources: [
                    { id: 's4', title: 'Portal Solar', type: 'url', date: '2024-03-01' },
                    { id: 's5', title: 'Vídeo: Futuro da Energia', type: 'youtube', date: '2024-02-15' }
                ]
            }
        ]
    }
];

export const getCollections = async (): Promise<Collection[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_COLLECTIONS;
};

export const createNotebook = async (title: string, collectionId: string): Promise<Notebook> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        id: `n${Math.random().toString(36).substr(2, 9)}`,
        title,
        summary: 'Novo notebook criado. Adicione fontes para gerar resumos.',
        sources: [],
        lastUpdated: new Date().toISOString().split('T')[0]
    }
}
