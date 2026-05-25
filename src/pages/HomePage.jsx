import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import heroImage from '../assets/graduating.png';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getCurrentUserEmail, isLoggedIn as hasSession } from "../services/tokenUtils";

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);

    // 1. Kiểm tra trạng thái đăng nhập
    const isLoggedIn = hasSession();
    const currentUserEmail = getCurrentUserEmail();
    const username = currentUserEmail?.split("@")[0] || "bạn";

    // 2. Hàm đăng xuất
    const handleLogout = () => {
        clearSession();
        setIsMobileMenuOpen(false);
        navigate("/");
        window.location.reload(); // Reload để reset toàn bộ state của ứng dụng
    };

    const handleMentorClick = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        if (isLoggedIn) {
            navigate("/chat");
        } else {
            navigate("/login");
        }
    };

    const handleStrategyClick = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        if (isLoggedIn) {
            navigate("/strategy");
        } else {
            navigate("/login");
        }
    };

    const handleAiAssistantClick = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        if (isLoggedIn) {
            navigate("/ai-assistant");
        } else {
            navigate("/login");
        }
    };

    const handleStartClick = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        navigate(isLoggedIn ? "/strategy" : "/register");
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        navigate("/login");
    };

    const handleRegisterClick = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        navigate("/register");
    };

    const scrollToHowItWorks = () => {
        document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    };

    const handleHowItWorksClick = (e) => {
        e.preventDefault();

        if (location.pathname !== "/") {
            navigate("/", { state: { scrollToHowItWorks: true } });
            return;
        }

        scrollToHowItWorks();
    };

    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) entry.target.classList.add("active");
            });
        }, observerOptions);

        document.querySelectorAll("section, .group").forEach((el) => {
            el.classList.add("reveal-up");
            observer.observe(el);
        });

        if (location.state?.scrollToHowItWorks) {
            requestAnimationFrame(() => {
                scrollToHowItWorks();
                navigate(location.pathname, { replace: true, state: null });
            });
        }
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        const handleOutsideClick = (event) => {
            if (!mobileMenuRef.current) return;
            if (!mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);

        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-satoshi bg-white scroll-smooth">
            <header className="bg-[#1a3a52] text-white px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-50 shadow-xl relative">
                <div className="flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-90 min-w-0">
                        <div className="bg-[#17a2b8] p-2.5 rounded-xl shadow-lg shadow-teal/20 shrink-0">
                            <Icon icon="lucide:graduation-cap" className="text-2xl text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-bold text-lg sm:text-xl leading-tight">TGrowth Pro</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                                Smart Career Hub
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-9 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
                        <button onClick={handleStrategyClick} className="hover:text-[#17a2b8] transition-colors cursor-pointer uppercase">Lộ trình cá nhân</button>
                        <button onClick={handleMentorClick} className="flex items-center gap-2 hover:text-[#17a2b8] transition-colors group cursor-pointer uppercase">
                            <span className="relative">
                                Kết nối Mentor
                                <span className="absolute -top-1 -right-4 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                </span>
                            </span>
                        </button>
                        <a href="#testimonials" className="hover:text-white transition-colors">Cảm nhận</a>
                    </nav>

                    <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                        {isLoggedIn ? (
                            <>
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 transition-all hover:bg-white/20">
                                    <div className="w-2 h-2 rounded-full bg-[#4fd1c5] animate-pulse"></div>
                                    <span className="text-xs font-bold tracking-wide text-white whitespace-nowrap">
                                        Chào, <span className="text-[#4fd1c5] uppercase">{username}</span>
                                    </span>
                                </div>
                                <button onClick={handleLogout} className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors whitespace-nowrap">Đăng xuất</button>
                                <button onClick={handleStartClick} className="px-5 py-3 bg-[#17a2b8] text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap">Bắt đầu ngay</button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleLoginClick} className="text-sm font-bold text-slate-200 hover:text-white transition-colors whitespace-nowrap">Đăng nhập</button>
                                <button onClick={handleRegisterClick} className="px-5 py-3 bg-[#17a2b8] text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap">Đăng ký</button>
                                <button onClick={handleStartClick} className="px-5 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors whitespace-nowrap">Bắt đầu ngay</button>
                            </>
                        )}
                    </div>

                    <div className="flex lg:hidden items-center gap-2">
                        <button onClick={handleStartClick} className="px-4 py-2.5 bg-[#17a2b8] text-white rounded-xl font-bold text-sm shadow-lg whitespace-nowrap">Bắt đầu ngay</button>
                        <button type="button" aria-label="Mở menu" aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((prev) => !prev)} className="h-11 w-11 rounded-xl border border-white/15 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                            <Icon icon={isMobileMenuOpen ? "lucide:x" : "lucide:menu"} className="text-xl" />
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div ref={mobileMenuRef} className="lg:hidden absolute left-0 right-0 top-full mt-3 mx-4 sm:mx-6 rounded-2xl border border-slate-700/10 bg-white text-[#0f2c3f] shadow-2xl overflow-hidden z-50">
                        <div className="flex items-center justify-between px-4 py-3 bg-[#0f2c3f] text-white">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Menu</p>
                                <p className="text-sm font-bold">TGrowth Pro</p>
                            </div>
                            <button type="button" aria-label="Đóng menu" onClick={() => setIsMobileMenuOpen(false)} className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center">
                                <Icon icon="lucide:x" className="text-lg" />
                            </button>
                        </div>

                        <div className="p-3 grid gap-2">
                            <button onClick={handleStrategyClick} className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 text-left">
                                <Icon icon="lucide:book-open-check" className="text-[#17a2b8]" />
                                <span className="font-semibold">Lộ trình cá nhân</span>
                            </button>
                            <button onClick={handleMentorClick} className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 text-left">
                                <Icon icon="lucide:message-circle" className="text-emerald-500" />
                                <span className="font-semibold">Kết nối Mentor</span>
                            </button>
                            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50">
                                <Icon icon="lucide:layout-grid" className="text-slate-500" />
                                <span className="font-semibold">Tính năng</span>
                            </a>
                            <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50">
                                <Icon icon="lucide:message-square-more" className="text-slate-500" />
                                <span className="font-semibold">Cảm nhận</span>
                            </a>
                            {isLoggedIn && (
                                <button onClick={handleAiAssistantClick} className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 text-left">
                                    <Icon icon="lucide:bot-message-square" className="text-cyan-600" />
                                    <span className="font-semibold">Hỏi đáp trợ lý AI</span>
                                </button>
                            )}

                            <div className="h-px bg-slate-100 my-1" />

                            {isLoggedIn ? (
                                <>
                                    <div className="px-4 py-2 text-sm text-slate-500">Chào, <span className="font-bold text-[#0f2c3f]">{username}</span></div>
                                    <button onClick={handleLogout} className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-red-50 text-left text-red-600">
                                        <Icon icon="lucide:log-out" />
                                        <span className="font-semibold">Đăng xuất</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleLoginClick} className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-slate-50 text-left">
                                        <Icon icon="lucide:log-in" className="text-slate-500" />
                                        <span className="font-semibold">Đăng nhập</span>
                                    </button>
                                    <button onClick={handleRegisterClick} className="flex items-center gap-3 rounded-xl px-4 py-3 bg-[#17a2b8] text-white text-left">
                                        <Icon icon="lucide:user-plus" />
                                        <span className="font-semibold">Đăng ký</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">
                {/* Hero */}
                <section className="relative pt-20 pb-32 px-8 overflow-hidden bg-slate-50">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#17a2b8]/10 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#1a3a52]/5 blur-[100px] rounded-full"></div>

                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#17a2b8]/10 text-[#17a2b8] rounded-full text-xs font-bold mb-8">
                                <span className="flex h-2 w-2 rounded-full bg-[#17a2b8] animate-ping"></span>
                                Nền tảng hướng nghiệp 4.0 hàng đầu Việt Nam
                            </div>
                            <h2 className="text-5xl lg:text-7xl font-black text-[#1a3a52] leading-[1.1] mb-8 tracking-tighter">
                                Định vị bản thân,<br />
                                <span className="bg-gradient-to-tr from-[#17a2b8] to-[#1a3a52] bg-clip-text text-transparent font-black">
                                    Chinh phục tương lai
                                </span>
                            </h2>
                            <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-medium">
                                Hệ thống AI thông minh giúp bạn khám phá thế mạnh tiềm ẩn, gợi ý ngành học mơ ước và kết nối trực tiếp với các sinh viên giỏi từ 200+ trường Đại học.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                                <Link
                                    to="/quiz"
                                    // Thêm cursor-pointer và z-10 để đảm bảo quyền ưu tiên click
                                    className="group relative z-10 cursor-pointer w-full sm:w-auto px-10 py-5 bg-[#1a3a52] text-white rounded-2xl font-bold text-xl shadow-2xl hover:bg-[#1e4a6d] hover:-translate-y-1.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 border border-white/10"
                                >
                                    <span>Khám phá ngay</span>
                                    <iconify-icon
                                        icon="lucide:arrow-right-circle"
                                        class="text-2xl group-hover:translate-x-1 transition-transform"
                                    />
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleHowItWorksClick}
                                    className="text-[#1a3a52] font-bold text-sm hover:underline decoration-2 underline-offset-4 transition-all"
                                >
                                    Tìm hiểu cách hoạt động
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            {/* Background gradient & decorative blur */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#d9f7eb] to-[#ffffff] -z-10"></div>
                            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#22c55e]/10 blur-[120px] rounded-full -z-10"></div>
                            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#16a34a]/10 blur-[100px] rounded-full -z-10"></div>

                            {/* Hero image with shadow and float animation */}
                            <div className="relative z-10 animate-[float_6s_ease-in-out_infinite] drop-shadow-2xl">
                                <img
                                    src={heroImage}
                                    alt="TGrowth Pro Hero"
                                    className="w-full max-w-lg mx-auto rounded-2xl border border-[#22c55e]/20"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="py-32 px-8 bg-gradient-to-b from-slate-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-3xl mb-12">
                            <h3 className="text-sm font-black text-[#17a2b8] uppercase tracking-[0.3em] mb-4">
                                Cách hoạt động
                            </h3>
                            <h2 className="text-4xl lg:text-5xl font-black text-[#1a3a52] mb-5 tracking-tight">
                                Cách TGrowth Pro hoạt động
                            </h2>
                            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
                                TGrowth Pro giúp học sinh/sinh viên định hướng ngành học, chọn phương pháp học phù hợp và xây dựng lộ trình học cá nhân hóa.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {[
                                {
                                    step: "Bước 1",
                                    title: "Làm bài quiz định hướng",
                                    description:
                                        "Người dùng trả lời các câu hỏi về sở thích, năng lực, thói quen và mục tiêu học tập.",
                                    icon: "lucide:clipboard-list",
                                    tone: "from-[#17a2b8] to-[#1a3a52]",
                                },
                                {
                                    step: "Bước 2",
                                    title: "Hệ thống gợi ý ngành phù hợp",
                                    description:
                                        "Dựa trên điểm số từ bài quiz, hệ thống phân tích và đề xuất những ngành học phù hợp nhất.",
                                    icon: "lucide:brain-circuit",
                                    tone: "from-emerald-500 to-teal-600",
                                },
                                {
                                    step: "Bước 3",
                                    title: "Nhập điểm để xem trường phù hợp",
                                    description:
                                        "Người dùng nhập điểm hoặc chọn khu vực để xem các trường đại học có ngành tương ứng và mức điểm phù hợp.",
                                    icon: "lucide:school",
                                    tone: "from-indigo-500 to-sky-600",
                                },
                                {
                                    step: "Bước 4",
                                    title: "Tạo lộ trình học cá nhân",
                                    description:
                                        "Sau khi chọn ngành, hệ thống gợi ý phương pháp học, kỹ năng cần rèn, công cụ nên dùng và thời khóa biểu học tập.",
                                    icon: "lucide:calendar-range",
                                    tone: "from-amber-500 to-orange-600",
                                },
                            ].map((item) => (
                                <article
                                    key={item.step}
                                    className="group rounded-[2rem] bg-white border border-slate-100 shadow-sm p-7 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.tone} text-white flex items-center justify-center mb-6 shadow-lg`}>
                                        <Icon icon={item.icon} className="text-2xl" />
                                    </div>
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-3">
                                        {item.step}
                                    </p>
                                    <h3 className="text-xl font-black text-[#1a3a52] mb-3 leading-snug">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        {item.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="py-32 px-8 bg-white">
                    <div className="max-w-7xl mx-auto text-center mb-20">
                        <h3 className="text-sm font-black text-[#17a2b8] uppercase tracking-[0.3em] mb-4">Dịch vụ của chúng tôi</h3>
                        <h2 className="text-4xl lg:text-5xl font-bold text-[#1a3a52] mb-6 tracking-tight">Hệ sinh thái hướng nghiệp toàn diện</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* AI Quiz */}
                        <Link
                            to="/quiz"
                            className="group p-10 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-[#17a2b8]/20 hover:bg-white hover:shadow-2xl hover:shadow-[#17a2b8]/10 transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#17a2b8]/10 text-[#17a2b8] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <Icon icon="lucide:brain-circuit" className="text-4xl" />
                            </div>
                            <h4 className="text-xl font-bold text-[#1a3a52] mb-4 flex items-center gap-2">
                                Trắc nghiệm AI <Icon icon="lucide:zap" className="text-teal-400 text-lg" />
                            </h4>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                Dựa trên thuật toán tâm lý học chuyên sâu để đánh giá năng lực và đam mê.
                            </p>
                            <span className="text-[#17a2b8] font-bold text-xs flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-widest">
                                Khám phá ngay <Icon icon="lucide:chevron-right" />
                            </span>
                        </Link>

                        {/* Learning Path */}
                        <div
                            onClick={handleStrategyClick} // Sử dụng hàm kiểm tra login đã viết ở trên
                            className="group p-10 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-[#17a2b8]/20 hover:bg-white hover:shadow-2xl hover:shadow-[#17a2b8]/10 transition-all duration-300 cursor-pointer"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#1a3a52]/5 text-[#1a3a52] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <Icon icon="lucide:map" className="text-4xl" />
                            </div>

                            <h4 className="text-xl font-bold text-[#1a3a52] mb-4 flex items-center gap-2">
                                Lộ trình cá nhân <Icon icon="lucide:compass" className="text-blue-500 text-lg" />
                            </h4>

                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                Xây dựng chiến lược học tập riêng biệt cho từng khối ngành để tối ưu điểm số THPTQG.
                            </p>

                            <span className="text-[#1a3a52] font-bold text-xs flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-widest">
                                Xem chi tiết <Icon icon="lucide:chevron-right" />
                            </span>
                        </div>

                        {/* Mentor */}
                        <div
                            onClick={handleMentorClick}
                            className="group p-10 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-[#17a2b8]/20 hover:bg-white hover:shadow-2xl hover:shadow-[#17a2b8]/10 transition-all duration-300 relative cursor-pointer"
                        >
                            {/* Icon với hiệu ứng Ping đồng bộ với Header */}
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative">
                                <Icon icon="lucide:message-circle" className="text-4xl" />

                                {/* Chấm xanh nhấp nháy */}
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500 border-2 border-white"></span>
                                </span>
                            </div>

                            <h4 className="text-xl font-bold text-[#1a3a52] mb-4 flex items-center gap-2">
                                Kết nối Mentor <Icon icon="lucide:user-check" className="text-emerald-500 text-lg" />
                            </h4>

                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                Trò chuyện trực tiếp với sinh viên xuất sắc đang theo học ngành bạn mơ ước.
                            </p>

                            <div className="text-emerald-600 font-bold text-xs flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-widest">
                                Chat ngay <Icon icon="lucide:chevron-right" />
                            </div>
                        </div>

                        {/* University Data */}
                        <Link
                            to="/university"
                            className="group p-10 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-[#17a2b8]/20 hover:bg-white hover:shadow-2xl hover:shadow-[#17a2b8]/10 transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <Icon icon="lucide:database" className="text-4xl" />
                            </div>
                            <h4 className="text-xl font-bold text-[#1a3a52] mb-4 flex items-center gap-2">
                                Data Đại Học <Icon icon="lucide:book-open" className="text-indigo-500 text-lg" />
                            </h4>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                Tra cứu điểm chuẩn, học phí, review 200+ trường ĐH.
                            </p>
                            <span className="text-indigo-600 font-bold text-xs flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-widest">
                                Tra cứu <Icon icon="lucide:chevron-right" />
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Stats Section */}
                <section id="statistics" className="py-24 bg-[#1a3a52] text-white overflow-hidden relative">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
                    </div>
                    <div className="max-w-7xl mx-auto px-8 relative z-10">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                            <div>
                                <p className="text-5xl lg:text-6xl font-display font-black text-teal-400 mb-2">500K+</p>
                                <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Học sinh tin dùng</p>
                            </div>
                            <div>
                                <p className="text-5xl lg:text-6xl font-display font-black text-teal-400 mb-2">200+</p>
                                <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Trường Đại học</p>
                            </div>
                            <div>
                                <p className="text-5xl lg:text-6xl font-display font-black text-teal-400 mb-2">1.2M+</p>
                                <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Lượt làm Quiz</p>
                            </div>
                            <div>
                                <p className="text-5xl lg:text-6xl font-display font-black text-teal-400 mb-2">98%</p>
                                <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Độ hài lòng</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="py-32 px-8 bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h3 className="text-sm font-black text-teal-400 uppercase tracking-[0.3em] mb-4">Cảm nhận người dùng</h3>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold text-[#1a3a52] mb-6 tracking-tight">Hàng ngàn bạn trẻ đã tìm thấy con đường</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Testimonial 1 */}
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative">
                                <iconify-icon icon="fa:quote-left" className="text-teal-50 text-6xl absolute top-8 left-8"></iconify-icon>
                                <p className="text-slate-600 italic mb-8 relative z-10">
                                    "TGrowth giúp mình thoát khỏi sự mông lung cuối năm lớp 12..."
                                </p>
                                <div className="flex items-center gap-4">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang" className="w-12 h-12 rounded-xl bg-slate-100" />
                                    <div>
                                        <p className="text-sm font-bold text-[#1a3a52]">Lê Hoàng Nam</p>
                                        <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Sinh viên K68 - HUST</p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial 2 */}
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative">
                                <iconify-icon icon="fa:quote-left" className="text-teal-50 text-6xl absolute top-8 left-8"></iconify-icon>
                                <p className="text-slate-600 italic mb-8 relative z-10">
                                    "Các Mentor rất nhiệt tình, giúp mình hiểu rõ thế mạnh và định hướng ngành."
                                </p>
                                <div className="flex items-center gap-4">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Trang" className="w-12 h-12 rounded-xl bg-slate-100" />
                                    <div>
                                        <p className="text-sm font-bold text-[#1a3a52]">Nguyễn Thị Trang</p>
                                        <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Sinh viên K69 - NEU</p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial 3 */}
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative">
                                <iconify-icon icon="fa:quote-left" className="text-teal-50 text-6xl absolute top-8 left-8"></iconify-icon>
                                <p className="text-slate-600 italic mb-8 relative z-10">
                                    "Chỉ sau 1 tuần, mình đã chọn đúng ngành phù hợp và tự tin đăng ký vào trường top."
                                </p>
                                <div className="flex items-center gap-4">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Minh" className="w-12 h-12 rounded-xl bg-slate-100" />
                                    <div>
                                        <p className="text-sm font-bold text-[#1a3a52]">Phạm Minh Quân</p>
                                        <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Sinh viên K70 - HCMUT</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-32 px-8 bg-teal-400 text-white text-center rounded-[3rem] mx-8 mt-20 mb-16">
                    <h2 className="text-4xl lg:text-5xl font-display font-black mb-6">
                        Bắt đầu hành trình hướng nghiệp ngay hôm nay
                    </h2>
                    <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                        Khám phá bản thân, chọn ngành phù hợp, kết nối Mentor<br className="hidden lg:inline" />
                        và đạt ước mơ Đại học!
                    </p>
                    <Link
                        to="/quiz"
                        className="px-12 py-5 bg-white text-teal-400 rounded-3xl font-bold text-xl shadow-lg shadow-teal/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Bắt đầu ngay
                    </Link>
                </section>



            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-white pt-24 pb-12 px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <Icon icon="lucide:graduation-cap" className="text-2xl text-[#17a2b8]" />
                        <h4 className="text-xl font-bold mb-4">TGrowth Pro</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Nền tảng hướng nghiệp thông minh giúp học sinh định hướng ngành học và kết nối Mentor xuất sắc.</p>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold mb-4">Liên hệ</h4>
                        <p className="text-slate-400 text-sm mb-2">Email: he182335nhudinhcan@gmail.com</p>
                        <p className="text-slate-400 text-sm mb-2">Hotline: 0968904130</p>
                        <p className="text-slate-400 text-sm">Địa chỉ: Đại Học FPT Hà Nội Km29 Đại Lộ Thăng Long</p>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold mb-4">Kết nối</h4>
                        <div className="flex items-center gap-4 mt-2">
                            <a
                                href="https://www.facebook.com/em.can.73744801"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Icon
                                    icon="lucide:facebook"
                                    className="text-2xl hover:text-teal-400 cursor-pointer"
                                />
                            </a>
                            <Icon icon="lucide:instagram" className="text-2xl hover:text-teal-400 cursor-pointer" />
                            <Icon icon="lucide:linkedin" className="text-2xl hover:text-teal-400 cursor-pointer" />
                        </div>
                    </div>
                </div>
                <p className="text-center text-slate-500 text-xs mt-10">&copy; 2026 TGrowth Pro. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default HomePage;


