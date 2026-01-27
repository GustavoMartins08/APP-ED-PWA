import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Save, Upload } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';

const columnistSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    role: z.string().min(1, 'Cargo é obrigatório'),
    company: z.string().min(1, 'Empresa é obrigatória'),
    bio: z.string().min(1, 'Biografia é obrigatória'),
    avatar_url: z.string().optional(),
});

type ColumnistFormData = z.infer<typeof columnistSchema>;

const ColumnistForm: React.FC = () => {
    const { id } = useParams();
    const isEditing = !!id && id !== 'new';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ColumnistFormData>({
        resolver: zodResolver(columnistSchema)
    });

    useEffect(() => {
        const loadData = async () => {
            if (isEditing) {
                const { data, error } = await supabase.from('columnists').select('*').eq('id', id).single();
                if (data) {
                    setValue('name', data.name);
                    setValue('role', data.role);
                    setValue('company', data.company);
                    setValue('bio', data.bio);
                    setValue('avatar_url', data.avatar_url || '');
                }
            }
        };
        loadData();
    }, [id, isEditing, setValue]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `col_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Using 'news-images' as a shared bucket for content assets if specifics don't exist
            const { error: uploadError } = await supabase.storage
                .from('news-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('news-images')
                .getPublicUrl(filePath);

            setValue('avatar_url', publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao fazer upload da imagem.');
        }
    };

    const onSubmit = async (data: ColumnistFormData) => {
        setLoading(true);
        try {
            if (isEditing) {
                const { error } = await supabase.from('columnists').update(data).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('columnists').insert([data]);
                if (error) throw error;
            }

            navigate('/admin/columnists');
        } catch (error: any) {
            console.error('Error saving columnist:', error);
            alert(`Erro ao salvar colunista: ${error.message || error.error_description || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/admin/columnists')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">
                        {isEditing ? 'Editar Colunista' : 'Novo Colunista'}
                    </h1>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="secondary" onClick={() => navigate('/admin/columnists')}>Cancelar</Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-primary text-white hover:bg-primary/90">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input {...register('name')} placeholder="Ex: Ana Silva" />
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cargo / Função</Label>
                            <Input {...register('role')} placeholder="Ex: Economista Chefe" />
                            {errors.role && <span className="text-xs text-red-500">{errors.role.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>Empresa</Label>
                            <Input {...register('company')} placeholder="Ex: Banco XP" />
                            {errors.company && <span className="text-xs text-red-500">{errors.company.message}</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Biografia</Label>
                        <textarea
                            {...register('bio')}
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Breve descrição sobre o autor..."
                        />
                        {errors.bio && <span className="text-xs text-red-500">{errors.bio.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label>Foto do Perfil (Avatar)</Label>
                        <div className="flex items-center gap-6">
                            <div className="h-24 w-24 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                                {watch('avatar_url') ? (
                                    <img src={watch('avatar_url')} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                        <Upload className="h-8 w-8" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                                <p className="text-xs text-gray-500 mt-2">Recomendado: 400x400px, JPG ou PNG.</p>
                                {watch('avatar_url') && (
                                    <Input {...register('avatar_url')} placeholder="URL da imagem (opcional)" className="mt-2" />
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ColumnistForm;
