import React, { useEffect, useState } from 'react';
import { Search, Shield, ShieldOff, User } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        let query = supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching users:', error);
        else setUsers(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    const toggleRole = async (id: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'promover este usuário a ADMIN' : 'remover acesso de ADMIN';

        if (window.confirm(`Tem certeza que deseja ${action}?`)) {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', id);

            if (error) {
                alert('Erro ao atualizar permissões. Verifique se você tem permissão para isso.');
                console.error(error);
            } else {
                fetchUsers();
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Usuários</h1>
                    <p className="text-gray-500">Gerencie usuários e permissões de acesso.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 px-0"
                />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Avatar</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Membro Desde</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-400">Nenhum usuário encontrado.</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="h-10 w-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.name || 'Sem nome'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.role === 'admin' ? (
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-purple-600 text-white hover:bg-purple-700">Admin</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">User</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleRole(user.id, user.role || 'user')}
                                            className={user.role === 'admin'
                                                ? "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                : "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                            }
                                        >
                                            {user.role === 'admin' ? (
                                                <>
                                                    <ShieldOff className="h-4 w-4 mr-2" />
                                                    Revogar Admin
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    Dar Admin
                                                </>
                                            )}
                                        </Button>
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

export default UserList;
