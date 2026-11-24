import { ChevronRightIcon } from "./icons";

export function CommunityBanner({ communityUrl }: { communityUrl: string | null }) {
  return (
    <section className="cbanner" aria-labelledby="cbanner-title">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cbanner__band" src="/brand/faixa-sinal.svg" alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cbanner__photo" src="/img/paulo-banner.webp" alt="" loading="lazy" />
      <h2 id="cbanner-title" className="cbanner__lockup">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/lockup-metodo.svg" alt="Método Paulo Recomenda" />
      </h2>
      <p className="cbanner__sub">
        Comunidade <b>Paulo Nesi</b>
      </p>
      <p className="cbanner__quote">
        O que eu não mostro aqui, eu mostro <em>lá dentro.</em>
      </p>
      {communityUrl ? (
        <a className="btn-outline-grad" href={communityUrl} target="_blank" rel="noopener noreferrer">
          Entrar na comunidade
        </a>
      ) : (
        <span className="btn-outline-grad" aria-disabled="true">
          Comunidade em breve <ChevronRightIcon />
        </span>
      )}
    </section>
  );
}
