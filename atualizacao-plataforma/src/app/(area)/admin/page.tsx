import Link from "next/link";
import { adminLives, adminMembers, adminModules } from "@/lib/admin";
import { liveDateParts } from "@/lib/course";

export default async function AdminHome() {
  const [modules, lives, members] = await Promise.all([adminModules(), adminLives(), adminMembers()]);
  const lessons = modules.flatMap((m) => m.lessons);
  const published = lessons.filter((l) => l.published && modules.find((m) => m.id === l.moduleId)?.published);
  const withoutVideo = published.filter((l) => !l.videoId);
  const active = members.filter((m) => m.enrollmentStatus === "active");
  const next = lives.filter((l) => l.status !== "encerrada").sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Visão geral</h1>
      </div>
      <div className="stats">
        <div className="stat"><b>{modules.length}</b><span>módulos ({modules.filter((m) => m.published).length} publicados)</span></div>
        <div className="stat"><b>{published.length}</b><span>aulas publicadas de {lessons.length}</span></div>
        <div className="stat"><b>{active.length}</b><span>alunos com acesso ativo</span></div>
        <div className="stat"><b>{withoutVideo.length}</b><span>aulas publicadas sem vídeo</span></div>
      </div>
      <div className="admin-grid">
        <div className="admin-card">
          <h2>O que fazer agora</h2>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9, color: "var(--ink-soft)" }}>
            {modules.length === 0 && <li><Link className="admin-link" href="/admin/modulos">Criar o primeiro módulo</Link></li>}
            {withoutVideo.length > 0 && <li>{withoutVideo.length} aula(s) publicada(s) ainda sem vídeo. <Link className="admin-link" href="/admin/modulos">Ver módulos</Link></li>}
            {active.length === 0 && <li><Link className="admin-link" href="/admin/alunos">Liberar acesso para o primeiro aluno</Link></li>}
            {!next && <li><Link className="admin-link" href="/admin/lives">Agendar a próxima live</Link></li>}
            <li><Link className="admin-link" href="/admin/configuracoes">Conferir o link da comunidade</Link></li>
          </ul>
        </div>
        <div className="admin-card">
          <h2>Próxima live</h2>
          {next ? (
            <>
              <p className="admin-row__title">{next.title}</p>
              <p className="meta" style={{ textTransform: "capitalize", marginTop: 6 }}>
                {(() => { const d = liveDateParts(next.startsAt); return `${d.weekday}, ${d.day} ${d.month.toLowerCase()} às ${d.time}`; })()}
              </p>
              <Link className="btn-small" style={{ marginTop: 14 }} href={`/admin/lives/${next.id}`}>Editar</Link>
            </>
          ) : (
            <p className="empty">Nenhuma live agendada.</p>
          )}
        </div>
      </div>
    </>
  );
}
