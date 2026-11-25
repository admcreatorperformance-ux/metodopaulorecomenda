-- Painel admin: funções de leitura de membros (e-mail vem de auth.users, que o app não lê direto).
-- Só admin consegue usar; qualquer outro recebe erro.

create or replace function public.admin_list_members()
returns table (
  user_id uuid,
  email text,
  full_name text,
  role text,
  enrollment_status text,
  expires_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, p.full_name, p.role, e.status, e.expires_at, p.last_seen_at, u.created_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.enrollments e on e.user_id = u.id and e.product = 'metodo-paulo-recomenda'
    order by u.created_at desc;
end;
$$;

create or replace function public.admin_find_user(p_email text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores' using errcode = '42501';
  end if;
  return (select u.id from auth.users u where lower(u.email) = lower(trim(p_email)) limit 1);
end;
$$;

revoke execute on function public.admin_list_members() from public, anon;
revoke execute on function public.admin_find_user(text) from public, anon;
grant execute on function public.admin_list_members() to authenticated;
grant execute on function public.admin_find_user(text) to authenticated;

-- Mantém updated_at das matrículas em dia.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger enrollments_touch_updated_at
  before update on public.enrollments
  for each row execute function public.touch_updated_at();
