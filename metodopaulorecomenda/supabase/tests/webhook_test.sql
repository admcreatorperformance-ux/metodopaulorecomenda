-- Testes do registro de webhooks e da busca de usuário. Rodar depois de rls_test.sql.
\set ON_ERROR_STOP 1
\set aluno '11111111-1111-4111-8111-111111111111'
\set admin '33333333-3333-4333-8333-333333333333'
create temp table r4 (teste text, ok boolean);
grant all on r4 to authenticated, anon, service_role;

insert into public.webhook_events (event_type, status, email, result, payload)
values ('sale', 'paid', 'comprador@x.com', 'liberado', '{}');

-- Servidor (service_role): acha usuário pelo e-mail, sem diferenciar maiúsculas
set role service_role;
insert into r4 select 'servidor acha usuario por e-mail', public.service_find_user('  ALUNO@x.com ') = '11111111-1111-4111-8111-111111111111';
insert into r4 select 'servidor: e-mail sem conta = null', public.service_find_user('ninguem@x.com') is null;
insert into r4 select 'servidor grava evento', true from (select 1) x;
insert into public.webhook_events (event_type, result, payload) values ('sale', 'ignorado', '{}');
insert into public.enrollments (user_id, product, status, source, external_id)
values ('44444444-4444-4444-8444-444444444444', 'metodo-paulo-recomenda', 'active', 'greenn', 'venda-1')
on conflict (user_id, product) do update set status = 'active', source = 'greenn', external_id = 'venda-1';
insert into r4 select 'servidor libera matricula', exists (select 1 from public.enrollments where external_id = 'venda-1' and status = 'active');
reset role;

-- Aluno: não acha usuário, não lê nem grava eventos
select set_config('request.jwt.claim.sub', :'aluno', false);
set role authenticated;
do $$ begin
  begin perform public.service_find_user('admin@x.com'); insert into r4 values ('aluno NAO busca usuario', false);
  exception when insufficient_privilege then insert into r4 values ('aluno NAO busca usuario', true); end;
  begin insert into public.webhook_events (result, payload) values ('liberado', '{}'); insert into r4 values ('aluno NAO grava evento', false);
  exception when insufficient_privilege then insert into r4 values ('aluno NAO grava evento', true); end;
end $$;
insert into r4 select 'aluno NAO le eventos', count(*) = 0 from public.webhook_events;
reset role;

-- Visitante sem login
set role anon;
do $$ begin
  begin perform public.service_find_user('admin@x.com'); insert into r4 values ('anon NAO busca usuario', false);
  exception when insufficient_privilege then insert into r4 values ('anon NAO busca usuario', true); end;
  begin perform count(*) from public.webhook_events; insert into r4 values ('anon NAO le eventos', false);
  exception when insufficient_privilege then insert into r4 values ('anon NAO le eventos', true); end;
end $$;
reset role;

-- Admin lê os eventos
select set_config('request.jwt.claim.sub', :'admin', false);
set role authenticated;
insert into r4 select 'admin le eventos', count(*) >= 2 from public.webhook_events;
reset role;

select ok, teste from r4 order by ok, teste;
select case when bool_and(ok) then 'TODOS OS TESTES PASSARAM' else 'FALHOU' end as resultado, count(*) from r4;
