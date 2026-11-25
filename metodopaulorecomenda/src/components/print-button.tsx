"use client";

export function PrintButton() {
  return (
    <button type="button" className="btn-save" onClick={() => window.print()}>
      Baixar em PDF / imprimir
    </button>
  );
}
