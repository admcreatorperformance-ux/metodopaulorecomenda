import { addComment, deleteComment } from "@/app/member-actions";
import { initials } from "@/lib/course";
import type { LessonComment, LessonMaterial, Role } from "@/lib/types";
import { FileIcon, LinkIcon } from "./icons";

const when = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date(iso));

export function MaterialsList({ materials }: { materials: LessonMaterial[] }) {
  if (!materials.length) return null;
  return (
    <section className="materials" aria-labelledby="materiais-title">
      <h2 id="materiais-title" className="lesson-section-title">Materiais da aula</h2>
      <ul>
        {materials.map((m) => (
          <li key={m.id}>
            <a href={`/material/${m.id}`} target="_blank" rel="noopener noreferrer" className="material">
              <span className="material__icon">{m.kind === "file" ? <FileIcon /> : <LinkIcon />}</span>
              <span>
                <b>{m.title}</b>
                <span className="meta">{m.kind === "file" ? "Baixar arquivo" : "Abrir link"}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Author({ c }: { c: LessonComment }) {
  const staff = c.authorRole !== "aluno";
  return (
    <div className="comment__head">
      <span className={`member__avatar${staff ? " member__avatar--staff" : ""}`}>
        {c.authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.authorAvatar} alt="" />
        ) : (
          initials(c.authorName)
        )}
      </span>
      <b>{c.authorName}</b>
      {staff && <span className="team-tag">EQUIPE</span>}
      <span className="meta">{when(c.createdAt)}</span>
    </div>
  );
}

function DeleteButton({ c, canDelete }: { c: LessonComment; canDelete: boolean }) {
  if (!canDelete) return null;
  return (
    <form action={deleteComment}>
      <input type="hidden" name="id" value={c.id} />
      <input type="hidden" name="lesson_id" value={c.lessonId} />
      <button type="submit" className="link-btn" style={{ marginTop: 0 }}>Apagar</button>
    </form>
  );
}

export function Comments({ lessonId, comments, viewerId, viewerRole }: { lessonId: string; comments: LessonComment[]; viewerId: string; viewerRole: Role }) {
  const isStaff = viewerRole !== "aluno";
  const roots = comments.filter((c) => !c.parentId);
  const replies = (id: string) => comments.filter((c) => c.parentId === id);
  const canDelete = (c: LessonComment) => isStaff || c.userId === viewerId;

  return (
    <section className="comments" id="comentarios" aria-labelledby="comentarios-title">
      <h2 id="comentarios-title" className="lesson-section-title">
        Dúvidas e comentários <span className="meta">({comments.length})</span>
      </h2>
      <form action={addComment} className="comment-form">
        <input type="hidden" name="lesson_id" value={lessonId} />
        <label htmlFor="novo-comentario" className="sr-only">Seu comentário</label>
        <textarea id="novo-comentario" name="body" required maxLength={2000} placeholder="Escreva sua dúvida ou conte como foi a aplicação..." />
        <button className="btn-save" type="submit">Publicar</button>
      </form>
      {roots.length === 0 && <p className="empty">Ninguém comentou ainda. Seja o primeiro.</p>}
      <ul className="comment-list">
        {roots.map((c) => (
          <li key={c.id} className="comment">
            <Author c={c} />
            <p className="comment__body">{c.body}</p>
            <div className="comment__actions">
              <details>
                <summary className="link-btn">Responder</summary>
                <form action={addComment} className="comment-form comment-form--reply">
                  <input type="hidden" name="lesson_id" value={lessonId} />
                  <input type="hidden" name="parent_id" value={c.id} />
                  <textarea name="body" required maxLength={2000} placeholder={`Responder ${c.authorName}...`} aria-label={`Responder ${c.authorName}`} />
                  <button className="btn-small" type="submit">Enviar resposta</button>
                </form>
              </details>
              <DeleteButton c={c} canDelete={canDelete(c)} />
            </div>
            {replies(c.id).length > 0 && (
              <ul className="comment-replies">
                {replies(c.id).map((r) => (
                  <li key={r.id} className="comment">
                    <Author c={r} />
                    <p className="comment__body">{r.body}</p>
                    <div className="comment__actions">
                      <DeleteButton c={r} canDelete={canDelete(r)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
