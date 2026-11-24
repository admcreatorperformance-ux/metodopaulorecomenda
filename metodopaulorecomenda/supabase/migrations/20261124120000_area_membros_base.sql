-- Área de Membros | Método Paulo Recomenda
-- Base: perfis, matrículas, módulos, aulas, progresso, lives, lembretes e configurações.
-- Regra de acesso: conteúdo só para quem tem matrícula ativa (ou é da equipe).
-- Escrita em conteúdo e matrículas: só admin (ou service_role, ex.: webhook de pagamento).

-- ---------------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'aluno'
    check (role in ('aluno', 'mentor', 'moderador', 'admin')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Dados públicos do membro dentro da área (sem e-mail).';

-- Cria o perfil automaticamente quando um usuário é criado no Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Matrículas (quem comprou / quem tem acesso)
-- ---------------------------------------------------------------------------
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product text not null default 'metodo-paulo-recomenda',
  status text not null default 'active'
    check (status in ('active', 'canceled', 'refunded', 'expired')),
  source text not null default 'manual',
  external_id text,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product)
);

create index enrollments_user_idx on public.enrollments (user_id);
create unique index enrollments_source_external_idx
  on public.enrollments (source, external_id) where external_id is not null;

-- ---------------------------------------------------------------------------
-- Funções de permissão (security definer para não cair em recursão de RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('mentor', 'moderador', 'admin')
  );
$$;

create or replace function public.has_active_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_staff() or exists (
    select 1 from public.enrollments e
    where e.user_id = auth.uid()
      and e.status = 'active'
      and e.starts_at <= now()
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.has_active_access() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.has_active_access() to authenticated;

-- ---------------------------------------------------------------------------
-- Conteúdo
-- ---------------------------------------------------------------------------
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  position int not null,
  slug text not null unique,
  title text not null,
  description text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  position int not null,
  title text not null,
  description text not null default '',
  video_provider text not null default 'youtube'
    check (video_provider in ('youtube', 'vimeo', 'panda', 'bunny')),
  video_id text,
  duration_seconds int,
  thumbnail_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (module_id, position)
);

create index lessons_module_idx on public.lessons (module_id, position);

create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index lesson_progress_recent_idx on public.lesson_progress (user_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- Lives e gravações
-- ---------------------------------------------------------------------------
create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  host_name text not null default 'Paulo Nesi',
  starts_at timestamptz not null,
  ends_at timestamptz,
  join_url text,
  status text not null default 'agendada'
    check (status in ('agendada', 'ao_vivo', 'encerrada')),
  recording_provider text
    check (recording_provider in ('youtube', 'vimeo', 'panda', 'bunny')),
  recording_video_id text,
  recording_thumbnail_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index live_sessions_starts_idx on public.live_sessions (starts_at);

create table public.live_reminders (
  user_id uuid not null references auth.users (id) on delete cascade,
  live_id uuid not null references public.live_sessions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, live_id)
);

-- ---------------------------------------------------------------------------
-- Configurações (link da comunidade etc.)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.live_sessions enable row level security;
alter table public.live_reminders enable row level security;
alter table public.site_settings enable row level security;

-- Perfis: cada um vê o próprio; membros com acesso veem os outros (lista da comunidade).
create policy "perfil: ler o proprio ou comunidade" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_active_access());

-- Perfil: o membro só pode editar nome e foto (role fica protegido pelo grant de coluna abaixo).
create policy "perfil: editar o proprio" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "perfil: admin gerencia" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke update on public.profiles from authenticated, anon;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- Matrículas: o membro só lê as próprias. Escrita: admin ou service_role (webhook).
create policy "matricula: ler a propria" on public.enrollments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "matricula: admin gerencia" on public.enrollments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Módulos e aulas: membros com acesso leem o que está publicado; admin vê e edita tudo.
create policy "modulos: membros leem publicados" on public.modules
  for select to authenticated
  using ((published and public.has_active_access()) or public.is_admin());

create policy "modulos: admin gerencia" on public.modules
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "aulas: membros leem publicadas" on public.lessons
  for select to authenticated
  using (
    (published
      and public.has_active_access()
      and exists (select 1 from public.modules m where m.id = module_id and m.published))
    or public.is_admin()
  );

create policy "aulas: admin gerencia" on public.lessons
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Progresso: cada membro só lê e grava o próprio, e só em aula que ele consegue ver.
create policy "progresso: ler o proprio" on public.lesson_progress
  for select to authenticated
  using (user_id = auth.uid());

create policy "progresso: inserir o proprio" on public.lesson_progress
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.has_active_access()
    and exists (select 1 from public.lessons l where l.id = lesson_id)
  );

create policy "progresso: atualizar o proprio" on public.lesson_progress
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.has_active_access());

create policy "progresso: apagar o proprio" on public.lesson_progress
  for delete to authenticated
  using (user_id = auth.uid());

-- Lives
create policy "lives: membros leem publicadas" on public.live_sessions
  for select to authenticated
  using ((published and public.has_active_access()) or public.is_admin());

create policy "lives: admin gerencia" on public.live_sessions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "lembretes: ler o proprio" on public.live_reminders
  for select to authenticated
  using (user_id = auth.uid());

create policy "lembretes: criar o proprio" on public.live_reminders
  for insert to authenticated
  with check (user_id = auth.uid() and public.has_active_access());

create policy "lembretes: apagar o proprio" on public.live_reminders
  for delete to authenticated
  using (user_id = auth.uid());

-- Configurações
create policy "config: membros leem" on public.site_settings
  for select to authenticated
  using (public.has_active_access());

create policy "config: admin gerencia" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Anônimo não acessa nada da área.
revoke all on all tables in schema public from anon;

-- ---------------------------------------------------------------------------
-- RPC: marca presença (lista "Online agora")
-- ---------------------------------------------------------------------------
create or replace function public.touch_last_seen()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set last_seen_at = now() where id = auth.uid();
$$;

revoke execute on function public.touch_last_seen() from public, anon;
grant execute on function public.touch_last_seen() to authenticated;
