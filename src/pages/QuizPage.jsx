import { useCallback, useEffect, useState } from "react";
import { getAllQuestions } from "../services/questionService";
import { submitQuiz } from "../services/quizService";
import { logoutApi } from "../services/authService";
import { clearSession, isLoggedIn } from "../services/tokenUtils";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("quiz_answers");
    return saved ? JSON.parse(saved) : {};
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem("quiz_time");
    return saved ? parseInt(saved, 10) : 1800;
  });
  const [showModal, setShowModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const res = await getAllQuestions();
      setQuestions((res.data || []).slice(0, 40));
    } catch (err) {
      console.error("Lỗi load câu hỏi:", err.message);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const saveToLocal = useCallback(() => {
    localStorage.setItem("quiz_answers", JSON.stringify(answers));
    localStorage.setItem("quiz_time", String(timeLeft));
  }, [answers, timeLeft]);

  useEffect(() => {
    const interval = setInterval(saveToLocal, 5000);
    return () => clearInterval(interval);
  }, [saveToLocal]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setConfirmMessage("Hết thời gian! Bài sẽ được nộp tự động.");
          setShowModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSelect = (value) => {
    const qId = String(questions[current].id);
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    const message =
      Object.keys(answers).length < questions.length
        ? "Bạn chưa làm hết, vẫn nộp bài?"
        : "Bạn chắc chắn muốn nộp bài?";
    setConfirmMessage(message);
    setShowModal(true);
  };

  const handleReset = () => {
    localStorage.removeItem("quiz_answers");
    localStorage.removeItem("quiz_time");
    setAnswers({});
    setTimeLeft(1800);
    setCurrent(0);
  };

  const handleLogout = async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    clearSession();
    navigate("/");
  };

  const confirmSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // ✅ FIX: submitQuiz nhận mảng, service sẽ wrap thành { answers: [...] }
      const answerList = Object.entries(answers).map(([qId, score]) => ({
        questionId: Number(qId),
        score,
      }));
      const res = await submitQuiz(answerList);
      const results = res.data?.result || res.data;
      localStorage.setItem("quiz_time_left", timeLeft);
      localStorage.setItem("quiz_results", JSON.stringify(results));
      navigate("/result", { state: { results, timeLeft } });
    } catch (err) {
      const msg = err.response?.data?.message || "Có lỗi khi nộp bài, vui lòng thử lại.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!questions[current]) return <div className="p-10 text-center">Đang tải câu hỏi...</div>;

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  const options = [
    "Mức độ 1 (Rất kém / rất không thích / rất không đồng ý)",
    "Mức độ 2 (Kém / không thích / không đồng ý)",
    "Mức độ 3 (Đang phân vân)",
    "Mức độ 4 (Tốt / thích / đồng ý)",
    "Mức độ 5 (Rất tốt / rất thích / rất đồng ý)",
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      {/* HEADER */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#0f2c3f] text-white flex justify-between items-center px-6 py-3 shadow-lg">
        <button
          onClick={() => { setConfirmMessage("Bạn có chắc muốn thoát về trang chủ?"); setShowModal(true); }}
          className="font-bold text-lg hover:text-cyan-400 transition-all"
        >
          🏠 TGrowth
        </button>

        {isLoggedIn() ? (
          <button
            onClick={() => { setConfirmMessage("Bạn muốn đăng xuất và thoát khỏi bài làm?"); setShowModal(true); }}
            className="text-sm font-medium px-4 py-1.5 border border-red-500/50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all"
          >
            Đăng xuất
          </button>
        ) : (
          <button onClick={() => navigate("/login")}
            className="text-sm font-medium px-4 py-1.5 border border-cyan-500/50 text-cyan-400 rounded-full hover:bg-cyan-500 hover:text-white transition-all">
            Đăng nhập
          </button>
        )}

        <div className="bg-black/20 px-4 py-1 rounded-lg border border-white/10">
          <p className="text-[10px] uppercase tracking-wider opacity-60">Thời gian còn lại</p>
          <p className="text-cyan-400 font-mono font-bold text-lg leading-none">{formatTime(timeLeft)}</p>
        </div>
      </div>

      <div className="flex">
        {/* SIDEBAR */}
        <div className="w-64 bg-white p-4 shadow fixed top-16 left-0 h-[calc(100vh-64px)] overflow-y-auto">
          <h3 className="font-bold mb-2">Danh sách câu hỏi</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-9 rounded text-sm ${answers[String(item.id)] ? "bg-teal-500 text-white" : "bg-gray-200"} ${current === index ? "ring-2 ring-blue-500" : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>


          <div className="mt-6 space-y-2">
            <div className="mt-6 text-sm">
              <p className="font-bold mb-2">Chú thích</p>

              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-teal-500 rounded"></div>
                <span>Đã làm</span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                <span>Đang làm</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>Chưa làm</span>
              </div>

              <p className="text-red-500 italic font-semibold text-xs leading-relaxed">
                Bạn chú ý nên làm hết các câu hỏi để đưa ra được gợi ý ngành học tốt nhất cho bạn!
              </p>
            </div>
            <button onClick={saveToLocal} className="w-full bg-[#0f2c3f] text-white py-2 rounded">💾 Lưu tạm thời</button>
            <button onClick={handleSubmit} className="w-full bg-red-500 text-white py-2 rounded">🚀 Nộp bài</button>
            <button onClick={() => { setConfirmMessage("Bạn có chắc muốn xoá toàn bộ bài làm?"); setShowModal(true); }}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300">
              🔄 Làm lại từ đầu
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 p-6 ml-64">
          <div className="bg-white p-4 rounded shadow mb-6">
            <div className="h-2 bg-gray-200 rounded">
              <div className="h-2 bg-teal-500 rounded" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm mt-1">
              <strong>Tiến độ: {answeredCount}/{questions.length} câu ({progress}%)</strong>
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-6">{q.content}</h2>
            <div className="space-y-3">
              {options.map((opt, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(index + 1)}
                  className={`p-4 border rounded-lg cursor-pointer flex justify-between ${answers[String(q.id)] === index + 1 ? "bg-green-500 text-white" : "hover:bg-gray-100"}`}
                >
                  {opt}
                  <div className="w-4 h-4 border rounded-full"></div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                disabled={current === 0}
                onClick={() => { setCurrent((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`px-6 py-2 rounded-lg font-bold ${current === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-300 hover:bg-gray-400 text-gray-700"}`}
              >
                ← Câu trước
              </button>
              <button
                disabled={current === questions.length - 1 || !answers[String(q.id)]}
                onClick={() => { if (current < questions.length - 1) { setCurrent((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
                className={`px-6 py-2 rounded-lg font-bold ${(current === questions.length - 1 || !answers[String(q.id)]) ? "bg-teal-200 text-white cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600 text-white"}`}
              >
                {current === questions.length - 1 ? "Hết câu hỏi" : "Câu tiếp →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showModal}
        message={confirmMessage}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false);
          if (confirmMessage.includes("xoá")) handleReset();
          else if (confirmMessage.includes("thoát")) navigate("/");
          else if (confirmMessage.includes("đăng xuất")) handleLogout();
          else confirmSubmit();
        }}
      />
    </div>
  );
}
