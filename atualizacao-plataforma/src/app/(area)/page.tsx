import Link from "next/link";
import { Carousel } from "@/components/carousel";
import { CommunityBanner } from "@/components/community-banner";
import { CommunityPanel } from "@/components/community-panel";
import { Hero } from "@/components/hero";
import { ChevronRightIcon } from "@/components/icons";
import { LessonList } from "@/components/lesson-list";
import { LivePanel } from "@/components/live-panel";
import { PillarCard } from "@/components/pillar-card";
import { VideoCard } from "@/components/video-card";
import { continueWatching, currentLesson, formatDate, moduleProgress, pad2, splitLives } from "@/lib/course";
import { loadAreaData } from "@/lib/data";

export default async function InicioPage() {
  const data = await loadAreaData();
  const lesson = currentLesson(data);
  const currentMod = lesson ? data.modules.find((m) => m.id === lesson.moduleId)! : data.modules[0];
  const { live, upcoming, recordings } = splitLives(data.lives);
  const watching = continueWatching(data);
  const modOf = (moduleId: string) => data.modules.find((m) => m.id === moduleId)!;

  if (!currentMod) {
    return (
      <div className="container page-pad">
        <h1 className="page-title">As aulas estão a caminho</h1>
        <p className="page-lead">Os módulos ainda não foram publicados. Assim que estiverem no ar, aparecem aqui.</p>
      </div>
    );
  }

  return (
    <>
      {lesson && (
        <Hero
          mod={currentMod}
          lesson={lesson}
          percent={moduleProgress(currentMod, data.progress).percent}
          started={Object.keys(data.progress).length > 0}
        />
      )}

      <div className="container body-grid">
        <div className="area-main">
          {watching.length > 0 && (
            <section aria-labelledby="continue-title">
              <div className="section-head">
                <h2 id="continue-title" className="section-title">
                  Continue <span className="accent-pink">assistindo</span>
                </h2>
                <Link href="/historico" className="section-link">
                  Ver histórico <ChevronRightIcon />
                </Link>
              </div>
              <Carousel className="rail rail--3" label="Continue assistindo">
                {watching.map((l) => {
                  const m = modOf(l.moduleId);
                  return (
                    <VideoCard
                      key={l.id}
                      href={`/aula/${l.id}`}
                      label={`Módulo ${pad2(m.position)}`}
                      meta={`Aula ${pad2(l.position)} · Módulo ${pad2(m.position)}`}
                      title={l.title}
                      thumb={l.thumbnailUrl}
                      percent={moduleProgress(m, data.progress).percent}
                    />
                  );
                })}
              </Carousel>
            </section>
          )}

          <section aria-labelledby="pilares-title">
            <div className="section-head">
              <h2 id="pilares-title" className="section-title">
                Os {data.modules.length} pilares da sua <span className="accent-cyan">operação</span>
              </h2>
              <Link href="/modulos" className="section-link">
                Ver todos os módulos <ChevronRightIcon />
              </Link>
            </div>
            <Carousel className="rail rail--pillars" label="Os pilares do método">
              {data.modules.map((m) => (
                <PillarCard key={m.id} mod={m} percent={moduleProgress(m, data.progress).percent} active={m.id === currentMod.id} />
              ))}
            </Carousel>
          </section>

          <section aria-labelledby="aulas-title">
            <div className="section-head">
              <h2 id="aulas-title" className="section-title">
                Aulas do <span className="accent-pink">módulo {pad2(currentMod.position)}</span>
              </h2>
            </div>
            <LessonList mod={currentMod} data={data} />
          </section>

          <CommunityBanner communityUrl={data.communityUrl} />

          {recordings.length > 0 && (
            <section aria-labelledby="gravacoes-title">
              <div className="section-head">
                <h2 id="gravacoes-title" className="section-title">
                  Gravações das <span className="accent-cyan">lives</span>
                </h2>
                <Link href="/gravacoes" className="section-link">
                  Ver todas <ChevronRightIcon />
                </Link>
              </div>
              <Carousel className="rail rail--rec" label="Gravações das lives">
                {recordings.slice(0, 6).map((r) => (
                  <VideoCard
                    key={r.id}
                    href={`/gravacoes/${r.id}`}
                    label="Gravação"
                    labelWhite
                    meta={formatDate(r.startsAt)}
                    title={r.title}
                    thumb={r.recordingThumbnailUrl}
                  />
                ))}
              </Carousel>
            </section>
          )}
        </div>

        <div className="area-live">
          <LivePanel live={live} upcoming={upcoming} reminders={data.reminders} />
        </div>
        <div className="area-community">
          <CommunityPanel members={data.members} communityUrl={data.communityUrl} />
        </div>
      </div>
    </>
  );
}
