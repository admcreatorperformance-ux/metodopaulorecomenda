import { VideoFields } from "@/components/admin/video-fields";
import { toLocalBR } from "@/lib/admin";
import type { LiveSession } from "@/lib/types";
import { saveLive } from "../actions";

export function LiveForm({ live }: { live?: LiveSession }) {
  return (
    <form action={saveLive} className="admin-card" id={live ? undefined : "novo"}>
      <h2>{live ? "Editar live" : "Nova live"}</h2>
      {live && <input type="hidden" name="id" value={live.id} />}
      <div className="field">
        <label htmlFor="title">Título</label>
        <input id="title" name="title" required defaultValue={live?.title} placeholder="Ex.: Tira-dúvidas da semana" />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="starts_at">Data e hora (Brasília)</label>
          <input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={live ? toLocalBR(live.startsAt) : ""} />
        </div>
        <div className="field">
          <label htmlFor="status">Situação</label>
          <select id="status" name="status" defaultValue={live?.status ?? "agendada"}>
            <option value="agendada">Agendada</option>
            <option value="ao_vivo">Ao vivo agora</option>
            <option value="encerrada">Encerrada</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="join_url">Link para entrar (Zoom, Meet, YouTube…)</label>
        <input id="join_url" name="join_url" type="url" defaultValue={live?.joinUrl ?? ""} placeholder="https://..." />
        <span className="field-help">Aparece no botão &quot;Entrar na live&quot; quando a situação for &quot;Ao vivo agora&quot;.</span>
      </div>
      <div className="field">
        <label htmlFor="host_name">Quem apresenta</label>
        <input id="host_name" name="host_name" defaultValue={live?.hostName ?? "Paulo Nesi"} />
      </div>
      <h2 style={{ marginTop: 22 }}>Gravação</h2>
      <VideoFields providerName="recording_provider" idName="recording_video_id" provider={live?.recordingProvider} videoId={live?.recordingVideoId} allowNone />
      <div className="field">
        <label htmlFor="recording_thumbnail_url">Capa da gravação (opcional)</label>
        <input id="recording_thumbnail_url" name="recording_thumbnail_url" type="url" defaultValue={live?.recordingThumbnailUrl ?? ""} placeholder="https://..." />
      </div>
      <label className="check"><input type="checkbox" name="published" defaultChecked={live?.published ?? true} /> Visível para os alunos</label>
      <button className="btn-save" type="submit">{live ? "Salvar live" : "Agendar live"}</button>
    </form>
  );
}
