-- Liberação automática de acesso pelas vendas da Greenn (webhook).
-- O endpoint /api/webhooks/greenn roda no servidor com a chave secreta (service_role).
-- Aqui ficam: o registro de cada aviso recebido (auditoria) e a busca de usuário por e-mail.

-- ---------------------------------------------------------------------------
-- Registro dos avisos recebidos
-- ---------------------------------------------------------------------------
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'greenn',
  received_at timestamptz not null default now(),
  event_type text,            -- sale | contract
  status text,                -- currentStatus enviado pela plataforma
  email text,
  product_id text,
  external_id text,           -- id da venda ou do contrato na plataforma
  result text not null,       -- liberado | bloqueado | ignorado | erro
  detail text,
  payload jsonb not null
);

create index webhook_events_received_idx on public.webhook_events (received_at desc);
create index webhook_events_email_idx on public.webhook_events (lower(email));

alter table public.webhook_events enable row level security;

-- Só o admin lê (pelo painel); quem grava é o servidor com a chave secreta.
create policy "webhooks: admin le" on public.webhook_events
  for select to authenticated
  using (public.is_admin());

revoke all on public.webhook_events from anon, authenticated;
grant select on public.webhook_events to authenticated;
grant all on public.webhook_events to service_role;

-- ---------------------------------------------------------------------------
-- Busca do usuário pelo e-mail (só para o servidor)
-- ---------------------------------------------------------------------------
create or replace function public.service_find_user(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.id from auth.users u where lower(u.email) = lower(trim(p_email)) limit 1;
$$;

revoke execute on function public.service_find_user(text) from public, anon, authenticated;
grant execute on function public.service_find_user(text) to service_role;
