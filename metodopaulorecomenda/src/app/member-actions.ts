"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { demoStore } from "@/lib/demo-data";
import { isDemo, supabaseUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const back = (path: string, kind: "ok" | "erro", msg: string): never =>
  redirect(`${path}${path.includes("?") ? "&" : "?"}${kind}=${encodeURIComponent(msg)}`);

async function session() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  return { supabase, userId };
}

/* ------------------------------------------------------------------ Perfil */
export async function updateProfile(fd: FormData) {
  const name = String(fd.get("full_name") ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) back("/perfil", "erro", "Digite seu nome (de 2 a 80 letras).");
  if (isDemo) {
    demoStore.viewerName = name;
  } else {
    const { supabase, userId } = await session();
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", userId);
    if (error) back("/perfil", "erro", "Não deu para salvar seu nome.");
  }
  revalidatePath("/", "layout");
  back("/perfil", "ok", "Nome atualizado. É ele que vai no seu certificado.");
}

/** Salva a foto depois que o navegador enviou o arquivo para a pasta do próprio usuário. */
export async function saveAvatar(path: string) {
  if (isDemo) return { error: "No modo demonstração não dá para enviar foto." };
  const { supabase, userId } = await session();
  if (!path.startsWith(`${userId}/`)) return { error: "Arquivo inválido." };
  const url = `${supabaseUrl}/storage/v1/object/public/avatars/${path}`;
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
  if (error) return { error: "Não deu para salvar a foto." };
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ------------------------------------------------------------------ Comentários */
export async function addComment(fd: FormData) {
  const lessonId = String(fd.get("lesson_id") ?? "");
  const parentId = String(fd.get("parent_id") ?? "") || null;
  const body = String(fd.get("body") ?? "").trim();
  const path = `/aula/${lessonId}`;
  if (!body) back(`${path}#comentarios`, "erro", "Escreva seu comentário.");
  if (body.length > 2000) back(`${path}#comentarios`, "erro", "Comentário muito longo (máximo 2.000 caracteres).");
  if (isDemo) {
    demoStore.comments.push({
      id: `c${Date.now()}`, lessonId, userId: "demo", parentId, body, createdAt: new Date().toISOString(),
      authorName: demoStore.viewerName, authorAvatar: null, authorRole: "admin",
    });
  } else {
    const { supabase, userId } = await session();
    const { error } = await supabase.from("lesson_comments").insert({ lesson_id: lessonId, user_id: userId, parent_id: parentId, body });
    if (error) back(path, "erro", "Não deu para publicar o comentário. Tente de novo.");
  }
  revalidatePath(path);
  redirect(`${path}?ok=${encodeURIComponent("Comentário publicado.")}#comentarios`);
}

export async function deleteComment(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const lessonId = String(fd.get("lesson_id") ?? "");
  const path = `/aula/${lessonId}`;
  if (isDemo) {
    demoStore.comments = demoStore.comments.filter((c) => c.id !== id && c.parentId !== id);
  } else {
    const { supabase } = await session();
    // O RLS só deixa apagar o próprio comentário (ou qualquer um, se for da equipe).
    const { error, count } = await supabase.from("lesson_comments").delete({ count: "exact" }).eq("id", id);
    if (error || !count) back(path, "erro", "Não deu para apagar esse comentário.");
  }
  revalidatePath(path);
  redirect(`${path}?ok=${encodeURIComponent("Comentário apagado.")}#comentarios`);
}

/* ------------------------------------------------------------------ Certificado */
export async function issueCertificate() {
  if (isDemo) {
    demoStore.certificate = demoStore.certificate ?? {
      id: "00000000-0000-4000-8000-00000000d3e0",
      fullName: demoStore.viewerName,
      lessonsCompleted: demoStore.modules.reduce((n, m) => n + m.lessons.length, 0),
      issuedAt: new Date().toISOString(),
    };
  } else {
    const { supabase } = await session();
    const { error } = await supabase.rpc("issue_certificate");
    if (error) back("/certificado", "erro", "Você ainda não concluiu todas as aulas publicadas.");
  }
  revalidatePath("/certificado");
  back("/certificado", "ok", "Certificado emitido. Parabéns!");
}
