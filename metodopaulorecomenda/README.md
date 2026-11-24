# Área de Membros | Método Paulo Recomenda

Next.js 16 (App Router, TypeScript) + Supabase (Auth, Postgres com RLS).

## O que já existe

| Rota | O que faz |
| --- | --- |
| `/login` | Entrada sem senha: código de 6 dígitos ou link mágico por e-mail. Só entra quem já tem cadastro (`shouldCreateUser: false`). |
| `/auth/confirm` | Valida o link do e-mail e cria a sessão. |
| `/` | Início: continue de onde parou, continue assistindo, 6 pilares, aulas do módulo atual, banner da comunidade, gravações, painel ao vivo e comunidade. |
| `/modulos`, `/modulos/[slug]` | Lista de módulos e aulas do módulo com status (Assistida, Próxima aula, Em andamento, Não iniciada). |
| `/aula/[id]` | Player (YouTube, Vimeo, Bunny ou Panda), marcar como concluída, aula anterior/próxima. |
| `/ao-vivo`, `/gravacoes`, `/gravacoes/[id]` | Lives agendadas com lembrete e gravações. |
| `/busca?q=` | Busca nas aulas. |
| `/sem-acesso` | Logado, mas sem matrícula ativa. |

## Regras de acesso (RLS)

- Conteúdo (módulos, aulas, lives, link da comunidade) só para quem tem **matrícula ativa e dentro da validade**, ou é da equipe (`mentor`, `moderador`, `admin`).
- Progresso e lembretes: cada aluno só lê e grava os próprios.
- Aluno edita só `full_name` e `avatar_url` do próprio perfil (não consegue mudar `role`).
- Matrículas e conteúdo: escrita só por `admin` ou `service_role` (futuro webhook de pagamento).
- Anônimo não lê nada.

Teste automatizado das políticas (21 casos) em `supabase/tests/rls_test.sql`:

```bash
psql -d banco_de_teste -f supabase/tests/stub_supabase_auth.sql   # só em Postgres puro, simula o Supabase
psql -d banco_de_teste -f supabase/migrations/20261124120000_area_membros_base.sql
psql -d banco_de_teste -f supabase/seed.sql
psql -d banco_de_teste -f supabase/tests/rls_test.sql
```

## Rodar local

```bash
npm install
cp .env.example .env.local   # preencher com o projeto Supabase de desenvolvimento
npm run dev
```

Sem Supabase ainda: `DEMO_MODE=1 npm run dev` mostra a área com os dados do layout. Em produção sem as variáveis, o app responde 503 (nunca abre a área).

## Configuração no Supabase (quando conectar)

1. Aplicar `supabase/migrations/*` (`supabase db push`) e, só em desenvolvimento, `supabase/seed.sql`.
2. Authentication > URL Configuration: Site URL = domínio da área; Redirect URLs inclui `https://DOMINIO/auth/confirm`.
3. Authentication > Emails > Magic Link: usar `supabase/templates/magic-link.html` (mostra o código de 6 dígitos).
4. Desligar "Allow new users to sign up" (aluno entra por compra/convite).
5. Criar o primeiro admin: convidar o e-mail em Authentication > Users e depois `update profiles set role = 'admin' where id = '<uuid>';` no SQL Editor.

## Vídeos das aulas

`lessons.video_provider` + `lessons.video_id`:
- `youtube` / `vimeo`: só o ID do vídeo.
- `bunny`: `<libraryId>/<videoId>`.
- `panda`: URL completa de embed do painel da Panda.

## Próximas etapas

- Webhook da plataforma de pagamento criando usuário + matrícula (Edge Function com `service_role`).
- Painel admin para cadastrar módulos, aulas, lives e matrículas.
- Progresso por tempo assistido (eventos do player) em vez do botão "concluída".
- Gerar tipos do banco (`supabase gen types`) e substituir os textos `[placeholder]` do seed pelo conteúdo real.
