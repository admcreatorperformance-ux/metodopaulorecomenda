import Link from "next/link";
import { PlayIcon } from "./icons";
import { ProgressBar } from "./progress-bar";

export function VideoThumb({ src, label, labelWhite, percent, small }: { src?: string | null; label?: string; labelWhite?: boolean; percent?: number; small?: boolean }) {
  return (
    <div className="vthumb">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src || "/img/thumb-paulo.webp"} alt="" loading="lazy" />
      {label && <span className={`vthumb__label${labelWhite ? " vthumb__label--white" : ""}`}>{label}</span>}
      <span className={`play-btn${small ? " play-btn--sm" : ""}`}>
        <PlayIcon size={small ? 12 : 14} />
      </span>
      {percent !== undefined && <ProgressBar percent={percent} />}
    </div>
  );
}

export function VideoCard({ href, label, labelWhite, meta, title, thumb, percent }: { href: string; label: string; labelWhite?: boolean; meta: string; title: string; thumb?: string | null; percent?: number }) {
  return (
    <Link href={href} className="vcard">
      <VideoThumb src={thumb} label={label} labelWhite={labelWhite} percent={percent} />
      <div className="vcard__body">
        <p className="meta">{meta}</p>
        <h3 className="vcard__title">{title}</h3>
      </div>
    </Link>
  );
}
