import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import learningImg from "../assets/learning.png";
import { Link, useNavigate } from "react-router-dom";
import { logoutApi } from "../services/authService";
import { getLearningMajors, getLearningStrategy } from "../services/learningStrategyService";
import { applyLearningMethod, getAppliedLearningMethods } from "../services/userLearningMethodService";
import { getTodayStudySchedules } from "../services/studyScheduleService";
import { clearSession, getCurrentUserEmail, isLoggedIn as hasSession } from "../services/tokenUtils";

const methodStyles = [
  { icon: "lucide:rocket", iconClass: "bg-orange-50 text-orange-500", borderClass: "hover:border-orange-100" },
  { icon: "lucide:layers", iconClass: "bg-cyan-50 text-[#00a8b5]", borderClass: "hover:border-cyan-100" },
  { icon: "lucide:git-branch", iconClass: "bg-indigo-50 text-indigo-500", borderClass: "hover:border-indigo-100" },
  { icon: "lucide:brain-circuit", iconClass: "bg-emerald-50 text-emerald-500", borderClass: "hover:border-emerald-100" },
  { icon: "lucide:target", iconClass: "bg-rose-50 text-rose-500", borderClass: "hover:border-rose-100" },
];

const dayLabels = {
  MONDAY: "Thứ 2",
  TUESDAY: "Thứ 3",
  WEDNESDAY: "Thứ 4",
  THURSDAY: "Thứ 5",
  FRIDAY: "Thứ 6",
  SATURDAY: "Thứ 7",
  SUNDAY: "Chủ nhật",
};

const getResponseData = (response) => response.data?.result || response.data || [];

const methodKey = (careerId, learningMethodId) => `${careerId}:${learningMethodId}`;

const formatTime = (value) => (value ? String(value).slice(0, 5) : "--:--");

const parseTimeToMinutes = (value) => {
  const [hour = "0", minute = "0"] = formatTime(value).split(":");
  return Number(hour) * 60 + Number(minute);
};

