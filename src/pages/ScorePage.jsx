import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react"

export default function ScoreInputPage() {

    const location = useLocation();
    const navigate = useNavigate();

    const careerId = location.state?.careerId;
    const careerName = location.state?.careerName;
    const percent = Math.round((location.state?.score || 0) / 10);

    const isLoggedIn = !!localStorage.getItem("accessToken");

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
        window.location.reload();
    };

    const [score, setScore] = useState(() => {
        const saved = localStorage.getItem("user_score");
        return saved ? Number(saved) : (location.state?.score ?? 24.5);
    });



    const handleChange = (value) => {
        if (value === "") {
            setScore("");
            return;
        }

        let newScore = parseFloat(value);

        if (isNaN(newScore)) newScore = 0;
        if (newScore > 30) newScore = 30;
        if (newScore < 0) newScore = 0;

        setScore(newScore);
    };

    const getLevel = () => {
        if (score < 20) return "avg";
        if (score <= 26) return "good";
        return "excellent";
    };

    const level = getLevel();

    const handleSubmit = () => {
        localStorage.setItem("user_score", score);

        navigate("/university", {
            state: { careerId, careerName, score }
        });
    };

    if (!careerId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Lỗi: chưa chọn ngành 😢
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-100 font-satoshi">
            {/* --- HEADER ĐÃ ĐƯỢC ĐỒNG BỘ --- */}
            <header className="sticky top-0 z-50 bg-[#1a3a52] text-white px-6 py-4 flex justify-between items-center shadow-2xl">
                {/* Logo & Brand */}
                <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all cursor-pointer">
                    <div className="bg-[#17a2b8] p-2.5 rounded-xl shadow-lg shadow-teal/20">
                        <Icon icon="lucide:graduation-cap" className="text-2xl text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">TGrowth Pro</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Smart Career Hub
                        </p>
                    </div>
                </Link>

                {/* Progress Step (Optional: Hiển thị bước hiện tại) */}
                <div className="hidden lg:flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                        <span className="w-5 h-5 rounded-full bg-[#17a2b8] text-[10px] flex items-center justify-center font-bold">2</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Nhập điểm dự kiến</span>
                    </div>
                </div>

                {/* Auth & User Info */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            {/* User Chip Đồng Bộ */}
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-2xl border border-white/10 hidden md:flex group hover:border-[#17a2b8]/50 transition-all cursor-default">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-[#17a2b8] font-black tracking-tighter uppercase">Student Account</span>
                                    <span className="text-xs font-bold text-white group-hover:text-[#17a2b8] transition-colors">
                                        {localStorage.getItem("userEmail")?.split('@')[0]}
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#17a2b8]/20 flex items-center justify-center border border-[#17a2b8]/30 overflow-hidden">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStorage.getItem("userEmail")}`}
                                        alt="avt"
                                    />
                                </div>
                            </div>

                            {/* Nút Logout */}
                            <button
                                onClick={handleLogout}
                                className="text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-all px-2 border-l border-slate-700 ml-2 h-8 flex items-center"
                            >
                                <Icon icon="lucide:log-out" className="mr-1" /> Thoát
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="text-sm font-bold hover:text-[#17a2b8] transition-colors">
                            Đăng nhập
                        </Link>
                    )}
                </div>
            </header>

            <div className="flex flex-1">

                {/* SIDEBAR */}
                <aside className="w-72 bg-white border-r p-6 hidden lg:flex flex-col justify-between">
                    <div>
                        <h2 className="font-bold mb-4">Lộ trình tư vấn</h2>

                        <div className="space-y-5 text-sm">

                            <div className="flex items-center gap-3 opacity-60">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
                                    📝
                                </div>
                                <span>Khảo sát năng lực</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 text-white shadow">
                                    🎯
                                </div>
                                <span className="font-bold text-teal-600">
                                    Nhập điểm & Gợi ý trường
                                </span>
                            </div>

                            <div className="flex items-center gap-3 opacity-40">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
                                    📚
                                </div>
                                <span>Phương pháp học</span>
                            </div>

                        </div>

                        {/* TIP */}
                        <div className="mt-6 p-4 bg-teal-50 rounded-xl text-sm">
                            <p className="font-bold text-teal-600 mb-1">Mẹo nhỏ</p>
                            <p>Nhập tổng điểm 3 môn để gợi ý chính xác hơn.</p>
                        </div>
                    </div>

                    {/* BACK */}
                    <button
                        onClick={() => navigate("/result")}
                        className="mt-6 py-3 border rounded-xl hover:bg-gray-100"
                    >
                        ← Quay lại chọn ngành
                    </button>
                </aside>

                {/* MAIN */}
                <main className="flex-1 flex justify-center items-center p-6">

                    <div className="w-full max-w-2xl">

                        {/* BADGE */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-white px-5 py-3 rounded-2xl shadow flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                                    💻
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Ngành đã chọn</p>
                                    <p className="font-bold">{careerName}</p>
                                </div>
                                <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">
                                    {percent}% phù hợp
                                </span>
                            </div>
                        </div>

                        {/* CARD */}
                        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">

                            <h2 className="text-3xl font-bold mb-2">
                                Nhập điểm dự kiến của bạn
                            </h2>

                            <p className="text-gray-400 mb-8">
                                Để gợi ý trường đại học phù hợp
                            </p>

                            {/* SCORE */}
                            <div className="mb-10">
                                <input
                                    type="number"
                                    value={score === "" ? 0 : score}
                                    step="0.25"
                                    onChange={(e) => handleChange(e.target.value)}
                                    className="w-40 text-center text-7xl font-bold border-b-2 border-gray-200 focus:outline-none focus:border-teal-400"
                                />
                                <p className="text-gray-400 mt-2">Điểm (hệ 30)</p>
                            </div>

                            {/* SLIDER */}
                            <div className="mb-10 px-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    step="0.25"
                                    value={score}
                                    onChange={(e) => handleChange(e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg"
                                />

                                <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    <span>0</span>
                                    <span>15</span>
                                    <span>20</span>
                                    <span>30</span>
                                </div>
                            </div>

                            {/* LEVEL */}
                            <div className="grid grid-cols-3 gap-4 mb-10">

                                {/* TRUNG BÌNH */}
                                <div className={`p-4 rounded-xl transition ${level === "avg"
                                    ? "bg-yellow-50 border-2 border-yellow-300 scale-105 shadow"
                                    : "bg-gray-50"
                                    }`}>
                                    <p className={`text-xs ${level === "avg" ? "text-yellow-600" : "text-gray-400"}`}>
                                        Trung bình
                                    </p>
                                    <p className="font-bold">15 - 20</p>
                                </div>

                                {/* KHÁ GIỎI */}
                                <div className={`p-4 rounded-xl transition ${level === "good"
                                    ? "bg-teal-50 border-2 border-teal-200 scale-105 shadow"
                                    : "bg-gray-50"
                                    }`}>
                                    <p className={`text-xs ${level === "good" ? "text-teal-600" : "text-gray-400"}`}>
                                        Khá - Giỏi
                                    </p>
                                    <p className="font-bold">20 - 26</p>
                                </div>

                                {/* XUẤT SẮC */}
                                <div className={`p-4 rounded-xl transition ${level === "excellent"
                                    ? "bg-green-50 border-2 border-green-300 scale-105 shadow"
                                    : "bg-gray-50"
                                    }`}>
                                    <p className={`text-xs ${level === "excellent" ? "text-green-600" : "text-gray-400"}`}>
                                        Xuất sắc
                                    </p>
                                    <p className="font-bold">26 - 30</p>
                                </div>

                            </div>

                            {/* BUTTON */}
                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 bg-teal-500 text-white rounded-xl font-bold text-lg hover:bg-teal-600 transition"
                            >
                                Xem gợi ý trường đại học ✨
                            </button>

                        </div>

                        {/* FOOTER */}
                        <div className="mt-6 text-center text-xs text-gray-400 flex justify-center gap-6">
                            <span>🔒 Bảo mật thông tin</span>
                            <span>📊 Dữ liệu chuẩn </span>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
