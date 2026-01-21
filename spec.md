# Especificação Geral da Plataforma - Empresário Digital

**Status:** Em Desenvolvimento Ativo  
**Data:** 21 de Janeiro de 2026

Este documento unifica a visão técnica da plataforma **Empresário Digital**, consolidando especificações de Frontend, Backend, PWA e Painel Administrativo. Ele serve como a "verdade única" sobre o estado atual e os próximos passos.

---

## 1. Visão Geral do Produto
A plataforma é um hub de inteligência de mercado e conteúdo premium para empresários. Funciona como uma aplicação Web Progressiva (PWA) instalável, oferecendo notícias, artigos de colunistas, vídeos e editoriais mensais.

### Funcionalidades Chave:
- **Feed de Notícias:** Curadoria de notícias rápidas e artigos de opinião.
- **Vídeos e Entrevistas:** Conteúdo audiovisual exclusivo.
- **Editoriais (Dossiês):** Edições mensais temáticas (ex: "Liderança Consciente").
- **Assinatura:** Modelo Freemium/Premium, restringindo acesso a conteúdos exclusivos.
- **Acervo Pessoal:** Funcionalidade de "Salvar" itens para leitura posterior.
- **PWA:** Instalação nativa em mobile/desktop e suporte offline preliminar.

---

## 2. Arquitetura Técnica

### 2.1. Frontend (PWA)
- **Framework:** React 19 + Vite.
- **Linguagem:** TypeScript.
- **Estilização:** Tailwind CSS + Animações customizadas.
- **Rotas (React Router v7):**
    - `/` (Home): Feed principal, Destaques, Carrossel de Vídeos e Editoriais.
    - `/ultimas-noticias`: Feed cronológico completo.
    - `/newsletters` & `/newsletter/:id`: Arquivo de newsletters.
    - `/edicoes`: Galeria de editoriais passados.
    - `/videos`: Acervo de vídeos.
    - `/colunas`: Lista de colunistas e seus artigos.
    - `/artigo/:id`: Leitura detalhada de notícias/artigos.
    - `/perfil`: Gestão de conta e itens salvos.
    - `/subscribe-premium`: Landing page de vendas.
    - `/login`: Autenticação e cadastro.

### 2.2. Backend (Supabase)
O projeto utiliza o Supabase como Backend-as-a-Service (BaaS).

**Status do Banco de Dados:**
- **Projeto ID:** `mzknvirbhibmcixmuqbq`
- **Tabelas Criadas e Validadas:**
    - `profiles`: Dados do usuário e Role (admin/subscriber).
    - `news_items`: Notícias e Artigos (com flag `is_premium`).
    - `columnists`: Autores dos artigos.
    - `videos`: Conteúdo audiovisual.
    - `editorials`: Dossiês mensais.
    - `newsletters` & `newsletter_items`: Edições enviadas.
    - `saved_items`: Favoritos do usuário.
    - `advertiser_inquiries` & `newsletter_subscriptions`: Leads.
- **Dados:** Atualmente as tabelas estão **VAZIAS (0 registros)**. O frontend pode estar operando com dados mockados localmente até que o banco seja populado.

### 2.3. PWA (Progressive Web App)
- **Status:** Fundação implementada.
- **Manifest:** Configurado para instalação (Standalone, Ícones, Cores).
- **Service Worker:** Gerado via `vite-plugin-pwa` (Cache de assets estáticos e fontes).
- **Offline:** Componente `ReloadPrompt` avisa sobre updates.
- **Pendente:** Sincronização de dados offline (Sync) para garantir que o usuário veja notícias cacheadas sem internet.

---

## 3. Painel Administrativo
**Status:** Especificado (Não Iniciado).

O gerenciamento de conteúdo hoje exigiria inserção direta no banco de dados. Um painel admin deve ser criado (projeto React separado ou rota `/admin` protegida) para permitir que editores publiquem conteúdo sem tocar no SQL.

**Requisitos (Resumo):**
- Login restrito a `role='admin'`.
- CRUD de Notícias (Rich Text), Vídeos, Editoriais e Colunistas.
- Visualização de Leads de Publicidade.

---

## 4. Análise de Lacunas (Gap Analysis)

### 4.1. Conexão Frontend <-> Backend
Existe uma discrepância de convenção de nomes entre o Frontend (CamelCase) e o Banco (Snake_case).
- **Frontend types.ts:** `imageUrl`, `authorId`, `monthYear`.
- **Supabase DB:** `image_url`, `author_id`, `month_year`.
**Ação Necessária:** Ajustar as queries do Supabase no frontend para fazer o alias (ex: `select('image_url:imageUrl')`) ou atualizar os tipos TypeScript para bater com o banco (recomendado usar gerador de tipos do Supabase).

### 4.2. Dados
O banco está vazio. A aplicação parecerá "quebrada" ou exibirá states de "Nenhum conteúdo encontrado" se conectada agora sem migração dos dados mockados.
**Ação Necessária:** Criar scripts de seed ou usar o MCP para popular o banco com os dados iniciais.

### 4.3. Funcionalidade "Salvar"
A lógica de salvar itens localmente (`localStorage`) deve ser migrada para a tabela `saved_items` quando o usuário estiver logado, mantendo a sincronia entre dispositivos.

---

## 5. Próximos Passos (Roteiro sugerido)

1.  **Popular Banco de Dados:** Inserir dados de teste/iniciais em todas as tabelas principais.
2.  **Refinar Integração DB:** Atualizar chamadas API no frontend para mapear corretamente snake_case -> camelCase e tratar estados de loading/erro.
3.  **Desenvolver Painel Admin:** Iniciar o desenvolvimento da interface administrativa para gestão contínua.
4.  **Aprimorar PWA:** Implementar lógica de cache de dados (API responses) para leitura offline.
