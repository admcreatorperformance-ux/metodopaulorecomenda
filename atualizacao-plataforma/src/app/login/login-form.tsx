"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { sendLoginCode, verifyLoginCode, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [sent, sendAction, sending] = useActionState<LoginState, FormData>(sendLoginCode, { step: "email" });
  const [verified, verifyAction, verifying] = useActionState<LoginState, FormData>(verifyLoginCode, { step: "code" });
  const [restart, setRestart] = useState(0);
  const showCode = sent.step === "code" && restart === 0;
  const [linkError, setLinkError] = useState<string | null>(null);

  // O Supabase devolve erros do link do e-mail no "#" do endereço (ex.: link expirado).
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const code = hash.get("error_code");
    if (!code) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do endereço ao abrir a página
    setLinkError(
      code === "otp_expired"
        ? "Esse link expirou ou já foi usado. Peça um novo e abra o e-mail mais recente, no mesmo navegador."
        : "Não deu para entrar com esse link. Peça um novo abaixo.",
    );
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  if (showCode) {
    return (
      <form action={verifyAction}>
        <input type="hidden" name="email" value={sent.email} />
        <input type="hidden" name="next" value={next} />
        {sent.message && <p className="form-msg form-msg--ok">{sent.message}</p>}
        {verified.error && <p className="form-msg form-msg--err" role="alert">{verified.error}</p>}
        <div className="field">
          <label htmlFor="token">Código de acesso</label>
          <input id="token" name="token" className="code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} required autoFocus />
        </div>
        <button className="btn-primary" type="submit" disabled={verifying}>
          {verifying ? "Entrando..." : "Entrar"} <span className="btn-primary__icon"><ArrowUpRightIcon /></span>
        </button>
        <div>
          <button type="button" className="link-btn" onClick={() => setRestart((n) => n + 1)}>
            Usar outro e-mail ou pedir novo código
          </button>
        </div>
      </form>
    );
  }

  return (
    <form action={(fd) => { setRestart(0); sendAction(fd); }}>
      <input type="hidden" name="next" value={next} />
      {sent.error && <p className="form-msg form-msg--err" role="alert">{sent.error}</p>}
      {!sent.error && linkError && <p className="form-msg form-msg--err" role="alert">{linkError}</p>}
      <div className="field">
        <label htmlFor="email">Seu e-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={sent.email} required placeholder="voce@email.com" />
      </div>
      <button className="btn-primary" type="submit" disabled={sending}>
        {sending ? "Enviando..." : "Receber código"} <span className="btn-primary__icon"><ArrowUpRightIcon /></span>
      </button>
    </form>
  );
}
