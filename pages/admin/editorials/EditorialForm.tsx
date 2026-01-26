import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Save, Upload, FileText, Trash2, ArrowUp, ArrowDown, Plus, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

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

    // --- Content Management State ---
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [availableItems, setAvailableItems] = useState<any[]>([]);
    const [itemsSearch, setItemsSearch] = useState('');

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditorialFormData>({
        resolver: zodResolver(editorialSchema),
        defaultValues: {
            published_at: new Date().toISOString().split('T')[0],
        }
    });

    useEffect(() => {
        const loadData = async () => {
            // 1. Load Available News Items
            const { data: news } = await supabase
                .from('news_items')
                .select('*')
                .order('published_at', { ascending: false })
                .limit(50);
            if (news) setAvailableItems(news);

            // 2. Load Editorial Data if Editing
            if (isEditing) {
                const { data: editorial, error } = await supabase.from('editorials').select('*').eq('id', id).single();
                if (editorial) {
                    setValue('month_year', editorial.month_year);
                    setValue('theme', editorial.theme);
                    setValue('summary', editorial.summary);
                    setValue('image_url', editorial.image_url || '');
                    setValue('pdf_url', editorial.pdf_url || '');
                    setValue('published_at', editorial.published_at.split('T')[0]);

                    // 3. Load Linked Items
                    const { data: rels } = await supabase
                        .from('editorial_items')
                        .select('*, news_items(*)')
                        .eq('editorial_id', id)
                        .order('order');

                    if (rels) {
                        const items = rels.map(r => ({ ...r.news_items }));
                        setSelectedItems(items);
                    }
                }
            }
        };
        loadData();
    }, [id, isEditing, setValue]);

    const [uploadingPdf, setUploadingPdf] = useState(false);

    // ... (inside handleFileUpload)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: string, field: 'image_url' | 'pdf_url') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (field === 'pdf_url') setUploadingPdf(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
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
        } finally {
            if (field === 'pdf_url') setUploadingPdf(false);
        }
    };

    // --- Item Management ---
    const addItem = (item: any) => {
        if (selectedItems.find(i => i.id === item.id)) return;
        setSelectedItems([...selectedItems, item]);
    };

    const removeItem = (index: number) => {
        const newItems = [...selectedItems];
        newItems.splice(index, 1);
        setSelectedItems(newItems);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === selectedItems.length - 1) return;

        const newItems = [...selectedItems];
        const temp = newItems[index];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        newItems[index] = newItems[targetIndex];
        newItems[targetIndex] = temp;
        setSelectedItems(newItems);
    };

    const onSubmit = async (data: EditorialFormData) => {
        setLoading(true);
        try {
            const dbData = {
                ...data,
                published_at: new Date(data.published_at).toISOString()
            };

            let editorialId = id;

            if (isEditing) {
                const { error } = await supabase.from('editorials').update(dbData).eq('id', id);
                if (error) throw error;

                // Clear existing items to re-insert
                await supabase.from('editorial_items').delete().eq('editorial_id', id);
            } else {
                const { data: newEd, error } = await supabase.from('editorials').insert([dbData]).select().single();
                if (error) throw error;
                editorialId = newEd.id;
            }

            // Insert Items
            if (selectedItems.length > 0) {
                const rels = selectedItems.map((item, index) => ({
                    editorial_id: editorialId,
                    news_item_id: item.id,
                    order: index
                }));
                const { error: relError } = await supabase.from('editorial_items').insert(rels);
                if (relError) throw relError;
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
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <Button variant="outline" size="icon" onClick={() => navigate('/admin/editorials')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">{isEditing ? 'Editar Edição' : 'Nova Edição'}</h1>
                    <p className="text-gray-500 text-sm">Gerencie os detalhes da edição e os conteúdos associados.</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="secondary" onClick={() => navigate('/admin/editorials')}>Cancelar</Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-primary text-white hover:bg-primary/90">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Edição'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Metadata & Files */}
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes da Edição</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Label>Capa da Edição</Label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative h-64 flex items-center justify-center overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={(e) => handleFileUpload(e, 'editorial-covers', 'image_url')}
                                />
                                {watch('image_url') ? (
                                    <img src={watch('image_url')} alt="Preview" className="w-full h-full object-cover rounded-md" />
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
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={(e) => handleFileUpload(e, 'edition-pdfs', 'pdf_url')}
                                />
                                {watch('pdf_url') ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                        <FileText className="h-6 w-6" />
                                        <span className="font-bold text-sm">PDF Carregado</span>
                                    </div>
                                ) : uploadingPdf ? (
                                    <div className="flex items-center justify-center gap-2 text-accent animate-pulse">
                                        <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                        <span className="font-bold text-sm">Enviando PDF...</span>
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

                {/* Right Column: Content Management */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="min-h-[500px] flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Conteúdos da Edição</CardTitle>
                                <p className="text-xs text-gray-400 font-normal mt-1">{selectedItems.length} itens selecionados</p>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 bg-gray-50/50 p-0 relative">
                            {selectedItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10">
                                    <FileText className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Nenhum conteúdo adicionado.</p>
                                    <p className="text-xs">Selecione notícias da biblioteca abaixo.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {selectedItems.map((item, index) => (
                                        <div key={item.id} className="p-4 bg-white flex gap-4 items-start group hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col gap-1 text-gray-300 pt-1">
                                                <button type="button" onClick={() => moveItem(index, 'up')} disabled={index === 0} className="hover:text-gray-600 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                                                <span className="text-xs font-mono font-bold text-center">{index + 1}</span>
                                                <button type="button" onClick={() => moveItem(index, 'down')} disabled={index === selectedItems.length - 1} className="hover:text-gray-600 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                                            </div>

                                            <div className="h-16 w-24 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                                {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-xs">Sem foto</div>}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-2">{item.excerpt}</p>
                                            </div>

                                            <Button variant="outline" size="icon" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Library Selector */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Biblioteca de Notícias</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar notícias existentes..."
                                    className="pl-8"
                                    value={itemsSearch}
                                    onChange={(e) => setItemsSearch(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] overflow-y-auto pr-2">
                                <div className="grid grid-cols-1 gap-2">
                                    {availableItems
                                        .filter(i =>
                                            !selectedItems.find(s => s.id === i.id) &&
                                            i.title.toLowerCase().includes(itemsSearch.toLowerCase())
                                        )
                                        .map(item => (
                                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer border border-transparent hover:border-gray-200" onClick={() => addItem(item)}>
                                                <div className="h-8 w-12 bg-gray-200 rounded shrink-0 overflow-hidden">
                                                    {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{item.title}</div>
                                                    <div className="text-xs text-gray-400">{new Date(item.published_at).toLocaleDateString()}</div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Plus className="h-3 w-3" /></Button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditorialForm;
