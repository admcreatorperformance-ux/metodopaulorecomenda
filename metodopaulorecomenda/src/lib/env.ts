export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/** Modo demonstração: só liga quando o Supabase NÃO está configurado e DEMO_MODE=1. */
export const isDemo = !supabaseConfigured && process.env.DEMO_MODE === "1";
