import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container page-pad" style={{ minHeight: "60vh" }}>
      <h1 className="page-title">Página não encontrada</h1>
      <p className="page-lead">Essa aula ou página não existe ou ainda não foi publicada.</p>
      <Link href="/" className="btn-ghost" style={{ marginTop: 24 }}>Voltar ao início</Link>
    </div>
  );
}
