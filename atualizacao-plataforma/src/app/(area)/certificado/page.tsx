import Link from "next/link";
import { headers } from "next/headers";
import { Flash, type FlashParams } from "@/components/admin/flash";
import { CertificateCard } from "@/components/certificate-card";
import { PrintButton } from "@/components/print-button";
import { ProgressBar } from "@/components/progress-bar";
import { issueCertificate } from "@/app/member-actions";
import { loadAreaData } from "@/lib/data";
import { courseCompletion, loadCertificate } from "@/lib/extras";

export const metadata = { title: "Certificado | Método Paulo Recomenda" };

export default async function CertificadoPage({ searchParams }: { searchParams: FlashParams }) {
  const [{ ok, erro }, data, cert, h] = await Promise.all([searchParams, loadAreaData(), loadCertificate(), headers()]);
  const { total, done, complete } = courseCompletion(data);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const verifyUrl = cert ? `https://${h.get("host")}/verificar/${cert.id}` : "";

  return (
    <div className="container page-pad">
      <div className="no-print">
        <h1 className="page-title">Seu <span className="accent-pink">certificado</span></h1>
        <p className="page-lead">Liberado quando você conclui todas as aulas publicadas do método.</p>
        <div style={{ marginTop: 24 }}><Flash ok={ok} erro={erro} /></div>
      </div>

      {cert ? (
        <>
          <CertificateCard cert={cert} />
          <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 20 }}>
            <PrintButton />
            <span className="field-help" style={{ overflowWrap: "anywhere" }}>Quem quiser conferir a autenticidade acessa: {verifyUrl}</span>
          </div>
        </>
      ) : complete ? (
        <form action={issueCertificate} className="admin-card" style={{ marginTop: 24, maxWidth: 560 }}>
          <h2>Você concluiu todas as {total} aulas!</h2>
          <p className="field-help" style={{ marginBottom: 16 }}>
            Confira se seu nome está certo em <Link className="admin-link" href="/perfil">Meu perfil</Link> antes de emitir. Ele vai no certificado.
          </p>
          <button className="btn-save" type="submit">Emitir meu certificado</button>
        </form>
      ) : (
        <div className="admin-card" style={{ marginTop: 24, maxWidth: 560 }}>
          <h2>Falta pouco</h2>
          <div className="hero__progress-head">
            <span>{done} de {total} aulas concluídas</span>
            <b>{percent}%</b>
          </div>
          <ProgressBar percent={percent} thick label="Progresso no curso" />
          <Link className="btn-small" style={{ marginTop: 18 }} href="/">Continuar de onde parei</Link>
        </div>
      )}
    </div>
  );
}
