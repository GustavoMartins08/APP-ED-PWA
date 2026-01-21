# Especificação do Painel Administrativo - Empresário Digital

**Status:** RASCUNHO  
**Data:** 20 de Janeiro de 2026  
**Objetivo:** Definir a estrutura, funcionalidades e requisitos para o desenvolvimento do Painel Administrativo que gerenciará todo o conteúdo da plataforma **Empresário Digital**.

---

## 1. Visão Geral

O Painel Administrativo será uma aplicação frontend **separada** da plataforma principal (PWA), desenvolvida em React. Ela se conectará ao **mesmo projeto Supabase** já existente, permitindo que administradores gerenciem o conteúdo (Notícias, Vídeos, Editoriais, Colunistas) e visualizem dados de usuários e leads.

### 1.1. Arquitetura
- **Frontend App:** Aplicação React independente (ex: `admin.empresariodigital.com.br` ou subrota `/admin` protegida).
- **Backend:** Supabase (PostgreSQL + Auth + Storage).
- **Segurança:** Acesso restrito via Row Level Security (RLS) a usuários com `role = 'admin'`.

---

## 2. Autenticação e Controle de Acesso

### 2.1. Login
- **Método:** Autenticação via Email/Senha (usando Supabase Auth).
- **Validação de Permissão:** Após o login, a aplicação deve verificar na tabela `public.profiles` se o usuário logado possui `role === 'admin'`.
- **Bloqueio:** Se o usuário não for admin, redirecionar para uma página de "Acesso Negado" ou para a Home pública.

### 2.2. Gestão de Administradores
- **Funcionalidade:** Visualizar lista de usuários e promover/rebaixar permissões (Subscriber <-> Admin).
- **Tabela Relacionada:** `public.profiles`.

---

## 3. Dashboard (Visão Geral)

Ao logar, o administrador deve ver um resumo da plataforma:
*   **Métricas Rápidas:**
    *   Total de Usuários Cadastrados.
    *   Total de Assinantes Premium.
    *   Notícias Publicadas (Mês Atual).
    *   Leads de Publicidade Pendentes.
*   **Atalhos Rápidos:** Botões para "Nova Notícia", "Novo Vídeo", "Novo Editorial".

---

## 4. Gerenciamento de Conteúdo (CRUD)

O painel deve oferecer interfaces completas (Listagem, Criação, Edição, Exclusão) para cada tipo de conteúdo.

### 4.1. Notícias e Artigos (`news_items`)
Responsável pelo feed principal e artigos de colunistas.

**Funcionalidades:**
*   **Listagem:** Tabela com Título, Categoria, Autor (se houver), Data de Publicação, Status (Premium/Free).
    *   Filtros: Por Categoria, Por Autor, Por Status.
    *   Busca: Por título.
*   **Formulário de Criação/Edição:**
    *   `title` (Texto): Título da manchete.
    *   `slug` (Texto - *Gerar automaticamente do título mas permitir edição*).
    *   `excerpt` (Texto Longo): Resumo para o card.
    *   `content` (Rich Text Editor / Markdown): Conteúdo completo do artigo.
    *   `category` (Select): Tecnologia, Negócios, Startups, Carreira, etc.
    *   `source` (Select/Texto): Fonte original (LinkedIn, YouTube, Autoral).
    *   `author_id` (Select - *Opcional*): Selecionar um Colunista da tabela `columnists`.
    *   `image_url` (Upload de Imagem): Upload para Supabase Storage -> Bucket `news-images`.
    *   `is_premium` (Checkbox): Conteúdo exclusivo para assinantes?
    *   `key_points` (Lista Dinâmica): Adicionar/Remover frases de destaque (bullet points).
    *   `published_at` (Datetime): Agendamento ou data retroativa.

### 4.2. Vídeos (`videos`)
Gerenciamento do acervo de vídeos e briefings.

**Funcionalidades:**
*   **Listagem:** Thumbnail, Título, Plataforma, Duração.
*   **Formulário de Criação/Edição:**
    *   `title` (Texto).
    *   `description` (Texto Longo).
    *   `platform` (Select): YouTube, Vimeo.
    *   `external_id` (Texto): ID do vídeo na plataforma.
    *   `url` (Calculado ou Input): Link direto.
    *   `duration` (Texto): Ex: "12:30".
    *   `category` (Select): Entrevistas, Análises, Clipes.
    *   `image_url` (Upload de Imagem): Thumbnail customizada. Supabase Bucket `video-thumbs`.

### 4.3. Editoriais e Dossiês (`editorials`)
Gerenciamento das edições mensais (Capas Verticais).

