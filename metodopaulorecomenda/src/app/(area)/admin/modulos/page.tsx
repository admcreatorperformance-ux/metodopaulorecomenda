import Link from "next/link";
import { Flash, type FlashParams } from "@/components/admin/flash";
import { adminModules } from "@/lib/admin";
import { pad2 } from "@/lib/course";
import { saveModule } from "../actions";

export default async function AdminModulos({ searchParams }: { searchParams: FlashParams }) {
  const [{ ok, erro }, modules] = await Promise.all([searchParams, adminModules()]);
  const nextPosition = (modules.at(-1)?.position ?? 0) + 1;
  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Módulos e aulas</h1>
        <a className="btn-small only-mobile" href="#novo">+ Novo módulo</a>
      </div>
      <Flash ok={ok} erro={erro} />
      <div className="admin-grid">
        <div className="admin-list">
          {modules.length === 0 && <p className="empty" style={{ padding: 20 }}>Nenhum módulo ainda. Crie o primeiro ao lado.</p>}
          {modules.map((m) => (
            <div key={m.id} className="admin-row">
              <span className="admin-row__n">{pad2(m.position)}</span>
              <div>
                <p className="admin-row__title">{m.title}</p>
                <p className="meta">
                  {m.lessons.length} aulas · {m.lessons.filter((l) => !l.videoId).length} sem vídeo
                </p>
              </div>
              <span className={`tag ${m.published ? "tag--on" : "tag--off"}`}>{m.published ? "Publicado" : "Rascunho"}</span>
              <Link className="btn-small" href={`/admin/modulos/${m.id}`}>Editar e aulas</Link>
            </div>
          ))}
        </div>
        <form action={saveModule} className="admin-card" id="novo">
          <h2>Novo módulo</h2>
          <div className="field">
            <label htmlFor="title">Título</label>
            <input id="title" name="title" required placeholder="Ex.: Encontrar produtos com potencial" />
          </div>
          <div className="field">
            <label htmlFor="description">Descrição curta</label>
            <textarea id="description" name="description" placeholder="Aparece no card do pilar e no topo do módulo." />
          </div>
          <div className="field">
            <label htmlFor="position">Ordem</label>
            <input id="position" name="position" type="number" min={1} defaultValue={nextPosition} />
          </div>
          <label className="check"><input type="checkbox" name="published" /> Publicar agora (alunos já veem)</label>
          <button className="btn-save" type="submit">Criar módulo</button>
        </form>
      </div>
    </>
  );
}
