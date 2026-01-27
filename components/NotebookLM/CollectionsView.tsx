import React, { useEffect, useState } from 'react';
import { Collection, getCollections, Notebook } from '../../lib/notebooklm';
import { Book, FileText, Bot, Plus, ArrowRight, Loader } from 'lucide-react';

interface CollectionsViewProps {
    onClose: () => void;
}

const CollectionsView: React.FC<CollectionsViewProps> = ({ onClose }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCollection, setActiveCollection] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getCollections();
                setCollections(data);
                if (data.length > 0) setActiveCollection(data[0].id);
            } catch (error) {
                console.error('Failed to load collections', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const currentCollection = collections.find(c => c.id === activeCollection);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 p-8">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm text-gray-500 font-medium">Carregando seus cadernos...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 tracking-tight">NotebookLM</h2>
                        <p className="text-xs text-gray-400 font-medium tracking-wide">ASSISTENTE DE PESQUISA</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                >
                    <span className="sr-only">Fechar</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Collections List */}
                <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col">
                    <div className="p-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Suas Coleções</h3>
                        <div className="space-y-1">
                            {collections.map(collection => (
                                <button
                                    key={collection.id}
                                    onClick={() => setActiveCollection(collection.id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3
                    ${activeCollection === collection.id
                                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-100'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Book className={`w-4 h-4 ${activeCollection === collection.id ? 'fill-indigo-100 text-indigo-600' : 'text-gray-400'}`} />
                                    <span className="truncate">{collection.title}</span>
                                </button>
                            ))}
                        </div>

                        <button className="flex items-center gap-2 w-full mt-4 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-dashed border-indigo-200 hover:border-indigo-300 uppercase tracking-wide justify-center">
                            <Plus className="w-3 h-3" />
                            Nova Coleção
                        </button>
                    </div>
                </div>

                {/* Main Content - Notebooks */}
                <div className="flex-1 flex flex-col bg-white">
                    {currentCollection ? (
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-${currentCollection.theme === 'blue' ? 'blue' : 'emerald'}-100 text-${currentCollection.theme === 'blue' ? 'blue' : 'emerald'}-700`}>
                                        Collection
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">Atualizado recentemente</span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentCollection.title}</h1>
                                <p className="text-gray-500 leading-relaxed max-w-2xl">{currentCollection.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentCollection.notebooks.map(notebook => (
                                    <NotebookCard key={notebook.id} notebook={notebook} />
                                ))}
                                {/* Create New Notebook Card */}
                                <button className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group h-full min-h-[160px]">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-indigo-600">Novo Notebook</span>
                                    <span className="text-xs text-gray-400 mt-1">Deep Research</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Selecione uma coleção
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NotebookCard = ({ notebook }: { notebook: Notebook }) => (
    <div className="group p-5 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-indigo-100 transition-all duration-300 cursor-pointer relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-indigo-400" />
        </div>

        <div className="mb-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1 group-hover:text-indigo-700 transition-colors">{notebook.title}</h3>
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{notebook.summary}</p>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
            <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {notebook.sources.length} fontes
            </span>
            {notebook.audioOverviewUrl && (
                <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex items-center gap-1">
                    Audio Overview
                </span>
            )}
        </div>
    </div>
);

export default CollectionsView;
