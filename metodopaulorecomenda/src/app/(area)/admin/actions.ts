"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fromLocalBR, requireAdmin, slugify } from "@/lib/admin";
import { demoStore } from "@/lib/demo-data";
import { createServiceClient } from "@/lib/supabase/service";
import type { AdminMember, LiveSession, VideoProvider } from "@/lib/types";

const PROVIDERS: VideoProvider[] = ["youtube", "vimeo", "panda", "bunny"];
const PRODUCT = "metodo-paulo-recomenda";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => {
  const n = Number(str(fd, k));
  return Number.isFinite(n) && str(fd, k) !== "" ? Math.round(n) : null;
};
const bool = (fd: FormData, k: string) => fd.get(k) === "on";
const back = (path: string, kind: "ok" | "erro", msg: string): never =>
  redirect(`${path}${path.includes("?") ? "&" : "?"}${kind}=${encodeURIComponent(msg)}`);

function friendly(message: string) {
  if (/duplicate key.*slug/i.test(message)) return "Já existe um módulo com esse endereço (slug). Troque o slug.";
  if (/duplicate key.*module_id.*position|lessons_module_id_position/i.test(message)) return "Já existe uma aula nessa posição dentro do módulo. Use outro número.";
  if (/row-level security|permission denied|42501/i.test(message)) return "Sem permissão para essa ação. Confirme se seu usuário é admin.";
  return `Não deu para salvar: ${message}`;
}

