import { Icon } from "@iconify/react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logoutApi } from "../../services/authService";
import { clearSession, getCurrentUserEmail } from "../../services/tokenUtils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: "lucide:layout-dashboard", end: true },
  { to: "/admin/careers", label: "Ngành học", icon: "lucide:compass" },
  { to: "/admin/universities", label: "Trường đại học", icon: "lucide:building-2" },
  { to: "/admin/university-majors", label: "Điểm chuẩn", icon: "lucide:chart-no-axes-combined" },
  { to: "/admin/learning-methods", label: "Phương pháp học", icon: "lucide:book-open-check" },
  { to: "/admin/learning-strategy-profiles", label: "Chiến lược học", icon: "lucide:map" },
  { to: "/admin/resources", label: "Kho tài liệu", icon: "lucide:folder-kanban" },
  { to: "/admin/quiz/questions", label: "Quiz định hướng", icon: "lucide:list-checks" },
  { to: "/admin/exam-subjects", label: "Môn thi", icon: "lucide:book" },
  { to: "/admin/exam-combinations", label: "Tổ hợp xét tuyển", icon: "lucide:blocks" },
  { to: "/admin/mock-exams", label: "Đề thi thử", icon: "lucide:file-pen-line" },
  { to: "/admin/users", label: "User", icon: "lucide:users" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const email = getCurrentUserEmail();

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
    <div className="min-h-screen bg-[#f6f8fb] text-[#0f2c3f]">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#0f2c3f] text-white flex items-center justify-center">
            <Icon icon="lucide:shield-check" className="text-xl" />
          </div>
          <div>
            <p className="font-black leading-tight">TGrowth Admin</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-cyan-50 text-[#00a8b5] border-l-4 border-[#00a8b5]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0f2c3f]"
                }`
              }
            >
              <Icon icon={item.icon} className="text-lg" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Admin</p>
            <h1 className="text-lg font-black">Quản trị TGrowth Pro</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-black">{email?.split("@")[0] || "Admin"}</p>
              <p className="text-[10px] text-slate-400">{email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-[#0f2c3f] px-4 py-2 text-xs font-black text-white hover:bg-[#1a4a69]"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
