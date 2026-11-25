import type { AdminMember, AreaData, Certificate, LessonComment, LessonMaterial, LessonProgress, LiveSession, Module } from "./types";

/**
 * Dados de demonstração (espelham supabase/seed.sql).
 * Só são usados quando DEMO_MODE=1 e o Supabase não está configurado.
 */
const lessonTitles: Record<number, string[]> = {
  1: ["[Aula 01 do módulo 01]", "[Aula 02 do módulo 01]", "[Aula 03 do módulo 01]", "[Aula 04 do módulo 01]"],
  2: [
    "Como identificar produtos com potencial",
    "Sinais de interesse do público",
    "Escolhendo o que vale testar",
    "Organizando sua lista de testes",
  ],
  3: ["[Aula 01 do módulo 03]", "Transformando um produto comum em desejo", "Estrutura de roteiro", "[Aula 04 do módulo 03]"],
  4: ["[Aula 01 do módulo 04]", "[Aula 02 do módulo 04]", "[Aula 03 do módulo 04]", "[Aula 04 do módulo 04]"],
  5: ["[Aula 01 do módulo 05]", "[Aula 02 do módulo 05]", "[Aula 03 do módulo 05]", "[Aula 04 do módulo 05]"],
  6: ["[Aula 01 do módulo 06]", "[Aula 02 do módulo 06]", "[Aula 03 do módulo 06]", "[Aula 04 do módulo 06]"],
};

const moduleInfo: [string, string, string][] = [
  ["comecar-do-jeito-certo", "Começar do jeito certo", "Prepare sua conta, organize seu perfil e entenda os requisitos para participar como afiliado."],
  ["encontrar-produtos-com-potencial", "Encontrar produtos com potencial", "Aprenda a identificar produtos que despertam interesse e que fazem sentido testar."],
  ["criar-videos-que-vendem", "Criar vídeos que vendem", "Entenda como transformar um produto comum em um vídeo que chama atenção."],
  ["vender-sem-depender-de-live", "Vender sem depender de live", "Conheça a estratégia para gerar vendas com vídeos publicados, sem precisar ficar transmitindo."],
  ["modulo-05", "[Título do módulo 05]", "[Descrição do módulo 05]"],
  ["modulo-06", "[Título do módulo 06]", "[Descrição do módulo 06]"],
];

const modules: Module[] = moduleInfo.map(([slug, title, description], i) => {
  const position = i + 1;
  const id = `m${position}`;
  return {
    id,
    position,
    slug,
    title,
    description,
    lessons: lessonTitles[position].map((t, j) => ({
      id: `m${position}-a${j + 1}`,
      moduleId: id,
      position: j + 1,
      title: t,
      description: "",
      videoProvider: "youtube" as const,
      videoId: null,
      durationSeconds: null,
      thumbnailUrl: null,
    })),
  };
});

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const daysFromNow = (d: number, hour = 20) => {
  const date = new Date(Date.now() + d * 86_400_000);
  date.setUTCHours(hour + 3, 0, 0, 0); // horário de Brasília
  return date.toISOString();
};

const initialProgress: LessonProgress[] = [
  ...["m1-a1", "m1-a2", "m1-a3", "m1-a4"].map((id, i) => ({ lessonId: id, completedAt: minutesAgo(9000 - i), updatedAt: minutesAgo(9000 - i) })),
  { lessonId: "m2-a1", completedAt: minutesAgo(3000), updatedAt: minutesAgo(3000) },
  { lessonId: "m2-a2", completedAt: minutesAgo(2000), updatedAt: minutesAgo(2000) },
  { lessonId: "m2-a3", completedAt: null, updatedAt: minutesAgo(30) },
  { lessonId: "m3-a1", completedAt: minutesAgo(1500), updatedAt: minutesAgo(1500) },
  { lessonId: "m3-a2", completedAt: null, updatedAt: minutesAgo(120) },
  { lessonId: "m3-a3", completedAt: null, updatedAt: minutesAgo(240) },
];

// Estado em memória do servidor para o modo demo (some ao reiniciar).
const demoState = {
  progress: Object.fromEntries(initialProgress.map((p) => [p.lessonId, p])) as Record<string, LessonProgress>,
  reminders: new Set<string>(),
};

export function demoSetProgress(lessonId: string, completed: boolean | null) {
  const current = demoState.progress[lessonId];
  const now = new Date().toISOString();
  demoState.progress[lessonId] = {
    lessonId,
    updatedAt: now,
    completedAt: completed === null ? current?.completedAt ?? null : completed ? now : null,
  };
}

export function demoToggleReminder(liveId: string) {
  if (demoState.reminders.has(liveId)) demoState.reminders.delete(liveId);
  else demoState.reminders.add(liveId);
}

const L = (id: string, title: string, startsAt: string, status: LiveSession["status"], rec: boolean): LiveSession => ({
  id, title, hostName: "Paulo Nesi", startsAt, status, joinUrl: null,
  recordingProvider: rec ? "youtube" : null, recordingVideoId: null, recordingThumbnailUrl: null,
  description: "", published: true,
});

