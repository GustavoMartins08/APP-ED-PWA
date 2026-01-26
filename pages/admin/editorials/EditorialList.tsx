import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FileText, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

const EditorialList: React.FC = () => {
    const [editorials, setEditorials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEditorials = async () => {
        setLoading(true);
        let query = supabase
            .from('editorials')
            .select('*')
            .order('published_at', { ascending: false });

        if (searchTerm) {
            query = query.ilike('theme', `%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching editorials:', error);
        else setEditorials(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchEditorials();
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta edição?')) {
            const { error } = await supabase.from('editorials').delete().eq('id', id);
            if (!error) fetchEditorials();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Editoriais Mensais</h1>
                    <p className="text-gray-500">Gerencie as edições da revista digital (PDF).</p>
                </div>
                <Link to="/admin/editorials/new">
                    <Button className="bg-primary text-white hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" /> Nova Edição</Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Buscar por tema..."
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
                            <TableHead>Mês/Ano</TableHead>
                            <TableHead>Tema Central</TableHead>
                            <TableHead>PDF</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell>
                            </TableRow>
                        ) : editorials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-400">Nenhuma edição encontrada.</TableCell>
                            </TableRow>
                        ) : (
                            editorials.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="h-16 w-12 bg-gray-100 rounded overflow-hidden shadow-sm">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.month_year}</TableCell>
                                    <TableCell className="font-bold text-primary">{item.theme}</TableCell>
                                    <TableCell>
                                        {item.pdf_url ? (
                                            <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-600 hover:underline">
                                                <Download className="h-3 w-3 mr-1" /> PDF
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400">Pendente</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/admin/editorials/${item.id}`}>
                                                <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"><Edit className="h-4 w-4" /></Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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

export default EditorialList;
