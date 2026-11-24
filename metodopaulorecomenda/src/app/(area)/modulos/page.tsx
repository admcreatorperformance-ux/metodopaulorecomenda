import { PillarCard } from "@/components/pillar-card";
import { moduleProgress } from "@/lib/course";
import { loadAreaData } from "@/lib/data";

export const metadata = { title: "Módulos | Método Paulo Recomenda" };

export default async function ModulosPage() {
  const data = await loadAreaData();
  return (
    <div className="container page-pad">
      <h1 className="page-title">
        Os {data.modules.length} pilares da sua <span className="accent-cyan">operação</span>
      </h1>
      <p className="page-lead">Siga na ordem. Cada módulo prepara o próximo.</p>
      <div className="grid-cards">
        {data.modules.map((m) => (
          <PillarCard key={m.id} mod={m} percent={moduleProgress(m, data.progress).percent} />
        ))}
      </div>
    </div>
  );
}
