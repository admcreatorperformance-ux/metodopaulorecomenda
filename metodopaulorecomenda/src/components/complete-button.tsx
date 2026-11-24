"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { setLessonCompleted, touchLesson } from "@/app/actions";
import { CheckIcon } from "./icons";

export function CompleteButton({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(completed);
  const [error, setError] = useState<string | null>(null);

  // Marca a aula como "aberta" para alimentar o "Continue assistindo".
  useEffect(() => {
    touchLesson(lessonId).catch(() => {});
  }, [lessonId]);

  return (
    <div>
      <button
        type="button"
        className={`complete-btn${optimistic ? " complete-btn--done" : ""}`}
        disabled={pending}
        aria-pressed={optimistic}
        onClick={() =>
          start(async () => {
            setError(null);
            setOptimistic(!optimistic);
            try {
              await setLessonCompleted(lessonId, !completed);
            } catch {
              setError("Não deu para salvar. Tente de novo.");
            }
          })
        }
      >
        <CheckIcon />
        {optimistic ? "Aula concluída" : "Marcar como concluída"}
      </button>
      {error && (
        <p role="alert" className="meta" style={{ color: "var(--pink)", marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}
