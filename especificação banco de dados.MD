# Especificação de Banco de Dados - Empresário Digital

Este documento detalha a estrutura de banco de dados necessária para suportar 100% das funcionalidades, interfaces e dados simulados (mocks) atualmente presentes na aplicação React "Empresário Digital". A implementação deve ser realizada no Supabase (PostgreSQL).

## 1. Visão Geral do Schema

O banco de dados deve suportar:
- **Conteúdo**: Notícias, Artigos de Colunistas, Vídeos, Editoriais, Newsletters.
- **Usuários**: Perfis de usuário, assinaturas (Free/Premium), itens salvos.
- **Interações**: Comentários (previsto na interface), Compartilhamentos (rastreamento opcional).
- **Institucional**: Leads de formulários (Newsletter e Publicidade).

## 2. Tabelas Principais

### 2.1. `public.profiles` (Perfis de Usuário)
Armazena informações públicas dos usuários, vinculados à autenticação do Supabase.

| Coluna | Tipo | Obrigatório | Descrição/Mapeamento Frontend |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Sim | Chave Primária. FK para `auth.users.id`. |
| `email` | `text` | Sim | Email do usuário (sincronizado de auth). |
| `full_name` | `text` | Não | Ex: "Ricardo Montenegro". Usado no `ProfilePage`. |
| `avatar_url` | `text` | Não | URL da imagem de perfil. |
| `role` | `text` | Sim | Default: 'subscriber'. Opções: 'admin', 'subscriber', 'editor'. |
| `subscription_status` | `text` | Sim | Default: 'free'. 'premium' libera acesso a Newsletters completas. |
| `created_at` | `timestamptz` | Sim | Default: `now()`. |

### 2.2. `public.columnists` (Colunistas)
Autores dos artigos de opinião e colunas.
*Referência: `src/pages/ColumnsPage.tsx`, `ArticleDetail.tsx`*

| Coluna | Tipo | Obrigatório | Descrição/Mapeamento Frontend |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Sim | PK. Default: `gen_random_uuid()`. |
| `name` | `text` | Sim | Ex: "Ana Silva". |
| `role` | `text` | Sim | Ex: "CEO", "Investor". |
| `company` | `text` | Sim | Ex: "Nexus Tech". |
| `bio` | `text` | Não | Biografia exibida na página de detalhes. |
| `avatar_url` | `text` | Não | Foto do colunista. |
| `created_at` | `timestamptz` | Sim | Default: `now()`. |

### 2.3. `public.news_items` (Notícias e Artigos)
Tabela central para todo conteúdo textual (Notícias Rápidas e Colunas).
*Referência: `src/components/NewsCard.tsx`, `src/types.ts (NewsItem)`*

| Coluna | Tipo | Obrigatório | Descrição/Mapeamento Frontend |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Sim | PK. Default: `gen_random_uuid()`. |
| `title` | `text` | Sim | Título da notícia/artigo. |
| `slug` | `text` | Sim | URL amigável (único). Ex: `o-impacto-da-ia`. |
| `excerpt` | `text` | Sim | Resumo apresentado nos cards. |
| `content` | `text` | Não | Conteúdo completo (HTML ou Markdown) para `ArticleDetail`. |
| `category` | `text` | Sim | Ex: 'Tecnologia', 'Negócios', 'Startups'. |
| `source` | `text` | Sim | Enum: 'LinkedIn', 'YouTube', 'Web', 'Reddit', 'Editorial'. |
| `image_url` | `text` | Não | Imagem de capa. |
| `author_id` | `uuid` | Não | FK para `columnists.id`. Se NULL, é notícia agregada/geral. |
| `published_at` | `timestamptz` | Sim | Data de publicação. Usado para ordenação "Mais Recentes". |
| `key_points` | `jsonb` | Não | Array de strings. Lista de destaques (`<ul>` no `NewsCard`). |
| `is_premium` | `boolean` | Sim | Default: `false`. Se true, bloqueia conteúdo para users free. |

### 2.4. `public.videos` (Vídeos)
Conteúdo audiovisual.
*Referência: `src/pages/VideosPage.tsx`, `src/components/HeroCarousel.tsx`*

| Coluna | Tipo | Obrigatório | Descrição/Mapeamento Frontend |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Sim | PK. |
| `title` | `text` | Sim | Título do vídeo. |
| `description` | `text` | Não | Descrição detalhada. |
| `duration` | `text` | Sim | Ex: "15:20". Exibido no card. |
| `platform` | `text` | Sim | Ex: 'YouTube', 'Vimeo'. |
| `external_id` | `text` | Sim | ID do vídeo na plataforma (ex: ID do YouTube). |
| `image_url` | `text` | Sim | Thumbnail. |
| `category` | `text` | Sim | Ex: 'Entrevistas', 'Análises'. |
| `published_at` | `timestamptz` | Sim | Data de lançamento. |

### 2.5. `public.editorials` (Editoriais / Edições)
Edições mensais ou temáticas (Dossiês).
*Referência: `src/pages/Editions.tsx`, `src/components/HeroCarousel.tsx`*

