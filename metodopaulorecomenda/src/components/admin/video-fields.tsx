import type { VideoProvider } from "@/lib/types";

const OPTIONS: { value: VideoProvider; label: string }[] = [
  { value: "youtube", label: "YouTube (não listado)" },
  { value: "vimeo", label: "Vimeo" },
  { value: "panda", label: "Panda Video" },
  { value: "bunny", label: "Bunny Stream" },
];

export function VideoFields({
  providerName,
  idName,
  provider,
  videoId,
  allowNone,
}: {
  providerName: string;
  idName: string;
  provider?: VideoProvider | null;
  videoId?: string | null;
  allowNone?: boolean;
}) {
  return (
    <>
      <div className="field">
        <label htmlFor={providerName}>Onde está o vídeo</label>
        <select id={providerName} name={providerName} defaultValue={provider ?? (allowNone ? "" : "youtube")}>
          {allowNone && <option value="">Sem gravação ainda</option>}
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={idName}>ID ou link de incorporação do vídeo</label>
        <input id={idName} name={idName} defaultValue={videoId ?? ""} placeholder="Ex.: dQw4w9WgXcQ" autoComplete="off" />
        <span className="field-help">
          YouTube e Vimeo: só o código do vídeo (no YouTube, o que vem depois de <code>v=</code>). Bunny: <code>biblioteca/video</code>. Panda: o link
          completo de incorporação. Deixe vazio se o vídeo ainda não estiver pronto.
        </span>
      </div>
    </>
  );
}
