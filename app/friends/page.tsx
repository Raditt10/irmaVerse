"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import Loading from "@/components/ui/Loading";
import SearchInput from "@/components/ui/SearchInput";
import CartoonNotification from "@/components/ui/Notification";
import { 
  UserCircle2, 
  UserPlus, 
  UserMinus,
  Sparkles, 
  Search, 
  Trophy
} from "lucide-react";

interface Friends {
  rowId: string,
  id: string,
  name: string,
  role: string,
  avatar: string,
  class: string,
  points: string,
  status: "Pending" | "Friend",
}

export default function FriendPage() {
  const [friends, setFriends] = useState<Friends[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingFriends, setPendingFriends] = useState<Friends[]>([]);

  // Notification State
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const router = useRouter();

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/auth";
    }
  });
  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    setLoading(true);
    try{  
      const res = await fetch("/api/friends", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        switch(data.code){
          case "NOT_FOUND":
            throw new Error("Belum ada data pertemanan");
          case "NO_FRIENDS":
            throw new Error("Kamu belum memiliki teman dan belum ada permintaan pertemanan");
          default:
            throw new Error("Gagal Mengambil data pertemanan");
        }
      };

      const friends = data.filter(
        (f) => f.status == "Friend"
      );
      
      const pendingFriends = data.filter(
        (f) => f.status == "Pending"
      );
      
      setPendingFriends(pendingFriends);
      setFriends(friends);
    }catch(error){
      console.error("Error fetching friend requests: ", error);
    }finally{
      setLoading(false);
    }
  };

  const handleAcceptFriend = async (rowid: string, id: string, name: string) => {
    setLoading(true);
    try {
      const req = await fetch(`/api/friends/accept`, {
        method: "POST",
        body: JSON.stringify({ 
          rowId: rowid,
          targetId: id
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      const res = await req.json();

      if(!req.ok){
        switch(res.code){
          case "NOT_FOUND":
            setNotification({
              type: "error",
              title: "Permintaan Gagal Tidak ada!",
              message: `Permintaan pertemanan dengan ${name} tidak ditemukan.`,
            });
            throw new Error("Permintaan pertemanan tidak ditemukan");
          case "SELF_ACCEPT":
            setNotification({
              type: "error",
              title: "Tidak Bisa Menerima Permintaan Pertemanan!",
              message: `Anda tidak dapat menerima permintaan pertemanan dari diri sendiri.`,
            });
            throw new Error("Permintaan pertemanan tidak valid");
          case "ALREADY_FRIENDS":
            setNotification({
              type: "error",
              title: "Sudah Berteman!",
              message: `Kamu sudah berteman dengan ${name}.`,
            });
            throw new Error("Kamu sudah berteman dengan pengguna ini");
          default:
            setNotification({
              type: "error",
              title: "Permintaan Gagal Diterima!",
              message: `Permintaan pertemanan dengan ${name} gagal diterima`,
            });
            throw new Error("Permintaan pertemanan gagal diterima: " + res.message);
        }
      }
      setNotification({
          type: "success",
          title: "Permintaan Diterima!",
          message: `Permintaan pertemanan ${name}diterima`,
        });
    }
    catch (error){
      console.error("Error accepting friend request:", error);
    }finally{
      setLoading(false);
    }
  };

  const handleRejectFriend = async (rowId: string, id: string, name: string) => {
    setLoading(true);
    try{
      const req = await fetch('/api/friends/reject',{
        method: "POST",
        body: JSON.stringify({
          rowId: rowId,
          targetId: id
        }),
        headers: {
          "Content-Type": "application/json"
         }
      });
      const res = await req.json();

      if (!req.ok) {
        switch(res.code){
          case "NOT_FOUND":
            setNotification({
              type: "error",
              title: "Gagal Menolak Permintaan Pertemanan!",
              message: `Data pertemanan dengan ${name} tidak ditemukan.`,
            });
            throw new Error("Data pertemanan tidak ditemukan");
          case "SELF_REJECT":
            setNotification({
              type: "error",
              title: "Gagal Menolak Permintaan Pertemanan!",
              message: `Anda tidak dapat menolak permintaan pertemanan sendiri.`,
            });
            throw new Error("Tidak dapat menolak permintaan pertemanan sendiri");
          case "DUPLICATE":
            setNotification({
              type: "error",
              title: "Permintaan pertemanan duplikat!",
              message: `Gagal menolak permintaan pertemanan dengan ${name}.`,
            });
            throw new Error("Data duplikat");
          default:
            throw new Error("Gagal Mengambil data pertemanan. " + res.message);
        }
      };

      setNotification({
        type: "success",
        title: "Permintaan pertemanan ditolak",
        message: `Permintaan pertemanan ${name} berhasil ditolak`,
      });
    }catch(error){
      throw new Error("Error rejecting friend request: " + error);
    }finally{
      setLoading(false);
    }
  }

  const filteredFriends = search 
  ? friends.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
  : friends;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* <p className="text-slate-500 min-h-screen text-center">Halaman pertemanan dalam pengembangan</p> */}
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="max-w-7xl mx-auto"></div>

          {/* Search & Suggestions */}
          <div className="space-y-6 mb-8 lg:mb-10">
            <div className="w-full md:max-w-md">
              <SearchInput
                placeholder="Cari nama teman..."
                value={search}
                onChange={setSearch}
              />
            </div>

            {/* Suggestion Box */}
            {search && filteredFriends.length > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border-2 border-teal-100 rounded-xl text-teal-700 animate-in fade-in slide-in-from-left-2">
                  <Sparkles className="h-4 w-4 text-teal-500 fill-teal-500" />
                  <p className="text-xs md:text-sm font-bold">
                      Menemukan: <span className="underline decoration-2 underline-offset-2">{filteredFriends[0].name}</span>
                      {filteredFriends.length > 1 && <span className="font-normal opacity-80"> +{filteredFriends.length - 1} lainnya</span>}
                  </p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Loading text="Sedang memanggil teman..." />
            </div>
          ) : (
            <>
              {friends.length <= 0 ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center animate-in fade-in zoom-in duration-300 bg-white rounded-[2.5rem] border-2 border-slate-200 border-dashed">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner border border-slate-100">
                      <Search className="h-8 w-8 md:h-10 md:w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-700 mb-2">
                      kamu belum memiliki teman
                  </h3>
                  <p className="text-slate-500 max-w-xs md:max-w-md text-sm md:text-base px-4">
                      Cobalah menambahkan teman terlebih dahulu.
                  </p>
                  <button
                    onClick={() => router.push(`/members`)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm shadow-[0_2px_0_0_#cbd5e1] hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#34d399] active:border-b-2 active:translate-y-0.5 transition-all"
                  >
                    <UserCircle2 className="h-4 w-4" />
                    Pergi ke halaman anggota
                  </button>
                </div>
              ) : (
                <>
                {/* --- FRIENDS GRID --- */}
                <h2 className="text-2xl font-black text-slate-800 mt-12 mb-6">
                  Temanmu
                </h2>
                {filteredFriends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFriends.map((friends) => (
                      <div
                        key={friends.id}
                        className="bg-white rounded-4xl border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] hover:border-teal-400 hover:shadow-[4px_4px_0_0_#34d399] transition-all duration-300 overflow-hidden group hover:-translate-y-1 flex flex-col"
                      >
                        {/* Header Card (Banner & Avatar) */}
                        <div className="pt-6 px-6 flex flex-col items-center">
                            {/* Avatar Wrapper (Tanpa Badge Status) */}
                            <div className="relative mb-3 group-hover:scale-105 transition-transform duration-500">
                                <div className="w-24 h-24 rounded-full p-1 bg-white border-4 border-slate-100 shadow-md overflow-hidden">
                                    <img
                                        src={friends.avatar}
                                        alt={friends.name}
                                        className="w-full h-full object-cover rounded-full bg-slate-50"
                                    />
                                </div>
                            </div>
                            
                            {/* Name & Role */}
                            <div className="text-center w-full">
                                <h3 className="text-xl font-black text-slate-800 truncate px-2">
                                    {friends.name}
                                </h3>
                                <p className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-0.5 rounded-full inline-block border border-teal-100 mt-1">
                                    {friends.role}
                                </p>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                    {friends.class}
                                </p>
                            </div>
                        </div>

                        {/* Points Section */}
                        <div className="mt-4 px-6">
                            <div className="bg-amber-50 rounded-2xl p-3 border-2 border-amber-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                                        <Trophy className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-amber-800">Poin Keaktifan</span>
                                </div>
                                <span className="text-lg font-black text-amber-600">{friends.points}</span>
                            </div>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1 min-h-4"></div>

                        {/* Action Buttons */}
                        <div className="p-4 bg-slate-50 border-t-2 border-slate-100 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => router.push(`/members/${friends.id}`)}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm shadow-[0_2px_0_0_#cbd5e1] hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#34d399] active:border-b-2 active:translate-y-0.5 transition-all"
                            >
                                <UserCircle2 className="h-4 w-4" />
                                Profile
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* --- EMPTY STATE --- */
                  <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center animate-in fade-in zoom-in duration-300 bg-white rounded-[2.5rem] border-2 border-slate-200 border-dashed">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner border border-slate-100">
                        <Search className="h-8 w-8 md:h-10 md:w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-700 mb-2">
                        Teman Tidak Ditemukan
                    </h3>
                    <p className="text-slate-500 max-w-xs md:max-w-md text-sm md:text-base px-4">
                        Kami tidak dapat menemukan Teman dengan nama <span className="font-bold text-teal-600">"{search}"</span>.
                    </p>
                    <button 
                        onClick={() => setSearch("")}
                        className="mt-6 md:mt-8 px-6 py-2.5 bg-slate-100 border-2 border-slate-200 text-slate-600 rounded-xl hover:bg-white hover:border-teal-400 hover:text-teal-600 font-bold transition-all shadow-sm"
                    >
                        Hapus Pencarian
                    </button>
                  </div>
                )}
                </>
              )}

              {/* --- PENDING FRIEND REQUESTS --- */}
              {pendingFriends.length > 0 && (
                <>
                  <h2 className="text-2xl font-black text-slate-800 mt-12 mb-6">
                    Permintaan Pertemanan
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="bg-white rounded-4xl border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] hover:border-teal-400 hover:shadow-[4px_4px_0_0_#34d399] transition-all duration-300 overflow-hidden group hover:-translate-y-1 flex flex-col"
                      >
                        {/* Header Card (Banner & Avatar) */}
                        <div className="pt-6 px-6 flex flex-col items-center">
                          {/* Avatar Wrapper (Tanpa Badge Status) */}
                          <div className="relative mb-3 group-hover:scale-105 transition-transform duration-500">
                            <div className="w-24 h-24 rounded-full p-1 bg-white border-4 border-slate-100 shadow-md overflow-hidden">
                              <img
                                src={friend.avatar}
                                alt={friend.name}
                                className="w-full h-full object-cover rounded-full bg-slate-50"
                              />
                            </div>
                          </div>
                            
                          {/* Name & Role */}
                          <div className="text-center w-full">
                            <h3 className="text-xl font-black text-slate-800 truncate px-2">
                              {friend.name}
                            </h3>
                            <p className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-0.5 rounded-full inline-block border border-teal-100 mt-1">
                              {friend.role}
                            </p>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                              {friend.class}
                            </p>
                          </div>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1 min-h-4"></div>

                        {/* Action Buttons */}
                        <div className="p-4 bg-slate-50 border-t-2 border-slate-100 grid grid-cols-2 gap-3">
                          <button
                            onClick={() => router.push(`/members/${friend.id}`)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm shadow-[0_2px_0_0_#cbd5e1] hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#34d399] active:border-b-2 active:translate-y-0.5 transition-all"
                          >
                            <UserCircle2 className="h-4 w-4" />
                            Profile
                          </button>
                          <button
                            onClick={() =>handleAcceptFriend(friend.rowId, friend.id, friend.name)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm shadow-[0_2px_0_0_#cbd5e1] hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#34d399] active:border-b-2 active:translate-y-0.5 transition-all"
                          >
                            <UserPlus className="h-4 w-4" />
                            Terima Pertemanan
                          </button>
                          <button
                            onClick={() =>handleRejectFriend(friend.rowId, friend.id, friend.name)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm shadow-[0_2px_0_0_#cbd5e1] hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#34d399] active:border-b-2 active:translate-y-0.5 transition-all"
                          >
                            <UserMinus className="h-4 w-4" />
                            Tolak Pertemanan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )} 
          <ChatbotButton />

          {/* --- NOTIFIKASI --- */}
          {notification && (
            <CartoonNotification
              type={notification.type}
              title={notification.title}
              message={notification.message}
              duration={3000}
              onClose={() => setNotification(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
