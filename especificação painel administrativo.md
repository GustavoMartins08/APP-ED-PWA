# Especificação do Painel Administrativo - Empresário Digital

**Status:** PRONTO PARA DESENVOLVIMENTO
**Data:** 22 de Janeiro de 2026
**Banco de Dados:** Conectado ao projeto Supabase existente (`mzknvirbhibmcixmuqbq`).

---

## 1. Visão Geral e Arquitetura

O Painel Administrativo ("Backoffice") será integrado diretamente na aplicação React existente como um **módulo de rota protegida** (`/admin`).

### 1.1. Estrutura de Rotas
*   **Aplicação Principal (Pública/Assinantes):** Rotas `/`, `/noticias`, `/videos`, etc. Acessível a todos (com bloqueios de conteúdo Premium).
*   **Painel Administrativo (Privado):** Rota `/admin/*`.
    *   **Proteção:** Um componente `AdminRoute` verifica se o usuário logado possui `role === 'admin'`. Se não, redireciona para `/`.
    *   **Layout:** O `/admin` terá um layout exclusivo (Sidebar lateral em vez de Header de navegação), focado em densidade de dados.

### 1.2. Estratégia Mobile & PWA
Como o Admin é parte da mesma aplicação PWA:
*   **Instalação:** Ao instalar o PWA "Empresário Digital", o administrador instala **ambos** (App Público + Admin).
*   **Acesso Mobile:**
    *   O admin abre o PWA instalado.
    *   Se estiver logado como admin, o Menu Principal ganha um botão extra **"Acessar Admin"**.
    *   Ao clicar, a UI transiciona para o layout do Backoffice dentro do mesmo app.
    *   Isso permite gerenciar o portal *on-the-go* sem precisar de um segundo app instalado.

### 1.3. Stack Tecnológica
*   **Frontend:** React (Vite) + Tailwind CSS (Projeto Atual).
*   **UI Kit:** ShadcnUI (recomendado para consistência e velocidade).
*   **Ícones:** Lucide React.
*   **Dados:** Supabase Client (`@supabase/supabase-js`) conectando ao projeto existente.
*   **Gerenciamento de Estado:** TanStack Query (React Query) para cache e otimização.

---

## 2. Autenticação e Segurança

### 2.1. Tela de Login
*   **Visual:** Minimalista, logo "Empresário Digital".
*   **Campos:** Email e Senha.
*   **Ação:**
    1.  Autenticar via `supabase.auth.signInWithPassword`.
    2.  Verificar na tabela `public.profiles` se o `user.id` retornado possui o campo `role` igual a `'admin'`.
    3.  **Crucial:** Se `role !== 'admin'`, realizar logout imediato e exibir erro "Acesso não autorizado".

---

## 3. Dashboard Principal

Visão macro do negócio ao entrar no sistema.

*   **KPIs (Cards no topo):**
    *   **Usuários Totais:** `count` da tabela `profiles`.
    *   **Assinantes Premium:** `count` onde `subscription_status = 'premium'`.
    *   **Leads de Publicidade:** `count` da tabela `advertiser_inquiries` (novos/total).
    *   **Newsletter:** Próximo envio agendado.
*   **Ações Rápidas (Botões):**
    *   "Nova Notícia"
    *   "Novo Vídeo"
    *   "Criar Edição Mensal"

---

## 4. Gestão de Conteúdo (CMS)

### 4.1. Notícias e Artigos (`news_items`)
O coração do conteúdo diário.

**Interface de Listagem:**
*   **Tabela:** Imagem (Thumb), Título, Autor, Categoria, Status (Premium/Free), Data.
*   **Filtros:** Por Categoria, Por Status (Premium/Free), Busca por Título.

**Interface de Edição/Criação:**
1.  **Manchete e SEO:**
    *   `Título` (Input Texto).
    *   `Slug` (Input Texto - *Gerar automático a partir do título, editável*).
    *   `Resumo/Excerpt` (Textarea - Limite ~200 chars).
2.  **Conteúdo:**
    *   `Corpo do Texto` (Rich Text Editor - Tiptap ou Quill).
    *   `Pontos Chave (Key Points)`: Lista dinâmica. Botão "+ Adicionar Ponto" cria novos inputs de texto para os bullets do card.
3.  **Mídia e Classificação:**
    *   `Imagem de Capa`: Upload (Bucket `news-images`). Preview da imagem.
    *   `Categoria`: Select (Tecnologia, Negócios, Startups, etc.).
    *   `Fonte`: Select/Input (LinkedIn, Autoral, etc.).
    *   `Autor`: Select (Busca na tabela `columnists`). Se vazio, assume "Redação".
4.  **Configurações:**
    *   `Conteúdo Premium?` (Switch/Toggle).
    *   `Visibilidade`: "Público" (Feed) ou "Oculto" (Exclusivo Newsletter).
    *   `Data de Publicação`: Datepicker.

