import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import StudyAppShell from "../components/StudyAppShell";
import { sendAiChatMessage } from "../services/aiService";
import { isLoggedIn } from "../services/tokenUtils";

const quickPrompts = [
  { label: "Gợi ý lịch học tuần này", contextType: "SCHEDULE" },
  { label: "Tôi nên học phương pháp nào?", contextType: "STUDY_METHOD" },
  { label: "Phân tích kết quả luyện đề của tôi", contextType: "MOCK_EXAM" },
  { label: "Gợi ý tài liệu cho ngành đang chọn", contextType: "RESOURCE" },
];

const fallbackAnswer = "EduBot hiện chưa phản hồi được, bạn thử lại sau nhé.";

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

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = async (text = input, contextType = inferContextType(text)) => {
    const message = text.trim();
    if (!message || loading) return;

    if (message.length > 2000) {
      setError("Tin nhắn tối đa 2000 ký tự.");
      return;
    }

    setError("");
    setInput("");
    setLoading(true);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: message, time: nowTime() },
    ]);

    try {
      const response = await sendAiChatMessage({ message, contextType });
      const result = response.data?.result || {};
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
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

  return (
    <StudyAppShell subtitle="EduBot 4.0" activePath="/ai-assistant">
      <div className="mx-auto flex h-[calc(100vh-112px)] max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
        <header className="border-b border-slate-100 bg-[#0f2c3f] px-5 py-4 text-white sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-200">
                <Icon icon="lucide:bot-message-square" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-lg font-black">Hỏi đáp trợ lý AI</h1>
                <p className="text-xs font-semibold text-cyan-100/80">
                  EduBot 4.0 hỗ trợ lộ trình học, tài liệu, lịch học và luyện đề.
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black text-cyan-100">
              <Icon icon="lucide:shield-check" />
              Context an toàn từ TGrowth Pro
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/60 px-4 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center">
              <div className="max-w-3xl text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50 text-[#00a8b5]">
                  <Icon icon="lucide:sparkles" className="text-3xl" />
                </div>
                <h2 className="mt-5 text-2xl font-black text-[#0f2c3f]">
                  Bạn muốn hỏi gì về lộ trình học của mình?
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-slate-500">
                  Hỏi về ngành học, phương pháp học, lịch học, tài liệu, kết quả luyện đề hoặc cách ôn tập sau khi làm đề.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => sendMessage(prompt.label, prompt.contextType)}
                      disabled={loading}
                      className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left text-sm font-black text-[#0f2c3f] shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 disabled:opacity-60"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div key={message.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && (
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#0f2c3f] text-cyan-200">
                        <Icon icon="lucide:bot" />
                      </div>
                    )}
                    <div className={`max-w-[82%] sm:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
                      <div
                        className={`whitespace-pre-line rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed shadow-sm ${
                          isUser
                            ? "rounded-tr-md bg-[#0f2c3f] text-white"
                            : message.error
                              ? "rounded-tl-md border border-amber-100 bg-amber-50 text-amber-800"
                              : "rounded-tl-md border border-slate-100 bg-white text-slate-700"
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className={`mt-1 text-[10px] font-bold text-slate-400 ${isUser ? "text-right" : "text-left"}`}>
                        {message.time}
                      </div>
                      {!isUser && message.suggestions?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => sendMessage(suggestion)}
                              disabled={loading}
                              className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[11px] font-black text-[#00a8b5] hover:bg-cyan-100 disabled:opacity-60"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {isUser && (
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#00a8b5]">
                        <Icon icon="lucide:user" />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#0f2c3f] text-cyan-200">
                    <Icon icon="lucide:bot" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm">
                    <span className="inline-flex items-center gap-2">
                      <Icon icon="lucide:loader-2" className="animate-spin text-[#00a8b5]" />
                      EduBot đang suy nghĩ...
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
          {error && (
            <div className="mb-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
              {error}
            </div>
          )}

          {messages.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  type="button"
                  onClick={() => sendMessage(prompt.label, prompt.contextType)}
                  disabled={loading}
                  className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-600 hover:bg-cyan-50 hover:text-[#00a8b5] disabled:opacity-60"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={2000}
              rows={1}
              placeholder="Nhập câu hỏi cho EduBot..."
              className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0f2c3f] text-white transition hover:bg-[#1a4a69] disabled:cursor-not-allowed disabled:bg-slate-300"
              aria-label="Gửi câu hỏi"
            >
              <Icon icon={loading ? "lucide:loader-2" : "lucide:send"} className={loading ? "animate-spin" : ""} />
            </button>
          </form>
          <p className="mt-2 text-[11px] font-semibold text-slate-400">
            Enter để gửi, Shift+Enter để xuống dòng. Tối đa 2000 ký tự.
          </p>
        </div>
      </div>
    </StudyAppShell>
  );
}
