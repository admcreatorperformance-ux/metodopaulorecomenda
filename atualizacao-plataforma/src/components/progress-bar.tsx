export function ProgressBar({ percent, thick = false, label }: { percent: number; thick?: boolean; label?: string }) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      className={`bar${thick ? " bar--thick" : ""}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progresso"}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
