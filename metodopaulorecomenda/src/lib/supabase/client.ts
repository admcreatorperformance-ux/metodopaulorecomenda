"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Cliente do navegador (sessão do próprio usuário). Usado só para enviar arquivos ao Storage. */
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return url && key ? createBrowserClient(url, key) : null;
}
