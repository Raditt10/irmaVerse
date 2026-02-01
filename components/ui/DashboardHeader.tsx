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
  Info
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

  // Fungsi tandai semua sudah dibaca
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/auth";
    }
  });

  const defaultAvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatimah";
  // Gunakan avatar jika ada, jika tidak fallback ke default
  // Pastikan userAvatar selalu string
  let userAvatar: string = defaultAvatarUrl;
  if (session?.user && typeof session.user === 'object' && 'avatar' in session.user) {
    const avatarVal = (session.user as any).avatar;
    if (typeof avatarVal === 'string') userAvatar = avatarVal || defaultAvatarUrl;
  }
  const userName = session?.user?.name || session?.user?.email || "User";
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm font-sans" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
      <div className="flex items-center justify-between gap-4 h-16">
        
        {/* Logo - Left */}
        <div className="flex items-center gap-3 shrink-0 pl-6 lg:pl-8">
          {/* Mobile burger button */}
          <button
            className="lg:hidden mr-1 inline-flex items-center justify-center h-10 w-10 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => window.dispatchEvent(new Event('open-mobile-sidebar'))}
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <img src="/logo.png" alt="IRMA Verse" className="h-10 w-10 object-contain" />
          
          <div className="block">
            <h2 className="text-base sm:text-lg font-bold text-emerald-600">
              IRMA VERSE
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500">Platform Digital Irma 13</p>
          </div>
        </div>

        {/* Search Bar - Center on desktop */}
        <div className="hidden md:flex flex-1 max-w-md">
          <SearchBar />
        </div>

        {/* Right Icons & Profile */}
        <div className="flex items-center gap-4 shrink-0 pr-6 lg:pr-8">
          
          {/* --- NOTIFICATION DROPDOWN --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                <Bell className="h-5 w-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl shadow-xl border border-slate-100" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
              {/* Header Notifikasi */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <span className="font-bold text-slate-800">Notifikasi</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Tandai dibaca
                  </button>
                )}
              </div>

              {/* List Notifikasi */}
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Tidak ada notifikasi baru
                  </div>
                ) : (
                  notifications.map((item) => (
                    <DropdownMenuItem 
                      key={item.id} 
                      className={`
                        cursor-pointer px-4 py-3 border-b border-slate-50 last:border-0 flex items-start gap-3
                        ${!item.read ? 'bg-emerald-50/30' : 'bg-white'} 
                        hover:bg-slate-50 transition-colors focus:bg-slate-50
                      `}
                    >
                      {/* Icon Indikator */}
                      <div className={`
                        mt-1 h-2 w-2 rounded-full shrink-0
                        ${!item.read ? 'bg-emerald-500' : 'bg-slate-300'}
                      `} />
                      
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm leading-none ${!item.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 leading-snug">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              
              {/* Footer Notifikasi */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                <button className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-200">
                  Lihat Semua Notifikasi
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-10 px-2 rounded-lg hover:bg-green-100 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                <Avatar className="h-8 w-8 border border-slate-200">
                  <AvatarImage src={userAvatar} alt={userName} className="object-cover" />
                  <AvatarFallback className="bg-linear-to-br from-emerald-500 to-cyan-500 text-white text-xs font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-semibold text-slate-900 truncate max-w-[150px]">
                  {userName}
                </span>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-100">
                    <AvatarImage src={userAvatar} alt={userName} className="object-cover" />
                    <AvatarFallback className="bg-linear-to-br from-emerald-500 to-cyan-500 text-white font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-900 truncate">{userName}</span>
                    <span className="text-xs text-slate-500 truncate">{session?.user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <div className="h-px bg-slate-100 my-1" />
              
              <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-slate-50">
                <UserIcon className="h-4 w-4 text-slate-500" />
                <span>Profile</span> 
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push("/level")} className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-slate-50">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <span>Progress level saya</span> 
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-slate-50">
                <Settings className="h-4 w-4 text-slate-500" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
              
              <div className="h-px bg-slate-100 my-1" />
              
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/auth" })}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 gap-2 py-2.5 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Bar - Below main header */}
      <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-50">
        <SearchBar />
      </div>
    </div>
  );
};