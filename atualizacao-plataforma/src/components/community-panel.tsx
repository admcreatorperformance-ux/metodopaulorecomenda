"use client";

import { useState } from "react";
import { initials, pad2 } from "@/lib/course";
import type { Member, Role } from "@/lib/types";
import { SearchIcon } from "./icons";

const roleLabel: Record<Role, string> = { mentor: "Mentor", moderador: "Moderação", admin: "Equipe", aluno: "Aluno" };

export function CommunityPanel({ members, communityUrl }: { members: Member[]; communityUrl: string | null }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const list = term ? members.filter((m) => m.fullName.toLowerCase().includes(term)) : members;
  const onlineCount = members.filter((m) => m.online).length;

  return (
    <section className="panel" id="comunidade" aria-labelledby="community-title">
      <div className="panel__head">
        <h2 id="community-title" className="panel__title">
          <span className="accent-cyan">Comunidade</span>
        </h2>
        {onlineCount > 0 && <span className="online">Online agora</span>}
      </div>
      <div className="search" style={{ marginBottom: 10 }}>
        <SearchIcon />
        <label htmlFor="busca-membro" className="sr-only">
          Buscar membro
        </label>
        <input id="busca-membro" type="search" placeholder="Buscar membro" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length === 0 ? (
        <p className="empty">{term ? "Ninguém com esse nome por aqui." : "A comunidade ainda está chegando."}</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {list.map((m) => {
            const staff = m.role !== "aluno";
            return (
              <li key={m.id} className="member">
                <span className={`member__avatar${staff ? " member__avatar--staff" : ""}${m.online ? " member__avatar--online" : ""}`}>
                  {initials(m.fullName)}
                </span>
                <span>
                  <span className="member__name">{m.fullName}</span>
                  <p className="meta">
                    {roleLabel[m.role]}
                    {m.role === "aluno" && m.currentModulePosition ? ` · Módulo ${pad2(m.currentModulePosition)}` : ""}
                  </p>
                </span>
                {staff && <span className="team-tag">EQUIPE</span>}
              </li>
            );
          })}
        </ul>
      )}
      {communityUrl && (
        <a className="btn-outline-grad btn-outline-grad--block" style={{ marginTop: 14 }} href={communityUrl} target="_blank" rel="noopener noreferrer">
          Abrir comunidade
        </a>
      )}
    </section>
  );
}
