import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge'; // Need to create Badge or use span
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Simple Badge component inline for now if not exists
const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
        {active ? 'Premium' : 'Free'}
    </span>
);

const NewsList: React.FC = () => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchNews = async () => {
        setLoading(true);
        let query = supabase
            .from('news_items')
            .select('*, author:columnists(name)')
            .order('published_at', { ascending: false });

        if (searchTerm) {
            query = query.ilike('title', `%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching news:', error);
        else setNews(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchNews();
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta notícia?')) {
            const { error } = await supabase.from('news_items').delete().eq('id', id);
            if (!error) fetchNews();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Notícias e Artigos</h1>
                    <p className="text-gray-500">Gerencie o conteúdo do feed principal.</p>
                </div>
                <Link to="/admin/news/new">
                    <Button><Plus className="h-4 w-4 mr-2" /> Nova Notícia</Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Buscar por título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 px-0"
                />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Capa</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Autor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">Carregando...</TableCell>
                            </TableRow>
                        ) : news.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-400">Nenhuma notícia encontrada.</TableCell>
                            </TableRow>
                        ) : (
                            news.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="h-12 w-16 bg-gray-100 rounded overflow-hidden">
                                            {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium max-w-md truncate">{item.title}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.author?.name || 'Redação'}</TableCell>
                                    <TableCell><StatusBadge active={item.is_premium} /></TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {format(new Date(item.published_at), 'dd/MM/yyyy', { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/admin/news/${item.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default NewsList;
