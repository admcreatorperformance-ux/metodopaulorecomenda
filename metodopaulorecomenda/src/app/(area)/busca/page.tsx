import Link from "next/link";
import { pad2 } from "@/lib/course";
import { loadAreaData } from "@/lib/data";

export const metadata = { title: "Buscar aulas | Método Paulo Recomenda" };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default async function BuscaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const data = await loadAreaData();
  const term = norm(q.trim());
  const results = term
    ? data.modules.flatMap((m) =>
        m.lessons.filter((l) => norm(`${l.title} ${l.description} ${m.title}`).includes(term)).map((l) => ({ m, l })),
      )
    : [];

  return (
    <div className="container page-pad">
      <h1 className="page-title">Buscar aulas</h1>
      <form action="/busca" className="search" role="search" style={{ marginTop: 24, maxWidth: 720 }}>
        <label htmlFor="busca-pagina" className="sr-only">
          Buscar aulas
        </label>
        <input id="busca-pagina" name="q" type="search" defaultValue={q} autoFocus={!q} placeholder="Ex.: roteiro, produto, gancho" style={{ width: "100%", height: 52, paddingLeft: 20 }} />
      </form>
      {term && (
        <p className="meta" style={{ margin: "20px 0 12px" }}>
          {results.length} {results.length === 1 ? "aula encontrada" : "aulas encontradas"}
        </p>
      )}
      {results.length > 0 && (
        <div className="lesson-list">
          {results.map(({ m, l }) => (
            <Link key={l.id} href={`/aula/${l.id}`} className="lesson-row" style={{ gridTemplateColumns: "42px 1fr" }}>
              <span className="lesson-row__num">{pad2(l.position)}</span>
              <span>
                <span className="lesson-row__title">{l.title}</span>
                <p className="meta">
                  Aula {pad2(l.position)} · Módulo {pad2(m.position)} · {m.title}
                </p>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
