import Link from "next/link";
import { pad2 } from "@/lib/course";
import type { Module } from "@/lib/types";
import { PlayIcon } from "./icons";
import { ProgressBar } from "./progress-bar";

export function PillarCard({ mod, percent, active }: { mod: Module; percent: number; active?: boolean }) {
  return (
    <Link href={`/modulos/${mod.slug}`} className={`pillar${active ? " pillar--active" : ""}`} aria-current={active ? "true" : undefined}>
      <span className="pillar__num">{pad2(mod.position)}</span>
      <span className="pillar__play">
        <PlayIcon size={12} />
      </span>
      <h3 className="pillar__title">{mod.title}</h3>
      <p className="pillar__desc">{mod.description}</p>
      <div className="pillar__foot">
        <span>{mod.lessons.length} aulas</span>
        <span>{percent}%</span>
      </div>
      <ProgressBar percent={percent} label={`Progresso no módulo ${pad2(mod.position)}`} />
    </Link>
  );
}
