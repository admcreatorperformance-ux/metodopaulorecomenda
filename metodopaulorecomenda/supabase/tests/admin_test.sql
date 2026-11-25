-- Teste das funções do painel. Rodar depois de rls_test.sql (usa os mesmos usuários).
\set ON_ERROR_STOP 1
create temp table r2 (teste text, ok boolean);
grant all on r2 to authenticated, anon;
set role authenticated; select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
insert into r2 select 'admin lista membros com e-mail', (select count(*) from public.admin_list_members() where email like '%@x.com')=4;
insert into r2 select 'admin acha usuario por e-mail', public.admin_find_user(' ALUNO@x.com ')='11111111-1111-4111-8111-111111111111';
reset role;
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
do $$ begin
  begin perform public.admin_list_members(); insert into r2 values ('aluno NAO lista membros', false);
  exception when others then insert into r2 values ('aluno NAO lista membros', true); end;
  begin perform public.admin_find_user('admin@x.com'); insert into r2 values ('aluno NAO busca e-mail', false);
  exception when others then insert into r2 values ('aluno NAO busca e-mail', true); end;
end $$;
reset role;
set role anon;
do $$ begin
  begin perform public.admin_list_members(); insert into r2 values ('anon NAO lista membros', false);
  exception when others then insert into r2 values ('anon NAO lista membros', true); end;
end $$;
reset role;
select ok, teste from r2 order by ok, teste;
select case when bool_and(ok) then 'ADMIN OK' else 'ADMIN FALHOU' end, count(*) from r2;
