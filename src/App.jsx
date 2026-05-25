import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import ScorePage from "./pages/ScorePage";
import UniversityPage from "./pages/UniversityPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import ChatPage from "./pages/ChatPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LearningStrategy from "./pages/LearningStrategy";
import SchedulePage from "./pages/SchedulePage";
import ResourcePage from "./pages/ResourcePage";
import MockExamPage from "./pages/MockExamPage";
import MockExamTakingPage from "./pages/MockExamTakingPage";
import MockExamResultPage from "./pages/MockExamResultPage";
import EduBotWidget from "./components/EduBotWidget";
import ProtectedAdminRoute from "./pages/admin/ProtectedAdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCareers from "./pages/admin/AdminCareers";
import AdminUniversities from "./pages/admin/AdminUniversities";
import AdminUniversityMajors from "./pages/admin/AdminUniversityMajors";
import AdminLearningMethods from "./pages/admin/AdminLearningMethods";
import AdminLearningStrategyProfiles from "./pages/admin/AdminLearningStrategyProfiles";
import AdminResources from "./pages/admin/AdminResources";
import AdminExamSubjects from "./pages/admin/AdminExamSubjects";
import AdminExamCombinations from "./pages/admin/AdminExamCombinations";
import AdminMockExams from "./pages/admin/AdminMockExams";
import AdminMockQuestions from "./pages/admin/AdminMockQuestions";
import AdminQuizQuestions from "./pages/admin/AdminQuizQuestions";
import AdminQuizWeights from "./pages/admin/AdminQuizWeights";
import AdminUsers from "./pages/admin/AdminUsers";

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
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/resources" element={<ResourcePage />} />
        <Route path="/mock-exams" element={<MockExamPage />} />
        <Route path="/mock-exams/results/:attemptId" element={<MockExamResultPage />} />
        <Route path="/mock-exams/:examId" element={<MockExamTakingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="careers" element={<AdminCareers />} />
          <Route path="universities" element={<AdminUniversities />} />
          <Route path="university-majors" element={<AdminUniversityMajors />} />
          <Route path="learning-methods" element={<AdminLearningMethods />} />
          <Route path="learning-strategy-profiles" element={<AdminLearningStrategyProfiles />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="quiz" element={<Navigate to="/admin/quiz/questions" replace />} />
          <Route path="quiz/questions" element={<AdminQuizQuestions />} />
          <Route path="quiz/questions/:questionId/weights" element={<AdminQuizWeights />} />
          <Route path="exam-subjects" element={<AdminExamSubjects />} />
          <Route path="exam-combinations" element={<AdminExamCombinations />} />
          <Route path="mock-exams" element={<AdminMockExams />} />
          <Route path="mock-exams/:examId/questions" element={<AdminMockQuestions />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <EduBotWidget />
    </BrowserRouter>
  );
}

export default App;
