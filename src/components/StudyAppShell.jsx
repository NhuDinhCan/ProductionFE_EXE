import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutApi } from "../services/authService";
import {
  clearSession,
  getCurrentUserEmail,
  isLoggedIn as hasSession,
} from "../services/tokenUtils";

const navItems = [
  { to: "/strategy", label: "Chiến lược học tập", icon: "lucide:book-open-check" },
  { to: "/schedule", label: "Thời khóa biểu", icon: "lucide:calendar-range" },
  { to: "/ai-assistant", label: "Hỏi đáp trợ lý AI", icon: "lucide:bot-message-square" },
  { to: "/chat", label: "Kết nối Mentor", icon: "lucide:message-circle" },
  { to: "/resources", label: "Kho tài liệu", icon: "lucide:folder-kanban" },
  { to: "/mock-exams", label: "Luyện đề thi thử", icon: "lucide:clipboard-pen-line" },
];

export default function StudyAppShell({ subtitle = "TGrowth Pro", activePath = "", children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoggedIn = hasSession();
  const userEmail = getCurrentUserEmail();
  const displayName = userEmail?.split("@")[0] || "Khách";

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
              <p className="truncate text-[10px] opacity-60 font-medium uppercase tracking-tighter">
                {subtitle}
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{displayName}</p>
            <p className="text-[10px] opacity-60 italic">{userEmail || "Chưa đăng nhập"}</p>
          </div>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-300 hover:text-white transition-colors"
            >
              Đăng xuất
            </button>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold text-cyan-200 hover:text-white transition-colors"
            >
              Đăng nhập
            </Link>
          )}
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
            {navItems.map((item) => {
              const active = activePath
                ? item.to === activePath
                : location.pathname === item.to;

              return active ? (
                <div
                  key={item.to}
                  className="flex items-center gap-3 p-3 bg-cyan-50 text-[#00a8b5] rounded-xl font-bold border-l-4 border-[#00a8b5] shadow-sm shadow-cyan-100"
                >
                  <Icon icon={item.icon} />
                  <span className="text-sm">{item.label}</span>
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <Icon icon={item.icon} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:ml-64 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
