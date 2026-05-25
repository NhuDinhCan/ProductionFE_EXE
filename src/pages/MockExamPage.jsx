import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import StudyAppShell from "../components/StudyAppShell";
import {
  deleteAllMockExamAttempts,
  deleteMockExamAttempt,
  getMockExamAttempts,
  getMockExamCombinations,
  getMockExams,
  getMockExamSubjects,
} from "../services/mockExamService";
import { isLoggedIn as hasSession } from "../services/tokenUtils";

const getResponseData = (response) => response.data?.result || response.data || [];

const difficultyLabels = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó",
  BEGINNER: "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
};

const defaultDifficultyOptions = ["EASY", "MEDIUM", "HARD", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

const statusLabels = {
  IN_PROGRESS: "Đang làm",
  SUBMITTED: "Đã nộp",
  EXPIRED: "Hết hạn",
};

function labelDifficulty(value) {
  return difficultyLabels[value] || value || "Chưa phân loại";
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getAttemptLink(attempt) {
  if (attempt.status === "IN_PROGRESS" && attempt.examId) {
    return `/mock-exams/${attempt.examId}?attemptId=${attempt.id}`;
  }
  return `/mock-exams/results/${attempt.id}`;
}

function getAttemptActionLabel(attempt) {
  return attempt.status === "IN_PROGRESS" ? "Tiếp tục làm" : "Xem kết quả";
}

function hasSubmittedAttempt(exam, attempts) {
  return attempts.some(
    (attempt) => attempt.examId === exam.id && attempt.status !== "IN_PROGRESS"
  );
}

export default function MockExamPage() {
  const navigate = useNavigate();
  const isLoggedIn = hasSession();

  const [subjects, setSubjects] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [filters, setFilters] = useState({
    subjectId: "",
    combinationCode: "",
    difficulty: "",
    year: "",
    keyword: "",
  });
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");

  const difficultyOptions = useMemo(() => {
    const values = new Set(defaultDifficultyOptions);
    exams.map((exam) => exam.difficulty).filter(Boolean).forEach((difficulty) => values.add(difficulty));
    return Array.from(values).sort();
  }, [exams]);

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        const [subjectRes, combinationRes] = await Promise.all([
          getMockExamSubjects(),
          getMockExamCombinations(),
        ]);

        if (!active) return;
        setSubjects(getResponseData(subjectRes));
        setCombinations(getResponseData(combinationRes));
      } catch (err) {
        if (!active) return;
        setMessage(err.response?.data?.message || "Không tải được bộ lọc đề thi.");
      } finally {
        if (active) setInitialLoading(false);
      }
    };

    loadInitialData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage("");

    const loadExams = async () => {
      try {
        const response = await getMockExams({
          subjectId: filters.subjectId || undefined,
          combinationCode: filters.combinationCode || undefined,
          difficulty: filters.difficulty || undefined,
          year: filters.year || undefined,
          keyword: filters.keyword || undefined,
        });

        if (!active) return;
        setExams(getResponseData(response));
      } catch (err) {
        if (!active) return;
        setMessage(err.response?.data?.message || "Không tải được danh sách đề thi.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadExams();
    return () => {
      active = false;
    };
  }, [filters]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let active = true;
    getMockExamAttempts()
      .then((response) => {
        if (active) setAttempts(getResponseData(response).slice(0, 4));
      })
      .catch(() => {
        if (active) setAttempts([]);
      });

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStart = (examId) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate(`/mock-exams/${examId}`);
  };

  const handleDeleteAttempt = async (attemptId) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa lịch sử bài làm này không?");
    if (!confirmed) return;

    try {
      await deleteMockExamAttempt(attemptId);
      setAttempts((prev) => prev.filter((attempt) => attempt.id !== attemptId));
      setMessage("Đã xóa lịch sử bài làm.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Không xóa được lịch sử bài làm.");
    }
  };

  const handleDeleteAllAttempts = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử làm bài không?");
    if (!confirmed) return;

    try {
      await deleteAllMockExamAttempts();
      setAttempts([]);
      setMessage("Đã xóa toàn bộ lịch sử làm bài.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Không xóa được lịch sử làm bài.");
    }
  };

  return (
    <StudyAppShell subtitle="Luyện đề thi thử" activePath="/mock-exams">
      <section className="mb-8">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
          <div>
            <span className="bg-[#00a8b5] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Ngân hàng đề thi
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0f2c3f] mt-5">
              Luyện đề thi thử
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              Chọn môn học, tổ hợp, mức độ và năm để luyện đề. Kết quả chỉ hiển thị đáp án đúng và giải thích sau khi bạn nộp bài.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 text-[#00a8b5] flex items-center justify-center">
              <Icon icon="lucide:clipboard-check" className="text-xl" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                Số đề
              </p>
              <p className="text-lg font-black text-[#0f2c3f]">{exams.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[190px_170px_160px_120px_1fr] gap-3 shadow-sm">
        <select
          value={filters.subjectId}
          onChange={(event) => updateFilter("subjectId", event.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-[#0f2c3f] outline-none"
        >
          <option value="">Tất cả môn học</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <select
          value={filters.combinationCode}
          onChange={(event) => updateFilter("combinationCode", event.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-[#0f2c3f] outline-none"
        >
          <option value="">Tất cả tổ hợp</option>
          {combinations.map((combination) => (
            <option key={combination.code} value={combination.code}>
              {combination.code} - {combination.name}
            </option>
          ))}
        </select>

        <select
          value={filters.difficulty}
          onChange={(event) => updateFilter("difficulty", event.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-[#0f2c3f] outline-none"
        >
          <option value="">Tất cả mức độ</option>
          {difficultyOptions.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {labelDifficulty(difficulty)}
            </option>
          ))}
        </select>

        <input
          value={filters.year}
          onChange={(event) => updateFilter("year", event.target.value)}
          inputMode="numeric"
          placeholder="Năm"
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-[#0f2c3f] outline-none"
        />

        <div className="relative md:col-span-2 xl:col-span-1">
          <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.keyword}
            onChange={(event) => updateFilter("keyword", event.target.value)}
            placeholder="Tìm tên đề, môn học hoặc tổ hợp..."
            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-[#0f2c3f] outline-none focus:ring-2 focus:ring-[#00a8b5]/30"
          />
        </div>
      </section>

      {message && (
        <div className="mb-6 bg-amber-50 text-amber-700 border border-amber-100 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Icon icon="lucide:info" />
          {message}
        </div>
      )}

      {isLoggedIn && attempts.length > 0 && (
        <section className="mb-6 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-sm font-black text-[#0f2c3f] uppercase tracking-widest">
              Lịch sử gần đây
            </h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDeleteAllAttempts}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-600 hover:bg-rose-100"
              >
                <Icon icon="lucide:trash-2" />
                Xóa tất cả
              </button>
              <Icon icon="lucide:history" className="text-[#00a8b5]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {attempts.map((attempt) => (
              <article
                key={attempt.id}
                className="relative bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-cyan-200 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteAttempt(attempt.id)}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100"
                  aria-label="Xóa lịch sử bài làm"
                >
                  <Icon icon="lucide:trash-2" />
                </button>

                <Link to={getAttemptLink(attempt)} className="block pr-9">
                  <p className="text-sm font-black text-[#0f2c3f] line-clamp-1">{attempt.examTitle}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{formatDateTime(attempt.startedAt)}</p>
                  <div className="mt-3 flex items-center justify-between text-xs font-black">
                    <span className="text-[#00a8b5]">{statusLabels[attempt.status] || attempt.status}</span>
                    <span className="text-[#0f2c3f]">
                      {attempt.status === "IN_PROGRESS" ? "" : `${attempt.score ?? 0}/10`}
                    </span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[11px] font-black text-[#0f2c3f] border border-slate-100">
                    <Icon icon={attempt.status === "IN_PROGRESS" ? "lucide:play-circle" : "lucide:bar-chart-3"} />
                    {getAttemptActionLabel(attempt)}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {initialLoading || loading ? (
        <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm border border-white">
          <Icon icon="lucide:loader-2" className="text-4xl text-[#00a8b5] animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-500">Đang tải danh sách đề thi...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-white">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-5">
            <Icon icon="lucide:file-search" className="text-3xl" />
          </div>
          <h2 className="text-xl font-black text-[#0f2c3f] mb-2">
            Chưa có đề thi phù hợp
          </h2>
          <p className="text-sm text-slate-500">
            Hãy thử đổi môn học, tổ hợp, mức độ, năm hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
          {exams.map((exam) => {
            const completed = hasSubmittedAttempt(exam, attempts);

            return (
            <article
              key={exam.id}
              className="bg-white rounded-[2rem] border border-white shadow-sm p-6 flex flex-col min-h-[280px] hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-[#00a8b5] flex items-center justify-center shrink-0">
                  <Icon icon="lucide:file-pen-line" className="text-3xl" />
                </div>
                <span className="text-[10px] font-black px-3 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-100">
                  {labelDifficulty(exam.difficulty)}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-black">
                  {completed && (
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">
                      Đã làm
                    </span>
                  )}
                  <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded-lg border border-slate-100">
                    {exam.subjectName}
                  </span>
                  {exam.combinationCode && (
                    <span className="bg-[#00a8b5]/10 text-[#00a8b5] px-2 py-1 rounded-lg border border-cyan-100">
                      {exam.combinationCode}
                    </span>
                  )}
                  {exam.year && (
                    <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">
                      {exam.year}
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-black text-[#0f2c3f] mb-4 leading-snug">
                  {exam.title}
                </h2>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 font-black uppercase tracking-widest">Số câu</p>
                    <p className="text-[#0f2c3f] font-black mt-1">{exam.totalQuestions || 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 font-black uppercase tracking-widest">Thời gian</p>
                    <p className="text-[#0f2c3f] font-black mt-1">{exam.durationMinutes || 0} phút</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStart(exam.id)}
                className="mt-6 w-full bg-[#0f2c3f] text-white px-4 py-3 rounded-xl text-xs font-black hover:bg-[#1a4a69] transition-colors inline-flex items-center justify-center gap-2"
              >
                <Icon icon="lucide:play-circle" />
                {completed ? "Làm lại" : "Làm bài"}
              </button>
            </article>
            );
          })}
        </section>
      )}
    </StudyAppShell>
  );
}
