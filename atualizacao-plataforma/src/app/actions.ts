"use server";

import { revalidatePath } from "next/cache";
import { demoSetProgress, demoToggleReminder } from "@/lib/demo-data";
import { isDemo } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

async function currentUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) throw new Error("Sessão expirada. Entre de novo.");
  return { supabase, userId };
}

/** Registra que o aluno abriu a aula (alimenta "Continue assistindo"). Não muda conclusão. */
export async function touchLesson(lessonId: string) {
  if (isDemo) return demoSetProgress(lessonId, null);
  const { supabase, userId } = await currentUserId();
  await supabase
    .from("lesson_progress")
    .upsert({ user_id: userId, lesson_id: lessonId, updated_at: new Date().toISOString() }, { onConflict: "user_id,lesson_id" });
}

export async function setLessonCompleted(lessonId: string, completed: boolean) {
  if (isDemo) {
    demoSetProgress(lessonId, completed);
  } else {
    const { supabase, userId } = await currentUserId();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        { user_id: userId, lesson_id: lessonId, completed_at: completed ? now : null, updated_at: now },
        { onConflict: "user_id,lesson_id" },
      );
    if (error) throw new Error("Não foi possível salvar seu progresso.");
  }
  revalidatePath("/", "layout");
}

export async function toggleLiveReminder(liveId: string, active: boolean) {
  if (isDemo) {
    demoToggleReminder(liveId);
  } else {
    const { supabase, userId } = await currentUserId();
    const { error } = active
      ? await supabase.from("live_reminders").delete().eq("user_id", userId).eq("live_id", liveId)
      : await supabase.from("live_reminders").insert({ user_id: userId, live_id: liveId });
    if (error) throw new Error("Não foi possível salvar o lembrete.");
  }
  revalidatePath("/", "layout");
}

export async function signOut() {
  if (isDemo) return;
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
