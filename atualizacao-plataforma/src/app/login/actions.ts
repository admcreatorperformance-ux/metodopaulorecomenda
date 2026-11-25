"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDemo } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { step: "email" | "code"; email?: string; message?: string; error?: string };

const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "/";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
};

export async function sendLoginCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { step: "email", error: "Digite um e-mail válido." };
  if (isDemo) redirect("/");

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Só entra quem já foi cadastrado (compra/convite). Ninguém cria conta sozinho.
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  // Mesma resposta para e-mail cadastrado ou não (não revela quem é aluno).
  if (error && error.status === 429) {
    return { step: "email", email, error: "Muitas tentativas. Aguarde um minuto e tente de novo." };
  }
  return {
    step: "code",
    email,
    message: "Se esse e-mail tiver acesso, enviamos um link e um código de 6 dígitos. Confira também o spam.",
  };
}

export async function verifyLoginCode(prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? prev.email ?? "");
  const token = String(formData.get("token") ?? "").replace(/\D/g, "");
  if (token.length < 6) return { ...prev, step: "code", error: "Digite o código que chegou no e-mail." };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { ...prev, step: "code", email, error: "Código inválido ou expirado. Peça um novo." };
  redirect(safeNext(formData.get("next")));
}