| Coluna | Tipo | Obrigatório | Descrição/Mapeamento Frontend |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Sim | PK. |
| `month_year` | `text` | Sim | Ex: "Janeiro 2024". (Pode ser `date` e formatado no front). |
| `theme` | `text` | Sim | Título do tema. Ex: "Liderança Consciente". |
| `summary` | `text` | Sim | Resumo do editorial. |
| `image_url` | `text` | Sim | Capa da edição. |
| `content` | `text` | Não | Texto completo de introdução ao editorial. |
| `pdf_url` | `text` | Não | Link para download do dossiê (se aplicável). |
| `published_at` | `timestamptz` | Sim | Data. |

### 2.6. `public.newsletters` (Edições da Newsletter)
Agregado de notícias enviadas semanalmente.
*Referência: `src/pages/Newsletters.tsx`*

| Coluna | Tipo | Obrigatório | Descrição/Mapeamento Frontend |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Sim | PK. |
| `title` | `text` | Sim | Ex: "Edição #42: O Futuro do Varejo". |
| `published_at` | `date` | Sim | Data de envio. |
| `synthesis` | `text` | Sim | Resumo "Sintese de Valor". |
| `cover_image` | `text` | Não | Imagem ilustrativa. |

### 2.7. `public.newsletter_items` (Relacionamento Newsletter <-> Notícias)
Define quais notícias compõem uma edição de newsletter.

| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `newsletter_id` | `uuid` | Sim | FK para `newsletters.id`. |
| `news_item_id` | `uuid` | Sim | FK para `news_items.id`. |
| `order` | `int` | Sim | Ordem de exibição na newsletter. |

### 2.8. `public.saved_items` (Itens Salvos)
Substitui o `localStorage` para persistência entre dispositivos.
*Referência: Botões "Salvar" e "No Acervo" em `Home.tsx`, `ArticleDetail.tsx`*

| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Sim | PK. |
| `user_id` | `uuid` | Sim | FK para `profiles.id`. |
| `item_type` | `text` | Sim | Enum: 'news', 'video', 'editorial', 'newsletter'. |
| `item_id` | `uuid` | Sim | ID do item salvo (Polimórfico ou colunas específicas FKs). |
| `created_at` | `timestamptz` | Sim | Para ordenação do "Acervo". |

*Nota: Para integridade referencial estrita, recomendo criar colunas específicas `news_id`, `video_id`, etc., todas nullable, com uma check constraint garantindo que apenas uma esteja preenchida.*

### 2.9. `public.advertiser_inquiries` (Leads Publicidade)
Armazena contatos feitos através da página de publicidade/contato.
*Referência: `src/types.ts (AdvertiserInquiry)`*

| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Sim | PK. |
| `first_name` | `text` | Sim | |
| `last_name` | `text` | Sim | |
| `job_title` | `text` | Sim | Cargo. |
| `company` | `text` | Sim | |
| `email` | `text` | Sim | |
| `interest_area` | `text` | Sim | Área de interesse selecionada. |
| `message` | `text` | Não | |
| `created_at` | `timestamptz` | Sim | |

### 2.10. `public.newsletter_subscriptions` (Leads Newsletter)
Assinantes da newsletter (pode ser integrado com provedor externo, mas bom manter registro).
*Referência: `src/types.ts (NewsletterSubscription)`*

| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Sim | PK. |
| `email` | `text` | Sim | Unique. |
| `first_name` | `text` | Não | |
| `last_name` | `text` | Não | |
| `active` | `boolean` | Sim | Default: true. |

## 3. Políticas de Segurança (RLS - Row Level Security)

Para garantir segurança total:

1.  **Leitura Pública**: Tabelas `news_items`, `videos`, `editorials`, `columnists`, `newsletters` (metadados) devem ter política `ENABLE SELECT FOR PUBLIC`.
    *   *Refinamento*: Se `is_premium` for true em `news_items`, a política deve checar se `auth.uid()` existe na tabela `profiles` com `subscription_status = 'premium'` (ou restringir via API/Edge Function para performance).
2.  **Dados de Usuário**: `profiles`, `saved_items` apenas acessíveis pelo próprio usuário (`auth.uid() = user_id`).
3.  **Leads (Escrita)**: `advertiser_inquiries` e `newsletter_subscriptions` devem permitir `INSERT` público (anônimo), mas `SELECT` apenas para admins.

## 4. Mapeamento de Dados Mockados para DB

Para migrar os dados atuais em `mcpClient.ts` para o banco:

- **Notícias ("O impacto da IA...")**: Inserir em `news_items`. `category`='Tecnologia', `source`='LinkedIn', `key_points`=['Redução...', ...].
- **Artigos/Colunistas (Ana Silva)**:
    - Criar registro em `columnists`.
    - Criar artigos em `news_items` vinculando `author_id` ao colunista.
- **Vídeos ("Entrevista: O futuro...")**: Inserir em `videos`.
- **Editoriais ("Liderança Consciente")**: Inserir em `editorials`.

Este esquema cobre 100% da aplicação atual, transformando todos os dados estáticos e `localStorage` em uma estrutura relacional robusta e escalável no Supabase.
