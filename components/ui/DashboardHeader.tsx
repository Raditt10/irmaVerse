"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Bell, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  Menu, 
  TrendingUp,
  Check,
  Clock,
  Sparkles
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

export default function DashboardHeader() {
  const router = useRouter();
  
  // Data Dummy Notifikasi
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Kajian Baru Tersedia",
      message: "Materi 'Adab Penuntut Ilmu' telah ditambahkan.",
      time: "Baru saja",
      read: false,
      type: "info"
    },
    {
      id: 2,
      title: "Pengingat Kuis",
      message: "Kuis Mingguan akan ditutup dalam 2 jam.",
      time: "2 jam lalu",
      read: false,
      type: "alert"
    },
    {
      id: 3,
      title: "Selamat!",
      message: "Kamu telah naik ke Level 5.",
      time: "1 hari lalu",
      read: true,
      type: "success"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
  });

  const userName = session?.user?.name || "User";
  const userAvatar = (session?.user as any)?.avatar;
  // Fallback ke dicebear jika tidak ada avatar dari database
  const displayAvatar = userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;
  // Fallback email jika tidak ada data session
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
          
          {/* Notification Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-11 w-11 flex items-center justify-center rounded-xl bg-white border-2 border-slate-200 text-slate-600 shadow-[3px_3px_0_0_#cbd5e1] hover:border-emerald-400 hover:text-emerald-600 hover:shadow-[3px_3px_0_0_#34d399] active:translate-y-[2px] active:shadow-none transition-all outline-none">
                <Bell className="h-5 w-5" strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] mt-2 overflow-hidden bg-white" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
              {/* Header Notifikasi */}
              <div className="flex items-center justify-between px-4 py-3 border-b-2 border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-emerald-500" />
                    <span className="font-black text-slate-800">Notifikasi</span>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Baca Semua
                  </button>
                )}
              </div>

              {/* List Notifikasi */}
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center">
                    <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-2xl">💤</div>
                    <p className="text-slate-500 font-bold text-sm">Belum ada notifikasi baru</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <DropdownMenuItem 
                      key={item.id} 
                      className={`
                        cursor-pointer px-4 py-3 border-b border-slate-100 last:border-0 flex items-start gap-3
                        ${!item.read ? 'bg-emerald-50/40' : 'bg-white'} 
                        hover:bg-slate-50 focus:bg-slate-50 transition-colors
                      `}
                    >
                      <div className={`
                        mt-1 h-3 w-3 rounded-full shrink-0 border-2
                        ${!item.read ? 'bg-emerald-400 border-emerald-600' : 'bg-slate-200 border-slate-300'}
                      `} />
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm leading-tight ${!item.read ? 'font-black text-slate-800' : 'font-bold text-slate-600'}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 font-medium leading-snug">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
                
                {/* --- BAGIAN INI DIPERBARUI: Tampilkan Nama & Email --- */}
                <div className="hidden sm:flex flex-col items-start justify-center text-left">
                    <span className="text-xs font-black text-slate-700 leading-none group-hover:text-emerald-700 truncate max-w-[100px] mb-0.5">
                      {userName.split(" ")[0]}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 leading-none truncate max-w-[120px]">
                      {userEmail}
                    </span>
                </div>
                {/* ---------------------------------------------------- */}

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
                <span>Keluar Aplikasi</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Bar - Slide down effect */}
      <div className="md:hidden px-4 pb-4 pt-0 border-t-2 border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="mt-4">
            <SearchBar />
        </div>
      </div>
    </div>
  );
};