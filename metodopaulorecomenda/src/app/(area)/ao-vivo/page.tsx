import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { LivePanel } from "@/components/live-panel";
import { VideoCard } from "@/components/video-card";
import { formatDate, splitLives } from "@/lib/course";
import { loadAreaData } from "@/lib/data";

export const metadata = { title: "Ao vivo | Método Paulo Recomenda" };

export default async function AoVivoPage() {
  const data = await loadAreaData();
  const { live, upcoming, recordings } = splitLives(data.lives);
  return (
    <div className="container page-pad">
      <h1 className="page-title">
        Lives e <span className="accent-pink">mentorias</span>
      </h1>
      <p className="page-lead">Ative o lembrete das lives que você não quer perder. Perdeu alguma? A gravação fica ao lado.</p>
      <div className="live-page">
        <LivePanel live={live} upcoming={upcoming.slice(0, 20)} reminders={data.reminders} />
        <section aria-labelledby="ult-gravacoes">
          <div className="section-head">
            <h2 id="ult-gravacoes" className="section-title" style={{ fontSize: 22 }}>
              Últimas <span className="accent-cyan">gravações</span>
            </h2>
            <Link href="/gravacoes" className="section-link">
              Ver todas <ChevronRightIcon />
            </Link>
          </div>
          {recordings.length === 0 ? (
            <p className="empty">As gravações aparecem aqui depois de cada live.</p>
          ) : (
            <div className="live-page__grid">
              {recordings.slice(0, 4).map((r) => (
                <VideoCard key={r.id} href={`/gravacoes/${r.id}`} label="Gravação" labelWhite meta={formatDate(r.startsAt)} title={r.title} thumb={r.recordingThumbnailUrl} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
