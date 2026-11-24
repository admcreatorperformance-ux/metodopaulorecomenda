import { Brand } from "@/components/brand";
import { SignOutButton } from "./sign-out";

export const metadata = { title: "Acesso não encontrado | Método Paulo Recomenda" };

export default function SemAcessoPage() {
  return (
    <div className="auth" style={{ gridTemplateColumns: "1fr" }}>
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
    </div>
  );
}
