import Link from "next/link";
import { notFound } from "next/navigation";
import { Flash, type FlashParams } from "@/components/admin/flash";
import { VideoFields } from "@/components/admin/video-fields";
import { adminModules } from "@/lib/admin";
import { pad2 } from "@/lib/course";
import { saveLesson, saveModule } from "../../actions";

export default async function AdminModulo({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: FlashParams }) {
  const [{ id }, { ok, erro }, modules] = await Promise.all([params, searchParams, adminModules()]);
  const mod = modules.find((m) => m.id === id);
  if (!mod) notFound();
  const nextPosition = (mod.lessons.at(-1)?.position ?? 0) + 1;

  return (
    <>
      <nav className="breadcrumb">
        <Link href="/admin/modulos">Módulos</Link> <span>›</span> <span>Módulo {pad2(mod.position)}</span>
      </nav>
      <div className="admin-head">
        <h1 className="page-title">{mod.title}</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn-small only-mobile" href="#novo">+ Nova aula</a>
          <Link className="btn-small" href={`/modulos/${mod.slug}`}>Ver como aluno</Link>
        </div>
      </div>
      <Flash ok={ok} erro={erro} />
      <div className="admin-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <section>
            <h2 className="section-title" style={{ fontSize: 22, marginBottom: 14 }}>Aulas</h2>
            <div className="admin-list">
              {mod.lessons.length === 0 && <p className="empty" style={{ padding: 20 }}>Nenhuma aula ainda.</p>}
              {mod.lessons.map((l) => (
                <div key={l.id} className="admin-row">
                  <span className="admin-row__n">{pad2(l.position)}</span>
                  <div>
                    <p className="admin-row__title">{l.title}</p>
                    <p className="meta">{l.videoId ? `Vídeo: ${l.videoProvider}` : "Sem vídeo"}{l.durationSeconds ? ` · ${Math.round(l.durationSeconds / 60)} min` : ""}</p>
                  </div>
                  <span className={`tag ${l.published ? "tag--on" : "tag--off"}`}>{l.published ? "Publicada" : "Rascunho"}</span>
                  <Link className="btn-small" href={`/admin/aulas/${l.id}`}>Editar</Link>
                </div>
              ))}
            </div>
          </section>

          <form action={saveLesson} className="admin-card" id="novo">
            <h2>Nova aula neste módulo</h2>
            <input type="hidden" name="module_id" value={mod.id} />
            <div className="field-row">
              <div className="field">
                <label htmlFor="l-title">Título da aula</label>
                <input id="l-title" name="title" required />
              </div>
              <div className="field">
                <label htmlFor="l-position">Ordem</label>
                <input id="l-position" name="position" type="number" min={1} defaultValue={nextPosition} />
              </div>
            </div>
            <VideoFields providerName="video_provider" idName="video_id" />
            <div className="field-row">
              <div className="field">
                <label htmlFor="l-duration">Duração (minutos)</label>
                <input id="l-duration" name="duration_minutes" type="number" min={1} />
              </div>
              <div className="field">
                <label htmlFor="l-thumb">Capa (link da imagem, opcional)</label>
                <input id="l-thumb" name="thumbnail_url" type="url" placeholder="https://..." />
              </div>
            </div>
            <div className="field">
              <label htmlFor="l-desc">Descrição / material de apoio</label>
              <textarea id="l-desc" name="description" placeholder="Resumo da aula, links e tarefas." />
            </div>
            <label className="check"><input type="checkbox" name="published" defaultChecked /> Publicar a aula</label>
            <button className="btn-save" type="submit">Adicionar aula</button>
          </form>
        </div>

        <form action={saveModule} className="admin-card">
          <h2>Dados do módulo</h2>
          <input type="hidden" name="id" value={mod.id} />
          <div className="field">
            <label htmlFor="title">Título</label>
            <input id="title" name="title" defaultValue={mod.title} required />
          </div>
          <div className="field">
            <label htmlFor="description">Descrição curta</label>
            <textarea id="description" name="description" defaultValue={mod.description} />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="position">Ordem</label>
              <input id="position" name="position" type="number" min={1} defaultValue={mod.position} />
            </div>
            <div className="field">
              <label htmlFor="slug">Endereço (slug)</label>
              <input id="slug" name="slug" defaultValue={mod.slug} />
            </div>
          </div>
          <label className="check"><input type="checkbox" name="published" defaultChecked={mod.published} /> Publicado (alunos veem)</label>
          <button className="btn-save" type="submit">Salvar módulo</button>
        </form>
      </div>
    </>
  );
}
