# Especificação Técnica: App PWA (Progressive Web App) - Empresário Digital

Este documento define as diretrizes técnicas e funcionais para a implementação do Progressive Web App (PWA) do projeto **Empresário Digital**. O objetivo é garantir uma experiência nativa, instalável, responsiva e resiliente (offline-first), hospedada na Vercel e conectada ao repositório GitHub.

## 1. Infraestrutura e Hospedagem (Vercel & GitHub)

A aplicação é hospedada na Vercel com CI/CD conectado ao GitHub. O PWA deve ser configurado para funcionar perfeitamente neste ambiente.

### 1.1. Configuração de Servidor (vercel.json)
Para garantir que o Service Worker e o Manifesto sejam servidos e atualizados corretamente:
*   **Headers de Cache**:
    *   `service-worker.js`: `Cache-Control: no-cache, no-store, must-revalidate` (Garante que o navegador sempre verifique se há nova versão do SW).
    *   `manifest.webmanifest`: `Cache-Control: public, max-age=0, must-revalidate`.
    *   Assets estáticos (JS/CSS com hash): `Cache-Control: public, max-age=31536000, immutable`.
*   **SPA Redirects**:
    *   Garantir que todas as rotas (exceto arquivos estáticos e API) sejam redirecionadas para `index.html` para permitir navegação via Service Worker e History API.

### 1.2. Pipeline de Build (GitHub Actions / Vercel)
*   O build deve gerar o SW e o manifesto dinamicamente baseados nos assets compilados.
*   Nenhuma variável de ambiente sensível deve ser exposta no manifesto ou SW.

---

## 2. Instalação e Compatibilidade (Cross-Device)

O App deve ser instalável em Android, iOS, iPadOS e Desktop (Windows/Mac/Linux).

### 2.1. Web App Manifest (manifest.webmanifest)
Campos obrigatórios para garantir a instalação ("Add to Home Screen"):
*   **`name`**: "Empresário Digital"
*   **`short_name`**: "Empresário"
*   **`start_url`**: `/?source=pwa` (Para rastreamento de acessos via PWA).
*   **`display`**: `standalone` (Remove barras do navegador, experiência de App).
*   **`background_color`**: `#111827` (Cor de fundo escura para evitar "flash" branco ao abrir).
*   **`theme_color`**: `#111827` (Integra a barra de status do sistema à cor do App).
*   **`orientation`**: `portrait-primary` (Bloquear em retrato se necessário, ou `any` para tablet).
*   **`icons`**:
    *   **Android/Desktop**: 192x192, 512x512 (PNG).
    *   **Maskable**: 512x512 com `purpose: maskable` (Para ícones adaptativos Android).

### 2.2. Suporte Específico para iOS (Apple)
O iOS tem requisitos adicionais fora do manifesto padrão que VITE-PWA deve injetar no `index.html`:
*   **Meta Tags**:
    *   `<meta name="apple-mobile-web-app-capable" content="yes">`
    *   `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
    *   `<meta name="apple-mobile-web-app-title" content="Empresário">`
*   **Touch Icons**:
    *   `<link rel="apple-touch-icon" href="/pwa-192x192.png">` (O iOS não lê o campo `icons` do manifesto para home screen em todas as versões).

---

## 3. Responsividade e UX Mobile (Design System)

O App deve se comportar como nativo em qualquer tamanho de tela, especialmente em dispositivos móveis.

### 3.1. Viewport e Áreas Seguras (Safe Areas)
*   **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">`
    *   `user-scalable=no`: Evita zoom acidental ao tocar rápido (comportamento de app nativo).
    *   `viewport-fit=cover`: Garante uso total da tela em iPhones com "notch" (recorte).
*   **CSS Safe Areas**:
    *   Utilizar `env(safe-area-inset-top)` para padding no topo (evita ficar atrás do relógio/notch).
    *   Utilizar `env(safe-area-inset-bottom)` para padding no rodapé (evita sobrepor a barra de gesto do iPhone).

### 3.2. Interações de Toque
*   **Tamanho de Toque**: Nenhum botão ou link deve ter área clicável menor que **44x44px**.
*   **Feedback Visual**: Todos os elementos interativos devem ter estado `:active` visível instantaneamente.
*   **Input Types**: Usar `type="email"`, `type="tel"`, `inputmode="numeric"` para abrir o teclado correto no celular.

---

## 4. Estratégias de Cache e Offline (Service Worker)

O App não pode mostrar a tela do "Dinossauro" quando offline. Ele deve permanecer funcional.

