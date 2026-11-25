-- Permissões de tabela para a API (PostgREST).
-- Projetos Supabase novos não dão mais GRANT automático em tabelas do schema public
-- para anon/authenticated. Sem isso, toda consulta do app dá "permission denied",
-- mesmo com as políticas de RLS certas. O RLS continua decidindo QUAIS linhas cada um vê.
-- anon continua sem acesso a nenhuma tabela (a página pública usa a função verify_certificate).

grant usage on schema public to authenticated, service_role;

-- Perfis: todos leem (RLS filtra); só nome e foto podem ser editados (grant de coluna da base).
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- Conteúdo e configuração: membros leem; o RLS só libera escrita para admin.
grant select, insert, update, delete on
  public.enrollments,
  public.modules,
  public.lessons,
  public.live_sessions,
  public.site_settings,
  public.lesson_materials
to authenticated;

-- Dados do próprio aluno.
grant select, insert, update, delete on public.lesson_progress to authenticated;
grant select, insert, delete on public.live_reminders to authenticated;
grant select, insert, delete on public.lesson_comments to authenticated;

-- Certificado: só leitura; a emissão é pela função issue_certificate().
grant select on public.certificates to authenticated;

-- Chave secreta do servidor (painel admin).
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
