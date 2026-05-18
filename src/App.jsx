import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import ScorePage from "./pages/ScorePage";
import UniversityPage from "./pages/UniversityPage";
import ChatPage from "./pages/ChatPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LearningStrategy from "./pages/LearningStrategy";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/score" element={<ScorePage />} />
        <Route path="/university" element={<UniversityPage />} />
        <Route path="/strategy" element={<LearningStrategy />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
