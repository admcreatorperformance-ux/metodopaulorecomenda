-- Testes de materiais, comentários, certificado e storage. Rodar depois de rls_test.sql.
\set ON_ERROR_STOP 1
\set aluno '11111111-1111-4111-8111-111111111111'
\set semacesso '22222222-2222-4222-8222-222222222222'
\set admin '33333333-3333-4333-8333-333333333333'
create temp table r3 (teste text, ok boolean);
grant all on r3 to authenticated, anon;

-- Material e comentário do admin (como postgres) na 1ª aula publicada do módulo 1
insert into public.lesson_materials (lesson_id, title, kind, url)
select id, 'Planilha', 'link', 'https://exemplo.com/planilha' from public.lessons where position = 1 and module_id = '00000000-0000-4000-a000-000000000001';
insert into public.lesson_materials (lesson_id, title, kind, url)
select id, 'Rascunho', 'link', 'https://exemplo.com/r' from public.lessons where published = false limit 1;
insert into public.lesson_comments (lesson_id, user_id, body)
select id, :'admin', 'Bem-vindos!' from public.lessons where position = 1 and module_id = '00000000-0000-4000-a000-000000000001';

-- ALUNO
set role authenticated; select set_config('request.jwt.claim.sub', :'aluno', false);
insert into r3 select 'aluno ve material de aula publicada', (select count(*) from public.lesson_materials where title = 'Planilha') = 1;
insert into r3 select 'aluno NAO ve material de aula rascunho', (select count(*) from public.lesson_materials where title = 'Rascunho') = 0;
insert into r3 select 'aluno ve comentario', (select count(*) from public.lesson_comments) = 1;
insert into public.lesson_comments (lesson_id, body, parent_id)
select lesson_id, 'Obrigado!', id from public.lesson_comments where body = 'Bem-vindos!';
insert into r3 select 'aluno responde', (select count(*) from public.lesson_comments where body = 'Obrigado!') = 1;
do $$ begin
  begin
    insert into public.lesson_comments (lesson_id, body, parent_id) select lesson_id, 'Resposta da resposta', id from public.lesson_comments where body = 'Obrigado!';
    insert into r3 values ('aluno NAO responde resposta (1 nivel)', false);
  exception when others then insert into r3 values ('aluno NAO responde resposta (1 nivel)', true); end;
  begin
    insert into public.lesson_comments (lesson_id, user_id, body) select lesson_id, '33333333-3333-4333-8333-333333333333', 'falso' from public.lesson_comments limit 1;
    insert into r3 values ('aluno NAO comenta em nome de outro', false);
  exception when others then insert into r3 values ('aluno NAO comenta em nome de outro', true); end;
  begin
    update public.lesson_comments set body = 'editado' where body = 'Obrigado!';
    insert into r3 values ('aluno NAO edita comentario', false);
  exception when others then insert into r3 values ('aluno NAO edita comentario', true); end;
  begin
    perform public.issue_certificate();
    insert into r3 values ('certificado NAO sai sem concluir', false);
  exception when others then insert into r3 values ('certificado NAO sai sem concluir', true); end;
  begin
    insert into storage.objects (bucket_id, name) values ('avatars', '33333333-3333-4333-8333-333333333333/foto.png');
    insert into r3 values ('aluno NAO envia foto na pasta de outro', false);
  exception when others then insert into r3 values ('aluno NAO envia foto na pasta de outro', true); end;
  begin
    insert into storage.objects (bucket_id, name) values ('materiais', 'x/arquivo.pdf');
    insert into r3 values ('aluno NAO envia material', false);
  exception when others then insert into r3 values ('aluno NAO envia material', true); end;
end $$;
delete from public.lesson_comments where body = 'Bem-vindos!';
insert into storage.objects (bucket_id, name) values ('avatars', '11111111-1111-4111-8111-111111111111/foto.png');
insert into r3 select 'aluno envia a propria foto', (select count(*) from storage.objects where bucket_id = 'avatars') = 1;
reset role;
insert into r3 select 'aluno NAO apaga comentario do admin', (select count(*) from public.lesson_comments where body = 'Bem-vindos!') = 1;

-- ADMIN: envia material, modera comentário
set role authenticated; select set_config('request.jwt.claim.sub', :'admin', false);
insert into storage.objects (bucket_id, name) values ('materiais', 'aula1/guia.pdf');
delete from public.lesson_comments where body = 'Obrigado!';
reset role;
insert into r3 select 'admin envia material', (select count(*) from storage.objects where bucket_id = 'materiais') = 1;
insert into r3 select 'admin apaga comentario de aluno', (select count(*) from public.lesson_comments where body = 'Obrigado!') = 0;

-- SEM MATRÍCULA
set role authenticated; select set_config('request.jwt.claim.sub', :'semacesso', false);
insert into r3 select 'sem matricula NAO ve material', (select count(*) from public.lesson_materials) = 0;
insert into r3 select 'sem matricula NAO ve comentario', (select count(*) from public.lesson_comments) = 0;
insert into r3 select 'sem matricula NAO baixa arquivo', (select count(*) from storage.objects where bucket_id = 'materiais') = 0;
reset role;

-- CERTIFICADO: aluno conclui tudo
insert into public.lesson_progress (user_id, lesson_id, completed_at)
select :'aluno', l.id, now() from public.lessons l join public.modules m on m.id = l.module_id where l.published and m.published
on conflict (user_id, lesson_id) do update set completed_at = now();
set role authenticated; select set_config('request.jwt.claim.sub', :'aluno', false);
create temp table cert as select public.issue_certificate() as id;
grant select on cert to anon, authenticated;
insert into r3 select 'certificado sai ao concluir tudo', (select id from cert) is not null;
insert into r3 select 'segunda emissao devolve o mesmo', public.issue_certificate() = (select id from cert);
reset role;
set role authenticated; select set_config('request.jwt.claim.sub', :'semacesso', false);
insert into r3 select 'outro usuario NAO le certificado alheio', (select count(*) from public.certificates) = 0;
reset role;
set role anon; select set_config('request.jwt.claim.sub', '', false);
insert into r3 select 'verificacao publica mostra nome', (select full_name from public.verify_certificate((select id from cert))) = 'Novo Nome';
reset role;

select ok, teste from r3 order by ok, teste;
select case when bool_and(ok) then 'EXTRAS OK' else 'EXTRAS FALHOU' end, count(*) from r3;
