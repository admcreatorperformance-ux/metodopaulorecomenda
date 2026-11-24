import type { AreaData, LessonProgress, Module } from "./types";

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

export function getDemoData(): AreaData {
  return {
    viewer: { id: "demo", fullName: "Você Convidado", role: "aluno" },
    modules,
    progress: { ...demoState.progress },
    reminders: [...demoState.reminders],
    lives: [
      { id: "l0", title: "Mentoria semanal: análise dos vídeos dos alunos", hostName: "Paulo Nesi", startsAt: minutesAgo(10), status: "ao_vivo", joinUrl: null, recordingProvider: null, recordingVideoId: null, recordingThumbnailUrl: null },
      { id: "l1", title: "Tira-dúvidas da semana", hostName: "Paulo Nesi", startsAt: daysFromNow(2), status: "agendada", joinUrl: null, recordingProvider: null, recordingVideoId: null, recordingThumbnailUrl: null },
      { id: "l2", title: "Análise de vídeos dos alunos", hostName: "Paulo Nesi", startsAt: daysFromNow(5), status: "agendada", joinUrl: null, recordingProvider: null, recordingVideoId: null, recordingThumbnailUrl: null },
      { id: "l3", title: "Produtos da semana", hostName: "Paulo Nesi", startsAt: daysFromNow(8), status: "agendada", joinUrl: null, recordingProvider: null, recordingVideoId: null, recordingThumbnailUrl: null },
      { id: "g1", title: "Mentoria: revisão de perfis", hostName: "Paulo Nesi", startsAt: daysFromNow(-7), status: "encerrada", joinUrl: null, recordingProvider: "youtube", recordingVideoId: null, recordingThumbnailUrl: null },
      { id: "g2", title: "Tira-dúvidas sobre afiliação", hostName: "Paulo Nesi", startsAt: daysFromNow(-14), status: "encerrada", joinUrl: null, recordingProvider: "youtube", recordingVideoId: null, recordingThumbnailUrl: null },
      { id: "g3", title: "Análise de produtos ao vivo", hostName: "Paulo Nesi", startsAt: daysFromNow(-21), status: "encerrada", joinUrl: null, recordingProvider: "youtube", recordingVideoId: null, recordingThumbnailUrl: null },
      { id: "g4", title: "Roteiros [título completo]", hostName: "Paulo Nesi", startsAt: daysFromNow(-28), status: "encerrada", joinUrl: null, recordingProvider: "youtube", recordingVideoId: null, recordingThumbnailUrl: null },
    ],
    members: [
      { id: "u1", fullName: "Paulo Nesi", avatarUrl: null, role: "mentor", online: true, currentModulePosition: null },
      { id: "u2", fullName: "[Nome do moderador]", avatarUrl: null, role: "moderador", online: true, currentModulePosition: null },
      { id: "u3", fullName: "[Membro]", avatarUrl: null, role: "aluno", online: true, currentModulePosition: 3 },
      { id: "u4", fullName: "[Membro]", avatarUrl: null, role: "aluno", online: true, currentModulePosition: 2 },
      { id: "u5", fullName: "[Membro]", avatarUrl: null, role: "aluno", online: false, currentModulePosition: 5 },
      { id: "u6", fullName: "[Membro]", avatarUrl: null, role: "aluno", online: false, currentModulePosition: 1 },
    ],
    communityUrl: null,
  };
}
