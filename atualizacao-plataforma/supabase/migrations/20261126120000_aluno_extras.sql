-- Extras do aluno: materiais da aula, comentários, certificado e fotos de perfil.

-- ---------------------------------------------------------------------------
-- Materiais da aula (link externo ou arquivo no Storage privado "materiais")
-- ---------------------------------------------------------------------------
create table public.lesson_materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  kind text not null check (kind in ('link', 'file')),
  url text check (url is null or url ~ '^https://'),
  storage_path text,
  position int not null default 1,
  created_at timestamptz not null default now(),
  check ((kind = 'link' and url is not null) or (kind = 'file' and storage_path is not null))
);

create index lesson_materials_lesson_idx on public.lesson_materials (lesson_id, position);
alter table public.lesson_materials enable row level security;

-- Aluno vê material só de aula que ele consegue ver (a consulta em lessons passa pelo RLS dele).
create policy "materiais: membros leem" on public.lesson_materials
  for select to authenticated
  using (public.has_active_access() and exists (select 1 from public.lessons l where l.id = lesson_id));

create policy "materiais: admin gerencia" on public.lesson_materials
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Comentários nas aulas (um nível de resposta)
-- ---------------------------------------------------------------------------
create table public.lesson_comments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  parent_id uuid references public.lesson_comments (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index lesson_comments_lesson_idx on public.lesson_comments (lesson_id, created_at);
alter table public.lesson_comments enable row level security;

create policy "comentarios: membros leem" on public.lesson_comments
  for select to authenticated
  using (public.has_active_access() and exists (select 1 from public.lessons l where l.id = lesson_id));

create policy "comentarios: membro comenta como ele mesmo" on public.lesson_comments
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.has_active_access()
    and exists (select 1 from public.lessons l where l.id = lesson_id)
  );

-- Sem edição. Apaga: o autor ou a equipe (moderação).
create policy "comentarios: autor ou equipe apaga" on public.lesson_comments
  for delete to authenticated
  using (user_id = auth.uid() or public.is_staff());

revoke update on public.lesson_comments from authenticated;

-- Resposta só um nível: o pai precisa ser comentário raiz da mesma aula.
create or replace function public.check_comment_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent record;
begin
  if new.parent_id is null then
    return new;
  end if;
  select lesson_id, parent_id into parent from public.lesson_comments where id = new.parent_id;
  if parent is null or parent.lesson_id <> new.lesson_id or parent.parent_id is not null then
    raise exception 'Resposta inválida' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger lesson_comments_parent_check
  before insert on public.lesson_comments
  for each row execute function public.check_comment_parent();

-- ---------------------------------------------------------------------------
-- Certificado de conclusão
-- ---------------------------------------------------------------------------
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  lessons_completed int not null,
  issued_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

create policy "certificado: dono ou admin le" on public.certificates
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Emite o certificado só se o aluno concluiu todas as aulas publicadas. Pode chamar mais de uma vez.
create or replace function public.issue_certificate()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  total int;
  done int;
  cert_id uuid;
  name text;
begin
  if uid is null or not public.has_active_access() then
    raise exception 'Sem acesso' using errcode = '42501';
  end if;

  select id into cert_id from public.certificates where user_id = uid;
  if cert_id is not null then
    return cert_id;
  end if;

  select count(*) into total
  from public.lessons l join public.modules m on m.id = l.module_id
  where l.published and m.published;

  select count(*) into done
  from public.lesson_progress p
  join public.lessons l on l.id = p.lesson_id
  join public.modules m on m.id = l.module_id
  where p.user_id = uid and p.completed_at is not null and l.published and m.published;

  if total = 0 or done < total then
    raise exception 'Curso ainda não concluído (% de % aulas)', done, total using errcode = 'P0001';
  end if;

  select coalesce(nullif(btrim(full_name), ''), 'Aluno') into name from public.profiles where id = uid;

  insert into public.certificates (user_id, full_name, lessons_completed)
  values (uid, coalesce(name, 'Aluno'), done)
  returning id into cert_id;
  return cert_id;
end;
$$;

-- Verificação pública: qualquer pessoa com o código confere nome e data (sem e-mail).
create or replace function public.verify_certificate(p_id uuid)
returns table (full_name text, issued_at timestamptz, lessons_completed int)
language sql
stable
security definer
set search_path = ''
as $$
  select c.full_name, c.issued_at, c.lessons_completed from public.certificates c where c.id = p_id;
$$;

revoke execute on function public.issue_certificate() from public, anon;
grant execute on function public.issue_certificate() to authenticated;
revoke execute on function public.verify_certificate(uuid) from public;
grant execute on function public.verify_certificate(uuid) to anon, authenticated;

revoke all on public.lesson_materials, public.lesson_comments, public.certificates from anon;

-- ---------------------------------------------------------------------------
-- Storage: fotos de perfil (públicas) e materiais (privados, só membros)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('materiais', 'materiais', false)
on conflict (id) do nothing;

create policy "avatar: dono le" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatar: dono envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatar: dono troca" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatar: dono apaga" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "materiais: membros baixam" on storage.objects
  for select to authenticated
  using (bucket_id = 'materiais' and public.has_active_access());

create policy "materiais: admin envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'materiais' and public.is_admin());

create policy "materiais: admin troca" on storage.objects
  for update to authenticated
  using (bucket_id = 'materiais' and public.is_admin());

create policy "materiais: admin apaga" on storage.objects
  for delete to authenticated
  using (bucket_id = 'materiais' and public.is_admin());
