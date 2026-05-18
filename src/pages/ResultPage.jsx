import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react"

export default function ResultPage() {

    const location = useLocation();
    const navigate = useNavigate();
    const [results] = useState(() => {
        try {
            const savedResults = localStorage.getItem("quiz_results");
            const data = location.state?.results || (savedResults ? JSON.parse(savedResults) : []);
            return data && data.length > 0 ? data.slice(0, 5) : [];
        } catch (e) {
            console.error("Lá»—i load result:", e);
            return [];
        }
    });
    const [timeLeft] = useState(() => {
        const savedTime = localStorage.getItem("quiz_time_left");
        return location.state?.timeLeft ?? (savedTime ? parseInt(savedTime, 10) : 0);
    });
    const isLoggedIn = !!localStorage.getItem("accessToken");

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
        window.location.reload();
    };

    const TOTAL_TIME = 1800; // 30 phút

    /*
    useEffect(() => {
        try {
            // lấy data
            const savedResults = localStorage.getItem("quiz_results");
            const savedTime = localStorage.getItem("quiz_time_left");

            const data =
                location.state?.results ||
                (savedResults ? JSON.parse(savedResults) : []);

            const time =
                location.state?.timeLeft ??
                (savedTime ? parseInt(savedTime) : 0);

            if (data && data.length > 0) {
                setResults(data.slice(0, 5));
            }

            setTimeLeft(time);

        } catch (e) {
            console.error("Lỗi load result:", e);
        }
    }, []);
    */

    const formatTime = (t) => {
        if (!t || t < 0) return "0 phút 0 giây";

        const m = Math.floor(t / 60);
        const s = t % 60;
        return `${m} phút ${s} giây`;
    };

    const handleSelectMajor = (career) => {
        navigate("/score", {
            state: {
                careerId: career.careerId,
                careerName: career.careerName,
                score: career.score
            }
        });
    };

    // ❌ không có data
    if (!results || results.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Không có dữ liệu 😢 (F5 thì nhớ làm quiz lại nha)
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-satoshi">
            {/* --- HEADER ĐÃ ĐƯỢC NÂNG CẤP --- */}
            <header className="sticky top-0 z-50 bg-[#1a3a52] text-white px-6 py-4 flex justify-between items-center shadow-2xl">
                {/* Logo & Brand - Click để về Home */}
                <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all cursor-pointer">
                    <div className="bg-[#17a2b8] p-2.5 rounded-xl shadow-lg shadow-teal/20">
                        <Icon icon="lucide:graduation-cap" className="text-2xl text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">TGrowth Pro</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Hệ thống định hướng thông minh
                        </p>
                    </div>
                </Link>

                {/* Status & Navigation */}
                <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    <div className="flex flex-col items-end border-r border-slate-700 pr-6">
                        <span className="text-[9px] text-slate-500 italic">Thời gian làm bài</span>
                        <span className="text-[#17a2b8] font-black">{formatTime(TOTAL_TIME - timeLeft)}</span>
                    </div>
                    <Link to="/chat" className="hover:text-white transition-colors">Kết nối Mentor</Link>
                </div>

                {/* Auth & User Info */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            {/* User Chip Nổi Bật */}
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
                <div className="w-80 bg-white border-r hidden lg:flex flex-col">
                    <div className="p-6 overflow-y-auto">

                        <h2 className="font-semibold mb-4">Tổng quan bài làm</h2>

                        {/* 40 câu */}
                        <div className="grid grid-cols-5 gap-2">
                            {[...Array(40)].map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-square flex items-center justify-center bg-teal-500 text-white rounded text-xs font-bold"
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>

                        {/* INFO */}
                        <div className="mt-6 space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-gray-500">Thời gian làm</p>
                                <p className="font-bold">
                                    {formatTime(TOTAL_TIME - timeLeft)}
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-gray-500">Năng lực nổi trội</p>
                                <p className="font-bold">
                                    {results[0]?.careerName || "Chưa xác định"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t space-y-2">

                        <button
                            onClick={() => navigate("/quiz")}
                            className="w-full py-2 bg-gray-100 rounded"
                        >
                            Làm lại
                        </button>

                        <button className="w-full py-2 bg-[#1a3a52] text-white rounded">
                            Tải PDF
                        </button>

                    </div>
                </div>

                {/* MAIN */}
                <div className="flex-1 overflow-y-auto px-6 py-8">

                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        ⭐ Top 5 Ngành Học Gợi Ý
                    </h2>

                    <div className="space-y-8">

                        {results.map((item, index) => {

                            const percent = Math.round(item.score / 10);

                            return (
                                <div
                                    key={item.careerId}
                                    className="bg-white rounded-3xl p-6 shadow hover:shadow-lg transition flex gap-6"
                                >

                                    {/* ICON */}
                                    <div className={`
                                        w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl
                                        ${index === 0
                                            ? "bg-gradient-to-br from-green-500 to-green-700"
                                            : "bg-gradient-to-br from-cyan-500 to-blue-900"}
                                    `}>
                                        💻
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-1">

                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-xl font-bold">
                                                {item.careerName}
                                            </h3>

                                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                                                {percent}% phù hợp
                                            </span>
                                        </div>

                                        <p className="text-gray-500 mb-4">
                                            Ngành này phù hợp với năng lực và xu hướng phát triển của bạn.
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleSelectMajor(item)}
                                                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                                            >
                                                Chọn ngành này →
                                            </button>

                                            {index === 0 && (
                                                <button className="px-4 py-2 bg-gray-100 rounded">
                                                    Chi tiết
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}

                    </div>

                    {/* FOOTER */}
                    <div className="text-center text-gray-400 mt-10 text-sm border-t pt-6">
                        © TGrowth Pro - AI định hướng nghề nghiệp
                    </div>

                </div>
            </div>
        </div>
    );
}
