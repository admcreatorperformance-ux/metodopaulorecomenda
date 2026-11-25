import { NextResponse, type NextRequest } from "next/server";
import { allowedProducts, applyEvent, parseGreenn, tokenOk, type Outcome } from "@/lib/greenn";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Webhook da Greenn: libera ou bloqueia o acesso do comprador.
 * URL para cadastrar na Greenn: https://SEU-SITE/api/webhooks/greenn?token=GREENN_WEBHOOK_TOKEN
 * Variáveis na Vercel: GREENN_WEBHOOK_TOKEN (obrigatória), GREENN_PRODUCT_IDS (opcional), SUPABASE_SECRET_KEY.
 */
export async function POST(request: NextRequest) {
  if (!tokenOk(request.nextUrl.searchParams.get("token"), process.env.GREENN_WEBHOOK_TOKEN)) {
    return NextResponse.json({ ok: false, error: "token inválido" }, { status: 401 });
  }

  const service = createServiceClient();
  if (!service) return NextResponse.json({ ok: false, error: "SUPABASE_SECRET_KEY ausente" }, { status: 500 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "corpo inválido" }, { status: 400 });
  }

  const ev = parseGreenn(body);
  let outcome: Outcome;
  try {
    outcome = ev ? await applyEvent(service, ev, allowedProducts(process.env.GREENN_PRODUCT_IDS)) : { result: "ignorado", detail: "corpo vazio" };
  } catch (e) {
    outcome = { result: "erro", detail: e instanceof Error ? e.message : "erro desconhecido" };
  }

  await service.from("webhook_events").insert({
    provider: "greenn",
    event_type: ev?.type || null,
    status: ev?.status || null,
    email: ev?.email || null,
    product_id: ev?.productId || null,
    external_id: ev?.externalId || null,
    result: outcome.result,
    detail: outcome.detail,
    payload: body as object,
  });

  // Erro devolve 500 para a Greenn tentar de novo; o resto responde 200.
  return NextResponse.json({ ok: outcome.result !== "erro", ...outcome }, { status: outcome.result === "erro" ? 500 : 200 });
}

export function GET() {
  return NextResponse.json({ ok: true, info: "Webhook da Greenn. Use POST." });
}
