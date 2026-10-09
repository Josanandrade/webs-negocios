import { useState } from "react";
import { api } from "../api/client";
import type { QuizSummary } from "../api/types";
import { useAction } from "../lib/hooks";
import { IconTrash } from "./icons";
import { Button, ErrorBox, Modal } from "./ui";

/** Botón para eliminar un test (con confirmación). `compact` = solo el icono, para listas. */
export function DeleteQuizButton({
  quiz,
  onDeleted,
  compact = false,
}: {
  quiz: Pick<QuizSummary, "id" | "title" | "status">;
  onDeleted: () => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const remove = useAction(async () => {
    await api(`/api/quizzes/${quiz.id}`, { method: "DELETE" });
    setOpen(false);
    onDeleted();
  });
  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Eliminar el test «${quiz.title}»`}
          title="Eliminar test"
          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
        >
          <IconTrash />
        </button>
      ) : (
        <Button variant="ghost" onClick={() => setOpen(true)}>
          <IconTrash /> Eliminar test
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="¿Eliminar este test?">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Se borrarán «{quiz.title}» y sus respuestas
          {quiz.status === "finished" ? ", y dejará de contar en tus estadísticas" : ""}. Las preguntas no se borran: siguen en tu
          banco.
        </p>
        <ErrorBox error={remove.error} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" busy={remove.busy} onClick={() => remove.run()}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}
