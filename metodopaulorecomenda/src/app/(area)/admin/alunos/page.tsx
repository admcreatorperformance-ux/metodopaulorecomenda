import { Flash } from "@/components/admin/flash";
import { adminMembers, adminWebhookEvents } from "@/lib/admin";
import { formatDate } from "@/lib/course";
import { addMember, setEnrollment } from "../actions";

const resultLabel: Record<string, string> = { liberado: "Acesso liberado", bloqueado: "Acesso bloqueado", ignorado: "Ignorado", erro: "Erro" };
const statusLabel = { active: "Acesso ativo", canceled: "Cancelado", refunded: "Reembolsado", expired: "Expirado" } as const;

export default async function AdminAlunos({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string; q?: string }> }) {
  const [{ ok, erro, q = "" }, members, events] = await Promise.all([searchParams, adminMembers(), adminWebhookEvents()]);
  const term = q.trim().toLowerCase();
  const list = term ? members.filter((m) => `${m.email} ${m.fullName}`.toLowerCase().includes(term)) : members;
  const activeCount = members.filter((m) => m.enrollmentStatus === "active").length;

  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Alunos</h1>
        <p className="meta">{activeCount} com acesso ativo · {members.length} cadastrados</p>
        <a className="btn-small only-mobile" href="#novo">+ Liberar acesso</a>
      </div>
      <Flash ok={ok} erro={erro} />
      <div className="admin-grid">
        <div>
          <form className="search" role="search" style={{ marginBottom: 14 }}>
            <label htmlFor="q" className="sr-only">Buscar aluno</label>
            <input id="q" name="q" type="search" defaultValue={q} placeholder="Buscar por e-mail ou nome" style={{ width: "100%", height: 46, paddingLeft: 18 }} />
          </form>
          <div className="admin-list">
            {list.length === 0 && <p className="empty" style={{ padding: 20 }}>{term ? "Ninguém encontrado." : "Nenhum aluno cadastrado ainda."}</p>}
            {list.map((m) => {
              const isStaff = m.role !== "aluno";
              const active = m.enrollmentStatus === "active";
              return (
                <div key={m.userId} className="admin-row member-row">
                  <div>
                    <p className="admin-row__title" style={{ wordBreak: "break-all" }}>{m.email}</p>
                    <p className="meta">
                      {m.fullName || "Sem nome"} · desde {formatDate(m.createdAt)}
                      {m.expiresAt ? ` · vence ${formatDate(m.expiresAt)}` : ""}
                    </p>
                  </div>
                  <span className={`tag ${isStaff ? "tag--on" : active ? "tag--on" : m.enrollmentStatus ? "tag--warn" : "tag--off"}`}>
                    {isStaff ? `Equipe (${m.role})` : m.enrollmentStatus ? statusLabel[m.enrollmentStatus] : "Sem matrícula"}
                  </span>
                  {!isStaff && (
                    <form action={setEnrollment}>
                      <input type="hidden" name="user_id" value={m.userId} />
                      <input type="hidden" name="status" value={active ? "canceled" : "active"} />
                      <button className={`btn-small${active ? " btn-small--danger" : ""}`} type="submit">
                        {active ? "Bloquear acesso" : "Liberar acesso"}
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
          <section className="admin-card" style={{ marginTop: 20 }} aria-labelledby="greenn-title">
            <h2 id="greenn-title">Últimas vendas recebidas da Greenn</h2>
            {events.length === 0 ? (
              <p className="meta">Nenhum aviso recebido ainda. Depois de configurar o webhook, cada venda aprovada, reembolso ou chargeback aparece aqui.</p>
            ) : (
              <div className="admin-list">
                {events.map((e) => (
                  <div key={e.id} className="admin-row member-row">
                    <div>
                      <p className="admin-row__title" style={{ wordBreak: "break-all" }}>{e.email || "Sem e-mail"}</p>
                      <p className="meta">{formatDate(e.receivedAt)} · status {e.status || "?"}{e.detail && e.result !== "liberado" && e.result !== "bloqueado" ? ` · ${e.detail}` : ""}</p>
                    </div>
                    <span className={`tag ${e.result === "liberado" ? "tag--on" : e.result === "erro" ? "tag--warn" : "tag--off"}`}>{resultLabel[e.result] ?? e.result}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <form action={addMember} className="admin-card" id="novo">
          <h2>Liberar acesso</h2>
          <div className="field">
            <label htmlFor="email">E-mail usado na compra</label>
            <input id="email" name="email" type="email" required placeholder="aluno@email.com" autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="full_name">Nome (opcional)</label>
            <input id="full_name" name="full_name" autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="expires_at">Acesso até (opcional)</label>
            <input id="expires_at" name="expires_at" type="date" />
            <span className="field-help">Vazio = acesso sem data para acabar. Se o e-mail já existir, só reativa o acesso.</span>
          </div>
          <button className="btn-save" type="submit">Liberar acesso</button>
        </form>
      </div>
    </>
  );
}
