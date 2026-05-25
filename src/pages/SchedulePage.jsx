import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { logoutApi } from "../services/authService";
import { getLearningMajors } from "../services/learningStrategyService";
import { getAppliedLearningMethods } from "../services/userLearningMethodService";
import {
  createStudySchedule,
  deleteStudySchedule,
  generateStudySchedules,
  getStudySchedules,
  updateStudySchedule,
} from "../services/studyScheduleService";
import {
  clearSession,
  getCurrentUserEmail,
  isLoggedIn as hasSession,
} from "../services/tokenUtils";

const days = [
  { value: "MONDAY", label: "Thứ 2" },
  { value: "TUESDAY", label: "Thứ 3" },
  { value: "WEDNESDAY", label: "Thứ 4" },
  { value: "THURSDAY", label: "Thứ 5" },
  { value: "FRIDAY", label: "Thứ 6" },
  { value: "SATURDAY", label: "Thứ 7" },
  { value: "SUNDAY", label: "Chủ nhật" },
];

const emptyForm = {
  careerId: "",
  learningMethodId: "",
  title: "",
  description: "",
  dayOfWeek: "MONDAY",
  startTime: "19:30",
  endTime: "21:00",
};

const getResponseData = (response) =>
  response.data?.result || response.data || [];

const formatTime = (value) =>
  value ? String(value).slice(0, 5) : "--:--";

