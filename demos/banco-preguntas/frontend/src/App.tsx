import { Navigate, Route, Routes } from "react-router";
import { useAuth } from "./auth";
import { Layout } from "./components/Layout";
import { Loading } from "./components/ui";
import { BankPage } from "./pages/BankPage";
import { DocumentPage } from "./pages/DocumentPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { LoginPage } from "./pages/LoginPage";
import { NewQuizPage } from "./pages/NewQuizPage";
import { QuestionPage } from "./pages/QuestionPage";
import { QuizPage } from "./pages/QuizPage";
import { QuizzesPage } from "./pages/QuizzesPage";
import { StatsPage } from "./pages/StatsPage";

export function App() {
  const { me, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!me) return <LoginPage />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/tests" replace />} />
        <Route path="tests" element={<QuizzesPage />} />
        <Route path="tests/nuevo" element={<NewQuizPage />} />
        <Route path="tests/:id" element={<QuizPage />} />
        <Route path="banco" element={<BankPage />} />
        <Route path="banco/:id" element={<QuestionPage />} />
        <Route path="documentos" element={<DocumentsPage />} />
        <Route path="documentos/:id" element={<DocumentPage />} />
        <Route path="estadisticas" element={<StatsPage />} />
        <Route path="*" element={<Navigate to="/tests" replace />} />
      </Route>
    </Routes>
  );
}
