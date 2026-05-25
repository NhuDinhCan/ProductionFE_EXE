import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import StudyAppShell from "../components/StudyAppShell";
import { getMockExamAttempt } from "../services/mockExamService";
import { isLoggedIn as hasSession } from "../services/tokenUtils";
import { resolveMediaUrl } from "../utils/mediaUrl";

const getResponseData = (response) => response.data?.result || response.data || null;
const optionKeys = ["A", "B", "C", "D"];

const statusLabels = {
  IN_PROGRESS: "Đang làm",
  SUBMITTED: "Đã nộp",
  EXPIRED: "Hết hạn",
};

function optionText(answer, option) {
  return answer[`option${option}`];
}

function formatScore(score) {
  return Number(score || 0).toFixed(2).replace(/\.00$/, "");
}

function QuestionImage({ src }) {
  if (!src) return null;

  return (
    <img
      src={resolveMediaUrl(src)}
      alt="Ảnh minh họa câu hỏi"
      className="mb-5 max-h-[420px] w-full rounded-2xl border border-slate-100 bg-white object-contain"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

export default function MockExamResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [message, setMessage] = useState("");
  const continueAttemptPath = result?.examId && result?.id
    ? `/mock-exams/${result.examId}?attemptId=${result.id}`
    : "/mock-exams";

  useEffect(() => {
    if (!hasSession()) {
      navigate("/login");
      return;
    }

    let active = true;
    setLoading(true);
    setMessage("");

    getMockExamAttempt(attemptId)
      .then((response) => {
        if (active) setResult(getResponseData(response));
      })
      .catch((err) => {
        if (active) setMessage(err.response?.data?.message || "Không tải được kết quả bài làm.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attemptId, navigate]);

  return (
    <StudyAppShell subtitle="Kết quả thi thử" activePath="/mock-exams">
      {loading ? (
        <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm border border-white">
          <Icon icon="lucide:loader-2" className="text-4xl text-[#00a8b5] animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-500">Đang tải kết quả...</p>
        </div>
      ) : message && !result ? (
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
          <section className="mb-6 bg-white border border-slate-100 rounded-2xl p-5 sm:p-7 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
              <div>
                <span className="bg-[#00a8b5] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {statusLabels[result.status] || result.status}
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-[#0f2c3f] mt-5">
                  {result.examTitle}
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  {result.subjectName}
                  {result.combinationCode ? ` · ${result.combinationCode}` : ""}
                </p>
              </div>

              {result.status === "IN_PROGRESS" ? (
                <Link
                  to={continueAttemptPath}
                  className="bg-[#0f2c3f] text-white rounded-[2rem] px-6 py-5 min-w-[180px] text-center hover:bg-[#1a4a69] transition-colors inline-flex flex-col items-center gap-2"
                >
                  <Icon icon="lucide:play-circle" className="text-3xl text-cyan-200" />
                  <span className="text-xs font-black">Tiếp tục làm bài</span>
                </Link>
              ) : (
                <div className="bg-[#0f2c3f] text-white rounded-[2rem] px-8 py-6 min-w-[180px] text-center">
                  <p className="text-[10px] uppercase tracking-widest text-cyan-200 font-black">
                    Điểm
                  </p>
                  <p className="text-5xl font-black mt-1">{formatScore(result.score)}</p>
                  <p className="text-xs text-white/60 mt-1">/10</p>
                </div>
              )}
            </div>

            {result.status !== "IN_PROGRESS" && (
            <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-black">Đúng</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{result.correctCount || 0}</p>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-rose-500 font-black">Sai</p>
                <p className="text-2xl font-black text-rose-600 mt-1">{result.wrongCount || 0}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-amber-500 font-black">Chưa làm</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{result.unansweredCount || 0}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Tổng câu</p>
                <p className="text-2xl font-black text-[#0f2c3f] mt-1">{result.totalQuestions || 0}</p>
              </div>
            </div>
            )}
          </section>

          {result.status === "IN_PROGRESS" ? (
            <section className="bg-white border border-white rounded-[2rem] shadow-sm p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-[#00a8b5] flex items-center justify-center mx-auto mb-5">
                <Icon icon="lucide:timer" className="text-3xl" />
              </div>
              <h2 className="text-xl font-black text-[#0f2c3f] mb-2">
                Bài thi này đang làm dở
              </h2>
              <p className="text-sm text-slate-500 max-w-xl mx-auto mb-6">
                Trang kết quả chỉ hiển thị đáp án đúng và giải thích sau khi bạn nộp bài.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to={continueAttemptPath}
                  className="bg-[#0f2c3f] text-white px-5 py-3 rounded-xl text-xs font-black hover:bg-[#1a4a69] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:play-circle" />
                  Tiếp tục làm bài
                </Link>
                <Link
                  to="/mock-exams"
                  className="bg-slate-100 text-slate-600 px-5 py-3 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:list-checks" />
                  Làm đề khác
                </Link>
              </div>
            </section>
          ) : (
            <>
          <section className="space-y-4">
            {(result.answers || []).map((answer, index) => {
              const unanswered = !answer.selectedOption;
              const correct = answer.correct === true;

              return (
                <article
                  key={answer.questionId}
                  className="bg-white border border-white rounded-[2rem] shadow-sm p-5 sm:p-7"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      Câu {index + 1}
                    </h2>
                    <span className={`w-fit text-[10px] font-black px-3 py-1 rounded-full border ${
                      unanswered
                        ? "bg-amber-50 text-amber-600 border-amber-100"
                        : correct
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                    }`}>
                      {unanswered ? "Chưa làm" : correct ? "Đúng" : "Sai"}
                    </span>
                  </div>

                  <p className="text-base font-black text-[#0f2c3f] leading-relaxed mb-5 whitespace-pre-wrap">
                    {answer.questionText}
                  </p>

                  <QuestionImage src={answer.imageUrl} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {optionKeys.map((option) => {
                      const isSelected = answer.selectedOption === option;
                      const isCorrectOption = answer.correctOption === option;

                      return (
                        <div
                          key={option}
                          className={`border rounded-2xl p-4 flex items-start gap-3 ${
                            isCorrectOption
                              ? "border-emerald-200 bg-emerald-50"
                              : isSelected
                                ? "border-rose-200 bg-rose-50"
                                : "border-slate-100 bg-slate-50"
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isCorrectOption
                              ? "bg-emerald-500 text-white"
                              : isSelected
                                ? "bg-rose-500 text-white"
                                : "bg-white text-slate-500"
                          }`}>
                            {option}
                          </span>
                          <span className="text-sm font-bold text-slate-700 leading-relaxed">
                            {optionText(answer, option)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Bạn chọn</p>
                      <p className="font-black text-[#0f2c3f] mt-1">{answer.selectedOption || "Chưa chọn"}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4">
                      <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-black">Đáp án đúng</p>
                      <p className="font-black text-emerald-700 mt-1">{answer.correctOption || "Chưa công bố"}</p>
                    </div>
                  </div>

                  {answer.explanation && (
                    <div className="mt-5 bg-cyan-50 border border-cyan-100 rounded-2xl p-4">
                      <p className="text-[10px] uppercase tracking-widest text-[#00a8b5] font-black mb-2">
                        Giải thích
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {answer.explanation}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {result.examId && (
              <Link
                to={`/mock-exams/${result.examId}`}
                className="bg-[#0f2c3f] text-white px-5 py-3 rounded-xl text-xs font-black hover:bg-[#1a4a69] transition-colors inline-flex items-center justify-center gap-2"
              >
                <Icon icon="lucide:rotate-ccw" />
                Làm lại đề này
              </Link>
            )}
            <Link
              to="/mock-exams"
              className="bg-slate-100 text-slate-600 px-5 py-3 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Icon icon="lucide:list-checks" />
              Làm đề khác
            </Link>
          </div>
            </>
          )}
        </>
      )}
    </StudyAppShell>
  );
}
