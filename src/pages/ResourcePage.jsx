import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { logoutApi } from "../services/authService";
import {
  getLearningResources,
  getResourceMajors,
  getSavedLearningResources,
  saveLearningResource,
  unsaveLearningResource,
} from "../services/learningResourceService";
import {
  clearSession,
  getCurrentUserEmail,
  isLoggedIn as hasSession,
} from "../services/tokenUtils";

const resourceTypes = [
  { value: "", label: "Tất cả loại" },
  { value: "PDF", label: "PDF" },
  { value: "VIDEO", label: "VIDEO" },
  { value: "WEBSITE", label: "WEBSITE" },
  { value: "EXERCISE", label: "EXERCISE" },
  { value: "ROADMAP", label: "ROADMAP" },
];

const resourceIcons = {
  PDF: "lucide:file-text",
  VIDEO: "lucide:video",
  WEBSITE: "lucide:globe-2",
  EXERCISE: "lucide:edit-3",
  ROADMAP: "lucide:map",
};

const levelStyles = {
  BEGINNER: "bg-emerald-50 text-emerald-600 border-emerald-100",
  INTERMEDIATE: "bg-amber-50 text-amber-600 border-amber-100",
  ADVANCED: "bg-rose-50 text-rose-600 border-rose-100",
};

const getResponseData = (response) => response.data?.result || response.data || [];

