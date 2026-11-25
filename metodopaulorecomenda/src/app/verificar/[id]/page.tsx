import { Suspense } from "react";
import { Brand } from "@/components/brand";
import { CertificateCard } from "@/components/certificate-card";
import { demoStore } from "@/lib/demo-data";
import { isDemo, supabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Certificate } from "@/lib/types";

export const metadata = { title: "Verificar certificado | Método Paulo Recomenda", robots: { index: false } };

async function find(id: string): Promise<Certificate | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  if (isDemo) return demoStore.certificate?.id === id ? demoStore.certificate : null;
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("verify_certificate", { p_id: id });
  const row = Array.isArray(data) ? data[0] : null;
  return row ? { id, fullName: row.full_name, lessonsCompleted: row.lessons_completed, issuedAt: row.issued_at } : null;
}

async function Result({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = await find(id);
  return cert ? (
    <>
      <p className="form-msg form-msg--ok" style={{ maxWidth: "none" }}>Certificado autêntico, emitido pela área de membros do Método Paulo Recomenda.</p>
      <CertificateCard cert={cert} />
    </>
  ) : (
    <p className="form-msg form-msg--err" style={{ maxWidth: "none" }}>Não encontramos um certificado com esse código.</p>
  );
}

export default function VerificarPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="container page-pad verify-page">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="verify-page__band" src="/brand/faixa-sinal.svg" alt="" aria-hidden="true" />
      <Brand />
      <h1 className="page-title" style={{ margin: "32px 0 20px" }}>Verificação de certificado</h1>
      <Suspense fallback={<p className="empty">Conferindo…</p>}>
        <Result params={params} />
      </Suspense>
    </div>
  );
}
