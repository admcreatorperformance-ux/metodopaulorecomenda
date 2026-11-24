export default function Loading() {
  return (
    <div className="container page-pad" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <div style={{ height: 40, width: 320, borderRadius: 10, background: "var(--surface-2)" }} />
      <div style={{ height: 220, marginTop: 24, borderRadius: 16, background: "var(--surface)" }} />
    </div>
  );
}
