import Link from "next/link";
import { pad2 } from "@/lib/course";
import type { Lesson, Module } from "@/lib/types";
import { ArrowUpRightIcon, ListIcon } from "./icons";
import { ProgressBar } from "./progress-bar";

/** "Continue de onde parou": título do módulo atual com a 2ª metade em destaque. */
function splitTitle(title: string): [string, string] {
  const words = title.split(" ");
  if (words.length < 3) return [title, ""];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

export function Hero({ mod, lesson, percent, started }: { mod: Module; lesson: Lesson; percent: number; started: boolean }) {
  const [first, second] = splitTitle(mod.title);
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" />
      <div className="hero__glow" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero__band" src="/brand/faixa-sinal.svg" alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero__photo" src="/img/paulo-hero.webp" alt="" fetchPriority="high" />
      <div className="hero__fade" />
      <div className="container hero__content">
        <span className="chip">{started ? "Continue de onde parou" : "Comece por aqui"}</span>
        <span className="kicker">
          Módulo {pad2(mod.position)} &nbsp;·&nbsp; Os 6 pilares
        </span>
        <h1 id="hero-title" className="hero__title">
          {first}
          {second && <strong>{second}</strong>}
        </h1>
        {mod.description && <p className="hero__desc">{mod.description}</p>}
        <div className="hero__progress">
          <div className="hero__progress-head">
            <span>Seu progresso no módulo</span>
            <b>{percent}%</b>
          </div>
          <ProgressBar percent={percent} thick label="Seu progresso no módulo" />
        </div>
        <div className="hero__actions">
          <Link href={`/aula/${lesson.id}`} className="btn-primary">
            {started ? "Continuar aula" : "Começar aula"}
            <span className="btn-primary__icon">
              <ArrowUpRightIcon />
            </span>
          </Link>
          <Link href={`/modulos/${mod.slug}`} className="btn-ghost">
            <ListIcon /> Ver aulas do módulo
          </Link>
        </div>
        <ul className="hero__bullets">
          <li>Só vídeo</li>
          <li>Sem live</li>
          <li>Sem estoque</li>
          <li>Começa com o celular</li>
        </ul>
      </div>
    </section>
  );
}
