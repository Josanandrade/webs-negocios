import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import type { Quiz, QuizQuestion } from "../api/types";
import { QuizPage } from "./QuizPage";

function question(ordinal: number): QuizQuestion {
  return {
    ordinal,
    question_id: `q${ordinal}`,
    stem: `¿Pregunta ${ordinal}?`,
    options: ["A", "B", "C", "D"].map((label) => ({ label, text: `Opción ${label}${ordinal}` })),
    difficulty: "medium",
    document_title: "temario",
    section_title: "Tema 1",
    top_section_title: "Tema 1",
    selected_label: null,
    answered: false,
    revealed: false,
    is_correct: null,
    correct_label: null,
    explanation: null,
    source_page: null,
    source_quote: null,
  };
}

function quiz(mode: "practice" | "exam"): Quiz {
  return {
    id: "z1", title: "Mi test", mode, status: "in_progress", penalty: 1 / 3, total: 2, answered: 0, correct: null,
    wrong: null, blank: null, net: null, score: null, time_limit_seconds: null, expires_at: null, remaining_seconds: null,
    started_at: "2026-10-09T10:00:00Z", finished_at: null, source_quiz_id: null, config: {},
    questions: [question(1), question(2)],
  };
}

/** Servidor simulado: la correcta siempre es la C. */
function mockServer(initial: Quiz) {
  const state = structuredClone(initial);
  const calls: { method: string; path: string; body?: unknown }[] = [];
  vi.stubGlobal("fetch", async (url: URL, init: RequestInit = {}) => {
    const path = new URL(url).pathname;
    const method = init.method ?? "GET";
    const body = init.body ? JSON.parse(init.body as string) : undefined;
    calls.push({ method, path, body });
    const json = (data: unknown) => new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    const answer = path.match(/questions\/(\d+)$/);
    if (answer && method === "PUT") {
      const q = state.questions[Number(answer[1]) - 1];
      q.selected_label = body.selected_label;
      q.answered = body.selected_label !== null || state.mode === "practice";
      if (state.mode === "practice") Object.assign(q, { revealed: true, correct_label: "C", is_correct: body.selected_label === "C", source_page: 7, source_quote: "La C es la buena." });
      return json(q);
    }
    if (path.endsWith("/finish")) {
      state.status = "finished";
      state.questions.forEach((q) => Object.assign(q, { revealed: true, correct_label: "C", is_correct: q.selected_label ? q.selected_label === "C" : null }));
      const correct = state.questions.filter((q) => q.is_correct).length;
      const wrong = state.questions.filter((q) => q.selected_label && !q.is_correct).length;
      Object.assign(state, { correct, wrong, blank: 2 - correct - wrong, net: correct - wrong / 3, score: ((correct - wrong / 3) / 2) * 10 });
      return json(state);
    }
    return json(state);
  });
  return calls;
}

function renderQuiz() {
  render(
    <MemoryRouter initialEntries={["/tests/z1"]}>
      <Routes>
        <Route path="/tests/:id" element={<QuizPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

test("práctica: corrige al responder, no deja cambiar y al entregar muestra la nota", async () => {
  const user = userEvent.setup();
  const calls = mockServer(quiz("practice"));
  renderQuiz();

  await user.click(await screen.findByRole("radio", { name: /Opción A1/ }));
  expect(await screen.findByText("Incorrecto. La respuesta es la C.")).toBeInTheDocument();
  expect(screen.getByText(/La C es la buena/)).toBeInTheDocument();
  await user.click(screen.getByRole("radio", { name: /Opción B1/ }));          // ya respondida: no se envía
  expect(calls.filter((c) => c.method === "PUT")).toHaveLength(1);

  await user.click(screen.getByRole("button", { name: "Siguiente" }));
  await user.keyboard("3");                                                      // teclado: 3 = C
  expect(await screen.findByText("¡Correcto!")).toBeInTheDocument();

  await user.click(screen.getAllByRole("button", { name: "Entregar" }).at(-1)!);
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText("Has respondido todas las preguntas.")).toBeInTheDocument();
  await user.click(within(dialog).getByRole("button", { name: "Entregar" }));
  expect(await screen.findByRole("heading", { name: "Corrección" })).toBeInTheDocument();
  expect(screen.getByText(/Neto 0,67 de 2/)).toBeInTheDocument();
});

test("examen: no revela nada antes de entregar y avisa de las que quedan en blanco", async () => {
  const user = userEvent.setup();
  mockServer(quiz("exam"));
  renderQuiz();

  await user.click(await screen.findByRole("radio", { name: /Opción A1/ }));
  expect(await screen.findByText("Pregunta 2 de 2")).toBeInTheDocument();          // pasa sola a la siguiente
  expect(screen.queryByText(/Correcto|Incorrecto/)).not.toBeInTheDocument();

  await user.click(screen.getAllByRole("button", { name: "Entregar" })[0]);
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText(/Te quedan 1 preguntas sin responder/)).toBeInTheDocument();
});
