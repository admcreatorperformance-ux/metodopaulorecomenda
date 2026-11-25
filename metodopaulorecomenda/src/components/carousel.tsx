"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

/** Trilho horizontal com setas e degradê quando há mais itens para os lados. */
export function Carousel({ className, label, children }: { className: string; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ prev: false, next: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ prev: el.scrollLeft > 4, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const go = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <div className="carousel" data-prev={edges.prev || undefined} data-next={edges.next || undefined}>
      <div ref={ref} className={className} onScroll={update} role="region" aria-label={label} tabIndex={0}>
        {children}
      </div>
      {edges.prev && (
        <button type="button" className="carousel__btn carousel__btn--prev" onClick={() => go(-1)} aria-label="Ver anteriores">
          <ChevronLeftIcon size={18} />
        </button>
      )}
      {edges.next && (
        <button type="button" className="carousel__btn carousel__btn--next" onClick={() => go(1)} aria-label="Ver próximos">
          <ChevronRightIcon size={18} />
        </button>
      )}
    </div>
  );
}
