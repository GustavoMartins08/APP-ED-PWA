import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Save, Upload, Youtube } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';

// Simple Switch/Checkbox
const SimpleSwitch = ({ checked, onChange, label }: { checked: boolean, onChange: (v: boolean) => void, label: string }) => (
    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onChange(!checked)}>
        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-primary' : 'bg-gray-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm font-medium">{label}</span>
    </div>
);

const videoSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    external_id: z.string().min(1, 'ID do Youtube é obrigatório'),
    duration: z.string().min(1, 'Duração é obrigatória (ex: 10:30)'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    platform: z.enum(['youtube', 'vimeo']),
    image_url: z.string().optional(),
    is_premium: z.boolean(),
    published_at: z.string(),
});

type VideoFormData = z.infer<typeof videoSchema>;

const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const VideoForm: React.FC = () => {
    const { id } = useParams();
    const isEditing = !!id && id !== 'new';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<VideoFormData>({
        resolver: zodResolver(videoSchema),
        defaultValues: {
            platform: 'youtube',
            is_premium: false,
            published_at: new Date().toISOString().split('T')[0],
        }
    });

    useEffect(() => {
        const loadData = async () => {
            if (isEditing) {
                const { data: video, error } = await supabase.from('videos').select('*').eq('id', id).single();
                if (video) {
                    setValue('title', video.title);
                    setValue('description', video.description);
                    setValue('external_id', video.external_id);
                    setValue('duration', video.duration);
                    setValue('category', video.category);
                    setValue('platform', video.platform || 'youtube');
                    setValue('image_url', video.image_url || '');
                    setValue('is_premium', video.is_premium);
                    setValue('published_at', video.published_at.split('T')[0]);
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
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('video-thumbs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('video-thumbs')
                .getPublicUrl(filePath);

            setValue('image_url', publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao fazer upload da imagem.');
        }
    };

    const fetchYoutubeData = async () => {
        // Implement logic to fetch title/thumb from youtube API if needed
        // For now just manually enter or auto-generate thumb url
        const yId = watch('external_id');
        if (yId && !watch('image_url')) {
            setValue('image_url', `https://img.youtube.com/vi/${yId}/maxresdefault.jpg`);
        }
    };

    const onSubmit = async (data: VideoFormData) => {
        setLoading(true);
        try {
            const dbData = {
                ...data,
                published_at: new Date(data.published_at).toISOString()
            };

            if (isEditing) {
                const { error } = await supabase.from('videos').update(dbData).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('videos').insert([dbData]);
                if (error) throw error;
            }

            navigate('/admin/videos');
        } catch (error) {
            console.error('Error saving video:', error);
            alert('Erro ao salvar vídeo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/admin/videos')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => {
                    const id = watch('external_id');
                    if (id) {
                        window.open(`https://youtube.com/watch?v=${id}`, '_blank');
                    }
                }}>
                    <Youtube className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">{isEditing ? 'Editar Vídeo' : 'Novo Vídeo'}</h1>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="secondary" onClick={() => navigate('/admin/videos')}>Cancelar</Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-primary text-white hover:bg-primary/90">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Vídeo'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Link do YouTube</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ex: https://www.youtube.com/watch?v=..."
                                    onChange={async (e) => {
                                        const url = e.target.value;
                                        const id = getYoutubeId(url);
                                        if (id) {
                                            setValue('external_id', id);
                                            // Fetch metadata
                                            try {
                                                const response = await fetch(`https://noembed.com/embed?url=${url}`);
                                                const data = await response.json();
                                                if (data.title && !watch('title')) setValue('title', data.title);
                                                if (data.thumbnail_url && !watch('image_url')) setValue('image_url', data.thumbnail_url);
                                                // Try to set author as description if empty, or just title
                                            } catch (err) {
                                                console.error("Failed to fetch metadata", err);
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <input type="hidden" {...register('external_id')} />
                            {errors.external_id && <span className="text-xs text-red-500">Link inválido ou ID não encontrado.</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Título</Label>
                            <Input {...register('title')} placeholder="Título do vídeo" />
                            {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <textarea
                                {...register('description')}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Descrição completa..."
                            />
                            {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Duração</Label>
                                    <Input {...register('duration')} placeholder="10:30" />
                                    {errors.duration && <span className="text-xs text-red-500">{errors.duration.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Data Publicação</Label>
                                    <Input type="date" {...register('published_at')} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <select
                                    {...register('category')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Tutorial">Tutorial</option>
                                    <option value="Entrevista">Entrevista</option>
                                    <option value="Análise">Análise</option>
                                    <option value="Vlog">Vlog</option>
                                </select>
                                {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <SimpleSwitch
                                    label="Conteúdo Premium"
                                    checked={watch('is_premium')}
                                    onChange={(v) => setValue('is_premium', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Label>Thumbnail</Label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleImageUpload}
                                />
                                {watch('image_url') ? (
                                    <img src={watch('image_url')} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                                ) : (
                                    <div className="space-y-2 text-gray-500">
                                        <Upload className="h-8 w-8 mx-auto" />
                                        <span className="text-xs block">Clique para upload</span>
                                    </div>
                                )}
                            </div>
                            {watch('image_url') && (
                                <Input {...register('image_url')} placeholder="URL da imagem (manual)" />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VideoForm;
