"use client";
import React, { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/components/ui/Loading";
import Toast from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/socket";
import {
  formatMessageDate,
  formatTimeOnly,
  playNotificationSound,
} from "@/lib/chat-utils";
import {
  Send,
  Menu,
  Users,
  MessageSquare,
  Globe2
} from "lucide-react";

// --- INTERFACES ---
interface GroupMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role?: string; // e.g., 'admin', 'instruktur', 'siswa'
  };
}

interface ForumInfo {
  name: string;
  participantCount: number;
}

const GlobalForumPage = () => {
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth");
    },
  });

  const { socket, isConnected } = useSocket();

  const [forumInfo, setForumInfo] = useState<ForumInfo>({ name: "Forum Diskusi IRMA13", participantCount: 0 });
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [loading, setLoading] = useState(true);
  
  // State untuk fitur fullscreen Desktop
  const [isDesktopChatFullscreen, setIsDesktopChatFullscreen] = useState(false);
  
  const messagesRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Forum Data (Info & Messages)
  const fetchForumData = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/forum/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.info) setForumInfo(data.info);
      }
    } catch (error) {
      console.error("Error fetching forum messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchForumData();
    }
  }, [status, fetchForumData]);

  // 2. Handle Global Room Socket
  useEffect(() => {
    if (socket && session?.user?.id) {
      // Langsung gabung ke "global-forum"
      socket.emit("forum:join", { userId: session.user.id });

      const handleNewMessage = (data: GroupMessage) => {
        setMessages((prev) => [...prev, data]);
        
        if (data.senderId !== session.user.id) {
          playNotificationSound();
        }
      };

      const handleParticipantUpdate = (count: number) => {
        setForumInfo(prev => ({ ...prev, participantCount: count }));
      };

      socket.on("forum:message:receive", handleNewMessage);
      socket.on("forum:participants:update", handleParticipantUpdate); 

      return () => {
        socket.emit("forum:leave", { userId: session.user.id });
        socket.off("forum:message:receive", handleNewMessage);
        socket.off("forum:participants:update", handleParticipantUpdate);
      };
    }
  }, [socket, session?.user?.id]);

  // Auto-scroll ke bawah saat pesan baru masuk
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. Handle Kirim Pesan
  const handleSendMessage = async () => {
    const content = messageDraft.trim();
    if (!content || !session?.user) return;
    
    setMessageDraft(""); // Kosongkan input langsung

    try {
      const res = await fetch(`/api/chat/forum/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        socket?.emit("forum:message:send", {
          message: newMessage,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setToast({ show: true, message: "Gagal mengirim pesan", type: "error" });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // --- RENDER ---
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loading text="Masuk ke forum..." />
      </div>
    );
  }

  return (
    <div className="h-dvh bg-[#FDFBF7] flex flex-col overflow-hidden">
      
      {/* Header Utama - Disembunyikan jika di mobile (pakai header chat) atau desktop fullscreen */}
      <div className={`${isDesktopChatFullscreen ? 'hidden' : 'hidden lg:block'} shrink-0`}>
        <DashboardHeader />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Utama - Menghapus 'hidden lg:block' agar sidebar mobile tetap bisa di-render dan direntangkan */}
        <div className={`${isDesktopChatFullscreen ? 'hidden' : 'block'} h-full shrink-0`}>
          <Sidebar />
        </div>

        <main className={`w-full flex-1 flex flex-col ${isDesktopChatFullscreen ? 'p-0' : 'p-0 lg:p-6'} overflow-hidden relative transition-all`}>
          
          {/* Judul Halaman (Hanya Desktop, disembunyikan jika fullscreen) */}
          <div className={`${isDesktopChatFullscreen ? 'hidden' : 'hidden lg:flex'} mb-4 items-center justify-between shrink-0`}>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Forum Diskusi</h1>
              <p className="text-slate-500 font-bold text-sm mt-1">Grup Ngobrol Santai & Belajar Bersama</p>
            </div>
            <div className="flex items-center gap-2">
                {isConnected ? (
                  <span className="flex items-center gap-2 text-xs font-black text-teal-600 bg-teal-100 px-3 py-1.5 rounded-full border-2 border-teal-200 shadow-sm">
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                    Terhubung
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border-2 border-slate-200 shadow-sm">
                    <span className="w-2 h-2 bg-slate-400 rounded-full" />
                    Menghubungkan...
                  </span>
                )}
            </div>
          </div>

          {/* CHAT CONTAINER FULL WIDTH */}
          <div className={`
            flex flex-col flex-1 bg-slate-50 w-full h-full overflow-hidden transition-all duration-300
            ${isDesktopChatFullscreen ? 'rounded-none border-0 shadow-none' : 'lg:rounded-4xl lg:border-4 border-slate-200 lg:shadow-[0_8px_0_0_#cbd5e1]'}
          `}>
            
            {/* Forum Header Bar */}
            <div className="flex items-center justify-between px-3 lg:px-4 py-3 bg-white border-b-2 border-slate-100 shadow-sm z-20 shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button - Sekarang akan berfungsi! */}
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-mobile-sidebar'))}
                  className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 hover:text-teal-600 rounded-xl transition-colors"
                >
                  <Menu className="h-6 w-6" strokeWidth={2.5} />
                </button>
                
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-slate-100 bg-teal-100 text-teal-500">
                  <AvatarFallback className="font-black"><Globe2 className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-black text-slate-800 text-base leading-tight line-clamp-1">
                    {forumInfo.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                    <Users className="h-3 w-3 text-teal-500" /> {forumInfo.participantCount} User Online
                  </p>
                </div>
              </div>

              {/* Action Buttons (Fullscreen Toggle) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDesktopChatFullscreen((v) => !v)}
                  className="hidden lg:inline-flex p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
                  title={isDesktopChatFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
                >
                  {isDesktopChatFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2m0-10V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v2m10 10h-2a2 2 0 00-2 2v-2a2 2 0 002-2h2m-10 0H5a2 2 0 00-2 2v2a2 2 0 002 2h2" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h6M4 4v6m0-6l6 6m10 10h-6m6 0v-6m0 6l-6-6" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={messagesRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-100/50"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <MessageSquare className="h-16 w-16 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-400">Belum ada obrolan. Jadilah yang pertama!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isMe = message.senderId === session?.user?.id;
                  const showDate = index === 0 || new Date(message.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                  // Tampilkan avatar dan nama jika pengirim berubah atau ada pemisah tanggal
                  const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== message.senderId || showDate);

                  return (
                    <React.Fragment key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-[10px] font-black text-slate-400 bg-white/80 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-sm">
                            {formatMessageDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group gap-2`}>
                        
                        {/* Avatar Kiri (Untuk Orang Lain) */}
                        {!isMe && (
                          <div className="w-8 shrink-0 flex items-end">
                            {showAvatar && (
                              <Avatar className="h-8 w-8 border border-slate-200 shadow-sm">
                                <AvatarImage src={message.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.name}`} />
                                <AvatarFallback>{message.sender.name.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}

                        <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          
                          {/* Nama Pengirim (Hanya jika bukan kita) */}
                          {!isMe && showAvatar && (
                            <span className="text-[11px] font-black text-slate-500 mb-1 ml-1 flex items-center gap-1.5">
                              {message.sender.name}
                              {message.sender.role === 'instruktur' && (
                                <span className="bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide border border-teal-200">Instruktur</span>
                              )}
                            </span>
                          )}

                          <div className={`
                            relative px-4 py-3 rounded-2xl shadow-sm border-2 text-sm md:text-base
                            ${isMe 
                              ? 'bg-teal-500 border-teal-600 text-white rounded-br-sm shadow-[2px_3px_0_0_#0f766e]' 
                              : 'bg-white border-slate-200 text-slate-800 rounded-bl-sm shadow-[2px_3px_0_0_#cbd5e1]'
                            }
                          `}>
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-1 opacity-70">
                            <span className="text-[10px] font-bold text-slate-500">{formatTimeOnly(message.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 lg:p-4 bg-white border-t-2 border-slate-100 z-20 shrink-0">
              <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-3xl border-2 border-slate-200 focus-within:border-teal-400 focus-within:shadow-[0_0_0_2px_rgba(45,212,191,0.2)] transition-all">
                <Textarea
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Kirim pesan ke forum..."
                  className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 min-h-11 max-h-32 py-2.5 px-3 text-sm md:text-base font-medium text-slate-700 placeholder:text-slate-400 resize-none"
                  rows={1}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!messageDraft.trim()}
                  className="p-2.5 bg-teal-500 text-white rounded-full hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_3px_0_0_#0f766e] active:translate-y-0.5 active:shadow-none transition-all shrink-0"
                >
                  <Send className="h-5 w-5" strokeWidth={3} />
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>

      {toast && (
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default function GlobalForumWrapper() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#FDFBF7]"><Loading /></div>}>
      <GlobalForumPage />
    </Suspense>
  );
}