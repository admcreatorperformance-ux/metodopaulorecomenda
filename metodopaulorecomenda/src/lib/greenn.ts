import "server-only";
import { timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PRODUCT = "metodo-paulo-recomenda";

/** O que fazer com a matrícula a partir do status que a Greenn mandou. */
export type Action = "liberar" | "bloquear" | "ignorar";

export type GreennEvent = {
  type: string; // sale | contract
  status: string; // currentStatus
  email: string;
  name: string;
  productId: string;
  externalId: string; // id da venda (sale) ou do contrato (contract)
};

// Venda avulsa (type "sale"): paid libera; reembolso e chargeback bloqueiam.
// Assinatura (type "contract"): paid/active/trialing libera; cancelado/encerrado bloqueia.
// Qualquer outro status (aguardando pagamento, recusado...) não mexe no acesso.
const LIBERA = new Set(["paid", "active", "trialing"]);
const BLOQUEIA = new Set(["refunded", "chargedback", "canceled", "cancelled", "ended", "expired"]);

export function decide(status: string): Action {
  const s = status.toLowerCase();
  if (LIBERA.has(s)) return "liberar";
  if (BLOQUEIA.has(s)) return "bloquear";
  return "ignorar";
}

function text(v: unknown): string {
  return typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
}

/** Lê os campos que importam do corpo do webhook da Greenn (formato documentado em greenn.com.br/ajuda/vendo/webhook). */
export function parseGreenn(body: unknown): GreennEvent | null {
  if (!body || typeof body !== "object") return null;
  type Obj = Record<string, unknown>;
  const b = body as Obj;
  const o = (v: unknown): Obj => (v && typeof v === "object" ? (v as Obj) : {});
  const type = text(b.type).toLowerCase();
  const sale = o(b.sale ?? b.currentSale);
  const status = text(b.currentStatus) || text(type === "contract" ? o(b.contract).status : sale.status);
  return {
    type,
    status,
    email: text(o(b.client).email).toLowerCase(),
    name: text(o(b.client).name),
    productId: text(o(b.product).id),
    externalId: type === "contract" ? text(o(b.contract).id) || text(sale.id) : text(sale.id),
  };
}

/** Compara o token da URL com o da Vercel sem vazar tempo de comparação. */
export function tokenOk(received: string | null, expected: string | undefined): boolean {
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Lista de produtos da Greenn que dão acesso ao Método (GREENN_PRODUCT_IDS="123,456"). Vazia = todos. */
export function allowedProducts(raw: string | undefined): Set<string> {
  return new Set((raw ?? "").split(",").map((s) => s.trim()).filter(Boolean));
}

export type Outcome = { result: "liberado" | "bloqueado" | "ignorado" | "erro"; detail: string };

/** Aplica o evento: cria o aluno se precisar e liga/desliga a matrícula. */
export async function applyEvent(service: SupabaseClient, ev: GreennEvent, products: Set<string>): Promise<Outcome> {
  if (ev.type !== "sale" && ev.type !== "contract") return { result: "ignorado", detail: `tipo ${ev.type || "vazio"}` };
  if (products.size && !products.has(ev.productId)) return { result: "ignorado", detail: `produto ${ev.productId || "vazio"} fora da lista` };
  const action = decide(ev.status);
  if (action === "ignorar") return { result: "ignorado", detail: `status ${ev.status || "vazio"}` };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev.email)) return { result: "erro", detail: "e-mail ausente ou inválido" };

  const { data: found, error: findError } = await service.rpc("service_find_user", { p_email: ev.email });
  if (findError) return { result: "erro", detail: `busca do usuário: ${findError.message}` };
  let userId = (found as string | null) ?? null;

  if (action === "bloquear") {
    if (!userId) return { result: "ignorado", detail: "bloqueio para e-mail sem conta" };
    const { error } = await service
      .from("enrollments")
      .update({ status: ev.status === "chargedback" || ev.status === "refunded" ? "refunded" : "canceled" })
      .eq("user_id", userId)
      .eq("product", PRODUCT);
    return error ? { result: "erro", detail: `bloqueio: ${error.message}` } : { result: "bloqueado", detail: ev.status };
  }

  if (!userId) {
    const { data, error } = await service.auth.admin.createUser({
      email: ev.email,
      email_confirm: true,
      user_metadata: ev.name ? { full_name: ev.name } : {},
    });
    if (error || !data.user) return { result: "erro", detail: `criar usuário: ${error?.message ?? "sem retorno"}` };
    userId = data.user.id;
  }

  const { error } = await service.from("enrollments").upsert(
    {
      user_id: userId,
      product: PRODUCT,
      status: "active",
      source: "greenn",
      external_id: ev.externalId || null,
      starts_at: new Date().toISOString(),
      expires_at: null,
    },
    { onConflict: "user_id,product" },
  );
  if (error) return { result: "erro", detail: `matrícula: ${error.message}` };

  // Nome do comprador no perfil, só se ainda estiver vazio ou for o padrão (parte do e-mail).
  if (ev.name) {
    const fallback = ev.email.split("@")[0];
    await service.from("profiles").update({ full_name: ev.name }).eq("id", userId).in("full_name", ["", fallback]);
  }
  return { result: "liberado", detail: ev.status };
}
