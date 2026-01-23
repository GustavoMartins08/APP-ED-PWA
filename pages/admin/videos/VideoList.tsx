import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Video } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const VideoList: React.FC = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchVideos = async () => {
        setLoading(true);
        let query = supabase
            .from('videos')
            .select('*')
            .order('published_at', { ascending: false });

        if (searchTerm) {
            query = query.ilike('title', `%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching videos:', error);
        else setVideos(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchVideos();
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este vídeo?')) {
            const { error } = await supabase.from('videos').delete().eq('id', id);
            if (!error) fetchVideos();
        }
    };

    const StatusBadge = ({ active }: { active: boolean }) => (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${active ? "bg-green-600 text-primary-foreground hover:bg-green-700" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {active ? 'Premium' : 'Youtube (Free)'}
        </span>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Vídeos</h1>
                    <p className="text-gray-500">Gerencie a biblioteca de vídeos (Youtube ou Upload).</p>
                </div>
                <Link to="/admin/videos/new">
                    <Button><Plus className="h-4 w-4 mr-2" /> Novo Vídeo</Button>
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
                            <TableHead className="w-[100px]">Thumb</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Plataforma</TableHead>
                            <TableHead>Categoria</TableHead>
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
                        ) : videos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-400">Nenhum vídeo encontrado.</TableCell>
                            </TableRow>
                        ) : (
                            videos.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="h-12 w-20 bg-gray-100 rounded overflow-hidden relative group">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                                    <Video className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium max-w-md truncate">{item.title}</TableCell>
                                    <TableCell className="capitalize">{item.platform}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell><StatusBadge active={item.is_premium} /></TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {format(new Date(item.published_at), 'dd/MM/yyyy', { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/admin/videos/${item.id}`}>
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

export default VideoList;
