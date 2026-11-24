"use client";

import { useActionState, useState } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { sendLoginCode, verifyLoginCode, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [sent, sendAction, sending] = useActionState<LoginState, FormData>(sendLoginCode, { step: "email" });
  const [verified, verifyAction, verifying] = useActionState<LoginState, FormData>(verifyLoginCode, { step: "code" });
  const [restart, setRestart] = useState(0);
  const showCode = sent.step === "code" && restart === 0;

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
