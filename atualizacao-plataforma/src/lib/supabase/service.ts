import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "../env";

/**
 * Cliente com a chave secreta (service_role). Só roda no servidor e só é usado
 * em ações de admin já verificadas, como cadastrar um aluno no Auth.
 * A chave fica na Vercel como SUPABASE_SECRET_KEY, sem o prefixo NEXT_PUBLIC_.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
