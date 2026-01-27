import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

const ColumnistList: React.FC = () => {
    const [columnists, setColumnists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchColumnists = async () => {
        setLoading(true);
        let query = supabase
            .from('columnists')
            .select('*')
            .order('name', { ascending: true });

        if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching columnists:', error);
        else setColumnists(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchColumnists();
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este colunista?')) {
            const { error } = await supabase.from('columnists').delete().eq('id', id);
            if (!error) fetchColumnists();
            else console.error('Error deleting columnist:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Colunistas e Autores</h1>
                    <p className="text-gray-500">Gerencie os autores e especialistas da plataforma.</p>
                </div>
                <Link to="/admin/columnists/new">
                    <Button className="bg-primary text-white hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" /> Novo Colunista
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 px-0"
                />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Foto</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Cargo/Função</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell>
                            </TableRow>
                        ) : columnists.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-400">Nenhum colunista encontrado.</TableCell>
                            </TableRow>
                        ) : (
                            columnists.map((col) => (
                                <TableRow key={col.id}>
                                    <TableCell>
                                        <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden">
                                            {col.avatar_url ? (
                                                <img src={col.avatar_url} alt={col.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{col.name}</TableCell>
                                    <TableCell>{col.role}</TableCell>
                                    <TableCell>{col.company}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/admin/columnists/${col.id}`}>
                                                <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                onClick={() => handleDelete(col.id)}
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

export default ColumnistList;
