-- Seed de DESENVOLVIMENTO (roda no `supabase db reset` local; não roda em produção).
-- Textos entre [colchetes] são placeholders do layout: trocar pelo conteúdo real.

insert into public.modules (id, position, slug, title, description, published) values
  ('00000000-0000-4000-a000-000000000001', 1, 'comecar-do-jeito-certo', 'Começar do jeito certo',
   'Prepare sua conta, organize seu perfil e entenda os requisitos para participar como afiliado.', true),
  ('00000000-0000-4000-a000-000000000002', 2, 'encontrar-produtos-com-potencial', 'Encontrar produtos com potencial',
   'Aprenda a identificar produtos que despertam interesse e que fazem sentido testar.', true),
  ('00000000-0000-4000-a000-000000000003', 3, 'criar-videos-que-vendem', 'Criar vídeos que vendem',
   'Entenda como transformar um produto comum em um vídeo que chama atenção.', true),
  ('00000000-0000-4000-a000-000000000004', 4, 'vender-sem-depender-de-live', 'Vender sem depender de live',
   'Conheça a estratégia para gerar vendas com vídeos publicados, sem precisar ficar transmitindo.', true),
  ('00000000-0000-4000-a000-000000000005', 5, 'modulo-05', '[Título do módulo 05]', '[Descrição do módulo 05]', true),
  ('00000000-0000-4000-a000-000000000006', 6, 'modulo-06', '[Título do módulo 06]', '[Descrição do módulo 06]', true);

insert into public.lessons (module_id, position, title, published)
select m.id, l.position, l.title, true
from (values
  (1, 1, '[Aula 01 do módulo 01]'), (1, 2, '[Aula 02 do módulo 01]'), (1, 3, '[Aula 03 do módulo 01]'), (1, 4, '[Aula 04 do módulo 01]'),
  (2, 1, 'Como identificar produtos com potencial'), (2, 2, 'Sinais de interesse do público'),
  (2, 3, 'Escolhendo o que vale testar'), (2, 4, 'Organizando sua lista de testes'),
  (3, 1, '[Aula 01 do módulo 03]'), (3, 2, 'Transformando um produto comum em desejo'),
  (3, 3, 'Estrutura de roteiro'), (3, 4, '[Aula 04 do módulo 03]'),
  (4, 1, '[Aula 01 do módulo 04]'), (4, 2, '[Aula 02 do módulo 04]'), (4, 3, '[Aula 03 do módulo 04]'), (4, 4, '[Aula 04 do módulo 04]'),
  (5, 1, '[Aula 01 do módulo 05]'), (5, 2, '[Aula 02 do módulo 05]'), (5, 3, '[Aula 03 do módulo 05]'), (5, 4, '[Aula 04 do módulo 05]'),
  (6, 1, '[Aula 01 do módulo 06]'), (6, 2, '[Aula 02 do módulo 06]'), (6, 3, '[Aula 03 do módulo 06]'), (6, 4, '[Aula 04 do módulo 06]')
) as l(module_pos, position, title)
join public.modules m on m.position = l.module_pos;

insert into public.live_sessions (title, starts_at, status, join_url) values
  ('Mentoria semanal: análise dos vídeos dos alunos', now() - interval '10 minutes', 'ao_vivo', null),
  ('Tira-dúvidas da semana', now() + interval '2 days', 'agendada', null),
  ('Análise de vídeos dos alunos', now() + interval '5 days', 'agendada', null),
  ('Produtos da semana', now() + interval '8 days', 'agendada', null);

insert into public.live_sessions (title, starts_at, status, recording_provider, recording_video_id) values
  ('Mentoria: revisão de perfis', now() - interval '7 days', 'encerrada', 'youtube', null),
  ('Tira-dúvidas sobre afiliação', now() - interval '14 days', 'encerrada', 'youtube', null),
  ('Análise de produtos ao vivo', now() - interval '21 days', 'encerrada', 'youtube', null),
  ('Roteiros [título completo]', now() - interval '28 days', 'encerrada', 'youtube', null);

insert into public.site_settings (key, value) values
  ('community_url', 'https://chat.whatsapp.com/[LINK-DA-COMUNIDADE]');
