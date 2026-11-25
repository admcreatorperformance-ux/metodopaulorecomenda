import { NextResponse, type NextRequest } from "next/server";
import { demoStore } from "@/lib/demo-data";
import { isDemo } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Abre um material da aula. Link: redireciona. Arquivo: gera um link temporário (2 min) do Storage privado.
 * Quem não tem acesso não enxerga o material (RLS) e cai de volta na área.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = new URL("/", request.url);

  if (isDemo) {
    const m = demoStore.materials.find((x) => x.id === id);
    if (m?.kind === "link" && m.url) return NextResponse.redirect(m.url);
    return NextResponse.redirect(new URL(`/aula/${m?.lessonId ?? ""}?erro=${encodeURIComponent("No modo demonstração os arquivos não abrem.")}`, request.url));
  }

  const supabase = await createClient();
  const { data: m } = await supabase.from("lesson_materials").select("lesson_id, kind, url, storage_path, title").eq("id", id).maybeSingle();
  if (!m) return NextResponse.redirect(home);
  if (m.kind === "link" && m.url) return NextResponse.redirect(m.url);

  const fileName = (m.storage_path as string).split("/").pop() ?? "material";
  const { data, error } = await supabase.storage.from("materiais").createSignedUrl(m.storage_path, 120, { download: fileName.replace(/^\d+-/, "") });
  if (error || !data?.signedUrl) {
    return NextResponse.redirect(new URL(`/aula/${m.lesson_id}?erro=${encodeURIComponent("Não deu para abrir o material agora.")}`, request.url));
  }
  return NextResponse.redirect(data.signedUrl);
}
