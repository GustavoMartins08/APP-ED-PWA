# Especificação de Melhorias UX/UI e Performance

Este documento detalha o plano de implementação para elevar a experiência do usuário (UX), refinar a interface (UI) e otimizar radicalmente a performance do app "Empresário Digital". O foco é eliminar a sensação de lentidão, corrigir falhas visuais de carregamento (glitches) e garantir uma navegação fluida em mobile.

## 1. Diagnóstico de Performance e UX

### 1.1 O Problema do "Cache / Banner Antigo"
**Sintoma:** Ao abrir o app, o usuário vê um banner com informações genéricas (ex: "INTELIGÊNCIA SINTETIZADA") que subitamente troca para o conteúdo real.
**Causa:** O componente `HeroCarousel` é renderizado imediatamente com dados "default" (hardcoded) enquanto a requisição de rede (`fetchLatestNews`) ainda está em andamento. Não é um problema de cache do navegador, mas sim uma estratégia de inicialização incorreta que exibe dados fictícios como se fossem reais.
**Solução Planejada:** Implementar estado de carregamento explícito (Skeleton Loading) no Banner Principal.

### 1.2 Lentidão ao Arrastar (Drag)
**Sintoma:** A animação do carrossel parece "pesada" ou atrasada ao tentar arrastar com o dedo.
**Causa:** A implementação atual detecta apenas o *final* do movimento (evento `onTouchEnd`) para trocar o slide. Não há feedback visual durante o movimento do dedo (1:1 finger tracking), criando uma desconexão cognitiva que o usuário percebe como lentidão. Além disso, a transição CSS de `1000ms` é muito lenta para interação tátil.
**Solução Planejada:** Reescrever a lógica de gestos para acompanhar o dedo em tempo real e reduzir o tempo de transição após o soltar.

### 1.3 Banco de Dados e Latência
**Diagnóstico:**
- Falta de índices em chaves estrangeiras (Foreign Keys), o que torna queries de junção (JOINs) lentas conforme a base cresce.
- Políticas de Segurança (RLS) duplicadas (ex: "Enable ALL" + política específica), fazendo o banco verificar permissões duas vezes para cada linha.

---

## 2. Plano de Implementação: Frontend (UX & Motion)

> **Diretriz:** Manter a identidade visual atual que foi aprovada. O foco é comportamento, física e refinamento.

### 2.1 Otimização do Hero Carousel (Prioridade Máxima)
**Objetivo:** Tornar o banner instantâneo e fluido.
- **Remover Hardcoded Defaults:** O componente nunca deve iniciar com título/imagem genérica se os dados ainda não chegaram.
- **Implementar Skeleton Premium:** Criar um Skeleton específico para o Banner que simule a estrutura exata (Título Grande, Categoria, Botão) com uma animação de "shimmer" sutil e escura (dark mode), para evitar o "flash" branco.
- **Física de Arraste (Swipe Physiology):**
  - Implementar *tracking* em tempo real: conforme o usuário arrasta o dedo, o slide deve se mover pixels correspondentes.
  - Adicionar resistência elástica nas bordas (quando não há mais slides).
  - Reduzir duração da animação automática de troca para `500ms` ou `600ms` com curva de Bezier `cubic-bezier(0.25, 1, 0.5, 1)` para sensação de "snap" rápido e suave.
- **Preload de Imagens:** A imagem do primeiro slide deve ter prioridade máxima de carregamento (`<link rel="preload">` ou `priority` prop) para afetar o LCP (Largest Contentful Paint).

### 2.2 Micro-interações e Feedback Visual
- **Feedback de Toque:** Adicionar estado `active` (scale 0.98) instantâneo em todos os cards e botões ao tocar, para confirmar que o clique foi registrado antes da navegação ocorrer.
- **Lazy Loading Inteligente:** Manter o ` IntersectionObserver` atual, mas aumentar a margem de disparo (`rootMargin`) para que o conteúdo carregue *antes* de entrar na tela, evitando que o usuário veja áreas em branco "chegando".
- **Transições de Página:** Suavizar a entrada de novas rotas. Em vez de um corte seco, o conteúdo novo deve fazer um leve `fade-in` (ex: 200ms).

### 2.3 Melhorias de Layout Mobile
- **Áreas de Toque:** Aumentar a área clicável dos botões de navegação lateral (setas) no mobile, ou removê-las em favor de indicadores de paginação (bolinhas) mais visíveis, já que o *swipe* será o principal método.
- **Fontes em Mobile:** Revisar tamanhos de fonte H1/H2 em telas < 375px para evitar quebras de linha que ocupem verticalmente mais de 40% da tela inicial.

---

## 3. Plano de Implementação: Performance e Database

As alterações abaixo devem ser aplicadas DIRETAMENTE no Supabase via SQL Editor para sanar gargalos invisíveis.

### 3.1 Índices de Banco de Dados (Database Indexing)
O banco atual reporta chaves estrangeiras sem índices, o que degrada a performance de *joins*.
**Ação:** Criar índices para as seguintes colunas:
1. `analytics_events(user_id)`
2. `analytics_page_views(user_id)`
3. `editorial_items(news_item_id)` e `editorial_items(edition_id)`
4. `newsletter_items_rel(news_item_id)` e `newsletter_items_rel(edition_id)`
5. `newsletter_subscriptions(user_id)` (se houver)

### 3.2 Otimização de RLS (Row Level Security)
**Problema:** Tabelas como `profiles` e `videos` possuem múltiplas políticas permissivas sobrepostas (ex: uma policy libera tudo, outra libera leitura pública).
**Ação:**
- Unificar políticas redundantes.
- Garantir que tabelas públicas (como `news_items`, `videos`) tenham uma única política `Enable Read Access for All` otimizada, sem verificar `auth.uid()` se não for necessário.

### 3.3 Cache Strategy (Frontend)
- **SWR / React Query:** (Sugestão Futura) Migrar do `useEffect` manual para bibliotecas de data-fetching que gerenciam cache, revalidação e background fetching automaticamente.
- **Correção Imediata:** Garantir que o `useEffect` do `Home.tsx` não "limpe" o estado dos dados anteriores se a nova requisição falhar, mas mostre um indicador de "atualizando" discreto.

---

## 4. Roteiro de Execução (Checklist)

### Fase 1: Correção Visual e UX (Frontend)
- [ ] **HeroCarousel:** Remover dados estáticos iniciais.
- [ ] **HeroCarousel:** Adicionar prop `isLoading` e renderizar Skeleton enquanto `true`.
- [ ] **HeroCarousel:** Refatorar lógica de touch para usar `transform: translateX` dinâmico durante o arraste.
- [ ] **CSS:** Atualizar todas as transições de `1000ms` para `500ms-600ms` em elementos interativos.
- [ ] **App.tsx:** Implementar `Suspense` com um Loading visualmente compatível com o design do app (não apenas spin) nas trocas de rota.

### Fase 2: Performance de Dados (Supabase)
- [ ] Executar script SQL de criação de índices (Index Creation).
- [ ] Revisar e consolidar Policies RLS para `profiles`, `videos` e `news_items`.
- [ ] Verificar logs de *Slow Queries* no Supabase após 24h de uso.

### Fase 3: Polimento Final
- [ ] Auditoria Lighthouse/PageSpeed no Mobile. Meta: Performance > 90.
- [ ] Teste de Stress no Swipe do carrossel (garantir que não trava a thread principal).

---
*Este documento serve como guia estrito para as próximas etapas de desenvolvimento. Nenhuma alteração visual de estilo (cores, fontes) está autorizada, apenas layout, comportamento e infraestrutura.*
