import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { suggestUniversity } from "../services/universityService";
import { Icon } from "@iconify/react";
import { clearSession, getCurrentUserEmail, isLoggedIn as hasSession } from "../services/tokenUtils";

export default function UniversityPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLoggedIn = hasSession();
    const currentUserEmail = getCurrentUserEmail();

    const { careerId, careerName, score } = location.state || {};

    const [universities, setUniversities] = useState([]);

    const handleLogout = () => {
        clearSession();
        navigate("/");
        window.location.reload();
    };


    // FILTER STATE
    const [region, setRegion] = useState("");
    const [type, setType] = useState([]);
    const [maxFee, setMaxFee] = useState(50);

    // CALL API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await suggestUniversity(careerId, score);
                setUniversities(res.data);
            } catch (err) {
                console.error("Lỗi gọi API:", err);
            }
        };

        if (careerId && score !== undefined) {
            fetchData();
        }
    }, [careerId, score]);

    // MATCH %
    const getMatch = (required) => {
        if (!score) return 0;
        return Math.min(100, Math.round((score / required) * 100));
    };

    if (!careerId) {
        return <div className="p-10">Thiếu dữ liệu 😢</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-satoshi">
            {/* --- HEADER ĐÃ ĐƯỢC ĐỒNG BỘ HOÀN TOÀN --- */}
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

                {/* --- NAVIGATION LINKS (MỚI THÊM) --- */}
                <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    {/* Link quay lại Lộ trình */}
                    <Link
                        to="/strategy"
                        className="flex items-center gap-2 hover:text-[#17a2b8] transition-colors border-r border-slate-700 pr-8"
                    >
                        <Icon icon="lucide:map" className="text-sm" />
                        Lộ trình cá nhân
                    </Link>
                    {/* Link đến Mentor */}
                    <Link
                        to="/chat"
                        className="flex items-center gap-2 hover:text-[#17a2b8] transition-colors"
                    >
                        <Icon icon="lucide:message-circle" className="text-sm" />
                        Kết nối Mentor
                    </Link>

                    {/* Badge trạng thái hiện tại */}
                    <div className="flex items-center gap-2 bg-[#17a2b8]/20 px-3 py-1.5 rounded-full border border-[#17a2b8]/30 ml-4">
                        <Icon icon="lucide:check-circle" className="text-[#17a2b8] text-xs" />
                        <span className="text-[9px] text-[#17a2b8]">Phân tích đại học</span>
                    </div>
                </nav>

                {/* Auth & User Info */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            {/* User Chip */}
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-2xl border border-white/10 hidden md:flex group hover:border-[#17a2b8]/50 transition-all cursor-default">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-[#17a2b8] font-black tracking-tighter uppercase">Student Account</span>
                                    <span className="text-xs font-bold text-white group-hover:text-[#17a2b8] transition-colors">
                                        {currentUserEmail?.split('@')[0]}
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#17a2b8]/20 flex items-center justify-center border border-[#17a2b8]/30 overflow-hidden">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserEmail}`}
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
                        <h2 className="font-bold mb-6">Lộ trình</h2>

                        <div className="space-y-5 text-sm">
                            <div className="flex items-center gap-3 opacity-50">
                                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                                    ✓
                                </div>
                                <span>Khảo sát</span>
                            </div>

                            <div className="flex items-center gap-3 opacity-50">
                                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                                    ✓
                                </div>
                                <span>Chọn ngành</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center">
                                    03
                                </div>
                                <span className="font-bold text-teal-600">
                                    Gợi ý trường
                                </span>
                            </div>
                        </div>

                        {/* MẸO */}
                        <div className="mt-6 p-4 bg-teal-50 rounded-xl text-sm">
                            <p className="font-bold text-teal-600">Mẹo</p>
                            <p>Chọn trường có điểm thấp hơn ~1 điểm để an toàn</p>
                        </div>

                        {/* FILTER */}
                        <div className="mt-6">
                            <h3 className="font-bold mb-3">Bộ lọc</h3>

                            {/* REGION */}
                            <select
                                className="w-full border p-2 rounded mb-3"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                            >
                                <option value="">Tất cả khu vực</option>
                                <option value="north">Miền Bắc</option>
                                <option value="central">Miền Trung</option>
                                <option value="south">Miền Nam</option>
                            </select>

                            {/* TYPE */}
                            <div className="mb-3 text-sm">
                                <label className="block">
                                    <input
                                        type="checkbox"
                                        checked={type.includes("public")}
                                        onChange={(e) =>
                                            e.target.checked
                                                ? setType([...type, "public"])
                                                : setType(type.filter(t => t !== "public"))
                                        }
                                    /> Công lập
                                </label>

                                <label className="block">
                                    <input
                                        type="checkbox"
                                        checked={type.includes("private")}
                                        onChange={(e) =>
                                            e.target.checked
                                                ? setType([...type, "private"])
                                                : setType(type.filter(t => t !== "private"))
                                        }
                                    /> Tư thục
                                </label>
                            </div>

                            {/* FEE */}
                            <div>
                                <p className="text-sm">Học phí tối đa</p>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={maxFee}
                                    onChange={(e) => setMaxFee(e.target.value)}
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-400">
                                    {maxFee} triệu/năm
                                </p>
                            </div>

                            {/* RESET */}
                            <button
                                onClick={() => {
                                    setRegion("");
                                    setType([]);
                                    setMaxFee(50);
                                }}
                                className="mt-3 w-full border py-2 rounded"
                            >
                                Reset bộ lọc
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/quiz")}
                        className="mt-6 py-3 border rounded-xl hover:bg-gray-100"
                    >
                        ← Làm lại
                    </button>
                </aside>

                {/* MAIN */}
                <main className="flex-1 p-8">

                    <div className="bg-white p-6 rounded-2xl shadow mb-8 flex justify-between">
                        <div>
                            <h2 className="text-xl font-bold">
                                Kết quả gợi ý 🎯
                            </h2>
                            <p className="text-gray-500">
                                {careerName} | {score}/30
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-gray-400 text-sm">Số trường</p>
                            <p className="text-2xl font-bold">
                                {
                                    universities.filter((uni) => {
                                        const matchRegion = region ? uni.region === region : true;
                                        const matchType = type.length > 0 ? type.includes(uni.type) : true;
                                        const matchFee = uni.tuitionFee ? uni.tuitionFee <= maxFee : true;
                                        return matchRegion && matchType && matchFee;
                                    }).length
                                }
                            </p>
                        </div>
                    </div>

                    {/* LIST */}
                    <div className="space-y-6">

                        {universities
                            .filter((uni) => {
                                const matchRegion = region ? uni.region === region : true;
                                const matchType = type.length > 0 ? type.includes(uni.type) : true;
                                const matchFee = uni.tuitionFee ? uni.tuitionFee <= maxFee : true;
                                return matchRegion && matchType && matchFee;
                            })
                            .map((uni, index) => {

                                const match = getMatch(uni.scoreRequired);

                                return (
                                    <div
                                        key={index}
                                        className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
                                    >
                                        <div className="flex justify-between mb-4">

                                            <div>
                                                <h3 className="text-xl font-bold">
                                                    #{index + 1} {uni.universityName}
                                                </h3>
                                                <p className="text-gray-400 text-sm">
                                                    {uni.careerName}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">
                                                    Điểm chuẩn
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {uni.scoreRequired}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                🎯 Match
                                                <p className="font-bold text-teal-600">
                                                    {match}%
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                📊 Chênh lệch
                                                <p className="font-bold">
                                                    {(score - uni.scoreRequired).toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                📚 Mức độ
                                                <p className="font-bold">
                                                    {match > 90 ? "An toàn" : match > 75 ? "Vừa sức" : "Khó"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button className="px-6 py-2 bg-[#1a3a52] text-white rounded-xl">
                                                Xem chi tiết
                                            </button>

                                            <button className="px-6 py-2 border rounded-xl">
                                                Lưu
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                    </div>

                    {/* FOOTER */}
                    <div className="text-center text-gray-400 text-xs mt-10">
                        🔒 Dữ liệu chỉ mang tính tham khảo
                    </div>
                </main>
            </div>
        </div>
    );
}
