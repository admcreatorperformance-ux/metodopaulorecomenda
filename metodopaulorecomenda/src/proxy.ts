import { NextResponse, type NextRequest } from "next/server";
import { isDemo, supabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // Webhooks de pagamento: sem sessão; o próprio endpoint confere o token.
  if (request.nextUrl.pathname.startsWith("/api/webhooks/")) return NextResponse.next();
  if (isDemo) return NextResponse.next();
  if (!supabaseConfigured) {
    // Sem Supabase e sem modo demo: nunca expor a área.
    return new NextResponse("Área de membros não configurada.", { status: 503 });
  }
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|img/|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