export default function SchedulePage() {
  const navigate = useNavigate();
  const userEmail = getCurrentUserEmail() || "Guest";

  const [schedules, setSchedules] = useState([]);
  const [appliedMethods, setAppliedMethods] = useState([]);
  const [majors, setMajors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterCareerId, setFilterCareerId] = useState("");
  const [filterLearningMethodId, setFilterLearningMethodId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const groupedSchedules = useMemo(() => {
    return days.reduce((acc, day) => {
      acc[day.value] = schedules.filter(
        (item) => item.dayOfWeek === day.value
      );
      return acc;
    }, {});
  }, [schedules]);

  const filterMethods = useMemo(() => {
    if (!filterCareerId) return appliedMethods;
    return appliedMethods.filter(
      (item) => String(item.careerId) === String(filterCareerId)
    );
  }, [appliedMethods, filterCareerId]);

  const availableMethods = useMemo(() => {
    if (!form.careerId) return [];
    return appliedMethods.filter(
      (item) => String(item.careerId) === String(form.careerId)
    );
  }, [appliedMethods, form.careerId]);

  const loadSchedules = async (careerId = "", learningMethodId = "") => {
    setLoading(true);
    setMessage("");

    try {
      const response = await getStudySchedules({
        careerId: careerId || undefined,
        learningMethodId: learningMethodId || undefined,
      });

      setSchedules(getResponseData(response));
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Không tải được thời khóa biểu."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAppliedMethodsForCareer = async (careerId) => {
    if (!careerId) {
      setAppliedMethods([]);
      return [];
    }

    const response = await getAppliedLearningMethods({ careerId });
    const methods = getResponseData(response);
    setAppliedMethods(methods);
    return methods;
  };

  useEffect(() => {
    if (!hasSession()) {
      navigate("/login");
      return;
    }

    let active = true;

    const loadInitialData = async () => {
      try {
        const majorsRes = await getLearningMajors();
        if (!active) return;
        setMajors(getResponseData(majorsRes));
        setAppliedMethods([]);
        await loadSchedules();
      } catch (err) {
        if (!active) return;
        setMessage(
          err.response?.data?.message || "Không tải được dữ liệu thời khóa biểu."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadInitialData();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleFilterCareerChange = async (careerId) => {
    setFilterCareerId(careerId);
    setFilterLearningMethodId("");
    setSchedules([]);
    setAppliedMethods([]);

    if (!careerId) {
      await loadSchedules();
      return;
    }

    try {
      await Promise.all([
        loadAppliedMethodsForCareer(careerId),
        loadSchedules(careerId, ""),
      ]);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Không tải được phương pháp đã áp dụng."
      );
      setLoading(false);
    }
  };

  const handleFilterMethodChange = async (learningMethodId) => {
    setFilterLearningMethodId(learningMethodId);

    if (!filterCareerId) {
      setSchedules([]);
      return;
    }

    await loadSchedules(filterCareerId, learningMethodId);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "careerId" ? { learningMethodId: "" } : {}),
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        careerId: Number(form.careerId),
        learningMethodId: form.learningMethodId
          ? Number(form.learningMethodId)
          : null,
        title: form.title,
        description: form.description,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
      };

      if (editingId) {
        await updateStudySchedule(editingId, payload);
        setMessage("Đã cập nhật lịch học.");
      } else {
        await createStudySchedule(payload);
        setMessage("Đã thêm lịch học mới.");
      }

      resetForm();

      setFilterCareerId(String(payload.careerId));
      setFilterLearningMethodId(
        payload.learningMethodId ? String(payload.learningMethodId) : ""
      );

      await loadSchedules(payload.careerId, payload.learningMethodId);
    } catch (err) {
      setMessage(err.response?.data?.message || "Không lưu được lịch học.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    const careerId = Number(filterCareerId);
    const learningMethodId = Number(filterLearningMethodId);

    if (!careerId || !learningMethodId) {
      setMessage("Vui lòng chọn ngành và phương pháp đã áp dụng.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await generateStudySchedules({ careerId, learningMethodId });
      setMessage("Đã tạo lịch học mẫu từ phương pháp đã áp dụng.");
      await loadSchedules(careerId, learningMethodId);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Không tạo được lịch học mẫu."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setForm({
      careerId: String(schedule.careerId),
      learningMethodId: schedule.learningMethodId
        ? String(schedule.learningMethodId)
        : "",
      title: schedule.title || "",
      description: schedule.description || "",
      dayOfWeek: schedule.dayOfWeek || "MONDAY",
      startTime: formatTime(schedule.startTime),
      endTime: formatTime(schedule.endTime),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    setSaving(true);
    setMessage("");

    try {
      await deleteStudySchedule(id);
      setMessage("Đã xóa lịch học.");

      await loadSchedules(filterCareerId, filterLearningMethodId);
    } catch (err) {
      setMessage(err.response?.data?.message || "Không xóa được lịch học.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    }

    clearSession();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <header className="h-16 bg-[#0f2c3f] text-white flex justify-between items-center px-6 fixed top-0 w-full z-50 shadow-lg">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all">
          <div className="bg-cyan-500 p-1.5 rounded-lg">
            <Icon icon="lucide:graduation-cap" className="text-xl" />
          </div>
          <div>
            <h1 className="font-bold leading-none text-lg tracking-tight">
              TGrowth Pro
            </h1>
            <p className="text-[10px] opacity-60 font-medium uppercase tracking-tighter">
              Thời khóa biểu học tập
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">
              {userEmail.split("@")[0] || "Student"}
            </p>
            <p className="text-[10px] opacity-60 italic">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-300 hover:text-white transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="flex pt-16">
        <aside className="w-64 bg-white border-r border-gray-100 p-6 fixed left-0 h-[calc(100vh-64px)] overflow-y-auto z-40">
          <nav className="space-y-2">
            <Link
              to="/strategy"
              className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Icon icon="lucide:book-open-check" />
              <span className="text-sm font-medium">Chiến lược học tập</span>
            </Link>

            <div className="flex items-center gap-3 p-3 bg-cyan-50 text-[#00a8b5] rounded-xl font-bold border-l-4 border-[#00a8b5] shadow-sm shadow-cyan-100">
              <Icon icon="lucide:calendar-range" />
              <span className="text-sm">Thời khóa biểu</span>
            </div>

            <Link
              to="/ai-assistant"
              className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Icon icon="lucide:message-circle" />
              <span className="text-sm font-medium">Hỏi đáp trợ lý AI</span>
            </Link>

            <Link
              to="/resources"
              className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Icon icon="lucide:folder-kanban" />
              <span className="text-sm font-medium">Kho tài liệu</span>
            </Link>

            <Link
              to="/mock-exams"
              className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Icon icon="lucide:clipboard-pen-line" />
              <span className="text-sm font-medium">Luyện đề thi thử</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 ml-64 p-8">
          <section className="mb-8">
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
              <div>
                <span className="bg-[#00a8b5] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Lịch học cá nhân
                </span>
                <h1 className="text-4xl font-black text-[#0f2c3f] mt-5">
                  Thời khóa biểu học tập
                </h1>
                <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                  Lọc lịch theo ngành học và phương pháp học đã áp dụng.
                </p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-sm">
                <select
                  value={filterLearningMethodId}
                  onChange={(event) => handleFilterMethodChange(event.target.value)}
                  disabled={!filterCareerId || appliedMethods.length === 0}
                  className="min-w-[280px] bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-[#0f2c3f] outline-none disabled:opacity-50"
                >
                  <option value="">
                    {filterCareerId
                      ? "Chọn phương pháp đã áp dụng"
                      : "Chọn ngành trước"}
                  </option>
                  {appliedMethods.map((item) => (
                    <option
                      key={`${item.careerId}:${item.learningMethodId}`}
                      value={item.learningMethodId}
                    >
                      {item.learningMethodTitle}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={saving || !filterCareerId || !filterLearningMethodId}
                  className="bg-[#0f2c3f] text-white px-5 py-3 rounded-xl text-xs font-black hover:bg-[#1a4a69] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:sparkles" />
                  Tạo lịch học từ phương pháp
                </button>
              </div>
            </div>
          </section>

          <section className="mb-6 bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-sm">
            <select
              value={filterCareerId}
              onChange={(event) => handleFilterCareerChange(event.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-[#0f2c3f] outline-none"
            >
              <option value="">Tất cả ngành học</option>
              {majors.map((major) => (
                <option key={major.code} value={major.code}>
                  {major.name}
                </option>
              ))}
            </select>

            <select
              value={filterLearningMethodId}
              onChange={(event) => handleFilterMethodChange(event.target.value)}
              disabled={!filterCareerId}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-[#0f2c3f] outline-none disabled:opacity-50"
            >
              <option value="">Tất cả phương pháp của ngành</option>
              {filterMethods.map((method) => (
                <option
                  key={`${method.careerId}:${method.learningMethodId}`}
                  value={method.learningMethodId}
                >
                  {method.learningMethodTitle}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setFilterCareerId("");
                setFilterLearningMethodId("");
                setAppliedMethods([]);
                loadSchedules();
              }}
              className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors"
            >
              Xem tất cả
            </button>
          </section>

          {message && (
            <div className="mb-6 bg-amber-50 text-amber-700 border border-amber-100 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <Icon icon="lucide:info" />
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
            <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
              {days.map((day) => (
                <div
                  key={day.value}
                  className="bg-white rounded-[2rem] p-5 shadow-sm border border-white min-h-[220px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-[#0f2c3f]">
                      {day.label}
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                      {(groupedSchedules[day.value] || []).length} buổi
                    </span>
                  </div>

                  {loading ? (
                    <p className="text-xs text-slate-400 font-bold">
                      Đang tải...
                    </p>
                  ) : (groupedSchedules[day.value] || []).length === 0 ? (
                    <p className="text-xs text-slate-400 font-bold">
                      Chưa có lịch học
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {groupedSchedules[day.value].map((schedule) => (
                        <div
                          key={schedule.id}
                          className="rounded-2xl bg-slate-50 border border-slate-100 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-black uppercase tracking-widest text-[#00a8b5]">
                                {formatTime(schedule.startTime)} -{" "}
                                {formatTime(schedule.endTime)}
                              </p>
                              <h3 className="text-sm font-black text-[#0f2c3f] mt-1 break-words">
                                {schedule.title}
                              </h3>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEdit(schedule)}
                                className="w-8 h-8 rounded-xl bg-white text-slate-500 hover:text-[#00a8b5] flex items-center justify-center"
                              >
                                <Icon icon="lucide:pencil" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(schedule.id)}
                                className="w-8 h-8 rounded-xl bg-white text-slate-500 hover:text-red-500 flex items-center justify-center"
                              >
                                <Icon icon="lucide:trash-2" />
                              </button>
                            </div>
                          </div>

                          {schedule.description && (
                            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                              {schedule.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black">
                            <span className="bg-white text-slate-500 px-2 py-1 rounded-lg border border-slate-100">
                              {schedule.careerName}
                            </span>

                            {schedule.learningMethodTitle && (
                              <span className="bg-cyan-50 text-[#00a8b5] px-2 py-1 rounded-lg border border-cyan-100">
                                {schedule.learningMethodTitle}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>

            <aside className="bg-white rounded-[2rem] p-6 shadow-sm border border-white self-start sticky top-24">
              <h2 className="text-xl font-black text-[#0f2c3f] mb-2">
                {editingId ? "Sửa lịch học" : "Thêm lịch học"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    Ngành học
                  </label>
                  <select
                    value={form.careerId}
                    onChange={(event) =>
                      updateField("careerId", event.target.value)
                    }
                    required
                    className="mt-2 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00a8b5]/30"
                  >
                    <option value="">Chọn ngành</option>
                    {majors.map((major) => (
                      <option key={major.code} value={major.code}>
                        {major.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    Phương pháp
                  </label>
                  <select
                    value={form.learningMethodId}
                    onChange={(event) =>
                      updateField("learningMethodId", event.target.value)
                    }
                    disabled={!form.careerId}
                    className="mt-2 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00a8b5]/30 disabled:opacity-50"
                  >
                    <option value="">Không gắn phương pháp</option>
                    {availableMethods.map((method) => (
                      <option
                        key={`${method.careerId}:${method.learningMethodId}`}
                        value={method.learningMethodId}
                      >
                        {method.learningMethodTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    Tiêu đề
                  </label>
                  <input
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    required
                    className="mt-2 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00a8b5]/30"
                    placeholder="Học Spring Boot"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    Mô tả
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    rows={3}
                    className="mt-2 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00a8b5]/30 resize-none"
                    placeholder="Ôn REST API và JWT"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                      Thứ
                    </label>
                    <select
                      value={form.dayOfWeek}
                      onChange={(event) =>
                        updateField("dayOfWeek", event.target.value)
                      }
                      className="mt-2 w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-sm font-bold outline-none"
                    >
                      {days.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                      Bắt đầu
                    </label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(event) =>
                        updateField("startTime", event.target.value)
                      }
                      className="mt-2 w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-sm font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                      Kết thúc
                    </label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(event) =>
                        updateField("endTime", event.target.value)
                      }
                      className="mt-2 w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-sm font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#0f2c3f] text-white py-3 rounded-xl text-xs font-black hover:bg-[#1a4a69] transition-colors disabled:opacity-50"
                  >
                    {saving
                      ? "Đang lưu..."
                      : editingId
                        ? "CẬP NHẬT"
                        : "THÊM LỊCH"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors"
                    >
                      HỦY
                    </button>
                  )}
                </div>
              </form>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}



