# Estudo de Performance 360º - App Empresário Digital

Análise técnica detalhada visando otimizar a velocidade de carregamento (LCP/FCP) e a interatividade (INP) do aplicativo, mantendo a integridade visual e animações atuais.

## Diagnóstico Atual

### 1. Frontend (Crítico)
*   **Carregamento de Dados Bloqueante**: A página `Home.tsx` carrega **todo** o conteúdo (Notícias, Editoriais, Vídeos) de uma só vez usando `Promise.all` antes de renderizar qualquer coisa. Isso causa uma tela branca ou de "loading" muito longa.
*   **Imagens Desproporcionais**: Imagens de capa (Unsplash) estão sendo carregadas em resolução total (ex: 4000x3000px) para serem exibidas em cards pequenos (ex: 400x300px), consumindo megabytes de banda desnecessariamente.
*   **Ausência de Paginação**: Todas as notícias estão sendo buscadas de uma vez. Conforme o conteúdo cresce, o app ficará exponencialmente mais lento.
*   **Bundle Único**: O App não parece estar utilizando Code Splitting (lazy loading) para rotas pesadas.

### 2. Banco de Dados (Supabase)
*   **Buscas Não Otimizadas**: Queries `select('*')` trazem colunas pesadas (como `content` ou `key_points` JSON) mesmo quando apenas o título e imagem são necessários para a Home.
*   **Falta de Política de Cache**: O cliente Supabase não está configurado para cachear queries frequentes (SWR/React Query não está totalmente otimizado).

---

## Plano de Ação (Velocidade)

### Fase 1: Otimização de Imagens (Ganho Imediato)
**Problema**: Imagens carregam 5MB+ cada.
**Solução**:
1.  **Supabase Image Transformation**: Utilizar a feature de transformação de imagem do Supabase Storage.
    *   Ex: `bucket/image.jpg?width=400&format=webp&quality=80`.
2.  **Lazy Loading Nativo**: Adicionar `loading="lazy"` e `decoding="async"` em todas as tags `<img>` abaixo da dobra.
3.  **Preload LCP**: A imagem da capa da Hero Section deve ter `<link rel="preload">` ou prioridade alta pelo Next.js/Vite.

### Fase 2: Estratégia de Carregamento de Dados (Feel Faster)
**Problema**: Tela de loading inicial longa.
**Solução**:
1.  **Skeleton Screens**: Em vez de uma tela branca com "Carregando...", mostrar esqueletos (placeholders) da estrutura do layout imediatamente.
2.  **Streaming / Suspense**: Carregar seções críticas (Hero) primeiro e deixar seções secundárias (Vídeos, Rodapé) carregarem depois.
3.  **Paginação**: Implementar `limit(6)` nas queries da Home e um botão "Carregar Mais" ou Infinite Scroll nos carrosséis.

### Fase 3: Otimização de Código (Bundle Size)
**Problema**: JS inicial muito pesado.
**Solução**:
1.  **Rota Lazy**: Transformar as rotas do `React Router` para `React.lazy()`:
    ```typescript
    const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
    ```
    Isso evita que o usuário comum baixe todo o código do painel administrativo (que é pesado).

### Fase 4: Banco de Dados
**Problema**: Transferência de dados excessiva.
**Solução**:
1.  **Specific Selects**: Alterar queries de `select('*')` para `select('id, title, image_url, category')` na Home.
2.  **Indexes**: Garantir índices nas colunas de filtro (`published_at`, `category`, `is_premium`).

---

## Próximos Passos (Implementação)

1.  [Frontend] Refatorar `Home.tsx` para usar queries separadas (não `Promise.all` bloqueante) e skeletons.
2.  [Frontend] Implementar função utilitária `getOptimizedImageUrl(url, width)` para redimensionar imagens on-the-fly.
3.  [Router] Implementar `React.lazy` nas rotas do `App.tsx`.