function refresh() {
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ Módulos */
export async function saveModule(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  const listPath = "/admin/modulos";
  const formPath = id ? `/admin/modulos/${id}` : listPath;
  if (!title) back(formPath, "erro", "Dê um título para o módulo.");
  const row = {
    title,
    slug: slugify(str(fd, "slug") || title),
    description: str(fd, "description"),
    position: num(fd, "position") ?? 1,
    published: bool(fd, "published"),
  };

  let newId = id;
  if (!supabase) {
    if (id) Object.assign(demoStore.modules.find((m) => m.id === id) ?? {}, row);
    else {
      newId = `m${Date.now()}`;
      demoStore.modules.push({ id: newId, ...row, lessons: [] });
    }
  } else if (id) {
    const { error } = await supabase.from("modules").update(row).eq("id", id);
    if (error) back(formPath, "erro", friendly(error.message));
  } else {
    const { data, error } = await supabase.from("modules").insert(row).select("id").single();
    if (error) back(formPath, "erro", friendly(error.message));
    newId = data!.id;
  }
  refresh();
  back(`/admin/modulos/${newId}`, "ok", id ? "Módulo salvo." : "Módulo criado. Agora adicione as aulas.");
}

/* ------------------------------------------------------------------ Aulas */
export async function saveLesson(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const moduleId = str(fd, "module_id");
  const modulePath = `/admin/modulos/${moduleId}`;
  const formPath = id ? `/admin/aulas/${id}` : modulePath;
  const title = str(fd, "title");
  const provider = str(fd, "video_provider") as VideoProvider;
  if (!moduleId) back("/admin/modulos", "erro", "Módulo não encontrado.");
  if (!title) back(formPath, "erro", "Dê um título para a aula.");
  if (!PROVIDERS.includes(provider)) back(formPath, "erro", "Escolha onde o vídeo está hospedado.");
  const minutes = num(fd, "duration_minutes");
  const row = {
    module_id: moduleId,
    title,
    description: str(fd, "description"),
    position: num(fd, "position") ?? 1,
    video_provider: provider,
    video_id: str(fd, "video_id") || null,
    duration_seconds: minutes ? minutes * 60 : null,
    thumbnail_url: str(fd, "thumbnail_url") || null,
    published: bool(fd, "published"),
  };

  if (!supabase) {
    const mod = demoStore.modules.find((m) => m.id === moduleId);
    if (!mod) back("/admin/modulos", "erro", "Módulo não encontrado.");
    const lesson = {
      moduleId, title: row.title, description: row.description, position: row.position, videoProvider: provider,
      videoId: row.video_id, durationSeconds: row.duration_seconds, thumbnailUrl: row.thumbnail_url, published: row.published,
    };
    if (mod!.lessons.some((l) => l.position === row.position && l.id !== id)) back(formPath, "erro", friendly("lessons_module_id_position"));
    if (id) Object.assign(mod!.lessons.find((l) => l.id === id) ?? {}, lesson);
    else mod!.lessons.push({ id: `${moduleId}-a${Date.now()}`, ...lesson });
  } else if (id) {
    const { error } = await supabase.from("lessons").update(row).eq("id", id);
    if (error) back(formPath, "erro", friendly(error.message));
  } else {
    const { error } = await supabase.from("lessons").insert(row);
    if (error) back(formPath, "erro", friendly(error.message));
  }
  refresh();
  back(modulePath, "ok", id ? "Aula salva." : "Aula criada.");
}

/** Só apaga aula em rascunho (despublicada), para não sumir com aula que aluno já viu sem querer. */
export async function deleteLesson(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const moduleId = str(fd, "module_id");
  const formPath = `/admin/aulas/${id}`;
  if (fd.get("confirm") !== "on") back(formPath, "erro", "Marque a confirmação para apagar.");
  if (!supabase) {
    const mod = demoStore.modules.find((m) => m.id === moduleId);
    const lesson = mod?.lessons.find((l) => l.id === id);
    if (lesson?.published) back(formPath, "erro", "Despublique a aula antes de apagar.");
    if (mod) mod.lessons = mod.lessons.filter((l) => l.id !== id);
  } else {
    const { data } = await supabase.from("lessons").select("published").eq("id", id).single();
    if (data?.published) back(formPath, "erro", "Despublique a aula antes de apagar.");
    const { error } = await supabase.from("lessons").delete().eq("id", id).eq("published", false);
    if (error) back(formPath, "erro", friendly(error.message));
  }
  refresh();
  back(`/admin/modulos/${moduleId}`, "ok", "Aula apagada.");
}

/* ------------------------------------------------------------------ Lives */
export async function saveLive(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const formPath = id ? `/admin/lives/${id}` : "/admin/lives";
  const title = str(fd, "title");
  const startsAt = fromLocalBR(str(fd, "starts_at"));
  const status = str(fd, "status") as LiveSession["status"];
  const recProvider = str(fd, "recording_provider") as VideoProvider | "";
  if (!title) back(formPath, "erro", "Dê um título para a live.");
  if (!startsAt) back(formPath, "erro", "Informe a data e o horário da live.");
  if (!["agendada", "ao_vivo", "encerrada"].includes(status)) back(formPath, "erro", "Escolha a situação da live.");
  const joinUrl = str(fd, "join_url");
  if (joinUrl && !/^https:\/\//.test(joinUrl)) back(formPath, "erro", "O link da live precisa começar com https://");
  const row = {
    title,
    description: str(fd, "description"),
    host_name: str(fd, "host_name") || "Paulo Nesi",
    starts_at: startsAt!,
    status,
    join_url: joinUrl || null,
    recording_provider: recProvider && PROVIDERS.includes(recProvider) ? recProvider : null,
    recording_video_id: str(fd, "recording_video_id") || null,
    recording_thumbnail_url: str(fd, "recording_thumbnail_url") || null,
    published: bool(fd, "published"),
  };

  if (!supabase) {
    const live: LiveSession = {
      id: id || `l${Date.now()}`, title: row.title, description: row.description, hostName: row.host_name, startsAt: row.starts_at,
      status: row.status, joinUrl: row.join_url, recordingProvider: row.recording_provider, recordingVideoId: row.recording_video_id,
      recordingThumbnailUrl: row.recording_thumbnail_url, published: row.published,
    };
    const i = demoStore.lives.findIndex((l) => l.id === id);
    if (i >= 0) demoStore.lives[i] = live;
    else demoStore.lives.push(live);
  } else if (id) {
    const { error } = await supabase.from("live_sessions").update(row).eq("id", id);
    if (error) back(formPath, "erro", friendly(error.message));
  } else {
    const { error } = await supabase.from("live_sessions").insert(row);
    if (error) back(formPath, "erro", friendly(error.message));
  }
  refresh();
  back("/admin/lives", "ok", id ? "Live salva." : "Live criada.");
}

/* ------------------------------------------------------------------ Alunos */
export async function addMember(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/alunos";
  const email = str(fd, "email").toLowerCase();
  const fullName = str(fd, "full_name");
  const expires = str(fd, "expires_at");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) back(path, "erro", "Digite um e-mail válido.");
  const expiresAt = expires ? fromLocalBR(`${expires}T23:59`) : null;

  if (!supabase) {
    const existing = demoStore.members.find((m) => m.email === email);
    if (existing) Object.assign(existing, { enrollmentStatus: "active", expiresAt });
    else demoStore.members.unshift({ userId: `u${Date.now()}`, email, fullName, role: "aluno", enrollmentStatus: "active", expiresAt, lastSeenAt: null, createdAt: new Date().toISOString() } satisfies AdminMember);
    refresh();
    back(path, "ok", `Acesso liberado para ${email}.`);
  }

  // 1) Acha ou cria o usuário no Auth (criar exige a chave secreta, só no servidor).
  const { data: found } = await supabase!.rpc("admin_find_user", { p_email: email });
  let userId = (found as string | null) ?? null;
  if (!userId) {
    const service = createServiceClient();
    if (!service) back(path, "erro", "Para cadastrar aluno novo, falta a variável SUPABASE_SECRET_KEY na Vercel. Veja o passo a passo no README.");
    const { data, error } = await service!.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : {},
    });
    if (error || !data.user) back(path, "erro", `Não deu para criar o usuário: ${error?.message ?? "erro desconhecido"}`);
    userId = data.user!.id;
  }

  // 2) Nome no perfil (opcional) e matrícula ativa.
  if (fullName) await supabase!.from("profiles").update({ full_name: fullName }).eq("id", userId);
  const { error } = await supabase!
    .from("enrollments")
    .upsert({ user_id: userId, product: PRODUCT, status: "active", source: "manual", expires_at: expiresAt }, { onConflict: "user_id,product" });
  if (error) back(path, "erro", friendly(error.message));
  refresh();
  back(path, "ok", `Acesso liberado para ${email}. Ele entra com o código no e-mail.`);
}