const getNearestTodaySchedule = (schedules) => {
  if (!schedules.length) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const sortedSchedules = [...schedules].sort(
    (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  );

  return (
    sortedSchedules.find((schedule) => parseTimeToMinutes(schedule.startTime) >= currentMinutes) ||
    sortedSchedules[sortedSchedules.length - 1]
  );
};

const LearningStrategy = () => {
  const navigate = useNavigate();
  const isLoggedIn = hasSession();
  const userEmail = getCurrentUserEmail() || "Guest";

  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState("");
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [majorsLoading, setMajorsLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedMethods, setAppliedMethods] = useState([]);
  const [applyingMethodId, setApplyingMethodId] = useState(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedCareerId = useMemo(() => {
    const raw = strategy?.careerId || selectedMajor;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [selectedMajor, strategy]);

  const selectedMajorName = useMemo(() => {
    return majors.find((major) => major.code === selectedMajor)?.name || strategy?.major || "";
  }, [majors, selectedMajor, strategy]);

  const appliedKeys = useMemo(() => {
    return new Set(appliedMethods.map((item) => methodKey(item.careerId, item.learningMethodId)));
  }, [appliedMethods]);

  const nextTodaySchedule = useMemo(() => getNearestTodaySchedule(todaySchedules), [todaySchedules]);

  const loadTodaySchedules = async () => {
    if (!hasSession()) return;
    const res = await getTodayStudySchedules();
    setTodaySchedules(getResponseData(res));
  };

  useEffect(() => {
    let active = true;

    const loadMajors = async () => {
      setMajorsLoading(true);
      try {
        const res = await getLearningMajors();
        const data = getResponseData(res);
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setMajors(data);
        } else {
          setMajors([]);
          setError("Database chưa có ngành học. Vui lòng thêm dữ liệu vào bảng career.");
        }
      } catch {
        if (active) {
          setMajors([]);
          setError("Không kết nối được API ngành học. Vui lòng kiểm tra backend và database MySQL.");
        }
      } finally {
        if (active) setMajorsLoading(false);
      }
    };

    loadMajors();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    let active = true;

    const loadUserLearningData = async () => {
      try {
        const [appliedRes, todayRes] = await Promise.all([
          getAppliedLearningMethods(),
          getTodayStudySchedules(),
        ]);
        if (!active) return;
        setAppliedMethods(getResponseData(appliedRes));
        setTodaySchedules(getResponseData(todayRes));
      } catch {
        if (!active) return;
        setApplyMessage("Không tải được dữ liệu học tập đã lưu.");
        setTodaySchedules([]);
      }
    };

    loadUserLearningData();
    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const loadStrategy = async (majorCode) => {
    if (!majorCode) {
      setStrategy(null);
      setError("Vui lòng chọn ngành học để xem phương pháp phù hợp.");
      return;
    }

    setLoading(true);
    setError("");
    setApplyMessage("");
    try {
      const res = await getLearningStrategy(majorCode);
      setStrategy(getResponseData(res));
    } catch (err) {
      setStrategy(null);
      setError(err.response?.data?.message || "Không lấy được phương pháp học cho ngành đã chọn. Vui lòng kiểm tra API backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleMajorChange = (event) => {
    const majorCode = event.target.value;
    setSelectedMajor(majorCode);
    loadStrategy(majorCode);
  };

  const handleApplyMethod = async (method) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (!selectedCareerId || !method.id) {
      setApplyMessage("Cần dữ liệu ngành và phương pháp từ backend để áp dụng.");
      return;
    }

    setApplyingMethodId(method.id);
    setApplyMessage("");
    try {
      const res = await applyLearningMethod({
        careerId: selectedCareerId,
        learningMethodId: method.id,
      });
      const applied = getResponseData(res);
      setAppliedMethods((prev) => {
        const key = methodKey(applied.careerId, applied.learningMethodId);
        const withoutDuplicate = prev.filter((item) => methodKey(item.careerId, item.learningMethodId) !== key);
        return [applied, ...withoutDuplicate];
      });
      await loadTodaySchedules();
      setApplyMessage("Đã áp dụng phương pháp và tạo lịch học mẫu.");
    } catch (err) {
      setApplyMessage(err.response?.data?.message || "Không áp dụng được phương pháp học.");
    } finally {
      setApplyingMethodId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Session cleanup still runs if the API is unavailable.
    }
    clearSession();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f1f5f9] font-sans">
      <header className="h-16 bg-[#0f2c3f] text-white flex justify-between items-center px-4 sm:px-6 fixed top-0 w-full z-50 shadow-lg">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-100 transition hover:bg-white/20 lg:hidden"
            aria-label="Mở menu"
            aria-expanded={sidebarOpen}
          >
            <Icon icon="lucide:menu" className="text-xl" />
          </button>

          <Link to="/" className="flex min-w-0 items-center gap-2 hover:opacity-80 transition-all cursor-pointer">
          <div className="bg-cyan-500 p-1.5 rounded-lg">
            <Icon icon="lucide:graduation-cap" className="text-xl" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold leading-none text-lg tracking-tight">TGrowth Pro</h1>
            <p className="text-[10px] opacity-60 font-medium uppercase tracking-tighter">Cố vấn học tập 4.0</p>
          </div>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
            <p className="text-[9px] opacity-50 font-bold uppercase tracking-widest">Mục tiêu cá nhân</p>
            <p className="text-xs font-bold text-cyan-400">{selectedMajorName || "Chọn ngành phù hợp"}</p>
          </div>

          <button className="relative p-2 text-gray-300 hover:text-white transition-colors group">
            <Icon icon="lucide:bell" className="text-xl group-hover:shake" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f2c3f]"></span>
          </button>

          <div className="flex items-center gap-4 group relative py-2 cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{userEmail.split("@")[0] || "Student"}</p>
              <p className="text-[10px] opacity-60 italic">{userEmail}</p>
            </div>

            <div className="relative">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`}
                className="w-10 h-10 rounded-full bg-orange-100 border-2 border-cyan-500/50 group-hover:border-cyan-400 transition-all"
                alt="avatar"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f2c3f] rounded-full"></span>

              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 text-[#0f2c3f] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right scale-95 group-hover:scale-100 z-[60]">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tài khoản quản lý</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-cyan-50 transition-colors">
                  <Icon icon="lucide:user" className="text-cyan-600" /> Hồ sơ của tôi
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-cyan-50 transition-colors">
                  <Icon icon="lucide:settings" className="text-gray-400" /> Cài đặt hệ thống
                </button>
                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold"
                >
                  <Icon icon="lucide:log-out" /> Đăng xuất phiên làm việc
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-full pt-16">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-16 z-30 bg-slate-950/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng menu"
          />
        )}

        <aside
          className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-64 max-w-[85vw] overflow-y-auto border-r border-gray-100 bg-white p-6 transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Menu
            </p>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500"
              aria-label="Đóng menu"
            >
              <Icon icon="lucide:x" />
            </button>
          </div>
          <nav className="flex flex-col h-full justify-between">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-4 flex items-center gap-2">
                  <Icon icon="lucide:layout-grid" /> Menu chính
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 text-[#00a8b5] rounded-xl font-bold cursor-pointer border-l-4 border-[#00a8b5] shadow-sm shadow-cyan-100">
                    <Icon icon="lucide:book-open-check" />
                    <span className="text-sm">Chiến lược học tập</span>
                  </div>
                  <Link to="/ai-assistant" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group">
                    <Icon icon="lucide:message-circle" className="group-hover:text-cyan-500" />
                    <span className="text-sm font-medium">Hỏi đáp trợ lý AI</span>
                  </Link>
                  <Link to="/schedule" onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group text-left">
                    <Icon icon="lucide:calendar-range" className="group-hover:text-cyan-500" />
                    <span className="text-sm font-medium">Thời khóa biểu</span>
                  </Link>
                  <Link to="/resources" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group">
                    <Icon icon="lucide:folder-kanban" className="group-hover:text-cyan-500" />
                    <span className="text-sm font-medium">Kho tài liệu</span>
                  </Link>
                  <Link to="/mock-exams" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group">
                    <Icon icon="lucide:clipboard-pen-line" className="group-hover:text-cyan-500" />
                    <span className="text-sm font-medium">Luyện đề thi thử</span>
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-4">Lịch trình hôm nay</p>
                <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-yellow-700 font-bold text-[11px] mb-2 relative z-10">
                    <Icon icon="lucide:clock" />
                    <span>
                      {nextTodaySchedule
                        ? `${formatTime(nextTodaySchedule.startTime)} - ${formatTime(nextTodaySchedule.endTime)}`
                        : "Không có lịch"}
                    </span>
                  </div>
                  <p className="text-[11px] text-yellow-800/80 leading-relaxed relative z-10">
                    {nextTodaySchedule?.title || (isLoggedIn ? "Hôm nay chưa có lịch học" : "Đăng nhập để xem lịch học hôm nay")}
                  </p>
                  <Icon icon="lucide:zap" className="absolute -right-2 -bottom-2 text-yellow-200/40 text-4xl" />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button className="w-full bg-[#0f2c3f] hover:bg-[#1a4a69] text-white py-3 rounded-xl text-[11px] font-black transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2">
                <Icon icon="lucide:sparkles" className="text-cyan-400" /> NÂNG CẤP PRO
              </button>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 bg-[#f8fafc] p-4 sm:p-6 lg:ml-64 lg:p-8">
          <section className="bg-white rounded-[2rem] lg:rounded-[3rem] p-5 sm:p-8 lg:p-12 relative overflow-hidden shadow-sm mb-8 border border-white group">
            <div className="max-w-3xl relative z-10">
              <span className="bg-[#00a8b5] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Chiến lược cá nhân hóa
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f2c3f] mt-8 mb-4 leading-tight">
                Lộ trình học theo ngành <br />
                <span className="text-[#00a8b5]">{strategy?.major || "bạn quan tâm"}</span>
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-8">
                {strategy?.description ||
                  "Chọn ngành học để hệ thống đề xuất phương pháp học, kỹ năng, công cụ và lộ trình phù hợp với mục tiêu của bạn."}
              </p>

              <div className="flex flex-col md:flex-row gap-3 md:items-center max-w-2xl">
                <select
                  value={selectedMajor}
                  onChange={handleMajorChange}
                  disabled={majorsLoading}
                  className="flex-1 bg-slate-50 border border-slate-100 text-[#0f2c3f] rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00a8b5]/30 focus:border-[#00a8b5]"
                >
                  <option value="">{majorsLoading ? "Đang tải ngành học..." : "Chọn ngành học"}</option>
                  {majors.map((major) => (
                    <option key={major.code} value={major.code}>
                      {major.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => loadStrategy(selectedMajor)}
                  disabled={loading}
                  className="bg-[#1e3a4f] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#1e3a4f]/20 disabled:opacity-60 disabled:hover:scale-100"
                >
                  {loading ? "Đang phân tích..." : "Xem gợi ý"} <Icon icon="lucide:play-circle" />
                </button>
              </div>

              {(error || applyMessage) && (
                <div className="mt-5 inline-flex items-start gap-2 bg-amber-50 text-amber-700 border border-amber-100 px-4 py-3 rounded-2xl text-xs font-bold max-w-2xl">
                  <Icon icon="lucide:alert-triangle" className="text-base shrink-0" />
                  <span>{applyMessage || error}</span>
                </div>
              )}
            </div>

            <div className="absolute right-0 bottom-0 w-[450px] opacity-100 hidden lg:block transition-transform duration-700 group-hover:translate-x-2">
              <img src={learningImg} alt="learning illustration" className="w-full h-full object-contain" />
            </div>
          </section>

          {!strategy && !loading && (
            <section className="mb-10 bg-cyan-50/70 border border-cyan-100 rounded-[2rem] p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#00a8b5] flex items-center justify-center text-2xl shadow-sm">
                <Icon icon="lucide:mouse-pointer-click" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#0f2c3f] mb-1">Chọn ngành học để bắt đầu</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Hệ thống sẽ hiển thị phương pháp học, kỹ năng cần rèn, công cụ nên dùng và lộ trình theo tuần.
                </p>
              </div>
            </section>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end mb-8 px-2">
            <div>
              <h2 className="text-2xl font-black text-[#0f2c3f] flex items-center gap-2">
                <Icon icon="lucide:layout-template" className="text-[#00a8b5]" />
                {strategy ? `Phương pháp học cho ${strategy.major}` : "Phương pháp học đề xuất"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                {strategy ? "Bấm áp dụng để lưu phương pháp vào tài khoản và tạo lịch học mẫu." : "Chọn ngành để cá nhân hóa nội dung bên dưới."}
              </p>
            </div>
            <Link to="/schedule" className="hidden md:flex items-center gap-2 text-xs font-black text-[#00a8b5] hover:text-[#0f2c3f]">
              <Icon icon="lucide:calendar-range" />
              Mở thời khóa biểu
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm border border-white mb-12">
              <Icon icon="lucide:loader-2" className="text-4xl text-[#00a8b5] animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-500">Đang lấy gợi ý phương pháp học...</p>
            </div>
          ) : (
            strategy && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  {strategy.methods.map((method, index) => {
                    const style = methodStyles[index % methodStyles.length];
                    const key = methodKey(selectedCareerId, method.id);
                    const isApplied = appliedKeys.has(key);
                    const isApplying = applyingMethodId === method.id;
                    const canApply = Boolean(selectedCareerId && method.id);

                    return (
                      <div
                        key={method.id || method.title}
                        className={`bg-white p-10 rounded-[2.5rem] border border-transparent ${style.borderClass} shadow-sm flex flex-col group transition-all hover:shadow-xl hover:-translate-y-1`}
                      >
                        <div className={`w-14 h-14 ${style.iconClass} rounded-2xl flex items-center justify-center mb-8 text-2xl group-hover:rotate-12 transition-all`}>
                          <Icon icon={style.icon} />
                        </div>
                        <h3 className="text-xl font-black text-[#1a3a52] mb-4">{method.title}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-8 flex-1">{method.description}</p>
                        <div className="space-y-3 mb-10 text-[11px] font-bold text-[#1a3a52]">
                          {(method.benefits || []).map((benefit) => (
                            <div key={benefit} className="flex items-center gap-2">
                              <Icon icon="lucide:check-circle-2" className="text-cyan-500 text-sm shrink-0" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyMethod(method)}
                          disabled={isApplied || isApplying || !canApply}
                          className={`w-full py-3 rounded-xl text-[11px] font-black transition-all ${
                            isApplied
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-slate-50 text-slate-700 hover:bg-[#00a8b5] hover:text-white disabled:opacity-60 disabled:hover:bg-slate-50 disabled:hover:text-slate-700"
                          }`}
                        >
                          {isApplying ? "Đang áp dụng..." : isApplied ? "Đã áp dụng ✓" : "ÁP DỤNG PHƯƠNG PHÁP"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                  <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-white">
                    <h3 className="text-lg font-black text-[#0f2c3f] mb-5 flex items-center gap-2">
                      <Icon icon="lucide:dumbbell" className="text-[#00a8b5]" /> Kỹ năng nên rèn
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(strategy.skills || []).map((skill) => (
                        <span key={skill} className="bg-cyan-50 text-[#0f4c5c] border border-cyan-100 px-3 py-2 rounded-xl text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-white">
                    <h3 className="text-lg font-black text-[#0f2c3f] mb-5 flex items-center gap-2">
                      <Icon icon="lucide:wrench" className="text-[#00a8b5]" /> Công cụ/tài liệu
                    </h3>
                    <div className="space-y-3">
                      {(strategy.tools || []).map((tool) => (
                        <div key={tool} className="flex items-center gap-3 text-sm text-slate-500 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-[#00a8b5]"></span>
                          {tool}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-white">
                    <h3 className="text-lg font-black text-[#0f2c3f] mb-5 flex items-center gap-2">
                      <Icon icon="lucide:calendar-days" className="text-[#00a8b5]" /> Lộ trình theo tuần
                    </h3>
                    <div className="space-y-4">
                      {(strategy.weeklyRoadmap || []).map((week, index) => (
                        <div key={week} className="flex gap-3">
                          <span className="w-7 h-7 rounded-xl bg-[#0f2c3f] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                            {index + 1}
                          </span>
                          <p className="text-xs text-slate-500 font-semibold leading-relaxed pt-1">{week}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="mb-12 bg-white rounded-[2rem] p-8 shadow-sm border border-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-[#0f2c3f] flex items-center gap-2">
                        <Icon icon="lucide:calendar-range" className="text-[#00a8b5]" />
                        Thời khóa biểu học tập
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-semibold">
                        Lịch học được lưu trong database và đồng bộ theo tài khoản của bạn.
                      </p>
                    </div>
                    <Link
                      to="/schedule"
                      className="bg-[#0f2c3f] text-white px-5 py-3 rounded-xl text-xs font-black hover:bg-[#1a4a69] transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Icon icon="lucide:calendar-plus" />
                      QUẢN LÝ THỜI KHÓA BIỂU
                    </Link>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Hôm nay</p>
                      <p className="text-sm font-black text-[#0f2c3f]">
                        {nextTodaySchedule ? `${dayLabels[nextTodaySchedule.dayOfWeek] || nextTodaySchedule.dayOfWeek} • ${formatTime(nextTodaySchedule.startTime)}` : "Chưa có lịch"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-cyan-50 p-5 border border-cyan-100">
                      <p className="text-[10px] uppercase tracking-widest text-cyan-600 font-black mb-1">Đã áp dụng</p>
                      <p className="text-sm font-black text-[#0f2c3f]">{appliedMethods.length} phương pháp</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-100">
                      <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-black mb-1">Tự động</p>
                      <p className="text-sm font-black text-[#0f2c3f]">Apply method sẽ tạo lịch mẫu</p>
                    </div>
                  </div>
                </section>
              </>
            )
          )}
        </main>
      </div>

    </div>
  );
};

export default LearningStrategy;
