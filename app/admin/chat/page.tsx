"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { HiChat, HiPaperAirplane, HiRefresh, HiSearch, HiUsers } from "react-icons/hi";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import axios from "@/lib/api/axios";

const SOCKET_URL = "http://localhost:5050";
const BASE_URL = "http://localhost:5050";

interface Message {
  _id: string;
  chatId: string;
  senderId: { _id: string; fullName: string; email: string; role: string };
  senderRole: "user" | "admin";
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Chat {
  _id: string;
  userId: { _id: string; fullName: string; email: string; profilePicture?: string };
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

interface User {
  _id: string;
  fullName?: string;
  email: string;
  profilePicture?: string | null;
  role: string;
}

const getAuthToken = () => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith("auth_token="))
      return decodeURIComponent(c.substring("auth_token=".length));
  }
  return null;
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatMessageTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

function UserAvatar({
  profilePicture,
  fullName,
  size = "md",
}: {
  profilePicture?: string | null;
  fullName?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const initials = fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  if (profilePicture) {
    return (
      <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 relative`}>
        <Image src={`${BASE_URL}${profilePicture}`} alt={fullName || "User"} fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div className={`${dim} rounded-full bg-red-100 flex items-center justify-center flex-shrink-0`}>
      <span className={`text-red-600 ${textSize} font-bold`}>{initials}</span>
    </div>
  );
}

export default function AdminChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // unreadMap: chatId -> unread count
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [startingChat, setStartingChat] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedChatRef = useRef<Chat | null>(null);

  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Connect socket
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("Socket error:", err.message));

    socket.on("new_message", (message: Message) => {
      // Add to messages if this chat is open
      if (selectedChatRef.current?._id === message.chatId) {
        setMessages((prev) => [...prev, message]);
      }

      // Update inbox last message preview
      setChats((prev) =>
        prev.map((c) =>
          c._id === message.chatId
            ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
            : c
        ).sort((a, b) =>
          new Date(b.lastMessageAt || b.createdAt).getTime() -
          new Date(a.lastMessageAt || a.createdAt).getTime()
        )
      );

      // If message is from user and this chat is NOT currently open → increment badge
      if (message.senderRole === "user" && selectedChatRef.current?._id !== message.chatId) {
        setUnreadMap((prev) => ({
          ...prev,
          [message.chatId]: (prev[message.chatId] || 0) + 1,
        }));
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  const fetchChats = useCallback(async () => {
  setLoadingChats(true);
  try {
    const res = await axios.get("/api/v1/chats");
    if (res.data.success) {
      setChats(res.data.data);
      const initialUnread: Record<string, number> = {};
      (res.data.data || []).forEach((c: any) => {
        if (c.unreadCount > 0) initialUnread[c._id] = c.unreadCount;
      });
      setUnreadMap(initialUnread);
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Failed to load chats");
  } finally {
    setLoadingChats(false);
  }
}, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get("/api/v1/admin/users?page=1&size=100");
      if (res.data.success) {
        setUsers((res.data.data || []).filter((u: User) => u.role !== "admin"));
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleShowUsers = () => {
    setShowUsers(true);
    if (users.length === 0) fetchUsers();
  };

  const startConversation = async (user: User) => {
    setStartingChat(user._id);
    try {
      const res = await axios.post(`/api/v1/chats/start/${user._id}`);
      if (res.data.success) {
        await fetchChats();
        setShowUsers(false);
        setUserSearch("");
        const enrichedChat: Chat = {
          ...res.data.data,
          userId: {
            _id: user._id,
            fullName: user.fullName || "",
            email: user.email,
            profilePicture: user.profilePicture || undefined,
          },
        };
        openChat(enrichedChat);
        toast.success(`Conversation started with ${user.fullName || user.email}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to start conversation");
    } finally {
      setStartingChat(null);
    }
  };

  const openChat = async (chat: Chat) => {
    if (selectedChatRef.current?._id) {
      socketRef.current?.emit("leave_chat", selectedChatRef.current._id);
    }
    setSelectedChat(chat);
    setMessages([]);
    setLoadingMessages(true);

    // Clear badge for this chat
    setUnreadMap((prev) => ({ ...prev, [chat._id]: 0 }));

    try {
      const res = await axios.get(`/api/v1/chats/${chat._id}/messages`);
    if (res.data.success) {
      setMessages(res.data.data.messages || []);
      await axios.put(`/api/v1/chats/${chat._id}/read`).catch(() => {});
      // ← ADD THIS
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
    socketRef.current?.emit("join_chat", chat._id);
    inputRef.current?.focus();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;
    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);
    try {
      await axios.post(`/api/v1/chats/${selectedChat._id}/messages`, { content });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message");
      setNewMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return u.fullName?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const userHasChat = (userId: string) => chats.some((c) => c.userId?._id === userId);

  // Total unread across all chats (for header)
  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  return (
    <div className="flex gap-0 h-[calc(100vh-120px)] rounded-2xl overflow-hidden shadow border border-gray-200">

      {/* LEFT — Inbox */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Messages</h2>
              {/* Total unread badge in header */}
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{chats.length} conversation{chats.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleShowUsers} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition" title="Start new conversation">
              <HiUsers size={18} />
            </button>
            <button onClick={fetchChats} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition" title="Refresh">
              <HiRefresh size={18} />
            </button>
          </div>
        </div>

        {showUsers ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-red-700">Start a Conversation</p>
              <button onClick={() => { setShowUsers(false); setUserSearch(""); }} className="text-xs text-gray-500 hover:text-gray-700">✕ Close</button>
            </div>
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex justify-center items-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">No users found</p>
              ) : (
                filteredUsers.map((user) => {
                  const hasChat = userHasChat(user._id);
                  const isStarting = startingChat === user._id;
                  return (
                    <div key={user._id} className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 hover:bg-gray-50">
                      <UserAvatar profilePicture={user.profilePicture} fullName={user.fullName} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName || "Unknown"}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => startConversation(user)}
                        disabled={isStarting}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition flex-shrink-0 ${hasChat ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-red-600 text-white hover:bg-red-700"} disabled:opacity-50`}
                      >
                        {isStarting ? "..." : hasChat ? "Open" : "Chat"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 p-6">
                <HiChat size={36} />
                <p className="text-sm text-center">No conversations yet</p>
                <button onClick={handleShowUsers} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition">
                  Start a conversation
                </button>
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = selectedChat?._id === chat._id;
                const chatUnread = unreadMap[chat._id] || 0;
                return (
                  <button
                    key={chat._id}
                    onClick={() => openChat(chat)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition border-b border-gray-100 hover:bg-gray-50 ${isActive ? "bg-red-50 border-l-4 border-l-red-600" : ""}`}
                  >
                    <UserAvatar profilePicture={chat.userId?.profilePicture} fullName={chat.userId?.fullName} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm font-semibold truncate ${isActive ? "text-red-600" : "text-gray-900"}`}>
                          {chat.userId?.fullName || "Unknown User"}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Per-conversation unread badge */}
                          {chatUnread > 0 && (
                            <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                              {chatUnread > 9 ? "9+" : chatUnread}
                            </span>
                          )}
                          {chat.lastMessageAt && (
                            <span className="text-xs text-gray-400">{formatTime(chat.lastMessageAt)}</span>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${chatUnread > 0 ? "text-gray-800 font-semibold" : "text-gray-500"}`}>
                        {chat.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* RIGHT — Conversation */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <UserAvatar profilePicture={selectedChat.userId?.profilePicture} fullName={selectedChat.userId?.fullName} />
              <div>
                <p className="font-bold text-gray-900">{selectedChat.userId?.fullName || "Unknown User"}</p>
                <p className="text-xs text-gray-500">{selectedChat.userId?.email}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                  <HiChat size={40} />
                  <p className="text-sm">No messages yet — say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.senderRole === "admin";
                  return (
                    <div key={msg._id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      {!isAdmin && (
                        <UserAvatar profilePicture={selectedChat.userId?.profilePicture} fullName={selectedChat.userId?.fullName} size="sm" />
                      )}
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm mx-2 ${isAdmin ? "bg-red-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"}`}>
                        <p className="leading-relaxed break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isAdmin ? "text-red-200" : "text-gray-400"}`}>
                          {formatMessageTime(msg.createdAt)}
                          {isAdmin && msg.isRead && <span className="ml-1 opacity-70">✓✓</span>}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedChat.userId?.fullName || "user"}...`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 text-sm bg-gray-50"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <HiPaperAirplane size={18} className="rotate-90" />
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <HiChat size={32} className="text-gray-300" />
            </div>
            <p className="text-base font-medium text-gray-500">Select a conversation</p>
            <p className="text-sm text-gray-400">Or click the users icon to start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
