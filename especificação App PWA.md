# Especificação para Criação do App PWA (Progressive Web App)

Este documento descreve os requisitos e o plano de implementação para transformar o projeto **Empresário Digital** em um PWA instalável, com suporte offline e integração otimizada com o banco de dados Supabase.

## 1. Visão Geral
O objetivo é permitir que os usuários instalem o aplicativo em seus dispositivos (mobile e desktop) diretamente pelo navegador, oferecendo uma experiência nativa (ícone na home screen, splash screen, sem barra de navegação do browser) e garantir funcionamento básico mesmo sem conexão à internet.

## 2. Tecnologias Base
Como o projeto utiliza **Vite** + **React**, a solução recomendada é utilizar o plugin oficial:
- **`vite-plugin-pwa`**: Automatiza a geração do Service Worker e do Manifesto.

## 3. Requisitos do Manifesto (manifest.json)
Para que o navegador habilite o prompt de instalação, o manifesto deve conter:

*   **`name`**: "Empresário Digital" (ou nome final do produto)
*   **`short_name`**: Nome curto para o ícone (ex: "Empresário")
*   **`description`**: Breve descrição do app.
*   **`theme_color`**: Cor da barra de status (ex: `#000000` ou a cor primária do tema).
*   **`background_color`**: Cor de fundo da splash screen (ex: `#ffffff` ou dark mode).
*   **`display`**: `"standalone"` (para remover a UI do navegador).
*   **`scope`**: `/`
*   **`start_url`**: `/`
*   **`icons`**:
    *   192x192 (PNG) - Ícone padrão.
    *   512x512 (PNG) - Ícone de alta resolução.
    *   512x512 (PNG, `purpose: 'maskable'`) - Para Android (ícones adaptativos).

## 4. Service Worker e Cache (Offline Support)
O Service Worker será responsável por interceptar requisições e servir arquivos do cache quando offline.

*   **Estratégia de Cache**:
    *   **Assets Estáticos (JS, CSS, Imagens Locais)**: *CacheFirst* (Carrega do cache, atualiza em background).
    *   **Imagens Externas (Supabase Storage)**: *StaleWhileRevalidate* (Mostra cache se existir, busca novo em background).
    *   **Páginas de Navegação**: Cachear a estrutura do App Shell.

## 5. Integração com Banco de Dados (Supabase) e Sincronização
Para garantir que o app funcione offline "combinado com o banco de dados", precisamos de uma camada intermediária de persistência, pois o cliente padrão do Supabase requer conexão ativa.

### Estratégia de Dados Offline:
1.  **Persistência Local**:
    *   Utilizar `localStorage` ou `IndexedDB` para salvar os últimos dados carregados (ex: lista de vídeos, edições recentes).
    *   Ao abrir o app sem internet, exibir os dados locais com um indicador visual de "Modo Offline".

2.  **Sincronização (Sync)**:
    *   **Leitura**: Ao recuperar conexão, o app deve revalidar os dados locais com o Supabase.
    *   **Escrita (Ações do Usuário)**: Se o usuário tentar salvar algo offline (ex: marcar uma aula como vista), a ação deve ser salva em uma "Fila de Sincronização" no LocalStorage.
    *   **Background Sync**: Assim que a conexão voltar (evento `online` do window), processar a fila e despachar as requisições para o Supabase.

## 6. Plano de Implementação (Passo a Passo)

### Passo 1: Configuração do Vite PWA
- Instalar `vite-plugin-pwa`.
- Configurar `vite.config.ts` para gerar o manifesto e registrar o Service Worker.

### Passo 2: Geração de Assets
- Criar ícones do app em todas as resoluções necessárias.
- Adicionar ao diretório `public`.

### Passo 3: Componente de Atualização (ReloadPrompt)
- Criar um componente visual (Toast/Notification) que avisa o usuário quando uma nova versão do app está disponível e pede para recarregar a página.

### Passo 4: UI de Instalação Customizada
- (Opcional) Criar um botão "Instalar App" dentro do menu de configurações que dispara o evento `beforeinstallprompt` (apenas Chrome/Android), facilitando a instalação para usuários leigos.

### Passo 5: Camada de Dados Offline
- Implementar hooks customizados (ou usar TanStack Query com persistência) para gerenciar o cache dos dados do Supabase.

## 7. Arquivos Necessários (Checklist)
- [ ] `vite.config.ts` (Atualização com plugin PWA)
- [ ] `public/pwa-192x192.png`
- [ ] `public/pwa-512x512.png`
- [ ] `public/maskable-icon-512x512.png`
- [ ] `src/ReloadPrompt.tsx` (Componente de aviso de update)
- [ ] `src/service-worker.ts` (Se optar por estratégia customizada além da automática)
