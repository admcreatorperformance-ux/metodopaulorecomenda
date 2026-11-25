import "server-only";
import { demoStore } from "./demo-data";
import { isDemo } from "./env";
import { createClient } from "./supabase/server";
import type { AreaData, Certificate, LessonComment, LessonMaterial, Role } from "./types";

type Row = Record<string, unknown>;

/** Materiais e comentários de uma aula (o RLS garante que só membro com acesso lê). */
export async function loadLessonExtras(lessonId: string): Promise<{ materials: LessonMaterial[]; comments: LessonComment[] }> {
  if (isDemo) {
    return {
      materials: demoStore.materials.filter((m) => m.lessonId === lessonId).sort((a, b) => a.position - b.position),
      comments: demoStore.comments.filter((c) => c.lessonId === lessonId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    };
  }
  const supabase = await createClient();
  const [mat, com] = await Promise.all([
    supabase.from("lesson_materials").select("id, lesson_id, title, kind, url, storage_path, position").eq("lesson_id", lessonId).order("position"),
    supabase
      .from("lesson_comments")
      .select("id, lesson_id, user_id, parent_id, body, created_at")
      .eq("lesson_id", lessonId)
      .order("created_at")
      .limit(300),
  ]);
  const rawComments = (com.data ?? []) as Row[];
  const authorIds = [...new Set(rawComments.map((c) => c.user_id as string))];
  const { data: authors } = authorIds.length
    ? await supabase.from("profiles").select("id, full_name, avatar_url, role").in("id", authorIds)
    : { data: [] as Row[] };
  const byId = new Map((authors ?? []).map((a: Row) => [a.id as string, a]));

  return {
    materials: ((mat.data ?? []) as Row[]).map((m) => ({
      id: m.id as string,
      lessonId: m.lesson_id as string,
      title: m.title as string,
      kind: m.kind as LessonMaterial["kind"],
      url: (m.url as string) ?? null,
      storagePath: (m.storage_path as string) ?? null,
      position: m.position as number,
    })),
    comments: rawComments.map((c) => {
      const a = byId.get(c.user_id as string);
      return {
        id: c.id as string,
        lessonId: c.lesson_id as string,
        userId: c.user_id as string,
        parentId: (c.parent_id as string) ?? null,
        body: c.body as string,
        createdAt: c.created_at as string,
        authorName: ((a?.full_name as string) || "Membro").trim(),
        authorAvatar: (a?.avatar_url as string) ?? null,
        authorRole: ((a?.role as Role) ?? "aluno"),
      };
    }),
  };
}

export async function loadCertificate(): Promise<Certificate | null> {
  if (isDemo) return demoStore.certificate;
  const supabase = await createClient();
  const { data } = await supabase.from("certificates").select("id, full_name, lessons_completed, issued_at").maybeSingle();
  return data
    ? { id: data.id, fullName: data.full_name, lessonsCompleted: data.lessons_completed, issuedAt: data.issued_at }
    : null;
}

/** Quantas aulas publicadas existem e quantas o aluno concluiu (mesma conta do banco). */
export function courseCompletion(data: AreaData) {
  const lessons = data.modules.flatMap((m) => m.lessons);
  const done = lessons.filter((l) => data.progress[l.id]?.completedAt).length;
  return { total: lessons.length, done, complete: lessons.length > 0 && done === lessons.length };
}
