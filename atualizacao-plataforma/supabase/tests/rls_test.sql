-- Teste de RLS. Rodar depois de: stub + migration + seed.
\set ON_ERROR_STOP 1
insert into auth.users (id, email, raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111','aluno@x.com','{"full_name":"Aluno Ativo"}'),
 ('22222222-2222-4222-8222-222222222222','semacesso@x.com','{}'),
 ('33333333-3333-4333-8333-333333333333','admin@x.com','{"full_name":"Paulo Nesi"}'),
 ('44444444-4444-4444-8444-444444444444','vencido@x.com','{}');
update public.profiles set role='admin' where id='33333333-3333-4333-8333-333333333333';
insert into public.enrollments (user_id, status) values ('11111111-1111-4111-8111-111111111111','active');
insert into public.enrollments (user_id, status, expires_at) values ('44444444-4444-4444-8444-444444444444','active', now() - interval '1 day');
update public.lessons set published=false where position=4 and module_id='00000000-0000-4000-a000-000000000006';

create temp table resultados (teste text, ok boolean);
grant all on resultados to authenticated, anon;

-- ALUNO ATIVO
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
insert into resultados select 'aluno ve 6 modulos', (select count(*) from public.modules)=6;
insert into resultados select 'aluno ve 23 aulas (rascunho oculto)', (select count(*) from public.lessons)=23;
insert into resultados select 'aluno ve so a propria matricula', (select count(*) from public.enrollments)=1;
insert into public.lesson_progress (user_id, lesson_id) select auth.uid(), id from public.lessons limit 2;
insert into resultados select 'aluno grava progresso', (select count(*) from public.lesson_progress)=2;
do $$ begin
  begin insert into public.lesson_progress (user_id, lesson_id) select '22222222-2222-4222-8222-222222222222', id from public.lessons limit 1;
    insert into resultados values ('aluno NAO grava progresso de outro', false);
  exception when others then insert into resultados values ('aluno NAO grava progresso de outro', true); end;
  begin update public.profiles set role='admin' where id=auth.uid();
    insert into resultados values ('aluno NAO vira admin', false);
  exception when others then insert into resultados values ('aluno NAO vira admin', true); end;
  begin insert into public.enrollments (user_id) values (auth.uid());
    insert into resultados values ('aluno NAO cria matricula', false);
  exception when others then insert into resultados values ('aluno NAO cria matricula', true); end;
  begin insert into public.modules (position, slug, title) values (9,'x','x');
    insert into resultados values ('aluno NAO cria modulo', false);
  exception when others then insert into resultados values ('aluno NAO cria modulo', true); end;
end $$;
update public.profiles set full_name='Novo Nome' where id=auth.uid();
insert into resultados select 'aluno edita o proprio nome', (select full_name from public.profiles where id=auth.uid())='Novo Nome';
update public.profiles set full_name='Hack' where id='33333333-3333-4333-8333-333333333333';
reset role;
insert into resultados select 'aluno NAO edita nome de outro', (select full_name from public.profiles where id='33333333-3333-4333-8333-333333333333')='Paulo Nesi';

-- SEM MATRÍCULA
set role authenticated; select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
insert into resultados select 'sem matricula NAO ve modulos', (select count(*) from public.modules)=0;
insert into resultados select 'sem matricula NAO ve aulas', (select count(*) from public.lessons)=0;
insert into resultados select 'sem matricula NAO ve lives', (select count(*) from public.live_sessions)=0;
insert into resultados select 'sem matricula NAO ve progresso alheio', (select count(*) from public.lesson_progress)=0;
insert into resultados select 'sem matricula ve so o proprio perfil', (select count(*) from public.profiles)=1;
insert into resultados select 'sem matricula NAO ve link comunidade', (select count(*) from public.site_settings)=0;
reset role;

-- MATRÍCULA VENCIDA
set role authenticated; select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',false);
insert into resultados select 'vencido NAO ve aulas', (select count(*) from public.lessons)=0;
reset role;

-- ADMIN
set role authenticated; select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
insert into resultados select 'admin ve 24 aulas (inclui rascunho)', (select count(*) from public.lessons)=24;
insert into resultados select 'admin ve todas matriculas', (select count(*) from public.enrollments)=2;
insert into resultados select 'admin NAO ve progresso alheio', (select count(*) from public.lesson_progress)=0;
reset role;

-- ANÔNIMO
set role anon; select set_config('request.jwt.claim.sub','',false);
do $$ begin
  begin perform 1 from public.lessons; insert into resultados values ('anon NAO le aulas', false);
  exception when others then insert into resultados values ('anon NAO le aulas', true); end;
end $$;
reset role;

select ok, teste from resultados order by ok, teste;
select case when bool_and(ok) then 'TODOS OS TESTES PASSARAM' else 'FALHOU' end as resultado, count(*) from resultados;
