import { useEffect, useState, useRef } from "react";
import { chatApi } from "../services/chatApi";
import { connectWebSocket, sendMessage, disconnectWebSocket } from "../services/socket";
import { logoutApi } from "../services/authService";
import { decodeToken, getCurrentUserEmail, getCurrentUserId, clearSession } from "../services/tokenUtils";
import "../styles/chat.css";
import { Link, useNavigate } from "react-router-dom";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/notionists/svg?seed=Felix";

export default function ChatPage() {
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [convId, setConvId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [unreadByConversation, setUnreadByConversation] = useState({});
  const scrollRef = useRef();
  const selectedConversationIdRef = useRef(null);
  const selectedUserRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");
  const currentUserEmail = getCurrentUserEmail();
  const currentUserId = getCurrentUserId();
  const userPayload = decodeToken(token);
  const displayName =
    userPayload?.first_name ||
    currentUserEmail?.split("@")[0] ||
    "User";

  const handleLogout = async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    clearSession();
    navigate("/");
  };

  useEffect(() => {
    selectedConversationIdRef.current = convId;
  }, [convId]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Fetch danh sách users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await chatApi.getUsers();
        const others = res.data.content || [];
        setUsersList(others);
        if (others.length > 0) setSelectedUser(others[0]);
      } catch (err) {
        console.error("Lỗi load users:", err.message);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    let active = true;

    connectWebSocket(
      token,
      (newMsg) => {
        if (!active) return;
        const messageConversationId = Number(newMsg.conversationId);
        const currentConversationId = Number(selectedConversationIdRef.current);

        setMessages((prev) => {
          if (messageConversationId !== currentConversationId) return prev;
          if (newMsg.id && prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        if (newMsg.senderEmail !== currentUserEmail && messageConversationId !== currentConversationId) {
          setUnreadByConversation((prev) => ({
            ...prev,
            [newMsg.conversationId]: (prev[newMsg.conversationId] || 0) + 1,
          }));
        }

        setUsersList((prev) => {
          const selected = selectedUserRef.current;
          const conversationUser = prev.find(
            (u) => Number(u.conversationId) === messageConversationId
          );
          const otherEmail = newMsg.senderEmail === currentUserEmail
            ? conversationUser?.email || selected?.email
            : newMsg.senderEmail;

          return prev
            .map((u) =>
              u.email === otherEmail
                ? {
                  ...u,
                  conversationId: newMsg.conversationId,
                  lastMessage: newMsg.content,
                  lastMessageAt: newMsg.createdAt,
                }
                : u
            )
            .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
        });
      },
      (status) => {
        if (active) setConnectionStatus(status);
      }
    );

    return () => {
      active = false;
      disconnectWebSocket();
    };
  }, [currentUserEmail, navigate, token]);

  // Kết nối chat khi chọn user
  useEffect(() => {
    if (!selectedUser || !token) return;
    let active = true;

    const initChat = async () => {
      try {
        const resConv = await chatApi.getOrCreateConversation({
          userId: currentUserId,
          mentorId: selectedUser.id,
        });
        const id = resConv.data.id;
        if (!active) return;
        selectedConversationIdRef.current = id;
        setConvId(id);
        setUsersList((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, conversationId: id } : u))
        );
        setUnreadByConversation((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });

        const resHistory = await chatApi.getHistory(id);
        if (!active) return;
        setMessages((resHistory.data.messages || []).reverse());
      } catch (err) {
        console.error("Lỗi init chat:", err.message);
      }
    };

    initChat();
    return () => {
      active = false;
    };
  }, [selectedUser, currentUserId, token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !convId || !selectedUser) return;
    const payload = {
      conversationId: Number(convId),
      content: input,
      senderEmail: currentUserEmail,
    };
    const sent = sendMessage(payload);
    if (sent) {
      setInput("");
    } else {
      alert("Mat ket noi chat, vui long thu lai sau vai giay.");
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden font-sans bg-[#f8fafc]">
      {/* HEADER */}
      <header className="h-16 bg-[#0f2c3f] text-white flex justify-between items-center px-6 shrink-0 z-50 shadow-md">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all cursor-pointer">
          <div className="bg-[#4fd1c5] p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/></svg>
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">TGrowth Pro</h1>
            <p className="text-[10px] text-gray-300">Kết nối cộng đồng sinh viên giỏi</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 border-l border-gray-700 pl-6">
          <p className="text-sm font-medium hidden sm:block">{displayName}</p>
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserEmail}`}
            className="w-9 h-9 rounded-full bg-white p-0.5 border border-gray-600" alt="avatar" />
          <button onClick={handleLogout}
            className="text-xs font-bold text-red-400 hover:text-red-300 transition-all ml-2">
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b">
            <input
              placeholder="Tìm kiếm..."
              className="w-full px-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {usersList.map((u) => {
              const unreadCount = unreadByConversation[u.conversationId] || 0;

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUser?.id === u.id ? "bg-cyan-50/50" : ""}`}
                >
                  <div className="relative">
                    <img src={u.avatar || DEFAULT_AVATAR} className="w-12 h-12 rounded-2xl bg-gray-100" alt="avatar" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-gray-800 truncate">
                        {u.firstName} {u.lastName}
                      </h4>
                      {unreadCount > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate ${unreadCount > 0 ? "text-gray-800 font-semibold" : "text-gray-400"}`}>
                      {u.lastMessage || u.email}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* MAIN CHAT */}
        <main className="flex-1 flex flex-col bg-white">
          <header className="h-16 px-6 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <img src={selectedUser?.avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-xl" alt="selected" />
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                {selectedUser ? `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim() : "Chọn người dùng"}
              </h3>
              <p className="text-[11px] text-[#00b5ad] font-semibold">
                {selectedUser?.email || ""}
                {connectionStatus !== "connected" && " - reconnecting"}
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
            {messages.map((m, i) => {
              const isMe = m.senderEmail === currentUserEmail;
              const time = m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                : "";
              return (
                <div key={i} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                  <img
                    src={isMe
                      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserEmail}`
                      : selectedUser?.avatar || DEFAULT_AVATAR}
                    className="w-9 h-9 rounded-xl mt-1 object-cover bg-slate-100"
                    alt="avt"
                  />
                  <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                      ? "bg-[#0f4c5c] text-white rounded-tr-none"
                      : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"}`}>
                      <p>{m.content}</p>
                    </div>
                    <span className="text-[10px] mt-1 font-medium text-slate-400">{time}</span>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>

          <form onSubmit={handleSend} className="chat-form-container">
            <div className="chat-input-wrapper">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="chat-main-input"
                placeholder="Nhập tin nhắn..."
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || connectionStatus !== "connected"}
              className={`send-btn ${input.trim() && connectionStatus === "connected" ? "send-btn-active" : "send-btn-disabled"}`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.33 3.67a2.46 2.46 0 0 0-2.39-.39L3.45 8.3a2.47 2.47 0 0 0-.21 4.57l4.06 1.58c.31.12.55.36.67.67l1.58 4.06a2.47 2.47 0 0 0 4.57-.21l5.02-14.49a2.47 2.47 0 0 0-.39-2.39Z" fill="currentColor"/>
              </svg>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
