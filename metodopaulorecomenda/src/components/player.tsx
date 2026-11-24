import { embedUrl } from "@/lib/course";
import { PlayIcon } from "./icons";

export function Player({ provider, videoId, title }: { provider: string; videoId: string | null; title: string }) {
  const src = embedUrl(provider, videoId);
  return (
    <div className="player">
      {src ? (
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="player__empty">
          <div>
            <span className="live-card__play" style={{ position: "static", transform: "none", margin: "0 auto" }}>
              <PlayIcon size={16} />
            </span>
            <p>O vídeo desta aula está sendo preparado.</p>
          </div>
        </div>
      )}
    </div>
  );
}
