import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendAiChatMessage } from "../services/aiService";
import { isLoggedIn } from "../services/tokenUtils";

const STORAGE_KEY = "edubot_widget_position";
const MOBILE_BREAKPOINT = 768;
const DESKTOP_WIDTH = 380;
const DESKTOP_HEIGHT = 520;
const COLLAPSED_HEIGHT = 64;
const DESKTOP_EDGE_GAP = 24;
const DESKTOP_BOTTOM_GAP = 96;
const BUTTON_GAP = 24;
const MOBILE_EDGE_GAP = 12;
const MOBILE_BOTTOM_GAP = 88;

const quickPrompts = [
  { label: "Gợi ý lịch học", contextType: "SCHEDULE" },
  { label: "Gợi ý tài liệu", contextType: "RESOURCE" },
  { label: "Phân tích luyện đề", contextType: "MOCK_EXAM" },
];

const fallbackAnswer = "EduBot hiện chưa phản hồi được, bạn thử lại sau nhé.";

const visibleRoutePatterns = [
  /^\/strategy\/?$/,
  /^\/schedule\/?$/,
  /^\/resources\/?$/,
  /^\/mock-exams\/?$/,
  /^\/mock-exams\/[^/]+\/?$/,
  /^\/mock-exams\/results\/[^/]+\/?$/,
];

function shouldShowWidget(pathname) {
  if (
    pathname === "/chat" ||
    pathname === "/ai-assistant" ||
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return false;
  }

  return visibleRoutePatterns.some((pattern) => pattern.test(pathname));
}

function inferContextType(message) {
  const value = message.toLowerCase();
  if (value.includes("lịch")) return "SCHEDULE";
  if (value.includes("tài liệu") || value.includes("resource")) return "RESOURCE";
  if (value.includes("đề") || value.includes("luyện") || value.includes("ôn tập")) return "MOCK_EXAM";
  if (value.includes("phương pháp") || value.includes("cách học")) return "STUDY_METHOD";
  if (value.includes("ngành") || value.includes("trường")) return "CAREER";
  return "GENERAL";
}

function nowTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function messageId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function readStoredPosition() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.x !== "number" ||
      typeof parsed.y !== "number" ||
      !Number.isFinite(parsed.x) ||
      !Number.isFinite(parsed.y)
    ) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { x: parsed.x, y: parsed.y };
  } catch {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }
}

function saveStoredPosition(position) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
}

function clearStoredPosition() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function getIsDesktop() {
  if (typeof window === "undefined") return true;
  return window.innerWidth >= MOBILE_BREAKPOINT;
}

function getPopupSize(isCollapsed) {
  return {
    width: DESKTOP_WIDTH,
    height: isCollapsed ? COLLAPSED_HEIGHT : DESKTOP_HEIGHT,
  };
}

function clampPosition(position, isCollapsed) {
  if (typeof window === "undefined") return position;
  const { width, height } = getPopupSize(isCollapsed);
  const maxX = Math.max(DESKTOP_EDGE_GAP, window.innerWidth - width - DESKTOP_EDGE_GAP);
  const maxY = Math.max(DESKTOP_EDGE_GAP, window.innerHeight - height - DESKTOP_EDGE_GAP);
  return {
    x: clamp(position.x, DESKTOP_EDGE_GAP, maxX),
    y: clamp(position.y, DESKTOP_EDGE_GAP, maxY),
  };
}

function getDefaultDesktopPosition(isCollapsed) {
  if (typeof window === "undefined") {
    return { x: DESKTOP_EDGE_GAP, y: DESKTOP_EDGE_GAP };
  }

  const { width, height } = getPopupSize(isCollapsed);
  return clampPosition(
    {
      x: window.innerWidth - width - DESKTOP_EDGE_GAP,
      y: window.innerHeight - height - DESKTOP_BOTTOM_GAP,
    },
    isCollapsed
  );
}

