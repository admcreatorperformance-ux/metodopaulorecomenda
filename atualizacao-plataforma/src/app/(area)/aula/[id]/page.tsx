import Link from "next/link";
import { notFound } from "next/navigation";
import { Flash } from "@/components/admin/flash";
import { CompleteButton } from "@/components/complete-button";
import { Comments, MaterialsList } from "@/components/lesson-extras";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { Player } from "@/components/player";
import { findLesson, moduleProgress, pad2 } from "@/lib/course";
import { loadAreaData } from "@/lib/data";
import { loadLessonExtras } from "@/lib/extras";

export default async function AulaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const [{ id }, { ok, erro }] = await Promise.all([params, searchParams]);
  const data = await loadAreaData();
  const found = findLesson(data, id);
  if (!found) notFound();
  const { mod, lesson, prev, next } = found;
  const completed = Boolean(data.progress[lesson.id]?.completedAt);
  const { percent } = moduleProgress(mod, data.progress);
  const { materials, comments } = await loadLessonExtras(lesson.id);

  return (
    <div className="container page-pad">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link href="/modulos">Módulos</Link> <ChevronRightIcon size={12} />
        <Link href={`/modulos/${mod.slug}`}>
          Módulo {pad2(mod.position)} · {mod.title}
        </Link>
        <ChevronRightIcon size={12} /> <span>Aula {pad2(lesson.position)}</span>
      </nav>

      <div className="lesson-layout">
        <div>
          <Player provider={lesson.videoProvider} videoId={lesson.videoId} title={lesson.title} />
          <div className="lesson-head">
            <div>
              <span className="kicker">
                Aula {pad2(lesson.position)} · Módulo {pad2(mod.position)}
              </span>
              <h1 style={{ marginTop: 10 }}>{lesson.title}</h1>
            </div>
            <CompleteButton lessonId={lesson.id} completed={completed} />
          </div>
          {lesson.description && <p className="lesson-desc">{lesson.description}</p>}
          <div style={{ marginTop: 20 }}>
            <Flash ok={ok} erro={erro} />
          </div>
          <MaterialsList materials={materials} />
          <div className="lesson-nav">
            {prev ? (
              <Link href={`/aula/${prev.id}`}>
                <ChevronLeftIcon /> Aula anterior
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/aula/${next.id}`}>
                Próxima aula <ChevronRightIcon />
              </Link>
            ) : (
              <Link href="/modulos">
                Ver próximos módulos <ChevronRightIcon />
              </Link>
            )}
          </div>
          <Comments lessonId={lesson.id} comments={comments} viewerId={data.viewer.id} viewerRole={data.viewer.role} />
        </div>

        <aside className="panel side-list" aria-label={`Aulas do módulo ${pad2(mod.position)}`}>
          <div className="panel__head">
            <h2 className="panel__title">
              Aulas do <span className="accent-pink">módulo {pad2(mod.position)}</span>
            </h2>
            <span className="meta">{percent}%</span>
          </div>
          {mod.lessons.map((l) => (
            <Link key={l.id} href={`/aula/${l.id}`} className="side-item" aria-current={l.id === lesson.id ? "page" : undefined}>
              <span className="side-item__n">{pad2(l.position)}</span>
              <span>{l.title}</span>
              {data.progress[l.id]?.completedAt ? (
                <span className="side-item__done" aria-label="Assistida">
                  <CheckIcon />
                </span>
              ) : (
                <span />
              )}
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
