import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchLatestNews, supabase } from '../lib/supabaseClient';
import { NewsletterEdition, NewsItem } from '../types';
import NewsletterForm from '../components/NewsletterForm';
import ShareModal from '../components/ShareModal';
import PDFReader from '../components/PDFReader';

const EditionDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [edition, setEdition] = useState<NewsletterEdition | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        const loadNewsletter = async () => {
            window.scrollTo(0, 0);

            // 1. Fetch Edition Metadata
            const { data: editionData, error } = await supabase
                .from('editorials')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !editionData) {
                console.error('Error fetching edition:', error);
                setLoading(false);
                return;
            }

            // 2. Fetch Related Items in Order
            const { data: rels, error: relsError } = await supabase
                .from('editorial_items')
                .select(`
                    order,
                    news_items (
                        *
                    )
                `)
                .eq('editorial_id', id)
                .order('order');

            if (relsError) {
                console.error('Error fetching items:', relsError);
            }

            // 3. Map to Frontend Types
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items: NewsItem[] = (rels || []).map((r: any) => ({
                id: r.news_items.id,
                title: r.news_items.title,
                excerpt: r.news_items.excerpt,
                category: r.news_items.category,
                source: r.news_items.source as any,
                timestamp: r.news_items.published_at,
                imageUrl: r.news_items.image_url,
                content: r.news_items.content,
                keyPoints: r.news_items.key_points
            }));

            const fullEdition: NewsletterEdition = {
                id: editionData.id,
                title: editionData.theme,
                date: editionData.month_year,
                coverImage: editionData.image_url,
                synthesis: editionData.summary,
                pdfUrl: editionData.pdf_url,
                published: true, // Editorials are naturally assumed published if viewable here
                items: items
            };

            setEdition(fullEdition);

            const saved = JSON.parse(localStorage.getItem('saved_newsletters') || '[]');
            setIsSaved(saved.includes(id || 'current'));

            setLoading(false);
        };
        if (id) {
            loadNewsletter();
        }
    }, [id]);

    const toggleSave = () => {
        const nid = id || 'current';
        const saved = JSON.parse(localStorage.getItem('saved_newsletters') || '[]');
        let newSaved;
        if (isSaved) {
            newSaved = saved.filter((sid: string) => sid !== nid);
        } else {
            newSaved = [...saved, nid];
        }
        localStorage.setItem('saved_newsletters', JSON.stringify(newSaved));
        setIsSaved(!isSaved);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white" role="status">
                <div className="text-center font-serif text-xl md:text-2xl animate-pulse text-accent tracking-tighter uppercase">
                    Carregando Edição...
                </div>
            </div>
        );
    }

    if (!edition) return <div className="p-20 text-center">Edição não encontrada.</div>;

    return (
        <div className="bg-white min-h-screen selection:bg-accent selection:text-white">
            <header className="relative h-[65vh] md:h-[75vh] lg:h-[80vh] overflow-hidden flex items-end">
                <img
                    src={edition.coverImage}
                    className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.3]"
                    alt="Capa"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                <div className="container mx-auto px-6 md:px-12 lg:px-24 pb-12 md:pb-24 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 md:mb-16">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/90 hover:text-accent transition-colors group"
                        >
                            <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            Voltar às Edições
                        </button>
                        <div className="flex gap-4">
                            <button
                                onClick={toggleSave}
                                className={`px-6 md:px-8 py-3 rounded-full border border-white/20 backdrop-blur-md text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${isSaved ? 'bg-accent text-white border-accent' : 'bg-white/5 text-white hover:bg-white/10'}`}
                            >
                                <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                {isSaved ? 'Salva' : 'Salvar Edição'}
                            </button>
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="px-6 md:px-8 py-3 rounded-full bg-white/5 border border-white/20 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 flex items-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                Compartilhar
                            </button>
                        </div>
                    </div>

                    <div className="max-w-5xl space-y-6 md:space-y-8">
                        <span className="inline-block bg-accent text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] px-6 py-2.5 md:px-8 md:py-3 rounded-full shadow-2xl">
                            Edição Exclusiva {/* CHANGED LABEL */}
                        </span>
                        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white uppercase leading-[0.95] md:leading-[1] tracking-tighter">
                            {edition.title}
                        </h1>
                        <div className="flex items-center gap-6 md:gap-8 text-[9px] md:text-[11px] font-black text-white/90 uppercase tracking-[0.4em]">
                            <span>{edition.date}</span>
                            <span className="w-1.5 h-1.5 bg-accent rounded-full hidden sm:block"></span>
                            <span className="hidden sm:block">Fronteiras Digitais</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* PDF Viewer Section - ALWAYS VISIBLE if URL exists */}
            {edition.pdfUrl && (
                <section className="bg-white relative z-20 -mt-12 md:-mt-20 mx-4 md:mx-12 lg:mx-24 mb-16 md:mb-32">
                    <div className="container mx-auto">
                        <div className="bg-white rounded-[2rem] p-4 md:p-8 shadow-2xl border-2 border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-3">
                                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                                    Documento Original
                                </h2>
                                <a href={edition.pdfUrl} download target="_blank" rel="noreferrer" className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors">
                                    Download PDF
                                </a>
                            </div>
                            <div className="w-full flex justify-center">
                                <PDFReader url={edition.pdfUrl} />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="py-16 md:py-32 bg-lightGray/30 border-b border-gray-100">
                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    <div className="max-w-4xl">
                        <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.6em] text-accent mb-8 md:mb-10">Abstract da Edição</h2>
                        <p className="font-serif text-xl md:text-3xl lg:text-4xl font-black text-primary leading-tight tracking-tight border-l-4 md:border-l-8 border-accent pl-6 md:pl-10">
                            "{edition.synthesis}"
                        </p>
                    </div>
                </div>
            </section>

            <main className="py-20 md:py-32 lg:py-48">
                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    <div className="max-w-4xl mx-auto space-y-24 md:space-y-32 lg:space-y-40">
                        {/* Explicit Heading for Columnist Content */}
                        <div className="text-center pb-12">
                            <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.5em] text-secondary/60">Conteúdos da Edição</h2>
                        </div>

                        {edition.items.map((item, index) => (
                            <section key={item.id} className="group relative">
                                <div className="absolute -left-4 md:-left-24 lg:-left-32 -top-12 md:-top-20 text-[80px] md:text-[150px] lg:text-[180px] font-serif font-black text-gray-100 -z-10 select-none leading-none pointer-events-none opacity-40 group-hover:text-accent/5 transition-colors duration-700">
                                    {String(index + 1).padStart(2, '0')}
                                </div>

                                <div className="space-y-8 md:space-y-12">
                                    <div className="flex items-center justify-between border-b border-gray-50 pb-6 md:pb-8">
                                        <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] text-accent">
                                            Análise Estratégica {index + 1}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-primary uppercase leading-[1.1] tracking-tighter group-hover:text-accent transition-all duration-500">
                                        <Link to={`/artigo/${item.id}`}>{item.title}</Link>
                                    </h3>

                                    <div className="aspect-[16/9] md:aspect-[21/9] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-xl md:shadow-2xl bg-lightGray relative gpu-accelerated">
                                        <img
                                            src={item.imageUrl}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                            alt={item.title}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>

                                    <div className="max-w-3xl lg:ml-10">
                                        <p className="text-secondary text-lg md:text-2xl font-light leading-relaxed opacity-90 mb-8 md:mb-12">
                                            {item.excerpt}
                                        </p>

                                        <div className="bg-lightGray/50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 lg:p-14 border border-gray-200 shadow-sm">
                                            <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 md:mb-10 flex items-center gap-3">
                                                <span className="w-6 md:w-8 h-[2px] bg-accent"></span>
                                                Síntese Tática
                                            </h4>
                                            <ul className="space-y-4 md:space-y-6">
                                                {item.keyPoints?.map((point, i) => (
                                                    <li key={i} className="flex gap-4 md:gap-6 items-start group/point">
                                                        <span className="text-accent font-black text-base md:text-xl leading-none mt-0.5 md:mt-1">→</span>
                                                        <p className="text-primary text-sm md:text-lg lg:text-xl font-medium leading-snug tracking-tight opacity-80 group-hover/point:opacity-100 transition-opacity">
                                                            {point}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </main>

            <section className="bg-primary py-24 md:py-48 rounded-t-[4rem] md:rounded-t-[8rem] lg:rounded-t-[12rem] overflow-hidden relative">
                <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10 text-center">
                    <h2 className="font-serif text-3xl sm:text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-8 md:mb-12">
                        Domine a <br className="hidden sm:block" /> <span className="text-accent">Disrupção</span>
                    </h2>
                    <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl p-6 md:p-14 lg:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-white/20 shadow-2xl">
                        <NewsletterForm variant="card" />
                    </div>
                </div>
            </section>
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={window.location.href} title={edition.title} />
        </div>
    );
};

export default EditionDetail;
