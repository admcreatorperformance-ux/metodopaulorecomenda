"use client";

export default function AreaError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container page-pad" style={{ minHeight: "60vh" }}>
      <h1 className="page-title">Algo deu errado</h1>
      <p className="page-lead">Não conseguimos carregar essa parte agora. Tente de novo em alguns segundos.</p>
      <button type="button" className="btn-ghost" style={{ marginTop: 24 }} onClick={reset}>Tentar de novo</button>
    </div>
  );
}
