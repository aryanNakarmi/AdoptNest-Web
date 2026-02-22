"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { HiChat, HiPaperAirplane, HiRefresh } from "react-icons/hi";
import { io, Socket } from "socket.io-client";
import {
  handleGetAllChats,
  handleGetChatMessages,
  handleSendAdminMessage,
  handleMarkAsRead,
} from "@/lib/actions/chat-action";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

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
  userId: { _id: string; fullName: string; email: string };
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
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

const formatMessageTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect socket
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socket = io(BASE_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("new_message", (message: Message) => {
      // Add message if it belongs to the open chat
      setMessages((prev) => {
        if (prev.length > 0 && prev[0]?.chatId === message.chatId) {
          return [...prev, message];
        }
        return prev;
      });
      // Update last message preview in inbox
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
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    setLoadingChats(true);
    const res = await handleGetAllChats();
    if (res.success) setChats(res.data);
    else toast.error(res.message || "Failed to load chats");
    setLoadingChats(false);
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Open a chat
  const openChat = async (chat: Chat) => {
    // Leave previous room
    if (selectedChat) {
      socketRef.current?.emit("leave_chat", selectedChat._id);
    }

    setSelectedChat(chat);
    setLoadingMessages(true);
    setMessages([]);

    const res = await handleGetChatMessages(chat._id);
    if (res.success && res.data) {
      setMessages(res.data.messages || []);
      await handleMarkAsRead(chat._id);
    } else {
      toast.error("Failed to load messages");
    }

    setLoadingMessages(false);

    // Join socket room
    socketRef.current?.emit("join_chat", chat._id);
    inputRef.current?.focus();
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const res = await handleSendAdminMessage(selectedChat._id, content);
    if (!res.success) {
      toast.error(res.message || "Failed to send message");
      setNewMessage(content); // restore on fail
    }

    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex gap-0 h-[calc(100vh-120px)] rounded-2xl overflow-hidden shadow border border-gray-200">

      {/* ===== LEFT — Inbox ===== */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Messages</h2>
            <p className="text-xs text-gray-500">{chats.length} conversation{chats.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={fetchChats}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
            title="Refresh"
          >
            <HiRefresh size={18} />
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 p-6">
              <HiChat size={36} />
              <p className="text-sm text-center">No conversations yet</p>
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = selectedChat?._id === chat._id;
              const initials = chat.userId?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?";

              return (
                <button
                  key={chat._id}
                  onClick={() => openChat(chat)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition border-b border-gray-100 hover:bg-gray-50 ${
                    isActive ? "bg-red-50 border-l-4 border-l-red-600" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-sm font-bold">{initials}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm font-semibold truncate ${isActive ? "text-red-600" : "text-gray-900"}`}>
                        {chat.userId?.fullName || "Unknown User"}
                      </p>
                      {chat.lastMessageAt && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ===== RIGHT — Conversation ===== */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">
                  {selectedChat.userId?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?"}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {selectedChat.userId?.fullName || "Unknown User"}
                </p>
                <p className="text-xs text-gray-500">{selectedChat.userId?.email}</p>
              </div>
            </div>

            {/* Messages */}
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
                    <div
                      key={msg._id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isAdmin
                            ? "bg-red-600 text-white rounded-br-sm"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                        }`}
                      >
                        <p className="leading-relaxed break-words">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isAdmin ? "text-red-200" : "text-gray-400"
                          }`}
                        >
                          {formatMessageTime(msg.createdAt)}
                          {isAdmin && msg.isRead && (
                            <span className="ml-1 opacity-70">✓✓</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
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
          /* Empty state — no chat selected */
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <HiChat size={32} className="text-gray-300" />
            </div>
            <p className="text-base font-medium text-gray-500">Select a conversation</p>
            <p className="text-sm text-gray-400">Choose from the inbox on the left</p>
          </div>
        )}
      </div>
    </div>
  );
}
