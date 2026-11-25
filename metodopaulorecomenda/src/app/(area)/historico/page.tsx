import Link from "next/link";
import { VideoThumb } from "@/components/video-card";
import { pad2 } from "@/lib/course";
import { loadAreaData } from "@/lib/data";

export const metadata = { title: "Histórico | Método Paulo Recomenda" };

const when = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date(iso));

export default async function HistoricoPage() {
  const data = await loadAreaData();
  const rows = data.modules
    .flatMap((m) => m.lessons.map((l) => ({ m, l, p: data.progress[l.id] })))
    .filter((r) => r.p)
    .sort((a, b) => b.p!.updatedAt.localeCompare(a.p!.updatedAt));

  return (
    <div className="container page-pad">
      <h1 className="page-title">Seu <span className="accent-cyan">histórico</span></h1>
      <p className="page-lead">As aulas que você abriu, da mais recente para a mais antiga.</p>
      {rows.length === 0 ? (
        <div className="admin-card" style={{ marginTop: 28 }}>
          <p className="empty">Você ainda não abriu nenhuma aula.</p>
          <Link className="btn-small" href="/modulos">Começar pelos módulos</Link>
        </div>
      ) : (
        <div className="lesson-list" style={{ marginTop: 28 }}>
          {rows.map(({ m, l, p }) => (
            <Link key={l.id} href={`/aula/${l.id}`} className="lesson-row">
              <span className="lesson-row__num">{pad2(l.position)}</span>
              <VideoThumb src={l.thumbnailUrl} small />
              <span>
                <span className="lesson-row__title">{l.title}</span>
                <p className="meta">Módulo {pad2(m.position)} · {m.title} · {when(p!.updatedAt)}</p>
              </span>
              <span className={`status status--${p!.completedAt ? "assistida" : "em_andamento"}`}>{p!.completedAt ? "Assistida" : "Em andamento"}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
