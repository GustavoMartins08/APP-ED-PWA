-- CRIAÇÃO DE BUCKETS
insert into storage.buckets (id, name, public)
values ('edition-pdfs', 'edition-pdfs', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('editorial-covers', 'editorial-covers', true)
on conflict (id) do nothing;

-- REMOVER POLÍTICAS ANTIGAS (PARA EVITAR CONFLITOS NA RECRIACÃO)
drop policy if exists "Public Access PDF" on storage.objects;
drop policy if exists "Authenticated Upload PDF" on storage.objects;
drop policy if exists "Public Access Covers" on storage.objects;
drop policy if exists "Authenticated Upload Covers" on storage.objects;

-- POLÍTICAS DE SEGURANÇA (RLS) - PDFs
create policy "Public Access PDF"
  on storage.objects for select
  using ( bucket_id = 'edition-pdfs' );

create policy "Authenticated Upload PDF"
  on storage.objects for insert
  with check ( bucket_id = 'edition-pdfs' and auth.role() = 'authenticated' );
  
create policy "Authenticated Update PDF"
  on storage.objects for update
  with check ( bucket_id = 'edition-pdfs' and auth.role() = 'authenticated' );

-- POLÍTICAS DE SEGURANÇA (RLS) - Capas (Covers)
create policy "Public Access Covers"
  on storage.objects for select
  using ( bucket_id = 'editorial-covers' );

create policy "Authenticated Upload Covers"
  on storage.objects for insert
  with check ( bucket_id = 'editorial-covers' and auth.role() = 'authenticated' );

create policy "Authenticated Update Covers"
  on storage.objects for update
  with check ( bucket_id = 'editorial-covers' and auth.role() = 'authenticated' );

-- CORREÇÃO DA TABELA (CASO FALTE A COLUNA)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'editorials' and column_name = 'pdf_url') then
        alter table public.editorials add column pdf_url text;
    end if;
end
$$;
