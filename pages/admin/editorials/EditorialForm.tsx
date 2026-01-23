import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Save, Upload, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';

const editorialSchema = z.object({
    month_year: z.string().min(1, 'Mês/Ano é obrigatório (ex: Janeiro 2024)'),
    theme: z.string().min(1, 'Tema é obrigatório'),
    summary: z.string().min(1, 'Resumo é obrigatório'),
    image_url: z.string().optional(),
    pdf_url: z.string().optional(),
    published_at: z.string(),
});

type EditorialFormData = z.infer<typeof editorialSchema>;

const EditorialForm: React.FC = () => {
    const { id } = useParams();
    const isEditing = !!id && id !== 'new';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditorialFormData>({
        resolver: zodResolver(editorialSchema),
        defaultValues: {
            published_at: new Date().toISOString().split('T')[0],
        }
    });

    useEffect(() => {
        const loadData = async () => {
            if (isEditing) {
                const { data: editorial, error } = await supabase.from('editorials').select('*').eq('id', id).single();
                if (editorial) {
                    setValue('month_year', editorial.month_year);
                    setValue('theme', editorial.theme);
                    setValue('summary', editorial.summary);
                    setValue('image_url', editorial.image_url || '');
                    setValue('pdf_url', editorial.pdf_url || '');
                    setValue('published_at', editorial.published_at.split('T')[0]);
                }
            }
        };
        loadData();
    }, [id, isEditing, setValue]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: string, field: 'image_url' | 'pdf_url') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            setValue(field, publicUrl);
        } catch (error) {
            console.error(`Error uploading ${field}:`, error);
            alert(`Erro ao fazer upload do arquivo.`);
        }
    };

    const onSubmit = async (data: EditorialFormData) => {
        setLoading(true);
        try {
            const dbData = {
                ...data,
                published_at: new Date(data.published_at).toISOString()
            };

            if (isEditing) {
                const { error } = await supabase.from('editorials').update(dbData).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('editorials').insert([dbData]);
                if (error) throw error;
            }

            navigate('/admin/editorials');
        } catch (error) {
            console.error('Error saving editorial:', error);
            alert('Erro ao salvar editorial.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/editorials')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">{isEditing ? 'Editar Edição' : 'Nova Edição'}</h1>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="secondary" onClick={() => navigate('/admin/editorials')}>Cancelar</Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Edição'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Tema Central</Label>
                            <Input {...register('theme')} placeholder="Ex: A Revolução da IA" />
                            {errors.theme && <span className="text-xs text-red-500">{errors.theme.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Referência (Mês/Ano)</Label>
                            <Input {...register('month_year')} placeholder="Ex: Janeiro 2024" />
                            {errors.month_year && <span className="text-xs text-red-500">{errors.month_year.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Resumo / Carta do Editor</Label>
                            <textarea
                                {...register('summary')}
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Uma breve introdução sobre esta edição..."
                            />
                            {errors.summary && <span className="text-xs text-red-500">{errors.summary.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Data de Publicação</Label>
                            <Input type="date" {...register('published_at')} />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Label>Capa da Edição</Label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative h-64 flex items-center justify-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleFileUpload(e, 'editorial-covers', 'image_url')}
                                />
                                {watch('image_url') ? (
                                    <img src={watch('image_url')} alt="Preview" className="h-full object-contain rounded-md" />
                                ) : (
                                    <div className="space-y-2 text-gray-500">
                                        <Upload className="h-8 w-8 mx-auto" />
                                        <span className="text-xs block">Clique para upload da capa</span>
                                    </div>
                                )}
                            </div>
                            {watch('image_url') && (
                                <Input {...register('image_url')} placeholder="URL da imagem (manual)" />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Label>Arquivo PDF</Label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleFileUpload(e, 'edition-pdfs', 'pdf_url')}
                                />
                                {watch('pdf_url') ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                        <FileText className="h-6 w-6" />
                                        <span className="font-bold text-sm">PDF Carregado</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-gray-500">
                                        <FileText className="h-8 w-8 mx-auto" />
                                        <span className="text-xs block">Clique para upload do PDF</span>
                                    </div>
                                )}
                            </div>
                            {watch('pdf_url') && (
                                <Input {...register('pdf_url')} placeholder="URL do PDF (manual)" />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditorialForm;
