import Link from "next/link";
import { Flash, type FlashParams } from "@/components/admin/flash";
import { adminLives } from "@/lib/admin";
import { liveDateParts } from "@/lib/course";
import { LiveForm } from "./live-form";

const statusLabel = { agendada: "Agendada", ao_vivo: "Ao vivo", encerrada: "Encerrada" } as const;

export default async function AdminLives({ searchParams }: { searchParams: FlashParams }) {
  const [{ ok, erro }, lives] = await Promise.all([searchParams, adminLives()]);
  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Lives e gravações</h1>
        <a className="btn-small only-mobile" href="#novo">+ Nova live</a>
      </div>
      <Flash ok={ok} erro={erro} />
      <div className="admin-grid">
        <div className="admin-list">
          {lives.length === 0 && <p className="empty" style={{ padding: 20 }}>Nenhuma live ainda.</p>}
          {lives.map((l) => {
            const d = liveDateParts(l.startsAt);
            return (
              <div key={l.id} className="admin-row">
                <span className="date-pill"><b>{d.day}</b><span>{d.month}</span></span>
                <div>
                  <p className="admin-row__title">{l.title}</p>
                  <p className="meta">
                    {d.time} · {l.status === "encerrada" ? (l.recordingVideoId ? "Com gravação" : "Sem gravação") : l.joinUrl ? "Com link" : "Sem link"}
                    {l.published ? "" : " · Oculta"}
                  </p>
                </div>
                <span className={`tag ${l.status === "ao_vivo" ? "tag--warn" : l.status === "agendada" ? "tag--on" : "tag--off"}`}>{statusLabel[l.status]}</span>
                <Link className="btn-small" href={`/admin/lives/${l.id}`}>Editar</Link>
              </div>
            );
          })}
        </div>
        <LiveForm />
      </div>
    </>
  );
}
