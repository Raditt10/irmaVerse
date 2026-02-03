"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Bell, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  Menu, 
  TrendingUp,
  Clock,
  X // Pastikan X diimport
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SearchBar from "@/components/ui/SearchBar";
import InvitationNotifications from "@/components/ui/InvitationNotifications";

export default function DashboardHeader() {
  const router = useRouter();
  const [invitationCount, setInvitationCount] = useState(0);
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
  });

  // Listen for invitation count updates
  useEffect(() => {
    const handleInvitationCountUpdate = () => {
      const count = (typeof window !== "undefined" ? (window as any).invitationCount : 0) || 0;
      setInvitationCount(count);
    };

    if (typeof window !== "undefined") {
      handleInvitationCountUpdate();
      window.addEventListener("invitationCountUpdate", handleInvitationCountUpdate);
      return () => {
        window.removeEventListener("invitationCountUpdate", handleInvitationCountUpdate);
      };
    }
  }, []);

  // Fetch invitations
  const fetchInvitations = async () => {
    setLoadingInvites(true);
    try {
      const res = await fetch("/api/materials/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      } else {
        setInvitations([]);
      }
    } catch (error) {
      console.error("[DashboardHeader] Error:", error);
      setInvitations([]);
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleBellClick = () => {
    setShowInvitations(true);
    fetchInvitations();
    if (session?.user?.role !== "instruktur") {
      fetchMessages();
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        const mappedMessages = data.map((conv: any) => ({
          id: conv.id,
          instructor: conv.participant,
          instructorId: conv.participant?.id,
          messages: conv.lastMessage ? [conv.lastMessage] : [],
          updatedAt: conv.updatedAt,
          unreadCount: conv.unreadCount,
        }));
        setMessages(mappedMessages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("[DashboardHeader] Error:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const userName = session?.user?.name || "User";
  const userAvatar = (session?.user as any)?.avatar;
  const displayAvatar = userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;
  const userEmail = session?.user?.email || "user@irmaverse.com"; 
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="border-b-2 border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 font-sans" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
      <div className="flex items-center justify-between gap-4 h-20 px-4 lg:px-8">
        
        {/* --- LEFT: LOGO --- */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => window.dispatchEvent(new Event('open-mobile-sidebar'))}
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" strokeWidth={2.5} />
          </button>
          
          <img src="/logo.png" alt="IRMA Verse" className="h-10 w-10 object-contain" />
          
          <div className="block">
            <h2 className="text-base sm:text-lg font-bold text-emerald-600 leading-tight">
              IRMA VERSE
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500">Platform Digital Irma 13</p>
          </div>
        </div>

        {/* --- CENTER: SEARCH BAR --- */}
        <div className="hidden md:flex flex-1 max-w-lg mx-4">
           <div className="w-full">
             <SearchBar />
           </div>
        </div>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={handleBellClick}
              className="relative h-11 w-11 rounded-xl bg-white border-2 border-slate-200 shadow-[3px_3px_0_0_#cbd5e1] hover:border-emerald-400 hover:shadow-[3px_3px_0_0_#34d399] active:translate-y-[2px] active:shadow-none transition-all inline-flex items-center justify-center outline-none"
              aria-label="Lihat notifikasi"
            >
              <Bell className="h-5 w-5 text-slate-600 hover:text-emerald-600 transition-colors" strokeWidth={2.5} />
              {invitationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-[2px_2px_0_0_#fff]">
                  {invitationCount > 9 ? "9+" : invitationCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu Notifikasi */}
            {showInvitations && (
              <>
                {/* Dropdown Card */}
                <div className="fixed left-4 right-4 top-20 z-50 sm:absolute sm:right-0 sm:left-auto sm:top-full sm:mt-2 sm:w-96 sm:rounded-2xl flex flex-col bg-white rounded-2xl border-2 border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)] max-h-[80vh] sm:max-h-[600px] overflow-hidden sm:shadow-xl animate-in fade-in-0 zoom-in-95 sm:fade-in-0 sm:zoom-in-100 duration-200" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
                
                {/* Header Dropdown */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
                  <p className="font-black text-sm text-emerald-800 tracking-wide flex items-center gap-2">
                     PESAN MASUK
                  </p>
                  
                  {/* TOMBOL CLOSE DIPERBAIKI */}
                  <button
                    onClick={() => setShowInvitations(false)}
                    className="h-9 w-9 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-2 border-slate-200 hover:border-red-200 shadow-sm active:scale-95 shrink-0"
                    aria-label="Tutup notifikasi"
                  >
                    <X className="h-5 w-5" strokeWidth={3} />
                  </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto flex-1 p-3 space-y-3 bg-slate-50/50">
                  {(loadingInvites || loadingMessages) ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="animate-spin h-8 w-8 border-4 border-emerald-400 border-t-transparent rounded-full mb-3"></div>
                      <p className="text-xs text-slate-500 font-bold">Sedang memuat...</p>
                    </div>
                  ) : (invitations.length === 0 && messages.length === 0) ? (
                    <div className="text-center py-10">
                      <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 border-2 border-slate-200 shadow-sm">
                        <Bell className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-slate-600 text-sm font-black">Sepi banget...</p>
                      <p className="text-slate-400 text-xs mt-1 font-medium">Belum ada notifikasi baru untukmu.</p>
                    </div>
                  ) : (
                    <>
                      {/* Undangan Section */}
                      {invitations.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-wider">Undangan Masuk</p>
                          {invitations.map((inv) => (
                            <div key={inv.id} className="border-2 border-emerald-100 rounded-2xl p-4 bg-white shadow-sm">
                              <div className="mb-3">
                                <p className="font-black text-slate-800 text-sm">{inv.material?.title || "Materi Kajian"}</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                                  Diundang oleh <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{inv.instructor?.name}</span>
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button className="flex-1 px-3 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 active:translate-y-0.5 transition-all border-b-4 border-emerald-700 active:border-b-0 shadow-lg shadow-emerald-200">
                                  Terima
                                </button>
                                <button className="flex-1 px-3 py-2 bg-white text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 active:translate-y-0.5 transition-all border-2 border-slate-200 border-b-4 active:border-b-2">
                                  Tolak
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pesan Section */}
                      {session?.user?.role !== "instruktur" && messages.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {invitations.length > 0 && <div className="h-px bg-slate-200 my-2 mx-2" />}
                          <p className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-wider">Pesan Baru</p>
                          {messages.map((msg) => (
                            <div key={msg.id} className="border-2 border-emerald-100 rounded-2xl p-4 bg-white shadow-sm hover:border-emerald-300 transition-colors group cursor-pointer" onClick={() => router.push(`/instructors/chat?instructorId=${msg.instructorId}`)}>
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-black text-slate-800 text-sm">{msg.instructor?.name}</p>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Chat</span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                {msg.messages?.[0]?.content || "Mengirim pesan..."}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 h-11 pl-1.5 pr-4 rounded-xl bg-white border-2 border-slate-200 shadow-[3px_3px_0_0_#cbd5e1] hover:border-emerald-400 hover:shadow-[3px_3px_0_0_#34d399] active:translate-y-[2px] active:shadow-none transition-all outline-none group">
                <Avatar className="h-8 w-8 border-2 border-slate-200 group-hover:border-emerald-400 transition-colors">
                  <AvatarImage src={displayAvatar} alt={userName} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-black">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="hidden sm:flex flex-col items-start justify-center text-left">
                    <span className="text-xs font-black text-slate-700 leading-none group-hover:text-emerald-700 truncate max-w-[100px] mb-0.5">
                      {userName.split(" ")[0]}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 leading-none truncate max-w-[120px]">
                      {userEmail}
                    </span>
                </div>

                <Settings className="h-4 w-4 text-slate-300 group-hover:text-emerald-400 transition-colors ml-1" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-60 mt-2 p-2 rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] bg-white" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
              <DropdownMenuLabel className="px-2 py-2 mb-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage src={displayAvatar} alt={userName} className="object-cover" />
                    <AvatarFallback className="bg-emerald-500 text-white font-black">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-slate-800 truncate">{userName}</span>
                    <span className="text-xs font-medium text-slate-500 truncate">{userEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <div className="space-y-1">
                <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer font-bold text-slate-600 focus:text-emerald-700 focus:bg-emerald-50 rounded-lg px-3 py-2.5 transition-colors">
                    <UserIcon className="h-4 w-4 mr-2" strokeWidth={2.5} />
                    <span>Profile Saya</span> 
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push("/level")} className="cursor-pointer font-bold text-slate-600 focus:text-emerald-700 focus:bg-emerald-50 rounded-lg px-3 py-2.5 transition-colors">
                    <TrendingUp className="h-4 w-4 mr-2" strokeWidth={2.5} />
                    <span>Level & Poin</span> 
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer font-bold text-slate-600 focus:text-emerald-700 focus:bg-emerald-50 rounded-lg px-3 py-2.5 transition-colors">
                    <Settings className="h-4 w-4 mr-2" strokeWidth={2.5} />
                    <span>Pengaturan</span>
                </DropdownMenuItem>
              </div>
              
              <div className="h-0.5 bg-slate-100 my-2 rounded-full" />
              
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/auth" })}
                className="cursor-pointer font-bold text-rose-600 focus:text-rose-700 focus:bg-rose-50 rounded-lg px-3 py-2.5 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" strokeWidth={2.5} />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-4 pt-0 border-t-2 border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="mt-4">
            <SearchBar />
        </div>
      </div>
      
      {/* Toast Notification (Floating) */}
      <InvitationNotifications />
    </div>
  );
};