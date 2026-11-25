"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerMaterialFile } from "@/app/(area)/admin/actions";
import { saveAvatar } from "@/app/member-actions";
import { createBrowserSupabase } from "@/lib/supabase/client";

const safeName = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9.]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "arquivo";

/** Foto de perfil: envia direto do navegador para a pasta do próprio usuário (regras do Storage garantem isso). */
export function AvatarUpload({ userId, demo }: { userId: string; demo: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok?: string; erro?: string }>({});
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return setMsg({ erro: "Use uma imagem PNG, JPG ou WEBP." });
    if (file.size > 3 * 1024 * 1024) return setMsg({ erro: "A foto pode ter no máximo 3 MB." });
    if (demo) return setMsg({ erro: "No modo demonstração não dá para enviar foto." });
    const supabase = createBrowserSupabase();
    if (!supabase) return setMsg({ erro: "Envio indisponível agora." });
    setBusy(true);
    setMsg({});
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      setBusy(false);
      return setMsg({ erro: "Não deu para enviar a foto. Tente de novo." });
    }
    const res = await saveAvatar(path);
    setBusy(false);
    if (res.error) return setMsg({ erro: res.error });
    setMsg({ ok: "Foto atualizada." });
    router.refresh();
  }

  return (
    <div>
      <label className="btn-small" style={{ cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Enviando..." : "Trocar foto"}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onChange} disabled={busy} hidden />
      </label>
      {msg.erro && <p className="field-help" role="alert" style={{ color: "#ffb3c2", marginTop: 8 }}>{msg.erro}</p>}
      {msg.ok && <p className="field-help" role="status" style={{ color: "var(--cyan)", marginTop: 8 }}>{msg.ok}</p>}
    </div>
  );
}

/** Material da aula em arquivo: o admin envia direto para o Storage privado "materiais". */
export function MaterialFileUpload({ lessonId, nextPosition, demo }: { lessonId: string; nextPosition: number; demo: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: string; erro?: string }>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setMsg({ erro: "Escolha o arquivo." });
    if (file.size > 50 * 1024 * 1024) return setMsg({ erro: "O arquivo pode ter no máximo 50 MB." });
    if (demo) return setMsg({ erro: "No modo demonstração não dá para enviar arquivo. Use um link." });
    const supabase = createBrowserSupabase();
    if (!supabase) return setMsg({ erro: "Envio indisponível agora." });
    setBusy(true);
    setMsg({});
    const path = `${lessonId}/${Date.now()}-${safeName(file.name)}`;
    const { error } = await supabase.storage.from("materiais").upload(path, file, { contentType: file.type || undefined });
    if (error) {
      setBusy(false);
      return setMsg({ erro: "Não deu para enviar o arquivo. Confirme se seu usuário é admin." });
    }
    const res = await registerMaterialFile({ lessonId, title: title || file.name, storagePath: path, position: nextPosition });
    setBusy(false);
    if (res.error) return setMsg({ erro: res.error });
    setTitle("");
    setFile(null);
    setMsg({ ok: "Arquivo enviado." });
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="mat-file-title">Nome do material</label>
        <input id="mat-file-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Checklist do produto (PDF)" />
      </div>
      <div className="field">
        <span className="field-label">Arquivo (PDF, planilha, imagem; até 50 MB)</span>
        <label className="file-pick">
          <span className="btn-small">Escolher arquivo</span>
          <span className="file-pick__name">{file ? file.name : "Nenhum arquivo escolhido"}</span>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="sr-only" />
        </label>
      </div>
      {msg.erro && <p className="flash flash--erro" role="alert">{msg.erro}</p>}
      {msg.ok && <p className="flash flash--ok" role="status">{msg.ok}</p>}
      <button className="btn-save" type="submit" disabled={busy}>{busy ? "Enviando..." : "Enviar arquivo"}</button>
    </form>
  );
}
