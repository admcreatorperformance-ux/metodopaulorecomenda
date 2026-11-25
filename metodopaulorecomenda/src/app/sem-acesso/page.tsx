import { Brand } from "@/components/brand";
import { SignOutButton } from "./sign-out";

export const metadata = { title: "Acesso não encontrado | Método Paulo Recomenda" };

export default function SemAcessoPage() {
  return (
    <div className="auth">
      <div className="auth__form">
        <Brand />
        <h1>
          Não encontramos
          <strong>um acesso ativo</strong>
        </h1>
        <p className="auth__lead">
          Seu login funcionou, mas esse e-mail não tem uma matrícula ativa no Método Paulo Recomenda. Se você comprou com outro e-mail, saia e entre com ele.
        </p>
        <SignOutButton />
      </div>
      <div className="auth__visual" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="band" src="/brand/faixa-sinal.svg" alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="photo" src="/img/paulo-hero.webp" alt="" />
      </div>
    </div>
  );
}
