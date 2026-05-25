import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { adminApi, getResult } from "../../services/adminService";

const cards = [
  ["totalUsers", "User", "lucide:users"],
  ["totalCareers", "Ngành học", "lucide:compass"],
  ["totalUniversities", "Trường", "lucide:building-2"],
  ["totalLearningResources", "Tài liệu", "lucide:folder-kanban"],
  ["totalMockExams", "Đề thi", "lucide:file-pen-line"],
  ["totalMockQuestions", "Câu hỏi thi", "lucide:list-checks"],
  ["totalAttempts", "Lượt làm bài", "lucide:clipboard-check"],
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard()
      .then((response) => setData(getResult(response)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="bg-white rounded-[2rem] p-10 text-center font-bold text-slate-500">Đang tải dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <section>
        <span className="bg-[#00a8b5] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Overview
        </span>
        <h1 className="text-3xl font-black text-[#0f2c3f] mt-4">Dashboard quản trị</h1>
        <p className="text-sm text-slate-500 mt-2">Theo dõi nhanh dữ liệu chính của TGrowth Pro.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(([key, label, icon]) => (
          <div key={key} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 text-[#00a8b5] flex items-center justify-center mb-4">
              <Icon icon={icon} className="text-xl" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">{label}</p>
            <p className="text-3xl font-black text-[#0f2c3f] mt-1">{data?.[key] ?? 0}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm">
          <h2 className="text-lg font-black mb-4">Lượt làm bài gần đây</h2>
          <div className="space-y-3">
            {(data?.recentAttempts || []).map((item) => (
              <div key={item.id} className="bg-slate-50 rounded-2xl p-4 flex justify-between gap-3">
                <div>
                  <p className="font-black text-sm">{item.examTitle}</p>
                  <p className="text-xs text-slate-500">{item.userEmail}</p>
                </div>
                <p className="text-sm font-black text-[#00a8b5]">{item.score ?? 0}/10</p>
              </div>
            ))}
            {(data?.recentAttempts || []).length === 0 && <p className="text-sm text-slate-500">Chưa có lượt làm bài.</p>}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm">
          <h2 className="text-lg font-black mb-4">User mới</h2>
          <div className="space-y-3">
            {(data?.recentUsers || []).map((user) => (
              <div key={user.id} className="bg-slate-50 rounded-2xl p-4 flex justify-between gap-3">
                <div>
                  <p className="font-black text-sm">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <p className="text-xs font-black text-slate-400">{(user.roles || []).join(", ")}</p>
              </div>
            ))}
            {(data?.recentUsers || []).length === 0 && <p className="text-sm text-slate-500">Chưa có user.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