export async function setEnrollment(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/alunos";
  const userId = str(fd, "user_id");
  const status = str(fd, "status") as NonNullable<AdminMember["enrollmentStatus"]>;
  if (!["active", "canceled", "refunded", "expired"].includes(status)) back(path, "erro", "Situação inválida.");
  if (!supabase) {
    const m = demoStore.members.find((x) => x.userId === userId);
    if (m) m.enrollmentStatus = status;
  } else {
    const { error } = await supabase
      .from("enrollments")
      .upsert({ user_id: userId, product: PRODUCT, status, source: "manual" }, { onConflict: "user_id,product" });
    if (error) back(path, "erro", friendly(error.message));
  }
  refresh();
  back(path, "ok", status === "active" ? "Acesso liberado." : "Acesso bloqueado.");
}

/* ------------------------------------------------------------------ Configurações */
export async function saveSettings(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/configuracoes";
  const url = str(fd, "community_url");
  if (url && !/^https:\/\//.test(url)) back(path, "erro", "O link da comunidade precisa começar com https://");
  if (!supabase) {
    demoStore.communityUrl = url || null;
  } else if (url) {
    const { error } = await supabase.from("site_settings").upsert({ key: "community_url", value: url, updated_at: new Date().toISOString() });
    if (error) back(path, "erro", friendly(error.message));
  } else {
    const { error } = await supabase.from("site_settings").delete().eq("key", "community_url");
    if (error) back(path, "erro", friendly(error.message));
  }
  refresh();
  back(path, "ok", "Configurações salvas.");
}

/* ------------------------------------------------------------------ Materiais da aula */
export async function addMaterialLink(fd: FormData) {
  const { supabase } = await requireAdmin();
  const lessonId = str(fd, "lesson_id");
  const path = `/admin/aulas/${lessonId}`;
  const title = str(fd, "title");
  const url = str(fd, "url");
  if (!title) back(path, "erro", "Dê um nome para o material.");
  if (!/^https:\/\//.test(url)) back(path, "erro", "O link do material precisa começar com https://");
  const position = num(fd, "position") ?? 1;
  if (!supabase) {
    demoStore.materials.push({ id: `mat${Date.now()}`, lessonId, title, kind: "link", url, storagePath: null, position });
  } else {
    const { error } = await supabase.from("lesson_materials").insert({ lesson_id: lessonId, title, kind: "link", url, position });
    if (error) back(path, "erro", friendly(error.message));
  }
  refresh();
  back(path, "ok", "Material adicionado.");
}

/** Registra um arquivo que o navegador do admin já enviou para o Storage "materiais". */
export async function registerMaterialFile(input: { lessonId: string; title: string; storagePath: string; position: number }) {
  const { supabase } = await requireAdmin();
  if (!supabase) return { error: "No modo demonstração não dá para enviar arquivo." };
  if (!input.title.trim() || !input.storagePath.startsWith(`${input.lessonId}/`)) return { error: "Dados do arquivo inválidos." };
  const { error } = await supabase.from("lesson_materials").insert({
    lesson_id: input.lessonId,
    title: input.title.trim(),
    kind: "file",
    storage_path: input.storagePath,
    position: input.position || 1,
  });
  if (error) return { error: friendly(error.message) };
  refresh();
  return { ok: true };
}

export async function deleteMaterial(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const lessonId = str(fd, "lesson_id");
  const path = `/admin/aulas/${lessonId}`;
  if (!supabase) {
    demoStore.materials = demoStore.materials.filter((m) => m.id !== id);
  } else {
    const { data } = await supabase.from("lesson_materials").select("storage_path").eq("id", id).single();
    const { error } = await supabase.from("lesson_materials").delete().eq("id", id);
    if (error) back(path, "erro", friendly(error.message));
    if (data?.storage_path) await supabase.storage.from("materiais").remove([data.storage_path]);
  }
  refresh();
  back(path, "ok", "Material removido.");
}
