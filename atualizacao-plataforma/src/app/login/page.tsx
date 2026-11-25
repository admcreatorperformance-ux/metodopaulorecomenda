import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Brand } from "@/components/brand";

export const metadata = { title: "Entrar | Método Paulo Recomenda" };

type SP = Promise<{ next?: string; erro?: string }>;

export default function LoginPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<div className="auth" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }: { searchParams: SP }) {
  const { next = "/", erro } = await searchParams;
  return (
    <div className="auth">
      <div className="auth__form">
        <Brand />
        <h1>
          Área de membros
          <strong>Método Paulo Recomenda</strong>
        </h1>
        <p className="auth__lead">Entre com o e-mail que você usou na compra. Vamos te mandar um código de acesso, sem senha.</p>
        {erro === "link" && <p className="form-msg form-msg--err">Esse link expirou ou já foi usado. Peça um novo código abaixo.</p>}
        <LoginForm next={next} />
        <p className="auth__help">Não recebeu? Confira o spam e a aba Promoções. Se o e-mail da compra for outro, entre com ele.</p>
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