export default function ResourcePage() {
  const navigate = useNavigate();
  const userEmail = getCurrentUserEmail() || "Guest";
  const isLoggedIn = hasSession();

  const [resources, setResources] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [majors, setMajors] = useState([]);
  const [careerId, setCareerId] = useState("");
  const [type, setType] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredTitle = useMemo(() => {
    if (!careerId) return "Kho tài liệu học tập";
    return majors.find((major) => String(major.code) === String(careerId))?.name || "Kho tài liệu học tập";
  }, [careerId, majors]);

  const loadResources = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await getLearningResources({
        careerId: careerId || undefined,
        type: type || undefined,
        keyword: keyword || undefined,
      });
      setResources(getResponseData(response));
    } catch (err) {
      setMessage(err.response?.data?.message || "Không tải được kho tài liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        const [majorsRes, savedRes] = await Promise.all([
          getResourceMajors(),
          isLoggedIn ? getSavedLearningResources() : Promise.resolve({ data: [] }),
        ]);

        if (!active) return;
        setMajors(getResponseData(majorsRes));
        setSavedIds(new Set(getResponseData(savedRes).map((resource) => resource.id)));
      } catch (err) {
        if (!active) return;
        setMessage(err.response?.data?.message || "Không tải được dữ liệu tài liệu.");
      }
    };

    loadInitialData();
    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    loadResources();
  }, [careerId, type, keyword]);

  const handleToggleSave = async (resource) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setSavingId(resource.id);
    setMessage("");

    try {
      if (savedIds.has(resource.id)) {
        await unsaveLearningResource(resource.id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(resource.id);
          return next;
        });
        setMessage("Đã bỏ lưu tài liệu.");
      } else {
        await saveLearningResource(resource.id);
        setSavedIds((prev) => new Set(prev).add(resource.id));
        setMessage("Đã lưu tài liệu.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Không lưu được tài liệu.");
    } finally {
      setSavingId(null);
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
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] font-sans">
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

        <Link to="/" className="flex min-w-0 items-center gap-2 hover:opacity-80 transition-all">
          <div className="bg-cyan-500 p-1.5 rounded-lg">
            <Icon icon="lucide:graduation-cap" className="text-xl" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold leading-none text-lg tracking-tight">TGrowth Pro</h1>
            <p className="text-[10px] opacity-60 font-medium uppercase tracking-tighter">
              Kho tài liệu học tập
            </p>
          </div>
        </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{userEmail.split("@")[0] || "Student"}</p>
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
          <nav className="space-y-2">
            <Link
              to="/strategy"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Icon icon="lucide:book-open-check" />
              <span className="text-sm font-medium">Chiến lược học tập</span>
            </Link>

            <Link
              to="/schedule"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Icon icon="lucide:calendar-range" />
              <span className="text-sm font-medium">Thời khóa biểu</span>
            </Link>

            <Link
              to="/ai-assistant"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Icon icon="lucide:message-circle" />
              <span className="text-sm font-medium">Hỏi đáp trợ lý AI</span>
            </Link>

            <div className="flex items-center gap-3 p-3 bg-cyan-50 text-[#00a8b5] rounded-xl font-bold border-l-4 border-[#00a8b5] shadow-sm shadow-cyan-100">
              <Icon icon="lucide:folder-kanban" />
              <span className="text-sm">Kho tài liệu</span>
            </div>

            <Link
              to="/mock-exams"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Icon icon="lucide:clipboard-pen-line" />
              <span className="text-sm font-medium">Luyện đề thi thử</span>
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:ml-64 lg:p-8">
          <section className="mb-8">
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
              <div>
                <span className="bg-[#00a8b5] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Tài liệu theo ngành
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-[#0f2c3f] mt-5">
                  {filteredTitle}
                </h1>
                <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                  Tìm tài liệu học tập, video, website, bài tập và roadmap phù hợp với định hướng ngành của bạn.
                </p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-50 text-[#00a8b5] flex items-center justify-center">
                  <Icon icon="lucide:bookmark-check" className="text-xl" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    Đã lưu
                  </p>
                  <p className="text-lg font-black text-[#0f2c3f]">{savedIds.size}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6 bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-[220px_180px_1fr] gap-3 shadow-sm">
            <select
              value={careerId}
              onChange={(event) => setCareerId(event.target.value)}
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
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-[#0f2c3f] outline-none"
            >
              {resourceTypes.map((item) => (
                <option key={item.value || "ALL"} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <div className="relative">
              <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo tiêu đề, mô tả hoặc ngành học..."
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

          {loading ? (
            <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm border border-white">
              <Icon icon="lucide:loader-2" className="text-4xl text-[#00a8b5] animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-500">Đang tải kho tài liệu...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-white">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-5">
                <Icon icon="lucide:folder-open" className="text-3xl" />
              </div>
              <h2 className="text-xl font-black text-[#0f2c3f] mb-2">
                Chưa có tài liệu cho ngành này
              </h2>
              <p className="text-sm text-slate-500">
                Hãy thử chọn ngành khác, đổi loại tài liệu hoặc xóa từ khóa tìm kiếm.
              </p>
            </div>
          ) : (
            <section className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
              {resources.map((resource) => {
                const icon = resourceIcons[resource.resourceType] || "lucide:file";
                const saved = savedIds.has(resource.id);

                return (
                  <article
                    key={resource.id}
                    className="bg-white rounded-[2rem] border border-white shadow-sm p-6 flex flex-col min-h-[300px] hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-[#00a8b5] flex items-center justify-center shrink-0">
                        <Icon icon={icon} className="text-3xl" />
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${levelStyles[resource.level] || "bg-slate-50 text-slate-500 border-slate-100"}`}>
                        {resource.level || "BEGINNER"}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-black">
                        <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded-lg border border-slate-100">
                          {resource.careerName}
                        </span>
                        <span className="bg-[#00a8b5]/10 text-[#00a8b5] px-2 py-1 rounded-lg border border-cyan-100">
                          {resource.resourceType}
                        </span>
                      </div>

                      <h2 className="text-lg font-black text-[#0f2c3f] mb-3 leading-snug">
                        {resource.title}
                      </h2>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-2">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#0f2c3f] text-white px-4 py-3 rounded-xl text-xs font-black hover:bg-[#1a4a69] transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <Icon icon="lucide:external-link" />
                        Mở tài liệu
                      </a>

                      <button
                        type="button"
                        onClick={() => handleToggleSave(resource)}
                        disabled={savingId === resource.id}
                        className={`flex-1 px-4 py-3 rounded-xl text-xs font-black transition-colors inline-flex items-center justify-center gap-2 ${
                          saved
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        } disabled:opacity-50`}
                      >
                        <Icon icon={saved ? "lucide:bookmark-check" : "lucide:bookmark-plus"} />
                        {saved ? "Đã lưu" : "Lưu tài liệu"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