### 4.1. Estratégias de Cache (Workbox)
1.  **App Shell (Crítico)**: *Cache First*
    *   HTML raiz, JS bundles, CSS, Fontes, SVG ícones.
    *   Estes arquivos mudam pouco (apenas em novos deploys) e devem carregar instantaneamente.
2.  **Imagens de Conteúdo (Supabase Storage)**: *Stale While Revalidate*
    *   Tenta servir do cache imediatamente para performance.
    *   Em background, verifica se a imagem mudou (pela URL/ETag) e atualiza o cache para a próxima visita.
    *   Limite: Max Entries 100, Max Age 30 dias.
3.  **API Requests (Leitura)**: *Network First com Fallback para Cache*
    *   Tenta buscar dados frescos na rede.
    *   Se falhar (offline), busca a última versão salva no cache.
    *   Essencial para feeds de notícias, dashboards financeiras, etc.

### 4.2. Página de Fallback
*   Se o usuário tentar acessar uma rota não cacheada e estiver offline, exibir uma página customizada "Você está offline" (previamente cacheada), permitindo navegar para áreas disponíveis (ex: downloads salvos).

---

## 5. Persistência de Sessão e Autenticação (Supabase Auth)

O login deve ser mantido robustamente, minimizando a necessidade de re-login "irritante", sem comprometer a segurança.

### 5.1. Configuração do Cliente Supabase
*   **Armazenamento de Sessão**: Configurar explicitamente para usar `localStorage` (padrão em web, mas essencial confirmar para PWA).
    *   *Nota*: Cookies são menos confiáveis em PWAs instalados no iOS (WebKit), `localStorage` é mais estável para persistência de tokens JWT.
*   **Auto Refresh**: Habilitar `autoRefreshToken: true`. O Service Worker ou o cliente React deve renovar o token silenciosamente antes que ele expire.
*   **Persistência Offline**:
    *   O token de acesso (JWT) e o refresh token ficam no storage local.
    *   Ao abrir o app offline, o estado de "Logado" deve ser assumido com base na existência desses tokens locais, permitindo acesso imediato às telas cacheadas (Dashboard, etc.) sem tentar bater na API de Auth (que falharia).

### 5.2. Tratamento de Expiração
*   Se o token expirar enquanto o usuário está offline, não deslogar imediatamente. Manter o acesso "somente leitura" aos dados cacheados.
*   Solicitar re-login apenas quando a conexão voltar E a tentativa de refresh do token falhar.

---

## 6. Sincronização de Dados (Sync Engine)

Para garantir que o app funcione sem internet e não perca dados.

### 6.1. Leitura de Dados (SWR / React Query)
*   Utilizar bibliotecas como **TanStack Query** (React Query) com persister (ex: `createSyncStoragePersister`).
*   Isso salva automaticamente o estado das queries (cache da API) no `localStorage` ou `IndexedDB`.
*   Resultado: O usuário abre o app sem internet e vê os dados da última sessão instantaneamente.

### 6.2. Escrita de Dados (Mutações Offline)
*   Se o usuário realizar uma ação crítica (ex: Salvar uma transação, Marcar aula como vista) offline:
    1.  **Optimistic UI**: Atualizar a interface imediatamente como se tivesse funcionado.
    2.  **Queue (Fila)**: Adicionar a requisição a uma fila persistente no `localStorage` (ex: `offline_mutation_queue`).
    3.  **Background Sync**:
        *   Ouvir o evento `window.addEventListener('online', ...)`
        *   Quando a internet voltar, processar a fila sequencialmente.
        *   Notificar o usuário ("Dados sincronizados com sucesso" ou "Erro ao sincronizar").

---

## 7. Checklist de Implementação Técnica

### Arquivos para Criar/Atualizar:
1.  **`vite.config.ts`**: Configuração avançada do plugin `VitePWA` com estratégias de cache Workbox definidas.
2.  **`vercel.json`**: Configuração de headers de cache.
3.  **`src/App.tsx`**: Listeners para detecção de status online/offline.
4.  **`src/lib/supabase.ts`**: Configuração de persistência de sessão.
5.  **`index.html`**: Meta tags para iOS, splash screen e viewport.
6.  **`public/manifest.webmanifest`** (ou gerado via config): Definições completas de ícones e cores.
7.  **`src/components/ReloadPrompt.tsx`**: UI para atualizar o Service Worker quando houver novo deploy.

Esta especificação garante que o **Empresário Digital** seja um app de classe mundial: rápido, confiável e sempre disponível, independente da qualidade da conexão de internet do usuário.
