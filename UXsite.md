# Especificação de Melhorias de UX/UI e Performance

Este documento detalha o plano de implementação para elevar a qualidade visual, interativa e de performance da aplicação "Empresário Digital". O foco principal é a otimização para dispositivos móveis, velocidade de carregamento e refinamento estético.

---

## 1. Performance e Arquitetura (Prioridade Alta)

A base para uma boa UX é a velocidade. Atualmente, a aplicação utiliza Tailwind CSS via CDN, o que é inseguro para produção, impede otimizações de performance e causa "flashes" de conteúdo não estilizado.

### 1.1 Migração de Tailwind CDN para Build Local
- **Problema Atual:** O uso de `<script src="https://cdn.tailwindcss.com"></script>` bloqueia a renderização inicial e baixa o motor inteiro do Tailwind no navegador do cliente (megabytes de CSS desnecessário).
- **Solução Específica:**
    - Remover o script da CDN do `index.html`.
    - Configurar `postcss.config.js` e `tailwind.config.js` corretamente para processar o CSS localmente.
    - Importar as diretivas do Tailwind (`@tailwind base;`, etc.) no `index.css`.
    - Garantir que o `vite` processe o CSS, gerando um arquivo minificado e com "tree-shaking" (removendo classes não utilizadas) no build final.
    - **Resultado Esperado:** Redução drástica no tempo de carregamento inicial (LCP) e pontuação de Performance no Lighthouse próxima a 100.

### 1.2 Otimização de Imagens e Fontes
- **Fontes:** As fontes 'Plus Jakarta Sans' e 'Archivo' já estão sendo carregadas, mas devem usar a propriedade `font-display: swap` para garantir que o texto seja visível imediatamente, mesmo antes da fonte carregar.
- **Imagens:**
    - Implementar componentes que solicitem imagens já dimensionadas para o dispositivo (srcset) se o backend suportar.
    - Manter e reforçar o uso de `loading="lazy"` para imagens "abaixo da dobra" e `decoding="async"`.
    - Adicionar placeholders de baixa resolução (blurhash) enquanto a imagem de alta qualidade carrega para evitar layout shifts (CLS).

---

## 2. Responsividade Mobile-First (Foco Principal)

O layout deve ser pensado primeiro para a tela pequena, expandindo-se para telas maiores.

### 2.1 Área de Toque e Ergonomia
- **Áreas de Toque:** Garantir que todos os elementos interativos (botões, ícones, links) tenham uma área clicável (padding) mínima de **44x44px** (padrão Apple/Google). Isso evita "cliques fantasmas" ou erros.
- **Zona do Polegar:** Em mobile, posicionar ações críticas (como botões de "Salvar", "Compartilhar", "Voltar") na metade inferior da tela para facilitar o uso com uma mão.
- **Safe Areas:** Respeitar as "safe areas" de dispositivos modernos (áreas do notch e da barra de navegação inferior/home indicator). Garantir que o conteúdo não fique oculto atrás dessas barras (usar `env(safe-area-inset-bottom)` no CSS).

### 2.2 Navegação e Gestos
- **Menu Inferior (Bottom Navigation):** Se não houver, considerar mover a navegação principal para uma barra inferior fixa em mobile, ao invés de um menu "hambúrguer" no topo, para acesso imediato.
- **Gestos de Swiper:** Implementar gestos de deslizar (swipe) para:
    - Voltar entre páginas (se não for nativo do browser).
    - Dispensar modais (arrastar para baixo).
    - Alternar entre abas ou carrosséis de notícias.

---

## 3. UI e Design System

Refinamento visual para transmitir uma sensação "Premium" e moderna.

### 3.1 Tipografia e Hierarquia
- **Escala Modular:** Definir tamanhos de fonte responsivos (`text-base`, `text-lg`, `text-xl`) que escalam matematicamente. Em mobile, reduzir ligeiramente os títulos grandes (`h1`, `h2`) para evitar quebras de linha excessivas e desequilíbrio visual.
- **Espaçamento (Whitespace):** Aumentar o espaçamento entre seções em mobile. O "respiro" é fundamental para um design limpo. Usar múltiplos de 4px (sistema de grid de 8px).

### 3.2 Ícones e Elementos Visuais
- **Padronização:** Utilizar a biblioteca `lucide-react` com consistência.
    - Definir `stroke-width` (espessura) consistente (ex: 1.5px ou 2px) para todos os ícones para manter a leveza.
    - Garantir que ícones em botões tenham alinhamento óptico perfeito com o texto.
- **Estados dos Botões:**
    - Definir estados claros para: `default`, `hover`, `active` (pressionado), `disabled` e `loading`.
    - O estado `active` deve dar feedback tátil visual (leve redução de escala: `scale-95`).

### 3.3 Cores e Modo Escuro
- **Contraste:** Verificar se as cores de texto cinza claro (ex: datas, autores) passam nos testes de acessibilidade WCAG em telas de brilho reduzido (comum em economia de bateria).
- **Glassmorphism:** Utilizar efeitos de desfoque (`backdrop-blur`) sutil em elementos flutuantes como Header, Modais e Toasts para um visual moderno (estilo iOS).

---

## 4. Animações e Micro-interações

Animações devem ser intencionais e performáticas.

### 4.1 Transições de Página
- Adicionar transições suaves entre rotas (fade + leve slide up) para que a navegação pareça fluida e nativa de um app, não um reload de site.

### 4.2 Feedback Interativo
- **Micro-interações:**
    - Ao clicar em "Salvar", o ícone deve ter uma pequena animação de "pulo" ou preenchimento animado.
    - Inputs de formulário devem focar suavemente com transição de borda e sombra.
- **Skeleton Loading:** Substituir o spinner de carregamento (`LoadingFallback`) por telas de "Skeleton" (esqueletos pulsantes cinzas) que imitam o layout do conteúdo que vai chegar. Isso reduz a percepção de espera.

### 4.3 Performance de Animação
- Usar estritamente propriedades `transform` e `opacity` para animações. Evitar animar `width`, `height`, `margin` ou `top/left` que causam recálculos de layout pesados.

---

## 5. Melhorias Específicas Detectadas (Correções Imediatas)

1.  **NewsCard:**
    - **Hover:** O efeito de zoom na imagem deve ser sutil e suave (`duration-500`, `ease-out`).
    - **Sombra:** Suavizar as sombras (`shadow-sm` para `shadow-md` no hover) para não parecer "sujo".
    - **Texto:** Garantir `line-clamp` adequado para evitar que títulos longos quebrem o alinhamento dos cards vizinhos em grid.

2.  **Modais (ShareModal):**
    - Garantir que o modal bloqueie o scroll da página de fundo (`body-scroll-lock`) quando aberto, para evitar a sensação de "site solto" atrás.
    - Adicionar animação de entrada (slide up bottom em mobile, fade in + scale em desktop).

3.  **PWA (Progressive Web App):**
    - Verificar e personalizar a "Splash Screen" gerada.
    - Garantir que a `theme-color` no meta tag coincida com o header/fundo para evitar barras brancas/pretas do sistema operacional no topo e fundo.

---

## Resumo do Plano de Ação

1.  **Imediato:** Migrar Tailwind para build local (Critical Performance Fix).
2.  **Curto Prazo:** Padronizar componentes de UI (Botões, Ícones) e implementar Skeleton Loading.
3.  **Médio Prazo:** Revisão completa de responsividade (margins, paddings, safe-areas) e implementação de animações de transição de página.