### 4.2. Editoriais e Dossiês (`editorials` + `editorial_items`)
Gerenciamento das edições mensais (ex: "Janeiro 2026 - O Futuro da IA").

**Fluxo de 2 Etapas:**

**Etapa 1: A Edição (Capa)**
*   Dados da tabela `editorials`.
*   Campos: `Mês/Ano`, `Tema (Título)`, `Resumo`, `Imagem de Capa Vertical`, `Introdução (Texto)`, `PDF (Upload)`.

**Etapa 2: O Dossiê (Conteúdo)**
*   Dentro da tela de detalhes da Edição, haverá uma seção **"Artigos desta Edição"**.
*   **Funcionamento:** Gerencia a tabela `editorial_items`.
*   **Interface:**
    *   **Lista Atual:** Mostra os artigos vinculados, com *drag-and-drop* para reordenar (campo `order`).
    *   **Adicionar Artigo:** Um botão abre um modal com buscador de artigos (`news_items`). O admin seleciona quais notícias compõem este dossiê.

### 4.3. Newsletters (`newsletters` + `newsletter_items`)
Montagem das newsletters semanais.

**Fluxo Semelhante aos Editoriais:**
1.  **Dados Gerais:** Título ("Edição #42"), Data, Síntese, Imagem de Capa.
2.  **Pauta (Curadoria):**
    *   Seção para vincular notícias à newsletter (tabela `newsletter_items`).
    *   Permite selecionar notícias *já existentes* no acervo ou *criar novas notícias ocultas* especificamente para esta newsletter.

### 4.4. Vídeos (`videos`)
Acervo de briefings visuais.

**Interface de Edição:**
*   `Título` e `Descrição`.
*   `Plataforma`: YouTube/Vimeo.
*   `ID Externo`: Ex: 'dQw4w9WgXcQ'.
*   `Duração`: Input texto (ex: "10:35").
*   `Categoria`: Select.
*   `Thumbnail`: Upload customizado (Bucket `video-thumbs`).

### 4.5. Colunistas (`columnists`)
Cadastro de autores.

**Interface:**
*   `Nome`, `Cargo`, `Empresa`.
*   `Bio`: Texto curto.
*   `Avatar`: Upload de foto redonda (Bucket `avatars`).

---

## 5. CRM e Leads

### 5.1. Assinantes da Newsletter (`newsletter_subscriptions`)
Base de contatos capturados pelos formulários "Assinar Agora" e "Acesso Premium".

**Interface de Listagem:**
*   **Tabela Rica:**
    *   Nome Completo (União de `first_name` + `last_name`).
    *   Email.
    *   **Empresa** (Novo campo).
    *   **Cargo** (Novo campo).
    *   **WhatsApp** (Novo campo `phone`).
    *   Status (Ativo/Inativo).
*   **Exportação:** Botão "Exportar CSV" no topo da tabela para uso em ferramentas de Email Marketing.

### 5.2. Anunciantes (`advertiser_inquiries`)
Leads B2B interessados em publicidade.

**Interface:**
*   Listagem com data de contato, nome, empresa e **Área de Interesse**.
*   Clique na linha abre modal/gaveta com a **Mensagem Completa** do lead.

### 5.3. Usuários da Plataforma (`profiles`)
Gestão de acesso.

**Interface:**
*   Listagem de todos os usuários logados.
*   **Coluna "Permissão":** Dropdown para alterar de 'subscriber' para 'admin' (e vice-versa).
*   **Coluna "Assinatura":** Visualizar se é Free ou Premium.

---

## 6. Bancos de Imagens (Storage)

O painel deve abstrair a complexidade do Storage.
*   Ao fazer upload de uma imagem (Capa de Notícia, Avatar, etc.), o sistema deve:
    1.  Fazer upload para o bucket correto no Supabase.
    2.  Obter a URL pública (`getPublicUrl`).
    3.  Salvar essa URL no campo de texto correspondente no banco de dados.

---

## 7. Requisitos Visuais (UI/UX)

*   **Tema:** Usar o mesmo DNA "Premium/Dark" ou "Clean/Corporate" do site principal, mas focado em produtividade (fundo branco/cinza claro para facilitar leitura de dados).
*   **Feedback:** Toasts de sucesso ("Notícia salva com sucesso") e erro para todas as ações.
*   **Loading:** Skeletons em tabelas enquanto os dados carregam.

---

## 8. Glossário de Tabelas (Referência Rápida)

*   `news_items`: Artigos em geral.
*   `editorials`: Capas das edições mensais.
*   `editorial_items`: Ligação N:N entre Editoriais e Artigos (Onde "mora" a curadoria do mês).
*   `newsletters`: Capas das newsletters.
*   `newsletter_items`: Ligação N:N entre Newsletters e Artigos (A pauta da semana).
*   `profiles`: Usuários e Admins.
*   `newsletter_subscriptions`: Leads B2C.
*   `advertiser_inquiries`: Leads B2B.
