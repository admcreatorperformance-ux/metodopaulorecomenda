import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRightIcon } from "@/components/icons";
import { LessonList } from "@/components/lesson-list";
import { ProgressBar } from "@/components/progress-bar";
import { moduleProgress, pad2 } from "@/lib/course";
import { loadAreaData } from "@/lib/data";

export default async function ModuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadAreaData();
  const mod = data.modules.find((m) => m.slug === slug);
  if (!mod) notFound();
  const { percent, done, total } = moduleProgress(mod, data.progress);

  return (
    <div className="container page-pad">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link href="/modulos">Módulos</Link> <ChevronRightIcon size={12} /> <span>Módulo {pad2(mod.position)}</span>
      </nav>
      <span className="kicker">Módulo {pad2(mod.position)}</span>
      <h1 className="page-title" style={{ marginTop: 12 }}>
        {mod.title}
      </h1>
      {mod.description && <p className="page-lead">{mod.description}</p>}
      <div style={{ maxWidth: 440, margin: "24px 0 32px" }}>
        <div className="hero__progress-head">
          <span>
            {done} de {total} aulas assistidas
          </span>
          <b>{percent}%</b>
        </div>
        <ProgressBar percent={percent} thick label="Progresso no módulo" />
      </div>
      <LessonList mod={mod} data={data} />
    </div>
  );
}
