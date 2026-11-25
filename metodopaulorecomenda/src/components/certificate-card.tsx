import type { Certificate } from "@/lib/types";

const longDate = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(iso));

export function CertificateCard({ cert }: { cert: Certificate }) {
  return (
    <article className="cert" aria-label="Certificado de conclusão">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cert__band" src="/brand/faixa-sinal.svg" alt="" />
      <p className="cert__kicker">Certificado de conclusão</p>
      <p className="cert__lead">Certificamos que</p>
      <p className="cert__name">{cert.fullName}</p>
      <p className="cert__text">
        concluiu o <b>Método Paulo Recomenda</b>, com {cert.lessonsCompleted} aulas sobre afiliação e vendas com vídeos curtos no TikTok Shop.
      </p>
      <div className="cert__foot">
        <div>
          <span className="cert__sign">Paulo Nesi</span>
          <span className="cert__label">Criador do método</span>
        </div>
        <div>
          <span className="cert__sign cert__sign--date">{longDate(cert.issuedAt)}</span>
          <span className="cert__label">Data de emissão</span>
        </div>
      </div>
      <p className="cert__code">Código de verificação: {cert.id}</p>
    </article>
  );
}
