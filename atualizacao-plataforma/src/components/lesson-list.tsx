import Link from "next/link";
import { lessonStatus, pad2, statusLabel } from "@/lib/course";
import type { AreaData, Module } from "@/lib/types";
import { VideoThumb } from "./video-card";

export function LessonList({ mod, data }: { mod: Module; data: AreaData }) {
  if (!mod.lessons.length) return <p className="empty">As aulas deste módulo ainda vão ser publicadas.</p>;
  return (
    <div className="lesson-list">
      {mod.lessons.map((lesson) => {
        const status = lessonStatus(lesson, mod, data);
        return (
          <Link key={lesson.id} href={`/aula/${lesson.id}`} className={`lesson-row${status === "proxima" ? " lesson-row--current" : ""}`}>
            <span className="lesson-row__num">{pad2(lesson.position)}</span>
            <VideoThumb src={lesson.thumbnailUrl} small />
            <span>
              <span className="lesson-row__title">{lesson.title}</span>
              <p className="meta">
                Aula {pad2(lesson.position)} · Módulo {pad2(mod.position)}
              </p>
            </span>
            <span className={`status status--${status}`}>{statusLabel[status]}</span>
          </Link>
        );
      })}
    </div>
  );
}
