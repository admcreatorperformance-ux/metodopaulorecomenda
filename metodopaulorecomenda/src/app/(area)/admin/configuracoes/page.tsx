import { Flash, type FlashParams } from "@/components/admin/flash";
import { adminCommunityUrl } from "@/lib/admin";
import { saveSettings } from "../actions";

export default async function AdminConfig({ searchParams }: { searchParams: FlashParams }) {
  const [{ ok, erro }, communityUrl] = await Promise.all([searchParams, adminCommunityUrl()]);
  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Configurações</h1>
      </div>
      <Flash ok={ok} erro={erro} />
      <form action={saveSettings} className="admin-card" style={{ maxWidth: 640 }}>
        <h2>Comunidade</h2>
        <div className="field">
          <label htmlFor="community_url">Link do grupo da comunidade</label>
          <input id="community_url" name="community_url" type="url" defaultValue={communityUrl} placeholder="https://chat.whatsapp.com/..." />
          <span className="field-help">Usado nos botões &quot;Entrar na comunidade&quot; e &quot;Abrir comunidade&quot;. Vazio mostra &quot;Comunidade em breve&quot;.</span>
        </div>
        <button className="btn-save" type="submit">Salvar</button>
      </form>
    </>
  );
}
