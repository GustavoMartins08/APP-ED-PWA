# Coisas a Serem Melhoradas - Auditoria Completa 360º

Este documento contém uma análise técnica e de produto detalhada sobre a aplicação "Empresário Digital", identificando pontos de melhoria em UX, Funcionalidades, Performance e Banco de Dados.

## 1. Funcionalidades Pendentes e Melhorias de Produto

### A. Notificações Push (PWA)
**Status**: Ausente.
**Impacto**: Alto (Retenção).
**Ação**: Implementar Firebase Cloud Messaging (FCM) ou OneSignal. O Service Worker atual suporta cache offline, mas não "re-engajamento". O app precisa solicitar permissão e enviar alertas de "Nova Edição Disponível".

### B. Modo Offline Real (Sincronização)
**Status**: Parcial (Cache básico de Assets).
**Ação**: O app carrega se tiver internet. Se cair a conexão, os dados antigos não são exibidos de forma robusta.
*   **Melhoria**: Implementar persistência local (IndexedDB) para armazenar os últimos JSONs baixados de `fetchLatestNews` e `fetchEditorials`. Se offline, ler do IndexedDB.

### C. Busca Global
**Status**: Ausente.
**Ação**: Adicionar uma lupa no Header. O usuário deve conseguir pesquisar por "Inteligência Artificial" e receber resultados mistos (Notícias, Vídeos, Colunas) em uma única listagem.

### D. Analytics do Admin
**Status**: Básico.
**Ação**: O Dashboard atual lista atalhos. Deveria exibir métricas reais:
*   Total de usuários cadastrados (Free vs Premium).
*   Notícia mais lida da semana.
*   Número de cliques no botão "Assine Já".

---

## 2. Experiência do Usuário (UX/UI)

### A. Feedback de Carregamento (Skeleton Universal)
**Status**: Implementado apenas na Home.
**Problema**: Ao navegar para `/videos` ou `/newsletters`, o usuário vê uma tela branca ou loading simples antes dos cards.
**Correção**: Reutilizar o componente `Skeleton` criado para a Home em **todas** as páginas de listagem.

### B. Tratamento de Erros (Empty States)
**Status**: Genérico.
**Problema**: Se a busca retornar vazio ou der erro de conexão, o app mostra mensagens técnicas ou vazias.
**Correção**: Criar componentes visuais "Empty State" bonitos (ex: ícone de caixa vazia, texto "Nada encontrado, tente outro termo").

### C. Navegação Admin -> App
**Status**: **Corrigido** (Botão Sair agora vai para Perfil).
**Melhoria Adicional**: Adicionar um botão flutuante ou link no Menu do Usuário "Acessar Painel Admin" visível *apenas* se `role=admin`, para evitar ter que digitar a URL manualmente.

---

## 3. Banco de Dados e Backend (Supabase)

### A. Índices de Performance
**Análise**: As queries principais ordenam por `published_at` e filtram por `is_premium` ou `category`.
**Risco**: Conforme a tabela `news_items` crescer para milhares de registros, a Home ficará lenta.
**Ação**: Criar índices compostos no Supabase:
```sql
CREATE INDEX idx_news_published_premium ON news_items (published_at DESC, is_premium);
CREATE INDEX idx_news_category ON news_items (category);
```

### B. Segurança de Dados (Row Level Security)
**Análise**: As políticas atuais protegem a escrita.
**Melhoria**: Validar se a coluna `subscription_status` em `profiles` está realmente bloqueada para edição pelo próprio usuário (apenas `service_role` ou admin deve mudar status para 'premium'). Risco de "hack" de assinatura se a RLS permitir update no próprio profile sem restrição de coluna.

### C. Limpeza Automática
**Ação**: Criar uma *Cron Job* no Supabase (pg_cron) para deletar Leads antigos (ex: `advertiser_inquiries`) após 90 dias, mantendo o banco leve e em conformidade com LGPD (se aplicável).

---

## 4. Qualidade de Código (Manutenibilidade)

### A. Tipagem Estrita
**Problema**: Algumas interfaces em `types.ts` podem divergir do banco real se não forem geradas automaticamente.
**Ação**: Configurar `supabase gen types typescript` para gerar as definições diretamente do esquema do banco, garantindo 100% de sincronia sempre que o banco mudar.

### B. Componentização de Listas
**Problema**: Há repetição de lógica de Grid/Listagem em `Newsletters.tsx`, `VideosPage.tsx` e `Editions.tsx`.
**Ação**: Criar um componente genérico `<ContentGrid items={...} renderItem={...} />` para padronizar espaçamentos, esqueletos e empty states.

### C. Remove Mock Data
**Verificação**: Confirmar se **todos** os arquivos `.tsx` removeram completamente as variáveis `const mockData = [...]`. Dados hardcoded aumentam o bundle e confundem manutenção.
*   *Nota: `EditionDetail.tsx` tinha mocks recentemente. Verificar se foi totalmente limpo.*

---

## Resumo das Prioridades

1.  **Imediato**: Aplicar Skeletons nas páginas internas (`/videos`, `/newsletters`).
2.  **Curto Prazo**: Índices no Banco de Dados e "Link para Admin" no perfil do admin.
3.  **Médio Prazo**: Busca Global e Notificações Push.
