import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRightIcon } from "@/components/icons";
import { Player } from "@/components/player";
import { formatDate } from "@/lib/course";
import { loadAreaData } from "@/lib/data";

export default async function GravacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadAreaData();
  const rec = data.lives.find((l) => l.id === id && l.status === "encerrada");
  if (!rec) notFound();
  return (
    <div className="container page-pad">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link href="/gravacoes">Gravações</Link> <ChevronRightIcon size={12} /> <span>{formatDate(rec.startsAt)}</span>
      </nav>
      <Player provider={rec.recordingProvider ?? "youtube"} videoId={rec.recordingVideoId} title={rec.title} />
      <div className="lesson-head">
        <div>
          <span className="kicker">Gravação · {formatDate(rec.startsAt)}</span>
          <h1 style={{ marginTop: 10 }}>{rec.title}</h1>
        </div>
      </div>
    </div>
  );
}
