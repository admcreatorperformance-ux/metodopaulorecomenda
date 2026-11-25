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
| `/perfil` | Nome (vai no certificado), foto e progresso. |
| `/historico` | Aulas abertas, da mais recente para a mais antiga. |
| `/certificado` | Liberado ao concluir todas as aulas publicadas; imprime/baixa em PDF. |
| `/verificar/[código]` | Página pública que confirma se um certificado é autêntico. |
| `/material/[id]` | Abre material da aula (link ou arquivo do Storage privado, com link temporário de 2 min). |
| `/admin` | Painel admin (só `role = admin`): módulos, aulas, lives, alunos (liberar/bloquear acesso) e link da comunidade. |

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

## Navegação

Coluna lateral esquerda fixa no computador (grupos Estudar, Ao vivo, Conta + card de progresso). No celular vira menu que abre pelo botão do topo.

## Aula: materiais e comentários

- Materiais: links ou arquivos (até 50 MB) cadastrados pelo admin na tela da aula. Arquivos ficam no bucket privado `materiais`; só membro com acesso baixa.
- Comentários com um nível de resposta. Sem edição; o autor apaga o próprio, a equipe apaga qualquer um.

## Painel admin

- Acesso: só perfis com `role = 'admin'`. Para os outros a página responde 404, e as regras do banco também bloqueiam a escrita.
- Aula publicada não pode ser apagada: primeiro despublica, depois apaga (com confirmação). Apagar remove o progresso dos alunos naquela aula.
- **Cadastrar aluno novo** exige a variável `SUPABASE_SECRET_KEY` na Vercel (Supabase → Project Settings → API Keys → secret key, ou a antiga service_role). Tipo **Secret**, **sem** prefixo `NEXT_PUBLIC_`. Ela só é usada no servidor, dentro da ação de admin. Reativar ou bloquear quem já existe não precisa dela.
- No modo demo o painel funciona, mas as mudanças ficam só na memória do servidor.

## Vídeos das aulas

`lessons.video_provider` + `lessons.video_id`:
- `youtube` / `vimeo`: só o ID do vídeo.
- `bunny`: `<libraryId>/<videoId>`.
- `panda`: URL completa de embed do painel da Panda.

## Liberação automática pela Greenn

Cada venda na Greenn avisa o site em `POST /api/webhooks/greenn?token=...`:

| Status da Greenn | O que acontece |
|---|---|
| `paid` (venda) ou `paid`/`active` (assinatura) | Cria a conta do comprador (se não existir) e ativa a matrícula |
| `refunded`, `chargedback` | Bloqueia (matrícula vira `refunded`) |
| `canceled`, `ended` (assinatura) | Bloqueia (matrícula vira `canceled`) |
| aguardando pagamento, recusada etc. | Não mexe no acesso |

Configuração:
1. Vercel → Environment Variables: `GREENN_WEBHOOK_TOKEN` (Secret, um texto longo aleatório) e, opcional, `GREENN_PRODUCT_IDS` (ids dos produtos da Greenn que dão acesso, separados por vírgula; vazio = todos). Precisa também de `SUPABASE_SECRET_KEY`. Redeploy.
2. Greenn → Produtos → Meus Produtos → engrenagem → Editar Produto → Conteúdos → Adicionar Conteúdo → Sistema Externo → Webhook. URL: `https://SEU-SITE/api/webhooks/greenn?token=O_MESMO_TOKEN`. Eventos: venda paga, reembolso, chargeback (e cancelamento de assinatura, se for recorrente).
3. Cada aviso fica registrado em `webhook_events` e aparece em Admin → Alunos → "Últimas vendas recebidas da Greenn".

## Próximas etapas

- Webhook da plataforma de pagamento criando usuário + matrícula (Edge Function com `service_role`).
- Progresso por tempo assistido (eventos do player) em vez do botão "concluída".
- Gerar tipos do banco (`supabase gen types`) e substituir os textos `[placeholder]` do seed pelo conteúdo real.
