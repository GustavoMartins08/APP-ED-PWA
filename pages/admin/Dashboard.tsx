import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Star, Newspaper } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const AdminDashboard: React.FC = () => {
    const [metrics, setMetrics] = React.useState({
        users: 0,
        premium: 0,
        news: 0,
        inquiries: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const [users, premium, news, inquiries] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'premium'), // Assuming role stores subscription status or check subscription_status column
                    supabase.from('news_items').select('*', { count: 'exact', head: true }),
                    supabase.from('advertiser_inquiries').select('*', { count: 'exact', head: true })
                ]);

                // Also check for subscription_status = 'active' if role isn't used for premium
                const { count: activeSubs } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('subscription_status', 'active');

                setMetrics({
                    users: users.count || 0,
                    premium: activeSubs || premium.count || 0,
                    news: news.count || 0,
                    inquiries: inquiries.count || 0
                });
            } catch (error) {
                console.error('Error fetching metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-400">Carregando métricas...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.users}</div>
                        <p className="text-xs text-muted-foreground">Cadastrados na plataforma</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assinantes Premium</CardTitle>
                        <Star className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.premium}</div>
                        <p className="text-xs text-muted-foreground">Assinaturas ativas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conteúdos</CardTitle>
                        <Newspaper className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.news}</div>
                        <p className="text-xs text-muted-foreground">Notícias e Artigos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leads (Ads)</CardTitle>
                        <Users className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.inquiries}</div>
                        <p className="text-xs text-muted-foreground">Contatos de anunciantes</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
