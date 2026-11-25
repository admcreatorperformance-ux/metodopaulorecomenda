import Link from "next/link";
import { Flash, type FlashParams } from "@/components/admin/flash";
import { ProgressBar } from "@/components/progress-bar";
import { AvatarUpload } from "@/components/upload-fields";
import { updateProfile } from "@/app/member-actions";
import { initials } from "@/lib/course";
import { loadAreaData } from "@/lib/data";
import { isDemo } from "@/lib/env";
import { courseCompletion } from "@/lib/extras";

export const metadata = { title: "Meu perfil | Método Paulo Recomenda" };

const roleLabel = { aluno: "Aluno", mentor: "Mentor", moderador: "Moderação", admin: "Administrador" } as const;

export default async function PerfilPage({ searchParams }: { searchParams: FlashParams }) {
  const [{ ok, erro }, data] = await Promise.all([searchParams, loadAreaData()]);
  const { total, done } = courseCompletion(data);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const v = data.viewer;

  return (
    <div className="container page-pad">
      <h1 className="page-title">Meu <span className="accent-pink">perfil</span></h1>
      <p className="page-lead">Seu nome aparece nos comentários e no certificado.</p>
      <div style={{ marginTop: 28 }}><Flash ok={ok} erro={erro} /></div>
      <div className="admin-grid">
        <form action={updateProfile} className="admin-card">
          <h2>Seus dados</h2>
          <div className="profile-photo">
            <span className="member__avatar member__avatar--staff profile-photo__img">
              {v.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.avatarUrl} alt="Sua foto" />
              ) : (
                initials(v.fullName)
              )}
            </span>
            <AvatarUpload userId={v.id} demo={isDemo} />
          </div>
          <div className="field">
            <label htmlFor="full_name">Nome completo</label>
            <input id="full_name" name="full_name" defaultValue={v.fullName} required minLength={2} maxLength={80} autoComplete="name" />
            <span className="field-help">Escreva como quer que apareça no certificado.</span>
          </div>
          <button className="btn-save" type="submit">Salvar</button>
        </form>
        <div className="admin-card">
          <h2>Sua jornada</h2>
          <p className="meta" style={{ marginBottom: 6 }}>{roleLabel[v.role]}</p>
          <div className="hero__progress-head" style={{ marginTop: 14 }}>
            <span>{done} de {total} aulas concluídas</span>
            <b>{percent}%</b>
          </div>
          <ProgressBar percent={percent} thick label="Progresso no curso" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
            <Link className="btn-small" href="/historico">Ver histórico</Link>
            <Link className="btn-small" href="/certificado">Certificado</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
