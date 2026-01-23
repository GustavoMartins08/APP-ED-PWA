# Especificação: Upload e Visualização de PDF (Dossiês/Edições)

Este documento descreve os requisitos para implementar o fluxo completo de gerenciamento e consumo de arquivos PDF para as Edições (Dossiês) do Empresário Digital.

## 1. Painel Administrativo (Upload)

### Requisitos Funcionais
1.  **Campo de Arquivo Específico**:
    *   No formulário de criação/edição de "Editorials" (Edições), deve haver um campo explícito para upload de arquivo PDF.
    *   Este campo é diferente da "Imagem de Capa". São dois assets distintos: Capa (JPG/PNG) e Conteúdo (PDF).
2.  **Storage (Supabase)**:
    *   Os arquivos devem ser salvos em um bucket privado ou protegido chamado `edition-pdfs`.
    *   O nome do arquivo deve ser sanitizado para evitar conflitos (ex: `uuid-nome-original.pdf`).
3.  **Persistência no Banco**:
    *   A tabela `editorials` deve ter uma coluna `pdf_url` (TEXT) para armazenar o link do arquivo.
4.  **UX do Admin**:
    *   Mostrar barra de progresso durante o upload (o PDF pode ser grande).
    *   Permitir substituir o PDF existente ao editar uma edição.

## 2. Página do Usuário (Visualização/Leitura)

### Requisitos Funcionais
1.  **Visualizador de PDF Integrado**:
    *   Na tela de detalhe da edição (`/edicao/:id`), o PDF deve ser carregado diretamente na página.
    *   NÃO deve ser apenas um botão de download. O usuário deve ler no app.
2.  **Navegação Horizontal (Swipe)**:
    *   **Mobile**: O usuário deve poder arrastar o dedo para o lado (swipe left/right) para mudar de página, como em um carrossel ou app de livros (Kindle).
    *   **Desktop**: Setas laterais de navegação ou scroll contínuo otimizado.
3.  **Performance (Lazy Loading)**:
    *   Não carregar o PDF inteiro de uma vez se for muito pesado. Renderizar páginas sob demanda é o ideal (usando `react-pdf` ou similar).
4.  **Responsividade**:
    *   O PDF deve se ajustar à largura da tela do dispositivo (‘width: 100%’).

## 3. Checklist Técnico para Implementação

### Banco de Dados & Storage
- [ ] Criar bucket `edition-pdfs` no Supabase Storage.
- [ ] Configurar políticas RLS para o bucket (Admin: All, Auth: Read, Public: Read).
- [ ] Adicionar coluna `pdf_url` na tabela `editorials` (se não existir).

### Backend (Admin Component)
- [ ] Atualizar `EditorialForm.tsx` para incluir input de file (accept=".pdf").
- [ ] Implementar lógica de upload para o bucket `edition-pdfs`.
- [ ] Salvar a URL pública retornada no campo `pdf_url` do banco.

### Frontend (User Viewer)
- [ ] Instalar biblioteca de renderização de PDF (ex: `react-pdf` ou `pdfjs-dist`).
- [ ] Criar componente `PDFReader.tsx`.
    - [ ] Implementar controles de página (anterior/próxima).
    - [ ] Implementar gestos de touch (swipe) para mobile.
- [ ] Integrar `PDFReader` na página `EditionDetail`.