**Funcionalidades:**
*   **Listagem:** Mês/Ano, Tema, Capa.
*   **Formulário de Criação/Edição:**
    *   `month_year` (Texto): Ex: "Fevereiro 2026".
    *   `theme` (Texto): Título do tema.
    *   `summary` (Texto Longo): Resumo da edição.
    *   `content` (Rich Text Editor): Texto introdutório.
    *   `image_url` (Upload de Imagem): Imagem vertical de alta qualidade. Bucket `editorial-covers`.
    *   `pdf_url` (Upload de Arquivo - *Opcional*): Arquivo PDF da edição. Bucket `editorial-files`.

### 4.5. Newsletters (`newsletters` e `newsletter_items`)
**Montagem de edições semanais e conteúdo exclusivo.**

**Fluxo de Trabalho:**
1.  **Criar Edição:** Define os dados básicos da newsletter.
2.  **Gerenciar Pauta:** Adiciona itens à newsletter (Curadoria ou Criação).

**Funcionalidades:**
*   **Listagem de Edições:** Título, Data, Síntese.
*   **Formulário de Edição (Capa):**
    *   `title` (Texto): Ex: "Edição #45".
    *   `published_at` (Data).
    *   `synthesis` (Texto Longo): O "Sintese de Valor" que aparece no card.
    *   `cover_image` (Upload): Imagem de capa.

*   **Gerenciador de Itens (Pauta):**
    *   Interface de *Drag & Drop* ou Lista Ordenável para definir a sequência das notícias.
    *   **Botão "Adicionar da Curadoria":** Abre um modal para buscar e selecionar notícias já publicadas no portal (`news_items` onde `visibility = 'public'`).
    *   **Botão "Criar Exclusivo":** Abre um formulário simplificado de Notícia para criar um conteúdo que **não** vai para o feed público.
        *   Ao salvar, o sistema cria um registro em `news_items` com `visibility = 'hidden'` e imediatamente o vincula a esta newsletter na tabela `newsletter_items`.

### 4.6. Colunistas (`columnists`)
Cadastro dos autores que podem assinar artigos.

**Funcionalidades:**
*   **Listagem:** Foto, Nome, Cargo, Empresa.
*   **Formulário de Criação/Edição:**
    *   `name` (Texto).
    *   `role` (Texto).
    *   `company` (Texto).
    *   `bio` (Texto Longo).
    *   `avatar_url` (Upload de Imagem): Foto de perfil. Bucket `avatars`.

---

## 5. Gerenciamento de Usuários e Leads

### 5.1. Usuários (`profiles`)
**Apenas Visualização e Edição de Permissões.**
*   **Listagem:** Email, Nome, Status Assinatura, Role, Data Cadastro.
*   **Ações:**
    *   Editar `role` (Promover a Admin).
    *   Visualizar dados básicos.

### 5.2. Leads de Publicidade (`advertiser_inquiries`)
**Leitura de contatos comerciais.**
*   **Listagem:** Data, Nome, Empresa, Email, Área de Interesse.
*   **Detalhes:** Visualizar a mensagem completa enviada pelo anunciante.
*   **Exportar:** Botão para exportar lista (CSV/Excel).

### 5.3. Assinantes Newsletter (`newsletter_subscriptions`)
*   **Listagem:** Email, Status (Ativo/Inativo).
*   **Ações:** Ativar/Desativar assinatura manualmente.

---

## 6. Requisitos Técnicos

### 6.1. Stack Tecnológico Sugerido
*   **Framework:** React (Vite) - Pode ser o mesmo monorepo ou projeto separado.
*   **UI Library:** Tailwind CSS + ShadcnUI (para tabelas, modais e formulários rápidos).
*   **Ícones:** Lucide React.
*   **Gerenciamento de Estado:** React Query (TanStack Query) - Essencial para cache e estados de loading/erro nas listagens.
*   **Formulários:** React Hook Form + Zod (validação).

### 6.2. Integração Supabase
*   Utilizar a biblioteca `@supabase/supabase-js`.
*   **Storage:** 
    *   Criar buckets públicos: `news-images`, `video-thumbs`, `editorial-covers`, `avatars`.
    *   Implementar função de upload que retorna a URL pública para salvar no banco.

### 6.3. RLS (Row Level Security)
Para que o painel funcione, o usuário logado deve ter permissão de escrita. As políticas de segurança já definidas no banco (`especificação banco de dados.MD`) preveem que apenas `role='admin'` pode fazer INSERT/UPDATE/DELETE em tabelas públicas globais.
*   **Check:** O frontend deve tratar erros de permissão (401/403) caso o token do usuário expire ou ele perca a permissão.

---

## 7. Próximos Passos para Implementação

1.  **Setup do Projeto:** Inicia o projeto React Admin.
2.  **Configuração Supabase:** Copiar `.env` e configurar cliente.
3.  **Login Admin:** Criar página de login e Contexto de Autenticação.
4.  **Layout Base:** Sidebar com navegação (Dashboard, Notícias, Vídeos, etc.).
5.  **CRUDs:** Implementar módulo por módulo (começando por Notícias).
6.  **Uploads:** Configurar buckets e componente de Drag & Drop.
