import type { AreaData, Lesson, LiveSession, Module } from "./types";

export type LessonStatus = "assistida" | "em_andamento" | "proxima" | "nao_iniciada";

export const pad2 = (n: number) => String(n).padStart(2, "0");

export function moduleProgress(mod: Module, progress: AreaData["progress"]) {
  const total = mod.lessons.length;
  const done = mod.lessons.filter((l) => progress[l.id]?.completedAt).length;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function allLessons(modules: Module[]): Lesson[] {
  return modules.flatMap((m) => m.lessons);
}

/** Aula para "Continue de onde parou": a última iniciada e não concluída; senão, a primeira não concluída. */
export function currentLesson(data: AreaData): Lesson | null {
  const lessons = allLessons(data.modules);
  const started = lessons
    .filter((l) => data.progress[l.id] && !data.progress[l.id].completedAt)
    .sort((a, b) => data.progress[b.id].updatedAt.localeCompare(data.progress[a.id].updatedAt));
  if (started[0]) return started[0];
  return lessons.find((l) => !data.progress[l.id]?.completedAt) ?? lessons[0] ?? null;
}

/** Cards de "Continue assistindo": aulas iniciadas e não concluídas, mais recentes primeiro (completa com as próximas). */
export function continueWatching(data: AreaData, limit = 3): Lesson[] {
  const lessons = allLessons(data.modules);
  const started = lessons
    .filter((l) => data.progress[l.id] && !data.progress[l.id].completedAt)
    .sort((a, b) => data.progress[b.id].updatedAt.localeCompare(data.progress[a.id].updatedAt));
  const next = lessons.filter((l) => !data.progress[l.id] && !started.includes(l));
  return [...started, ...next].slice(0, limit);
}

export function lessonStatus(lesson: Lesson, mod: Module, data: AreaData): LessonStatus {
  const p = data.progress[lesson.id];
  if (p?.completedAt) return "assistida";
  const firstOpen = mod.lessons.find((l) => !data.progress[l.id]?.completedAt);
  if (firstOpen?.id === lesson.id) return "proxima";
  if (p) return "em_andamento";
  return "nao_iniciada";
}

export const statusLabel: Record<LessonStatus, string> = {
  assistida: "Assistida",
  em_andamento: "Em andamento",
  proxima: "Próxima aula",
  nao_iniciada: "Não iniciada",
};

export function findLesson(data: AreaData, lessonId: string) {
  for (const mod of data.modules) {
    const idx = mod.lessons.findIndex((l) => l.id === lessonId);
    if (idx >= 0) return { mod, lesson: mod.lessons[idx], prev: mod.lessons[idx - 1] ?? null, next: mod.lessons[idx + 1] ?? null };
  }
  return null;
}

export function splitLives(lives: LiveSession[]) {
  const live = lives.find((l) => l.status === "ao_vivo") ?? null;
  const now = Date.now();
  const upcoming = lives.filter((l) => l.status === "agendada" && new Date(l.startsAt).getTime() > now - 3 * 3_600_000);
  const recordings = lives
    .filter((l) => l.status === "encerrada" && l.recordingProvider)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return { live, upcoming, recordings };
}

const TZ = "America/Sao_Paulo";

export function liveDateParts(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: TZ }).format(d);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: TZ }).format(d).replace(".", "").toUpperCase();
  const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(d);
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: TZ }).format(d);
  return { day, month, time, weekday };
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ }).format(new Date(iso));
}

export function initials(name: string) {
  const parts = name.replace(/[[\]]/g, "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] ?? "")).toUpperCase();
}

const EMBED_HOSTS = [
  "www.youtube-nocookie.com",
  "www.youtube.com",
  "player.vimeo.com",
  "iframe.mediadelivery.net",
  "player.mediadelivery.net",
];

/**
 * URL do player embutido.
 * youtube/vimeo: video_id é o ID do vídeo.
 * bunny: video_id = "<libraryId>/<videoId>".
 * panda: video_id = URL completa de embed do painel da Panda.
 */
export function embedUrl(provider: string, videoId: string | null): string | null {
  if (!videoId) return null;
  if (videoId.startsWith("https://")) {
    try {
      const host = new URL(videoId).hostname;
      const ok = EMBED_HOSTS.includes(host) || host.endsWith(".pandavideo.com.br");
      return ok ? videoId : null;
    } catch {
      return null;
    }
  }
  switch (provider) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1`;
    case "vimeo":
      return `https://player.vimeo.com/video/${encodeURIComponent(videoId)}`;
    case "bunny":
      return `https://iframe.mediadelivery.net/embed/${videoId.split("/").map(encodeURIComponent).join("/")}`;
    default:
      return null;
  }
}
