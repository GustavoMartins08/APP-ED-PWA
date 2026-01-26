import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Plus, Trash2, Save, Upload } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';

// Simple Switch/Checkbox for now
const SimpleSwitch = ({ checked, onChange, label }: { checked: boolean, onChange: (v: boolean) => void, label: string }) => (
    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onChange(!checked)}>
        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-primary' : 'bg-gray-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm font-medium">{label}</span>
    </div>
);

const newsSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    slug: z.string().min(1, 'Slug é obrigatório'),
    excerpt: z.string().min(1, 'Resumo é obrigatório'),
    content: z.string().optional(),
    category: z.string().min(1, 'Categoria é obrigatória'),
    source: z.string().optional(),
    author_id: z.string().optional(),
    image_url: z.string().optional(),
    is_premium: z.boolean(),
    published_at: z.string(),
    key_points: z.array(z.object({ value: z.string() })).optional()
});

type NewsFormData = z.infer<typeof newsSchema>;

const NewsForm: React.FC = () => {
    const { id } = useParams();
    const isEditing = !!id && id !== 'new';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [columnists, setColumnists] = useState<any[]>([]);

    const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<NewsFormData>({
        resolver: zodResolver(newsSchema),
        defaultValues: {
            is_premium: false,
            published_at: new Date().toISOString().split('T')[0],
            key_points: [{ value: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "key_points"
    });

    // Auto-generate slug from title
    const title = watch('title');
    useEffect(() => {
        if (title && !isEditing) {
            const slug = title
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setValue('slug', slug);
        }
    }, [title, isEditing, setValue]);

    useEffect(() => {
        const loadData = async () => {
            // Load Columnists
            const { data: cols } = await supabase.from('columnists').select('id, name');
            setColumnists(cols || []);

            // Load News if editing
            if (isEditing) {
                const { data: news, error } = await supabase.from('news_items').select('*').eq('id', id).single();
                if (news) {
                    setValue('title', news.title);
                    setValue('slug', news.slug);
                    setValue('excerpt', news.excerpt);
                    setValue('content', news.content || '');
                    setValue('category', news.category);
                    setValue('source', news.source || '');
                    setValue('author_id', news.author_id || '');
                    setValue('image_url', news.image_url || '');
                    setValue('is_premium', news.is_premium);
                    setValue('published_at', news.published_at.split('T')[0]); // Format for input date

                    if (news.key_points && Array.isArray(news.key_points)) {
                        setValue('key_points', news.key_points.map((p: string) => ({ value: p })));
                    }
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
                .from('news-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('news-images')
                .getPublicUrl(filePath);

            setValue('image_url', publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao fazer upload da imagem.');
        }
    };

    const onSubmit = async (data: NewsFormData) => {
        setLoading(true);
        try {
            const dbData = {
                ...data,
                author_id: data.author_id || null, // Fix: convert empty string to null for UUID field
                key_points: data.key_points?.map(k => k.value).filter(v => v) || [],
                // Ensure published_at has time
                published_at: new Date(data.published_at).toISOString()
            };

            if (isEditing) {
                const { error } = await supabase.from('news_items').update(dbData).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('news_items').insert([dbData]);
                if (error) throw error;
            }

            navigate('/admin/news');
        } catch (error) {
            console.error('Error saving news:', error);
            alert('Erro ao salvar notícia.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/admin/news')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">{isEditing ? 'Editar Notícia' : 'Nova Notícia'}</h1>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="secondary" onClick={() => navigate('/admin/news')}>Cancelar</Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-primary text-white hover:bg-primary/90">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Notícia'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input {...register('title')} placeholder="Manchete principal" />
                                {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Slug (URL Amigável)</Label>
                                <Input {...register('slug')} placeholder="titulo-da-noticia" />
                            </div>

                            <div className="space-y-2">
                                <Label>Resumo (Excerpt)</Label>
                                <textarea
                                    {...register('excerpt')}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Resumo curto para o card..."
                                />
                                {errors.excerpt && <span className="text-xs text-red-500">{errors.excerpt.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Conteúdo Completo (Markdown/HTML Simples)</Label>
                                <textarea
                                    {...register('content')}
                                    className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                    placeholder="Escreva seu artigo aqui..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Pontos Chave (Key Points)</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}>
                                    <Plus className="h-3 w-3 mr-2" /> Adicionar
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <Input {...register(`key_points.${index}.value` as const)} placeholder="Ponto de destaque..." />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Data de Publicação</Label>
                                <Input type="date" {...register('published_at')} />
                            </div>

                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <select
                                    {...register('category')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Tecnologia">Tecnologia</option>
                                    <option value="Negócios">Negócios</option>
                                    <option value="Startups">Startups</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Carreira">Carreira</option>
                                    <option value="Finanças">Finanças</option>
                                </select>
                                {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Autor</Label>
                                <select
                                    {...register('author_id')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">Redação (Sem autor)</option>
                                    {columnists.map(col => (
                                        <option key={col.id} value={col.id}>{col.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Fonte Original</Label>
                                <Input {...register('source')} placeholder="Ex: LinkedIn, YouTube..." />
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
                            <Label>Imagem de Capa</Label>
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
                                <Input {...register('image_url')} placeholder="URL da imagem" />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NewsForm;
