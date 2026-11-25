import Link from "next/link";
import { notFound } from "next/navigation";
import { Flash, type FlashParams } from "@/components/admin/flash";
import { VideoFields } from "@/components/admin/video-fields";
import { Player } from "@/components/player";
import { MaterialFileUpload } from "@/components/upload-fields";
import { FileIcon, LinkIcon } from "@/components/icons";
import { adminModules } from "@/lib/admin";
import { pad2 } from "@/lib/course";
import { isDemo } from "@/lib/env";
import { loadLessonExtras } from "@/lib/extras";
import { addMaterialLink, deleteLesson, deleteMaterial, saveLesson } from "../../actions";

export default async function AdminAula({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: FlashParams }) {
  const [{ id }, { ok, erro }, modules] = await Promise.all([params, searchParams, adminModules()]);
  const mod = modules.find((m) => m.lessons.some((l) => l.id === id));
  const lesson = mod?.lessons.find((l) => l.id === id);
  if (!mod || !lesson) notFound();
  const { materials } = await loadLessonExtras(lesson.id);
  const nextMaterial = (materials.at(-1)?.position ?? 0) + 1;

  return (
    <>
      <nav className="breadcrumb">
        <Link href="/admin/modulos">Módulos</Link> <span>›</span>
        <Link href={`/admin/modulos/${mod.id}`}>Módulo {pad2(mod.position)}</Link> <span>›</span> <span>Aula {pad2(lesson.position)}</span>
      </nav>
      <div className="admin-head">
        <h1 className="page-title">{lesson.title}</h1>
        <Link className="btn-small" href={`/aula/${lesson.id}`}>Ver como aluno</Link>
      </div>
      <Flash ok={ok} erro={erro} />
      <div className="admin-grid">
        <div>
          <Player provider={lesson.videoProvider} videoId={lesson.videoId} title={lesson.title} />
          <p className="field-help" style={{ marginTop: 10 }}>Prévia do vídeo como o aluno vê. Salve para atualizar.</p>

          <section className="admin-card" style={{ marginTop: 24 }}>
            <h2>Materiais da aula</h2>
            {materials.length === 0 ? (
              <p className="empty" style={{ paddingTop: 0 }}>Nenhum material ainda. Adicione um link ou envie um arquivo.</p>
            ) : (
              <div className="admin-list" style={{ marginBottom: 20 }}>
                {materials.map((m) => (
                  <div key={m.id} className="admin-row">
                    <span className="material__icon">{m.kind === "file" ? <FileIcon /> : <LinkIcon />}</span>
                    <div>
                      <p className="admin-row__title">{m.title}</p>
                      <p className="meta" style={{ overflowWrap: "anywhere" }}>{m.kind === "file" ? "Arquivo" : m.url}</p>
                    </div>
                    <a className="btn-small" href={`/material/${m.id}`} target="_blank" rel="noopener noreferrer">Abrir</a>
                    <form action={deleteMaterial}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="lesson_id" value={lesson.id} />
                      <button className="btn-small btn-small--danger" type="submit">Remover</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
            <div className="field-row" style={{ alignItems: "start", gap: 24 }}>
              <form action={addMaterialLink}>
                <p className="meta" style={{ marginBottom: 10 }}>Adicionar link (Drive, planilha, site)</p>
                <input type="hidden" name="lesson_id" value={lesson.id} />
                <input type="hidden" name="position" value={nextMaterial} />
                <div className="field">
                  <label htmlFor="mat-title">Nome do material</label>
                  <input id="mat-title" name="title" required placeholder="Ex.: Planilha de testes" />
                </div>
                <div className="field">
                  <label htmlFor="mat-url">Link</label>
                  <input id="mat-url" name="url" type="url" required placeholder="https://..." />
                </div>
                <button className="btn-save" type="submit">Adicionar link</button>
              </form>
              <div>
                <p className="meta" style={{ marginBottom: 10 }}>Ou enviar arquivo</p>
                <MaterialFileUpload lessonId={lesson.id} nextPosition={nextMaterial} demo={isDemo} />
              </div>
            </div>
          </section>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <form action={saveLesson} className="admin-card">
            <h2>Editar aula</h2>
            <input type="hidden" name="id" value={lesson.id} />
            <input type="hidden" name="module_id" value={mod.id} />
            <div className="field">
              <label htmlFor="title">Título</label>
              <input id="title" name="title" defaultValue={lesson.title} required />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="position">Ordem</label>
                <input id="position" name="position" type="number" min={1} defaultValue={lesson.position} />
              </div>
              <div className="field">
                <label htmlFor="duration">Duração (min)</label>
                <input id="duration" name="duration_minutes" type="number" min={1} defaultValue={lesson.durationSeconds ? Math.round(lesson.durationSeconds / 60) : ""} />
              </div>
            </div>
            <VideoFields providerName="video_provider" idName="video_id" provider={lesson.videoProvider} videoId={lesson.videoId} />
            <div className="field">
              <label htmlFor="thumb">Capa (link da imagem, opcional)</label>
              <input id="thumb" name="thumbnail_url" type="url" defaultValue={lesson.thumbnailUrl ?? ""} placeholder="https://..." />
            </div>
            <div className="field">
              <label htmlFor="desc">Descrição / material de apoio</label>
              <textarea id="desc" name="description" defaultValue={lesson.description} />
            </div>
            <label className="check"><input type="checkbox" name="published" defaultChecked={lesson.published} /> Publicada (alunos veem)</label>
            <button className="btn-save" type="submit">Salvar aula</button>
          </form>

          <form action={deleteLesson} className="admin-card">
            <h2>Apagar aula</h2>
            <input type="hidden" name="id" value={lesson.id} />
            <input type="hidden" name="module_id" value={mod.id} />
            <p className="field-help" style={{ marginBottom: 12 }}>
              Só dá para apagar aula em rascunho. Apagar também remove o progresso dos alunos nessa aula e não tem volta.
            </p>
            <label className="check"><input type="checkbox" name="confirm" /> Entendi, quero apagar</label>
            <button className="btn-small btn-small--danger" type="submit" disabled={lesson.published}>
              {lesson.published ? "Despublique para apagar" : "Apagar aula"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
