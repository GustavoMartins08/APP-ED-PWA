import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Plus, Trash2, Save, Upload, Link as LinkIcon, FileText, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

// --- Item Form Schema (Subset of NewsItem) ---
const quickItemSchema = z.object({
    title: z.string().min(1, 'Título obrigatório'),
    excerpt: z.string().min(1, 'Resumo obrigatório'),
    image_url: z.string().optional(),
    category: z.string().default('Geral'),
    key_points: z.array(z.string()).optional()
});

// --- Edition Schema ---
const editionSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    date: z.string().min(1, 'Data é obrigatória'),
    synthesis: z.string().min(1, 'Síntese é obrigatória'),
    cover_image: z.string().min(1, 'Capa é obrigatória'),
    pdf_url: z.string().optional(),
    published: z.boolean().default(false)
});

type EditionFormData = z.infer<typeof editionSchema>;

const NewsletterForm: React.FC = () => {
    const { id } = useParams();
    const isEditing = !!id && id !== 'new';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // --- State for Items Management ---
    const [selectedItems, setSelectedItems] = useState<any[]>([]); // Items currently in the newsletter
    const [availableItems, setAvailableItems] = useState<any[]>([]); // Items from DB to pick
    const [itemsSearch, setItemsSearch] = useState('');
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    // Form for Edition Metadata
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditionFormData>({
        resolver: zodResolver(editionSchema) as any,
        defaultValues: {
            published: false,
            date: new Date().toISOString().split('T')[0]
        }
    });

    // Form for Quick Add Item
    const quickForm = useForm<z.infer<typeof quickItemSchema>>({
        resolver: zodResolver(quickItemSchema) as any,
        defaultValues: {
            key_points: ['', '', ''] // Start with 3 empty points
        }
    });

    // Load initial data
    useEffect(() => {
        const load = async () => {
            // Load available news items for selector
            const { data: news } = await supabase
                .from('news_items')
                .select('*')
                .order('published_at', { ascending: false })
                .limit(50);
            if (news) setAvailableItems(news);

            if (isEditing) {
                // Load Edition Metadata
                const { data: edition } = await supabase
                    .from('newsletter_editions')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (edition) {
                    setValue('title', edition.title);
                    setValue('date', edition.date);
                    setValue('synthesis', edition.synthesis);
                    setValue('cover_image', edition.cover_image);
                    setValue('pdf_url', edition.pdf_url || '');
                    setValue('published', edition.published);

                    // Load Related Items with Order
                    const { data: rels } = await supabase
                        .from('newsletter_items_rel')
                        .select('*, news_items(*)')
                        .eq('edition_id', id)
                        .order('order_index');

                    if (rels) {
                        const items = rels.map(r => ({ ...r.news_items, r_id: r.id })); // r_id helps tracking
                        setSelectedItems(items);
                    }
                }
            }
        };
        load();
    }, [id, isEditing, setValue]);

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const fileName = `covers/${Date.now()}_${file.name}`;
            const { error } = await supabase.storage.from('newsletter-assets').upload(fileName, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('newsletter-assets').getPublicUrl(fileName);
            setValue('cover_image', publicUrl);
        } catch (err) {
            console.error(err);
            alert('Erro ao subir imagem');
        }
    };

    // --- Item Management Functions ---

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

    const handleQuickAddSubmit = async (data: z.infer<typeof quickItemSchema>) => {
        // Create News Item immediately in DB
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const newItem = {
            title: data.title,
            slug,
            excerpt: data.excerpt,
            category: data.category,
            image_url: data.image_url,
            key_points: data.key_points?.filter(Boolean),
            published_at: new Date().toISOString(),
            is_premium: true // Default for newsletter items
        };

        const { data: inserted, error } = await supabase.from('news_items').insert(newItem).select().single();
        if (error) {
            alert('Erro ao criar item: ' + error.message);
            return;
        }

        addItem(inserted);
        setIsQuickAddOpen(false);
        quickForm.reset({ key_points: ['', '', ''] });
    };

    const onSubmit = async (data: EditionFormData) => {
        setLoading(true);
        try {
            let editionId = id;

            const editionData = {
                title: data.title,
                date: data.date,
                synthesis: data.synthesis,
                cover_image: data.cover_image,
                pdf_url: data.pdf_url,
                published: data.published
            };

            if (isEditing) {
                await supabase.from('newsletter_editions').update(editionData).eq('id', id);
                // Clear existing rels to re-insert (easiest way to handle reordering)
                await supabase.from('newsletter_items_rel').delete().eq('edition_id', id);
            } else {
                const { data: newEd, error } = await supabase.from('newsletter_editions').insert(editionData).select().single();
                if (error) throw error;
                editionId = newEd.id;
            }

            // Insert Relationships
            if (selectedItems.length > 0) {
                const rels = selectedItems.map((item, index) => ({
                    edition_id: editionId,
                    news_item_id: item.id,
                    order_index: index
                }));
                await supabase.from('newsletter_items_rel').insert(rels);
            }

            navigate('/admin/newsletters');
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar edição');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <Button variant="outline" size="icon" onClick={() => navigate('/admin/newsletters')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">{isEditing ? 'Editar Edição' : 'Nova Edição'}</h1>
                    <p className="text-gray-500 text-sm">Monte a newsletter organizando a capa e os conteúdos.</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="secondary" onClick={() => navigate('/admin/newsletters')}>Cancelar</Button>
                    <Button onClick={handleSubmit(onSubmit as any)} disabled={loading} className="bg-primary text-white hover:bg-primary/90">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Edição'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Metadata & Cover (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Capa & Metadados</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título da Edição</Label>
                                <Input {...register('title')} placeholder="Ex: Newsletter #42" />
                                {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Data</Label>
                                <Input type="date" {...register('date')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Síntese (Abstract)</Label>
                                <textarea
                                    {...register('synthesis')}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                                    placeholder="Resumo executivo da edição..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Imagem de Capa</Label>
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 relative h-40 flex items-center justify-center cursor-pointer overflow-hidden">
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleCoverUpload} />
                                    {watch('cover_image') ? (
                                        <img src={watch('cover_image')} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-400"><Upload className="mx-auto mb-2" />Upload Capa</div>
                                    )}
                                </div>
                                {errors.cover_image && <span className="text-xs text-red-500 block mt-1">{errors.cover_image.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>URL do PDF (Opcional)</Label>
                                <Input {...register('pdf_url')} placeholder="https://..." />
                            </div>

                            <hr className="my-6 border-gray-100" />

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="published"
                                    className="rounded border-gray-300"
                                    {...register('published')}
                                />
                                <Label htmlFor="published">Publicar imediatamente</Label>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Content Builder (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Selected Items List */}
                    <Card className="min-h-[500px] flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Conteúdos da Edição</CardTitle>
                                <p className="text-xs text-gray-400 font-normal mt-1">{selectedItems.length} itens selecionados</p>
                            </div>
                            <Button size="sm" onClick={() => setIsQuickAddOpen(!isQuickAddOpen)} variant={isQuickAddOpen ? "secondary" : "default"}>
                                {isQuickAddOpen ? 'Fechar Quick Add' : <><Plus className="h-4 w-4 mr-2" /> Adicionar Item</>}
                            </Button>
                        </CardHeader>

                        <CardContent className="flex-1 bg-gray-50/50 p-0 relative">
                            {/* Quick Global Add Panel */}
                            {isQuickAddOpen && (
                                <div className="p-6 bg-white border-b border-gray-200 animate-in slide-in-from-top-2">
                                    <h3 className="font-bold text-sm mb-4">Novo Item Rápido</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="col-span-2 space-y-2">
                                            <Label>Título</Label>
                                            <Input {...quickForm.register('title')} placeholder="Título da notícia" />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>Resumo</Label>
                                            <textarea {...quickForm.register('excerpt')} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={2} />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>Imagem URL</Label>
                                            <Input {...quickForm.register('image_url')} placeholder="https://..." />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>Pontos Chave</Label>
                                            <div className="space-y-2">
                                                {[0, 1, 2].map(i => (
                                                    <Input key={i} {...quickForm.register(`key_points.${i}` as any)} placeholder={`Ponto chave ${i + 1}`} className="text-sm" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="sm" type="button" onClick={quickForm.handleSubmit(handleQuickAddSubmit as any)}>Adicionar à Edição</Button>
                                </div>
                            )}

                            {selectedItems.length === 0 && !isQuickAddOpen ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10">
                                    <FileText className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Nenhum item adicionado à esta edição.</p>
                                    <p className="text-xs">Use o botão acima ou selecione da lista abaixo.</p>
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
                                                {item.key_points && (
                                                    <div className="flex gap-1 mt-2">
                                                        {item.key_points.slice(0, 2).map((kp: string, i: number) => (
                                                            <Badge key={i} variant="outline" className="text-[10px] truncate max-w-[150px]">{kp}</Badge>
                                                        ))}
                                                    </div>
                                                )}
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

                    {/* Existing Items Selector */}
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
                            <div className="h-[200px] overflow-y-auto pr-2">
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

export default NewsletterForm;
