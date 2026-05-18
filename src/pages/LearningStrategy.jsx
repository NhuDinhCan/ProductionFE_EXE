import React from 'react';
import { Icon } from '@iconify/react';
import learningImg from '../assets/learning.png'; // Đảm bảo đường dẫn này đúng trong project của bạn
import { Link, useNavigate } from "react-router-dom";

const LearningStrategy = () => {
    const navigate = useNavigate();

    // 1. Kiểm tra trạng thái đăng nhập dựa trên Access Token
    const userEmail = localStorage.getItem("userEmail") || "Guest";

    // 2. Hàm đăng xuất chuẩn (Xóa toàn bộ session & tokens)
    const handleLogout = () => {
        // Xóa các key quan trọng nhất
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
        
        // Hoặc xóa sạch hoàn toàn nếu không cần giữ lại setting gì khác
        // localStorage.clear(); 

        // Điều hướng về trang chủ
        navigate("/");

        // Reload để reset toàn bộ State/Context của ứng dụng (Tránh leak dữ liệu cũ)
        window.location.reload();
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f1f5f9] font-sans">
            {/* 1. TOP NAVBAR - FIX CỨNG TRÊN ĐẦU */}
            <header className="h-16 bg-[#0f2c3f] text-white flex justify-between items-center px-6 fixed top-0 w-full z-50 shadow-lg">
                
                {/* Logo & Về Home */}
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all cursor-pointer">
                    <div className="bg-cyan-500 p-1.5 rounded-lg">
                        <Icon icon="lucide:graduation-cap" className="text-xl" />
                    </div>
                    <div>
                        <h1 className="font-bold leading-none text-lg tracking-tight">TGrowth Pro</h1>
                        <p className="text-[10px] opacity-60 font-medium uppercase tracking-tighter">Cố vấn học tập 4.0</p>
                    </div>
                </Link>

                {/* Right Actions: Progress + Notification + Profile */}
                <div className="flex items-center gap-6">
                    {/* Mục tiêu (Chỉ hiện trên desktop) */}
                    <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
                        <p className="text-[9px] opacity-50 font-bold uppercase tracking-widest">Mục tiêu cá nhân</p>
                        <p className="text-xs font-bold text-cyan-400">ĐH Bách Khoa (27+)</p>
                    </div>

                    {/* Notification Bell */}
                    <button className="relative p-2 text-gray-300 hover:text-white transition-colors group">
                        <Icon icon="lucide:bell" className="text-xl group-hover:shake" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f2c3f]"></span>
                    </button>

                    {/* User Profile & Logout Dropdown */}
                    <div className="flex items-center gap-4 group relative py-2 cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">Nhu Dinh Can</p>
                            <p className="text-[10px] opacity-60 italic">{userEmail}</p>
                        </div>
                        
                        <div className="relative">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                                className="w-10 h-10 rounded-full bg-orange-100 border-2 border-cyan-500/50 group-hover:border-cyan-400 transition-all"
                                alt="avatar"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f2c3f] rounded-full"></span>

                            {/* Dropdown Menu - Hover để hiện */}
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

            <div className="flex pt-16 h-full">

                {/* 2. SIDEBAR - CỐ ĐỊNH BÊN TRÁI */}
                <aside className="w-64 bg-white border-r border-gray-100 p-6 fixed left-0 h-[calc(100vh-64px)] overflow-y-auto z-40">
                    <nav className="flex flex-col h-full justify-between">
                        <div className="space-y-8">
                            {/* Group: Navigation */}
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-4 flex items-center gap-2">
                                    <Icon icon="lucide:layout-grid" /> Menu chính
                                </p>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 p-3 bg-cyan-50 text-[#00a8b5] rounded-xl font-bold cursor-pointer border-l-4 border-[#00a8b5] shadow-sm shadow-cyan-100">
                                        <Icon icon="lucide:book-open-check" />
                                        <span className="text-sm">Chiến lược học tập</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group">
                                        <Icon icon="lucide:message-circle" className="group-hover:text-cyan-500" />
                                        <span className="text-sm font-medium">Hỏi đáp trợ lý AI</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group">
                                        <Icon icon="lucide:calendar-range" className="group-hover:text-cyan-500" />
                                        <span className="text-sm font-medium">Thời khóa biểu</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group">
                                        <Icon icon="lucide:folder-kanban" className="group-hover:text-cyan-500" />
                                        <span className="text-sm font-medium">Kho tài liệu IT</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group">
                                        <Icon icon="lucide:edit-3" className="group-hover:text-cyan-500" />
                                        <span className="text-sm font-medium">Luyện đề thi thử</span>
                                    </div>
                                </div>
                            </div>

                            {/* Group: Nhắc nhở */}
                            <div className="pt-6 border-t border-gray-50">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-4">Lịch trình hôm nay</p>
                                <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 relative overflow-hidden">
                                    <div className="flex items-center gap-2 text-yellow-700 font-bold text-[11px] mb-2 relative z-10">
                                        <Icon icon="lucide:clock" />
                                        <span>14:00 - 15:30</span>
                                    </div>
                                    <p className="text-[11px] text-yellow-800/80 leading-relaxed relative z-10">
                                        Ôn tập <b>Spring Boot</b> và giải bài tập <b>Cấu trúc dữ liệu</b>.
                                    </p>
                                    <Icon icon="lucide:zap" className="absolute -right-2 -bottom-2 text-yellow-200/40 text-4xl" />
                                </div>
                            </div>
                        </div>

                        {/* Upgrade Button at Sidebar Bottom */}
                        <div className="mt-auto pt-6">
                            <button className="w-full bg-[#0f2c3f] hover:bg-[#1a4a69] text-white py-3 rounded-xl text-[11px] font-black transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2">
                                <Icon icon="lucide:sparkles" className="text-cyan-400" /> NÂNG CẤP PRO
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* 3. MAIN CONTENT - ĐẨY SANG PHẢI ĐỂ CHỪA SIDEBAR */}
                <main className="flex-1 ml-64 p-8 bg-[#f8fafc]">

                    {/* BANNER CARD */}
                    <section className="bg-white rounded-[3rem] p-12 relative overflow-hidden shadow-sm mb-12 border border-white group">
                        <div className="max-w-2xl relative z-10">
                            <span className="bg-[#00a8b5] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                Chiến lược cá nhân hóa
                            </span>
                            <h1 className="text-5xl font-black text-[#0f2c3f] mt-8 mb-4 leading-tight">
                                Lộ trình bứt phá <br />
                                <span className="text-[#00a8b5]">Fullstack Dev</span> <br />
                                <span className="text-2xl font-bold opacity-80 text-[#0f2c3f]">cho mục tiêu 27+</span>
                            </h1>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-lg mb-10">
                                Chào <b className="text-gray-700">CanND</b>, dựa trên kiến thức Java hiện tại, chúng tôi đề xuất bộ phương pháp học tập tối ưu để bạn chinh phục các trường đại học top đầu.
                            </p>

                            <div className="flex gap-4">
                                <button className="bg-[#1e3a4f] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#1e3a4f]/20">
                                    Bắt đầu học ngay <Icon icon="lucide:play-circle" />
                                </button>
                                <button className="bg-white border border-gray-100 px-10 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-2">
                                    <Icon icon="lucide:download-cloud" /> Tài liệu PDF
                                </button>
                            </div>
                        </div>

                        {/* Illustration với hiệu ứng nổi nhẹ */}
                        <div className="absolute right-0 bottom-0 w-[450px] opacity-100 hidden lg:block transition-transform duration-700 group-hover:translate-x-2">
                            <img
                                src={learningImg}
                                alt="learning illustration"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </section>

                    {/* SECTION TITLE */}
                    <div className="flex justify-between items-end mb-8 px-2">
                        <div>
                            <h2 className="text-2xl font-black text-[#0f2c3f] flex items-center gap-2">
                                <Icon icon="lucide:layout-template" className="text-[#00a8b5]" />
                                3 Phương Pháp Học Hiệu Quả Nhất
                            </h2>
                        </div>
                        <button className="text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors underline decoration-2 underline-offset-4">
                            Khám phá thêm
                        </button>
                    </div>

                    {/* 3 CARDS METHODS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {/* Card 1: Pomodoro */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-transparent hover:border-orange-100 shadow-sm flex flex-col group transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-8 text-2xl group-hover:rotate-12 transition-all">
                                <Icon icon="lucide:timer" />
                            </div>
                            <h3 className="text-xl font-black text-[#1a3a52] mb-4">Pomodoro IT Edition</h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-8 flex-1">
                                Chia thời gian: 50 phút tập trung code/giải thuật + 10 phút nghỉ ngơi hoàn toàn.
                            </p>
                            <div className="space-y-3 mb-10 text-[11px] font-bold text-[#1a3a52]">
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:check-circle-2" className="text-cyan-500 text-sm" /> <span>Tối ưu hóa khả năng Debug</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:check-circle-2" className="text-cyan-500 text-sm" /> <span>Tăng tư duy logic 40%</span>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl text-[11px] font-black hover:bg-[#00a8b5] hover:text-white transition-all">SỬ DỤNG TIMER</button>
                        </div>

                        {/* Card 2: Active Recall */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-transparent hover:border-cyan-100 shadow-sm flex flex-col group transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="w-14 h-14 bg-cyan-50 text-[#00a8b5] rounded-2xl flex items-center justify-center mb-8 text-2xl group-hover:rotate-12 transition-all">
                                <Icon icon="lucide:layers" />
                            </div>
                            <h3 className="text-xl font-black text-[#1a3a52] mb-4">Active Recall</h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-8 flex-1">
                                Tự kiểm tra kiến thức qua các flashcard Anki về cú pháp Java và Spring Boot Core.
                            </p>
                            <div className="space-y-3 mb-10 text-[11px] font-bold text-[#1a3a52]">
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:check-circle-2" className="text-cyan-500 text-sm" /> <span>Nhớ lâu x5 lần bình thường</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:check-circle-2" className="text-cyan-500 text-sm" /> <span>Thích hợp học Syntax mới</span>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl text-[11px] font-black hover:bg-[#00a8b5] hover:text-white transition-all">MỞ FLASHCARD</button>
                        </div>

                        {/* Card 3: Feynman */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-transparent hover:border-indigo-100 shadow-sm flex flex-col group transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-8 text-2xl group-hover:rotate-12 transition-all">
                                <Icon icon="lucide:git-branch" />
                            </div>
                            <h3 className="text-xl font-black text-[#1a3a52] mb-4">The Feynman Technique</h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-8 flex-1">
                                Giải thích một thuật toán phức tạp cho người khác hiểu để nắm vững bản chất vấn đề.
                            </p>
                            <div className="space-y-3 mb-10 text-[11px] font-bold text-[#1a3a52]">
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:check-circle-2" className="text-cyan-500 text-sm" /> <span>Hiểu sâu gốc rễ System</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:check-circle-2" className="text-cyan-500 text-sm" /> <span>Phản biện cực tốt</span>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl text-[11px] font-black hover:bg-[#00a8b5] hover:text-white transition-all">THỬ GIẢI THÍCH</button>
                        </div>
                    </div>
                </main>
            </div>

            {/* FLOATING AI CHAT BUTTON */}
            <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#00a8b5] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
                <Icon icon="lucide:bot" className="text-3xl" />
                <span className="absolute right-full mr-4 bg-[#0f2c3f] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                    Hỏi EduBot 4.0
                </span>
            </button>
        </div>
    );
};

export default LearningStrategy;
