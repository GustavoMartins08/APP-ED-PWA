import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

const NewsletterList: React.FC = () => {
    const navigate = useNavigate();
    const [editions, setEditions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEditions();
    }, []);

    const loadEditions = async () => {
        setLoading(true);
        // Using a join or just counting items would be nice, but simple select first
        const { data, error } = await supabase
            .from('newsletter_editions')
            .select('*')
            .order('date', { ascending: false });

        if (!error && data) {
            setEditions(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta edição?')) return;

        const { error } = await supabase
            .from('newsletter_editions')
            .delete()
            .eq('id', id);

        if (!error) {
            loadEditions();
        } else {
            alert('Erro ao excluir edição.');
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Gestão de Newsletters</h1>
                    <p className="text-gray-500 mt-1">Gerencie as edições quinzenais e seus conteúdos.</p>
                </div>
                <Button onClick={() => navigate('/admin/newsletters/new')} className="bg-primary text-white hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" /> Nova Edição
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edições Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10">Carregando...</div>
                    ) : editions.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Nenhuma edição encontrada.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left font-medium text-gray-500 py-3 px-4">Data</th>
                                        <th className="text-left font-medium text-gray-500 py-3 px-4">Título</th>
                                        <th className="text-left font-medium text-gray-500 py-3 px-4">Status</th>
                                        <th className="text-right font-medium text-gray-500 py-3 px-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editions.map((edition) => (
                                        <tr key={edition.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4 font-mono text-gray-600">
                                                {new Date(edition.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-900">{edition.title}</div>
                                                <div className="text-xs text-gray-400 truncate max-w-[300px]">{edition.synthesis}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {edition.published ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Publicado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        <XCircle className="w-3 h-3 mr-1" /> Rascunho
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => navigate(`/admin/newsletters/${edition.id}`)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => handleDelete(edition.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default NewsletterList;
