import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getDemoData } from "./demo-data";
import { isDemo } from "./env";
import { createClient } from "./supabase/server";
import type { AreaData, LessonProgress, LiveSession, Member, Module, Role } from "./types";

const ONLINE_WINDOW_MS = 5 * 60_000;

/**
 * Carrega tudo que a área precisa para o usuário logado.
 * Sem login → /login. Logado sem matrícula ativa → /sem-acesso.
 * Todas as consultas passam pelo RLS com o token do próprio usuário.
 */
export const loadAreaData = cache(async (): Promise<AreaData> => {
  // Área sempre renderizada por requisição (dados do aluno logado).
  await connection();
  if (isDemo) return getDemoData();

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: hasAccess } = await supabase.rpc("has_active_access");
  if (!hasAccess) redirect("/sem-acesso");

  // Presença para a lista "Online agora" (não bloqueia a página se falhar).
  void supabase.rpc("touch_last_seen");

  const [profileRes, modulesRes, progressRes, livesRes, remindersRes, membersRes, settingsRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, avatar_url").eq("id", userId).single(),
    supabase
      .from("modules")
      .select(
        "id, position, slug, title, description, lessons(id, module_id, position, title, description, video_provider, video_id, duration_seconds, thumbnail_url, published)",
      )
      .eq("published", true)
      .order("position"),
    supabase.from("lesson_progress").select("lesson_id, completed_at, updated_at").eq("user_id", userId),
    supabase
      .from("live_sessions")
      .select("id, title, host_name, starts_at, status, join_url, recording_provider, recording_video_id, recording_thumbnail_url")
      .eq("published", true)
      .order("starts_at", { ascending: true }),
    supabase.from("live_reminders").select("live_id").eq("user_id", userId),
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, last_seen_at")
      .order("last_seen_at", { ascending: false, nullsFirst: false })
      .limit(30),
    supabase.from("site_settings").select("key, value").eq("key", "community_url").maybeSingle(),
  ]);

  const firstError = [profileRes, modulesRes, progressRes, livesRes, remindersRes, membersRes].find((r) => r.error)?.error;
  if (firstError) throw new Error(`Falha ao carregar a área: ${firstError.message}`);

  const modules: Module[] = (modulesRes.data ?? []).map((m) => ({
    id: m.id,
    position: m.position,
    slug: m.slug,
    title: m.title,
    description: m.description,
    lessons: (m.lessons ?? [])
      .filter((l) => l.published)
      .sort((a, b) => a.position - b.position)
      .map((l) => ({
        id: l.id,
        moduleId: l.module_id,
        position: l.position,
        title: l.title,
        description: l.description,
        videoProvider: l.video_provider,
        videoId: l.video_id,
        durationSeconds: l.duration_seconds,
        thumbnailUrl: l.thumbnail_url,
      })),
  }));

  const progress: Record<string, LessonProgress> = {};
  for (const p of progressRes.data ?? []) {
    progress[p.lesson_id] = { lessonId: p.lesson_id, completedAt: p.completed_at, updatedAt: p.updated_at };
  }

  const lives: LiveSession[] = (livesRes.data ?? []).map((l) => ({
    id: l.id,
    title: l.title,
    hostName: l.host_name,
    startsAt: l.starts_at,
    status: l.status,
    joinUrl: l.join_url,
    recordingProvider: l.recording_provider,
    recordingVideoId: l.recording_video_id,
    recordingThumbnailUrl: l.recording_thumbnail_url,
  }));

  const staffOrder: Record<Role, number> = { mentor: 0, admin: 1, moderador: 2, aluno: 3 };
  const now = Date.now();
  const members: Member[] = (membersRes.data ?? [])
    .map((p) => ({
      id: p.id,
      fullName: p.full_name || "Membro",
      avatarUrl: p.avatar_url,
      role: p.role as Role,
      online: p.last_seen_at ? now - new Date(p.last_seen_at).getTime() < ONLINE_WINDOW_MS : false,
      currentModulePosition: null,
    }))
    .sort((a, b) => staffOrder[a.role] - staffOrder[b.role] || Number(b.online) - Number(a.online))
    .slice(0, 6);

  const profile = profileRes.data!;
  return {
    viewer: { id: profile.id, fullName: profile.full_name, role: profile.role as Role, avatarUrl: profile.avatar_url ?? null },
    modules,
    progress,
    lives,
    reminders: (remindersRes.data ?? []).map((r) => r.live_id),
    members,
    communityUrl: settingsRes.data?.value ?? null,
  };
});
