import "server-only";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { demoStore } from "./demo-data";
import { isDemo } from "./env";
import { createClient } from "./supabase/server";
import type { AdminMember, LiveSession, Module, Role } from "./types";

/**
 * Garante que quem acessa o painel é admin. Aluno ou equipe sem papel admin recebe 404
 * (o painel nem "existe" para eles). As regras do banco (RLS) também bloqueiam a escrita.
 */
export async function requireAdmin() {
  await connection();
  if (isDemo) return { supabase: null, userId: "demo" };
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login?next=/admin");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if ((profile?.role as Role | undefined) !== "admin") notFound();
  return { supabase, userId };
}

type Row = Record<string, unknown>;

function mapLesson(l: Row) {
  return {
    id: l.id as string,
    moduleId: l.module_id as string,
    position: l.position as number,
    title: l.title as string,
    description: (l.description as string) ?? "",
    videoProvider: l.video_provider as Module["lessons"][number]["videoProvider"],
    videoId: (l.video_id as string) ?? null,
    durationSeconds: (l.duration_seconds as number) ?? null,
    thumbnailUrl: (l.thumbnail_url as string) ?? null,
    published: Boolean(l.published),
  };
}

/** Todos os módulos e aulas, inclusive rascunhos. */
export async function adminModules(): Promise<Module[]> {
  const { supabase } = await requireAdmin();
  if (!supabase) {
    return [...demoStore.modules]
      .sort((a, b) => a.position - b.position)
      .map((m) => ({ ...m, lessons: [...m.lessons].sort((a, b) => a.position - b.position) }));
  }
  const { data, error } = await supabase
    .from("modules")
    .select("id, position, slug, title, description, published, lessons(id, module_id, position, title, description, video_provider, video_id, duration_seconds, thumbnail_url, published)")
    .order("position");
  if (error) throw new Error(error.message);
  return (data ?? []).map((m: Row) => ({
    id: m.id as string,
    position: m.position as number,
    slug: m.slug as string,
    title: m.title as string,
    description: (m.description as string) ?? "",
    published: Boolean(m.published),
    lessons: ((m.lessons as Row[]) ?? []).map(mapLesson).sort((a, b) => a.position - b.position),
  }));
}

export async function adminLives(): Promise<LiveSession[]> {
  const { supabase } = await requireAdmin();
  if (!supabase) return [...demoStore.lives].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const { data, error } = await supabase
    .from("live_sessions")
    .select("id, title, description, host_name, starts_at, status, join_url, recording_provider, recording_video_id, recording_thumbnail_url, published")
    .order("starts_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((l: Row) => ({
    id: l.id as string,
    title: l.title as string,
    description: (l.description as string) ?? "",
    hostName: l.host_name as string,
    startsAt: l.starts_at as string,
    status: l.status as LiveSession["status"],
    joinUrl: (l.join_url as string) ?? null,
    recordingProvider: (l.recording_provider as LiveSession["recordingProvider"]) ?? null,
    recordingVideoId: (l.recording_video_id as string) ?? null,
    recordingThumbnailUrl: (l.recording_thumbnail_url as string) ?? null,
    published: Boolean(l.published),
  }));
}

export async function adminMembers(): Promise<AdminMember[]> {
  const { supabase } = await requireAdmin();
  if (!supabase) return [...demoStore.members];
  const { data, error } = await supabase.rpc("admin_list_members");
  if (error) throw new Error(error.message);
  return (data ?? []).map((m: Row) => ({
    userId: m.user_id as string,
    email: m.email as string,
    fullName: (m.full_name as string) ?? "",
    role: ((m.role as Role) ?? "aluno"),
    enrollmentStatus: (m.enrollment_status as AdminMember["enrollmentStatus"]) ?? null,
    expiresAt: (m.expires_at as string) ?? null,
    lastSeenAt: (m.last_seen_at as string) ?? null,
    createdAt: m.created_at as string,
  }));
}

export async function adminCommunityUrl(): Promise<string> {
  const { supabase } = await requireAdmin();
  if (!supabase) return demoStore.communityUrl ?? "";
  const { data } = await supabase.from("site_settings").select("value").eq("key", "community_url").maybeSingle();
  return data?.value ?? "";
}

/** "2026-11-30T20:00" no horário de Brasília → ISO. */
export function fromLocalBR(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  return new Date(`${value}:00-03:00`).toISOString();
}

/** ISO → "2026-11-30T20:00" no horário de Brasília (para o campo datetime-local). */
export function toLocalBR(iso: string): string {
  const d = new Date(new Date(iso).getTime() - 3 * 3_600_000);
  return d.toISOString().slice(0, 16);
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
