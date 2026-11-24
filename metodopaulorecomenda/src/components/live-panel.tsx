"use client";

import { useOptimistic, useTransition } from "react";
import { toggleLiveReminder } from "@/app/actions";
import { liveDateParts } from "@/lib/course";
import type { LiveSession } from "@/lib/types";
import { ArrowUpRightIcon, BellFilledIcon, BellIcon, PlayIcon } from "./icons";

function ReminderButton({ live, active }: { live: LiveSession; active: boolean }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(active);
  return (
    <button
      type="button"
      className="reminder-btn"
      aria-pressed={optimistic}
      aria-label={optimistic ? `Remover lembrete: ${live.title}` : `Lembrar de: ${live.title}`}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleLiveReminder(live.id, active);
        })
      }
    >
      {optimistic ? <BellFilledIcon size={16} /> : <BellIcon size={16} />}
    </button>
  );
}

export function LivePanel({ live, upcoming, reminders }: { live: LiveSession | null; upcoming: LiveSession[]; reminders: string[] }) {
  const next = live ?? upcoming[0] ?? null;
  const rest = (live ? upcoming : upcoming.slice(1)).slice(0, 3);
  return (
    <section className="panel" id="ao-vivo" aria-labelledby="live-title">
      <div className="panel__head">
        <h2 id="live-title" className="panel__title">
          Ao <span className="accent-pink">vivo</span>
        </h2>
        {live && <span className="badge-live">AO VIVO</span>}
      </div>

      {next ? (
        <div className="live-card">
          <div className="live-card__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="band" src="/brand/faixa-sinal.svg" alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="photo" src="/img/paulo-live.webp" alt="" loading="lazy" />
            <span className="live-card__play">
              <PlayIcon size={16} />
            </span>
          </div>
          <div className="live-card__body">
            <h3 className="live-card__title">{next.title}</h3>
            <p className="live-card__meta">
              Com {next.hostName} ·{" "}
              {live ? "ao vivo agora" : (() => { const d = liveDateParts(next.startsAt); return `${d.weekday}, ${d.day}/${d.month.toLowerCase()} às ${d.time}`; })()}
            </p>
            {live && live.joinUrl ? (
              <a className="btn-primary btn-primary--block" href={live.joinUrl} target="_blank" rel="noopener noreferrer">
                Entrar na live <ArrowUpRightIcon />
              </a>
            ) : live ? (
              <span className="btn-primary btn-primary--block" aria-disabled="true">
                Link da live em instantes
              </span>
            ) : (
              <ReminderInline live={next} active={reminders.includes(next.id)} />
            )}
          </div>
        </div>
      ) : (
        <p className="empty">Nenhuma live agendada por enquanto. Assim que tiver, ela aparece aqui.</p>
      )}

      {rest.length > 0 && (
        <>
          <h3 className="panel__sub">Próximas lives</h3>
          <div>
            {rest.map((l) => {
              const d = liveDateParts(l.startsAt);
              return (
                <div key={l.id} className="upnext">
                  <span className="date-pill">
                    <b>{d.day}</b>
                    <span>{d.month}</span>
                  </span>
                  <div>
                    <p className="upnext__title">{l.title}</p>
                    <p className="meta">
                      {d.weekday} · {d.time}
                    </p>
                  </div>
                  <ReminderButton live={l} active={reminders.includes(l.id)} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function ReminderInline({ live, active }: { live: LiveSession; active: boolean }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(active);
  return (
    <button
      type="button"
      className="btn-outline-grad btn-outline-grad--block"
      aria-pressed={optimistic}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleLiveReminder(live.id, active);
        })
      }
    >
      {optimistic ? "Lembrete ativado" : "Me lembrar"}
    </button>
  );
}
