# Especificação de Analytics e KPIs - Painel Administrativo

Este documento detalha a implementação da visualização de dados e KPIs (Key Performance Indicators) no Dashboard Administrativo da Empresário Digital. O objetivo é fornecer aos administradores uma visão clara, em tempo real, da eficiência do site/app, monitoramento de tráfego, engajamento com conteúdo e conversão de usuários.

> **Nota:** Nenhuma alteração de código será feita neste momento. Este documento serve apenas como guia de implementação.

---

## 1. Visão Geral dos KPIs (Indicadores-Chave de Desempenho)

Ao acessar o painel administrativo (`/admin`), o administrador deverá visualizar os seguintes grupos de métricas:

### A. Métricas de Crescimento (Atuais + Melhorias)
*   **Total de Usuários Cadastrados:** (Já existente)
*   **Novos Usuários (Últimos 30 dias):** Gráfico de linha mostrando a taxa de crescimento diária.
*   **Conversão Gratuito -> Premium:** Taxa percentual de usuários que migraram para o plano pago.
*   **Churn Rate (Cancelamentos):** Quantos usuários cancelaram a assinatura no período.

### B. Métricas de Engajamento (Visitas e Acesso)
*   **Sessões Ativas (Tempo Real):** Número de usuários navegando no site/app *neste momento*.
*   **Visualizações de Página (Page Views):** Total de páginas acessadas (Diário/Semanal/Mensal).
*   **Dispositivos:** Gráfico de pizza (Mobile vs Desktop).
*   **Origem do Tráfego:** Direto, Google, Redes Sociais (baseado em referrer).

### C. Métricas de Conteúdo (Eficiência Editorial)
*   **Top 5 Notícias Mais Lidas:** Lista com títulos e contagem de visualizações.
*   **Engajamento com Newsletter:**
    *   Taxa de Abertura (Cliques na Newsletter).
    *   Downloads de PDF (se aplicável).
*   **Categorias Mais Populares:** Quais temas (Política, Economia, Tech) atraem mais leitores.

---

## 2. Alterações Necessárias no Banco de Dados (Supabase)

Para suportar essas métricas em tempo real, precisamos criar novas tabelas e alterar algumas existentes no Supabase.

### A. Novas Tabelas de Analytics

#### 1. `analytics_page_views` (Rastreamento de Navegação)
Tabela para armazenar cada carregamento de página.
*   `id`: uuid (PK)
*   `user_id`: uuid (FK -> profiles.id, nullable) - Para saber *quem* acessou, se logado.
*   `session_id`: uuid - Identificador único da sessão do navegador.
*   `path`: text - A URL acessada (ex: `/noticias/titulo-da-materia`).
*   `referrer`: text - De onde o usuário veio.
*   `device_type`: text - 'mobile', 'desktop', 'tablet'.
*   `created_at`: timestamp (default now()).

#### 2. `analytics_events` (Ações Específicas)
Tabela para cliques importantes e interações.
*   `id`: uuid (PK)
*   `user_id`: uuid (FK, nullable)
*   `event_name`: text - Ex: 'newsletter_click', 'pdf_download', 'signup_start', 'video_play'.
*   `event_label`: text - Ex: 'Edição Jan/2026', 'Video ID 123'.
*   `metadata`: jsonb - Dados extras do evento.
*   `created_at`: timestamp.

### B. Alterações em Tabelas Existentes

#### 1. `news_items`
*   **Adicionar coluna:** `view_count` (integer, default 0).
    *   *Uso:* Incrementado via RPC function (atomic update) cada vez que uma notícia é carregada, para evitar "locks" excessivos na tabela de logs.

#### 2. `newsletter_editions`
*   **Adicionar coluna:** `click_count` (integer, default 0).
*   **Adicionar coluna:** `pdf_download_count` (integer, default 0).

---

## 3. Segurança e Performance (Row Level Security & Functions)

Como os dados de analytics podem crescer rapidamente, a implementação deve ser eficiente.

*   **RLS (Policies):**
    *   `INSERT` nas tabelas `analytics_*`: Permitido para `public` (anon key), para que usuários não logados também contem nas estatísticas de visita.
    *   `SELECT` nas tabelas `analytics_*`: Restrito APENAS para `role = 'admin'` ou `role = 'service_role'`. Usuários comuns não podem ver os dados de tráfego.

*   **Database Functions (RPC):**
    *   `increment_news_view(news_id)`: Função para incrementar contador atomicamente (+1) sem precisar ler o registro antes.
    *   `get_dashboard_stats()`: Uma função agregadora que retorna um JSON com todos os contadores principais (Users, Premium, Views Hoje, Top News) em uma única requisição. Isso torna o carregamento do Dashboard instantâneo, evitando 10 requisições separadas do frontend.

---

## 4. Visualização no Frontend (Admin Dashboard)

Sugestão de componentes visuais para o arquivo `Dashboard.tsx`:

1.  **Cards de Resumo (Topo):**
    *   Manter os atuais (Usuários, Premium).
    *   Adicionar: **"Visualizações Hoje"** e **"Usuários Online"**.

2.  **Gráfico Principal (Linha - Recharts):**
    *   Eixo X: Últimos 7 ou 30 dias.
    *   Eixo Y: Quantidade.
    *   Linhas: Novos Usuários vs. Visualizações de Página.

3.  **Tabelas "Top Performers" (Lado a Lado):**
    *   **Notícias em Alta:** Lista das 5 notícias com mais views nas últimas 24h.
    *   **Últimos Eventos:** Log simples de ações recentes (ex: "Novo usuário Premium assinou").

---

## 5. Plano de Ação para Implementação

1.  **Backend:**
    *   Executar script SQL para criar tabelas `analytics_page_views` e `analytics_events`.
    *   Adicionar colunas `view_count` nas tabelas de conteúdo.
    *   Criar Policies RLS e Functions RPC.

2.  **Frontend (App):**
    *   Criar um hook global `useAnalytics` que dispara o insert em `analytics_page_views` na mudança de rota.
    *   Instrumentar cliques em botões chave (Download PDF, Play Video) com `analytics_events`.

3.  **Frontend (Admin):**
    *   Instalar biblioteca de gráficos (ex: `recharts` ou `chart.js`).
    *   Atualizar `Dashboard.tsx` para consumir a função `get_dashboard_stats`.
