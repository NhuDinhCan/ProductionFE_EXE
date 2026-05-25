import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import StudyAppShell from "../components/StudyAppShell";
import {
  resumeMockExamAttempt,
  startMockExam,
  submitMockExamAttempt,
} from "../services/mockExamService";
import { isLoggedIn as hasSession } from "../services/tokenUtils";
import { resolveMediaUrl } from "../utils/mediaUrl";

const getResponseData = (response) => response.data?.result || response.data || null;
const optionKeys = ["A", "B", "C", "D"];

function formatTimer(seconds) {
  if (seconds === null || seconds === undefined) return "--:--";
  const safeSeconds = Math.max(Number(seconds) || 0, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function optionText(question, option) {
  return question[`option${option}`];
}

function selectedAnswersToMap(selectedAnswers = []) {
  return selectedAnswers.reduce((acc, answer) => {
    if (answer?.questionId && answer?.selectedOption) {
      acc[answer.questionId] = answer.selectedOption;
    }
    return acc;
  }, {});
}

function QuestionImage({ src }) {
  if (!src) return null;

  return (
    <img
      src={resolveMediaUrl(src)}
      alt="Ảnh minh họa câu hỏi"
      className="mb-6 max-h-[420px] w-full rounded-2xl border border-slate-100 bg-white object-contain"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

export default function MockExamTakingPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeAttemptId = searchParams.get("attemptId");
  const submitLockRef = useRef(false);
  const answersRef = useRef({});

  const [attemptId, setAttemptId] = useState(null);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const questions = exam?.questions || [];
  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id]).length,
    [answers, questions]
  );

  const progress = questions.length > 0
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!hasSession()) {
      navigate("/login");
      return;
    }

    let active = true;
    setLoading(true);
    setMessage("");
    setExam(null);
    setAttemptId(null);
    setAnswers({});
    setCurrentIndex(0);
    submitLockRef.current = false;
    answersRef.current = {};

    const request = resumeAttemptId
      ? resumeMockExamAttempt(resumeAttemptId)
      : startMockExam(examId);

    request
      .then((response) => {
        if (!active) return;
        const data = getResponseData(response);
        setAttemptId(data.attemptId);
        setExam(data.exam);
        const restoredAnswers = selectedAnswersToMap(data.selectedAnswers);
        setAnswers(restoredAnswers);
        answersRef.current = restoredAnswers;

        const fallbackSeconds = Number(data.exam?.durationMinutes || 0) * 60;
        setRemainingSeconds(data.remainingSeconds ?? (fallbackSeconds > 0 ? fallbackSeconds : null));
      })
      .catch((err) => {
        if (!active) return;
        setMessage(err.response?.data?.message || "Không tải được bài thi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [examId, navigate, resumeAttemptId]);

  const submitExam = useCallback(async () => {
    if (!attemptId || submitLockRef.current) return;
    submitLockRef.current = true;
    setSubmitting(true);
    setMessage("");

    try {
      const payload = Object.entries(answersRef.current).map(([questionId, selectedOption]) => ({
        questionId: Number(questionId),
        selectedOption,
      }));

      const response = await submitMockExamAttempt(attemptId, payload);
      const result = getResponseData(response);
      navigate(`/mock-exams/results/${result.id || attemptId}`, { replace: true, state: { result } });
    } catch (err) {
      submitLockRef.current = false;
      setMessage(err.response?.data?.message || "Không nộp được bài thi.");
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, navigate]);

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds === undefined || submitLockRef.current) {
      return;
    }

    if (remainingSeconds <= 0) {
      submitExam();
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max((current || 0) - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [remainingSeconds, submitExam]);

  const handleSelect = (questionId, selectedOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const goToQuestion = (index) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
  };

  return (
    <StudyAppShell subtitle="Đang làm đề thi" activePath="/mock-exams">
      {loading ? (
        <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm border border-white">
          <Icon icon="lucide:loader-2" className="text-4xl text-[#00a8b5] animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-500">Đang khởi tạo bài thi...</p>
        </div>
      ) : message && !exam ? (
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-white">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-5">
            <Icon icon="lucide:alert-circle" className="text-3xl" />
          </div>
          <h1 className="text-xl font-black text-[#0f2c3f] mb-2">{message}</h1>
          <Link to="/mock-exams" className="text-sm font-black text-[#00a8b5]">
            Quay lại danh sách đề
          </Link>
        </div>
      ) : (
        <>
          <section className="mb-6 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div>
                <span className="bg-[#00a8b5] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {exam?.subjectName}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0f2c3f] mt-4">
                  {exam?.title}
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  {answeredCount}/{questions.length} câu đã chọn
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    Thời gian còn lại
                  </p>
                  <p className={`text-2xl font-black ${remainingSeconds !== null && remainingSeconds <= 60 ? "text-rose-500" : "text-[#0f2c3f]"}`}>
                    {formatTimer(remainingSeconds)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={submitExam}
                  disabled={submitting}
                  className="bg-[#0f2c3f] text-white px-5 py-4 rounded-2xl text-xs font-black hover:bg-[#1a4a69] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Icon icon="lucide:send" />
                  Nộp bài
                </button>
              </div>
            </div>

            <div className="mt-5 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00a8b5] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          {message && (
            <div className="mb-6 bg-amber-50 text-amber-700 border border-amber-100 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <Icon icon="lucide:info" />
              {message}
            </div>
          )}

          {questions.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-white">
              <h2 className="text-xl font-black text-[#0f2c3f] mb-2">Đề thi chưa có câu hỏi</h2>
              <Link to="/mock-exams" className="text-sm font-black text-[#00a8b5]">
                Quay lại danh sách đề
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
              <section className="bg-white border border-white rounded-[2rem] shadow-sm p-5 sm:p-7">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    Câu {currentIndex + 1}/{questions.length}
                  </h2>
                  {answers[currentQuestion.id] && (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black px-3 py-1 rounded-full">
                      Đã chọn {answers[currentQuestion.id]}
                    </span>
                  )}
                </div>

                <p className="text-lg font-black text-[#0f2c3f] leading-relaxed mb-6 whitespace-pre-wrap">
                  {currentQuestion.questionText}
                </p>

                <QuestionImage src={currentQuestion.imageUrl} />

                <div className="space-y-3">
                  {optionKeys.map((option) => {
                    const selected = answers[currentQuestion.id] === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(currentQuestion.id, option)}
                        className={`w-full text-left border rounded-2xl p-4 transition-all flex items-start gap-4 ${
                          selected
                            ? "border-[#00a8b5] bg-cyan-50 text-[#0f2c3f] shadow-sm"
                            : "border-slate-100 bg-slate-50 hover:border-cyan-200 text-slate-600"
                        }`}
                      >
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                          selected ? "bg-[#00a8b5] text-white" : "bg-white text-slate-500"
                        }`}>
                          {option}
                        </span>
                        <span className="text-sm font-bold leading-relaxed">
                          {optionText(currentQuestion, option)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-7 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => goToQuestion(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-black disabled:opacity-40 inline-flex items-center gap-2"
                  >
                    <Icon icon="lucide:chevron-left" />
                    Câu trước
                  </button>

                  <button
                    type="button"
                    onClick={() => goToQuestion(currentIndex + 1)}
                    disabled={currentIndex === questions.length - 1}
                    className="px-4 py-3 rounded-xl bg-[#0f2c3f] text-white text-xs font-black disabled:opacity-40 inline-flex items-center gap-2"
                  >
                    Câu tiếp
                    <Icon icon="lucide:chevron-right" />
                  </button>
                </div>
              </section>

              <aside className="bg-white border border-white rounded-[2rem] shadow-sm p-5 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-[#0f2c3f]">Danh sách câu</h3>
                  <span className="text-[11px] font-black text-slate-400">{progress}%</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const selected = Boolean(answers[question.id]);
                    const current = index === currentIndex;

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => goToQuestion(index)}
                        className={`aspect-square rounded-xl text-xs font-black border transition-all ${
                          current
                            ? "bg-[#0f2c3f] text-white border-[#0f2c3f]"
                            : selected
                              ? "bg-cyan-50 text-[#00a8b5] border-cyan-100"
                              : "bg-slate-50 text-slate-400 border-slate-100"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </aside>
            </div>
          )}
        </>
      )}
    </StudyAppShell>
  );
}
