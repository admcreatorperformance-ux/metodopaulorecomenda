import { VideoCard } from "@/components/video-card";
import { formatDate, splitLives } from "@/lib/course";
import { loadAreaData } from "@/lib/data";

export const metadata = { title: "Gravações | Método Paulo Recomenda" };

export default async function GravacoesPage() {
  const data = await loadAreaData();
  const { recordings } = splitLives(data.lives);
  return (
    <div className="container page-pad">
      <h1 className="page-title">
        Gravações das <span className="accent-cyan">lives</span>
      </h1>
      <p className="page-lead">Perdeu alguma live? Está tudo aqui.</p>
      {recordings.length === 0 ? (
        <p className="empty">Ainda não tem gravação publicada.</p>
      ) : (
        <div className="grid-cards">
          {recordings.map((r) => (
            <VideoCard key={r.id} href={`/gravacoes/${r.id}`} label="Gravação" labelWhite meta={formatDate(r.startsAt)} title={r.title} thumb={r.recordingThumbnailUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