function getDefaultMobilePosition(isCollapsed) {
  if (typeof window === "undefined") {
    return { x: MOBILE_EDGE_GAP, y: MOBILE_BOTTOM_GAP };
  }

  return {
    x: MOBILE_EDGE_GAP,
    y: Math.max(MOBILE_EDGE_GAP, window.innerHeight - (isCollapsed ? COLLAPSED_HEIGHT : 0) - MOBILE_BOTTOM_GAP),
  };
}

function getInitialPosition(isDesktop) {
  if (!isDesktop) {
    return getDefaultMobilePosition(false);
  }

  const stored = readStoredPosition();
  if (!stored) {
    return getDefaultDesktopPosition(false);
  }

  return clampPosition(stored, false);
}

export default function EduBotWidget() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDesktop, setIsDesktop] = useState(() => getIsDesktop());
  const [position, setPosition] = useState(() => getInitialPosition(getIsDesktop()));
  const [dragging, setDragging] = useState(false);

  const bottomRef = useRef(null);
  const popupRef = useRef(null);
  const inputRef = useRef(null);
  const dragRef = useRef(null);
  const rafRef = useRef(0);
  const pendingPositionRef = useRef(position);
  const positionRef = useRef(position);
  const userDraggedRef = useRef(false);
  const activeElementRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const visible = useMemo(() => shouldShowWidget(location.pathname), [location.pathname]);

  useEffect(() => {
    pendingPositionRef.current = position;
  }, [position]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!visible) {
      setOpen(false);
      setCollapsed(false);
      setDragging(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!open || collapsed) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open, collapsed]);

  useEffect(() => {
    const handleResize = () => {
      const nextIsDesktop = getIsDesktop();
      setIsDesktop(nextIsDesktop);

      if (!nextIsDesktop) {
        setPosition(getDefaultMobilePosition(false));
        return;
      }

      const stored = readStoredPosition();
      if (stored) {
        const clamped = clampPosition(stored, collapsed);
        setPosition(clamped);
        return;
      }

      setPosition(getDefaultDesktopPosition(collapsed));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed]);

  useEffect(() => {
    if (!open || !isDesktop) return;

    const clamped = clampPosition(positionRef.current, collapsed);
    if (clamped.x !== positionRef.current.x || clamped.y !== positionRef.current.y) {
      setPosition(clamped);
    }
  }, [collapsed, isDesktop, open]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (!visible) {
    return null;
  }

  const syncPosition = (nextPosition) => {
    pendingPositionRef.current = nextPosition;

    if (rafRef.current) return;

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;
      setPosition(pendingPositionRef.current);
    });
  };

  const stopDragging = () => {
    if (!dragRef.current) return;

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerEnd);
    window.removeEventListener("pointercancel", handlePointerEnd);

    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    const finalPosition = clampPosition(pendingPositionRef.current, collapsed);
    setPosition(finalPosition);
    if (dragRef.current.moved) {
      saveStoredPosition(finalPosition);
      userDraggedRef.current = true;
    }
    dragRef.current = null;
    setDragging(false);

    const activeElement = activeElementRef.current;
    if (activeElement instanceof HTMLElement && popupRef.current?.contains(activeElement)) {
      window.requestAnimationFrame(() => {
        activeElement.focus({ preventScroll: true });
      });
    }
    activeElementRef.current = null;
  };

  function handlePointerMove(event) {
    if (!dragRef.current) return;
    event.preventDefault();

    const nextPosition = clampPosition(
      {
        x: event.clientX - dragRef.current.offsetX,
        y: event.clientY - dragRef.current.offsetY,
      },
      collapsed
    );

    if (
      nextPosition.x !== dragRef.current.startPosition.x ||
      nextPosition.y !== dragRef.current.startPosition.y
    ) {
      dragRef.current.moved = true;
    }

    syncPosition(nextPosition);
  }

  function handlePointerEnd() {
    stopDragging();
  }

  const handleDragStart = (event) => {
    if (!open || !isDesktop || event.button !== 0) return;
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = popupRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startPosition: { ...positionRef.current },
      moved: false,
    };
    activeElementRef.current = document.activeElement;
    setDragging(true);

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerEnd, { once: true });
    window.addEventListener("pointercancel", handlePointerEnd, { once: true });
  };

  const handleToggle = () => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setOpen((value) => !value);
    setCollapsed(false);
    setError("");

    if (!open && isDesktop) {
      const stored = readStoredPosition();
      if (stored) {
        setPosition(clampPosition(stored, false));
      } else {
        setPosition(getDefaultDesktopPosition(false));
      }
    }

    if (!open && !isDesktop) {
      setPosition(getDefaultMobilePosition(false));
    }
  };

  const handleResetPosition = () => {
    clearStoredPosition();
    userDraggedRef.current = false;
    setPosition(isDesktop ? getDefaultDesktopPosition(collapsed) : getDefaultMobilePosition(collapsed));
  };

  const sendMessage = async (text = input, contextType = inferContextType(text)) => {
    const message = text.trim();
    if (!message || loading) return;

    if (!isLoggedIn()) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (message.length > 2000) {
      setError("Tin nhắn tối đa 2000 ký tự.");
      return;
    }

    setError("");
    setInput("");
    setLoading(true);
    setMessages((current) => [
      ...current,
      { id: messageId(), role: "user", content: message, time: nowTime() },
    ]);

    try {
      const response = await sendAiChatMessage({ message, contextType });
      const result = response.data?.result || {};
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content: result.answer || fallbackAnswer,
          suggestions: result.suggestions || [],
          time: nowTime(),
        },
      ]);
    } catch (err) {
      const messageFromApi = err.response?.data?.message || fallbackAnswer;
      setError(messageFromApi);
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content: err.response?.status === 429 ? messageFromApi : fallbackAnswer,
          suggestions: ["Gợi ý lịch học", "Xem tài liệu", "Luyện đề"],
          time: nowTime(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const openFullChat = () => {
    setOpen(false);
    setCollapsed(false);
    navigate("/ai-assistant");
  };

  const closeWidget = () => {
    setOpen(false);
    setCollapsed(false);
  };

  const popupStyle = isDesktop
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
      }
    : {
        left: "12px",
        right: "12px",
        bottom: "88px",
      };

  return (
    <div className="fixed bottom-4 right-4 z-[9990] sm:bottom-6 sm:right-6">
      <div
        ref={popupRef}
        style={popupStyle}
        className={`fixed flex overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-2xl shadow-slate-400/40 transition-all duration-200 ${
          isDesktop ? "w-[380px] max-w-[380px]" : "w-[calc(100vw-24px)] max-w-[calc(100vw-24px)]"
        } ${
          open
            ? collapsed
              ? "h-16 opacity-100 scale-100"
              : isDesktop
                ? "h-[520px] opacity-100 scale-100"
                : "h-[70vh] max-h-[calc(100vh-112px)] opacity-100 scale-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        } ${dragging ? "select-none" : ""}`}
        aria-hidden={!open}
      >
        <div className="flex w-full flex-col">
          <header className="flex items-center justify-between gap-3 bg-[#0f2c3f] px-4 py-3 text-white">
            <div
              className={`flex min-w-0 items-center gap-3 ${isDesktop ? "cursor-grab active:cursor-grabbing" : ""}`}
              onPointerDown={handleDragStart}
              onPointerUp={handlePointerEnd}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-200">
                <Icon icon="lucide:bot-message-square" className="text-xl" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black">EduBot 4.0</h2>
                <p className="truncate text-[11px] font-semibold text-cyan-100/80">
                  Trợ lý học tập cá nhân
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-100 transition hover:bg-white/20"
                aria-label={collapsed ? "Mở rộng EduBot" : "Thu nhỏ EduBot"}
                title={collapsed ? "Mở rộng" : "Thu nhỏ"}
              >
                <Icon icon={collapsed ? "lucide:chevron-up" : "lucide:chevron-down"} />
              </button>
              <button
                type="button"
                onClick={openFullChat}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-100 transition hover:bg-white/20"
                aria-label="Mở trang chat"
                title="Mở trang chat"
              >
                <Icon icon="lucide:expand" />
              </button>
              <button
                type="button"
                onClick={handleResetPosition}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-100 transition hover:bg-white/20"
                aria-label="Đặt lại vị trí"
                title="Đặt lại vị trí"
              >
                <Icon icon="lucide:refresh-ccw" />
              </button>
              <button
                type="button"
                onClick={closeWidget}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-100 transition hover:bg-white/20"
                aria-label="Đóng EduBot"
                title="Đóng"
              >
                <Icon icon="lucide:x" />
              </button>
            </div>
          </header>

          {!collapsed && (
            <>
              <div className="border-b border-slate-100 bg-white px-4 py-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => sendMessage(prompt.label, prompt.contextType)}
                      disabled={loading}
                      className="shrink-0 rounded-full bg-cyan-50 px-3 py-1.5 text-[11px] font-black text-[#00a8b5] transition hover:bg-cyan-100 disabled:opacity-60"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/70 px-3 py-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-3 text-center">
                    <div>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-[#00a8b5] shadow-sm">
                        <Icon icon="lucide:sparkles" className="text-2xl" />
                      </div>
                      <h3 className="mt-4 text-base font-black text-[#0f2c3f]">
                        Bạn muốn hỏi gì về lộ trình học?
                      </h3>
                      <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
                        Hỏi nhanh về lịch học, tài liệu, phương pháp học hoặc kết quả luyện đề.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const isUser = message.role === "user";
                      return (
                        <div key={message.id} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                          {!isUser && (
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#0f2c3f] text-cyan-200">
                              <Icon icon="lucide:bot" />
                            </div>
                          )}
                          <div className="max-w-[78%]">
                            <div
                              className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-xs font-semibold leading-relaxed shadow-sm ${
                                isUser
                                  ? "rounded-tr-md bg-[#0f2c3f] text-white"
                                  : message.error
                                    ? "rounded-tl-md border border-amber-100 bg-amber-50 text-amber-800"
                                    : "rounded-tl-md border border-slate-100 bg-white text-slate-700"
                              }`}
                            >
                              {message.content}
                            </div>
                            <p className={`mt-1 text-[10px] font-bold text-slate-400 ${isUser ? "text-right" : "text-left"}`}>
                              {message.time}
                            </p>
                            {!isUser && message.suggestions?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {message.suggestions.slice(0, 3).map((suggestion) => (
                                  <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => sendMessage(suggestion)}
                                    disabled={loading}
                                    className="rounded-full border border-cyan-100 bg-white px-2.5 py-1 text-[10px] font-black text-[#00a8b5] hover:bg-cyan-50 disabled:opacity-60"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {loading && (
                      <div className="flex gap-2">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#0f2c3f] text-cyan-200">
                          <Icon icon="lucide:bot" />
                        </div>
                        <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-500 shadow-sm">
                          <span className="inline-flex items-center gap-2">
                            <Icon icon="lucide:loader-2" className="animate-spin text-[#00a8b5]" />
                            EduBot đang trả lời...
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white p-3">
                {error && (
                  <div className="mb-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
                    {error}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={2000}
                    rows={1}
                    placeholder="Nhập câu hỏi..."
                    className="max-h-24 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0f2c3f] text-white transition hover:bg-[#1a4a69] disabled:cursor-not-allowed disabled:bg-slate-300"
                    aria-label="Gửi câu hỏi"
                  >
                    <Icon icon={loading ? "lucide:loader-2" : "lucide:send"} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                  Enter để gửi, Shift+Enter xuống dòng.
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-[#00a8b5] text-white shadow-2xl shadow-cyan-700/30 transition hover:scale-105 hover:bg-[#0196a3] active:scale-95"
        aria-label="Mở EduBot 4.0"
        aria-expanded={open}
      >
        <Icon icon={open ? "lucide:x" : "lucide:bot-message-square"} className="text-3xl" />
        <span className="absolute right-full mr-4 hidden whitespace-nowrap rounded-xl bg-[#0f2c3f] px-4 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 sm:block">
          Hỏi EduBot 4.0
        </span>
      </button>
    </div>
  );
}
