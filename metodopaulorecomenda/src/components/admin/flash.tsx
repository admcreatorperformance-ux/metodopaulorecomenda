export function Flash({ ok, erro }: { ok?: string; erro?: string }) {
  if (erro) return <p className="flash flash--erro" role="alert">{erro}</p>;
  if (ok) return <p className="flash flash--ok" role="status">{ok}</p>;
  return null;
}

export type FlashParams = Promise<{ ok?: string; erro?: string }>;