/** Estado em memória do modo demo: o painel admin edita estes dados (some ao reiniciar). */
export const demoStore = {
  modules: modules.map((m) => ({ ...m, published: true, lessons: m.lessons.map((l) => ({ ...l, published: true })) })),
  lives: [
    L("l0", "Mentoria semanal: análise dos vídeos dos alunos", minutesAgo(10), "ao_vivo", false),
    L("l1", "Tira-dúvidas da semana", daysFromNow(2), "agendada", false),
    L("l2", "Análise de vídeos dos alunos", daysFromNow(5), "agendada", false),
    L("l3", "Produtos da semana", daysFromNow(8), "agendada", false),
    L("g1", "Mentoria: revisão de perfis", daysFromNow(-7), "encerrada", true),
    L("g2", "Tira-dúvidas sobre afiliação", daysFromNow(-14), "encerrada", true),
    L("g3", "Análise de produtos ao vivo", daysFromNow(-21), "encerrada", true),
    L("g4", "Roteiros [título completo]", daysFromNow(-28), "encerrada", true),
  ] as LiveSession[],
  members: [
    { userId: "u1", email: "paulo@exemplo.com", fullName: "Paulo Nesi", role: "admin", enrollmentStatus: null, expiresAt: null, lastSeenAt: minutesAgo(1), createdAt: minutesAgo(90000) },
    { userId: "u3", email: "aluna1@exemplo.com", fullName: "Aluna Exemplo", role: "aluno", enrollmentStatus: "active", expiresAt: null, lastSeenAt: minutesAgo(30), createdAt: minutesAgo(40000) },
    { userId: "u4", email: "aluno2@exemplo.com", fullName: "Aluno Exemplo", role: "aluno", enrollmentStatus: "refunded", expiresAt: null, lastSeenAt: minutesAgo(9000), createdAt: minutesAgo(30000) },
  ] as AdminMember[],
  communityUrl: null as string | null,
  viewerName: "Você Convidado",
  materials: [
    { id: "mat1", lessonId: "m2-a3", title: "Planilha de testes de produto", kind: "link", url: "https://docs.google.com/spreadsheets/", storagePath: null, position: 1 },
    { id: "mat2", lessonId: "m2-a3", title: "Checklist: vale testar?", kind: "file", url: null, storagePath: "m2-a3/checklist.pdf", position: 2 },
  ] as LessonMaterial[],
  comments: [
    { id: "c1", lessonId: "m2-a3", userId: "u1", parentId: null, body: "Antes de testar, olha se o produto tem vídeo vendendo nos últimos 7 dias. Se ninguém está vendendo, ou é oportunidade ou é armadilha. Me conta aqui qual você escolheu.", createdAt: minutesAgo(600), authorName: "Paulo Nesi", authorAvatar: null, authorRole: "mentor" },
    { id: "c2", lessonId: "m2-a3", userId: "u3", parentId: null, body: "Escolhi um mop giratório. Tem vídeo vendendo mas pouca gente fazendo.", createdAt: minutesAgo(300), authorName: "Aluna Exemplo", authorAvatar: null, authorRole: "aluno" },
    { id: "c3", lessonId: "m2-a3", userId: "u1", parentId: "c2", body: "Boa escolha. Grava 3 ganchos diferentes e me mostra na live de quinta.", createdAt: minutesAgo(200), authorName: "Paulo Nesi", authorAvatar: null, authorRole: "mentor" },
  ] as LessonComment[],
  certificate: null as Certificate | null,
};

export function getDemoData(): AreaData {
  return {
    viewer: { id: "demo", fullName: demoStore.viewerName, role: "admin", avatarUrl: null },
    modules: demoStore.modules
      .filter((m) => m.published)
      .sort((a, b) => a.position - b.position)
      .map((m) => ({ ...m, lessons: m.lessons.filter((l) => l.published).sort((a, b) => a.position - b.position) })),
    progress: { ...demoState.progress },
    reminders: [...demoState.reminders],
    lives: demoStore.lives.filter((l) => l.published).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    members: [
      { id: "u1", fullName: "Paulo Nesi", avatarUrl: null, role: "mentor", online: true, currentModulePosition: null },
      { id: "u2", fullName: "[Nome do moderador]", avatarUrl: null, role: "moderador", online: true, currentModulePosition: null },
      { id: "u3", fullName: "[Membro]", avatarUrl: null, role: "aluno", online: true, currentModulePosition: 3 },
      { id: "u4", fullName: "[Membro]", avatarUrl: null, role: "aluno", online: true, currentModulePosition: 2 },
      { id: "u5", fullName: "[Membro]", avatarUrl: null, role: "aluno", online: false, currentModulePosition: 5 },
      { id: "u6", fullName: "[Membro]", avatarUrl: null, role: "aluno", online: false, currentModulePosition: 1 },
    ],
    communityUrl: demoStore.communityUrl,
  };
}
