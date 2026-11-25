import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Método Paulo Recomenda, início">
      <span className="brand__kicker">MÉTODO</span>
      <span className="brand__name">
        <b>PAULO</b> <span>RECOMENDA</span>
      </span>
    </Link>
  );
}
