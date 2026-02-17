"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import Loading from "@/components/ui/Loading";
import SearchInput from "@/components/ui/SearchInput";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import CartoonNotification from "@/components/ui/Notification";
import { 
  UserCircle2, 
  UserPlus, 
  Sparkles, 
  Search, 
  Trophy
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  role: string;
  class: string;
  avatar: string;
  points: number;
  status: "Aktif" | "Tidak Aktif";
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
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
    if(session?.user?.id){
      fetchMembers();
    }
  }, [session]);

  
  const lastFetchRef = useRef<number>(0);
  const fetchMembers = async () => {
    const now = Date.now();

    if (now - lastFetchRef.current < 30000) {
      return;                      // Hold fetch around 30s after the first fetch
    }

    lastFetchRef.current = now;
  
    try {
      const res = await fetch("/api/members");
      if (!res.ok) throw new Error("Gagal mengambil data anggota");

      const data = await res.json();
      const mapped = data.map((u: any) => ({
        id: u.id,
        name: u.name || "-",
        role: u.role || "-",
        class: u.class || "-",
        avatar: u.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (u.name || "user"),
        points: u.points || 0,
        status: u.status || "Aktif",
      }));
      setMembers(mapped);
    } catch (error) {
      console.error("Error fetching members:", error);
      setNotification({
        type: "error",
        title: "Gagal",
        message: "Gagal memuat data anggota.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = search
    ? members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    : members;

  const handleAddFriend = async (id: string, name: string) => {
    setLoading(true);
    try {
      const req = await fetch(`/api/friends`, {
        method: "POST",
        body: JSON.stringify({ 
          targetId: id
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if(req.ok){
        setNotification({
          type: "success",
          title: "Permintaan Terkirim!",
          message: `Permintaan pertemanan dikirim ke ${name}`,
        });
        return;
      }
      const res = await req.json();

      if(res.existed){
        setNotification({
          type: "warning",
          title: "Permintaan Sudah Ada!",
          message: `Sudah ada permintaan pertemanan ke ${name}`,
        });
        return;
      }
      setNotification({
        type: "error",
        title: "Permintaan Gagal Dikirim!",
        message: `Permintaan pertemanan gagal dikirim ke ${name}`,
      });
      throw new Error("gagal mengirim request pertemanan");
    }
    catch (error){
      console.error("Error sending friend request:", error);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="mb-8 lg:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-2">
                  Daftar Anggota
                </h1>
                <p className="text-slate-500 font-medium text-sm lg:text-lg">
                  Temukan teman dan lihat siapa saja anggota aktif IRMA.
                </p>
              </div>
            </div>

            {/* Search & Suggestions */}
            <div className="space-y-6 mb-8 lg:mb-10">
              <div className="w-full md:max-w-md">
                <SearchInput
                  placeholder="Cari nama anggota..."
                  value={search}
                  onChange={setSearch}
                />
              </div>

              {/* Suggestion Box */}
              {search && filteredMembers.length > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border-2 border-teal-100 rounded-xl text-teal-700 animate-in fade-in slide-in-from-left-2">
                    <Sparkles className="h-4 w-4 text-teal-500 fill-teal-500" />
                    <p className="text-xs md:text-sm font-bold">
                        Menemukan: <span className="underline decoration-2 underline-offset-2">{filteredMembers[0].name}</span>
                        {filteredMembers.length > 1 && <span className="font-normal opacity-80"> +{filteredMembers.length - 1} lainnya</span>}
                    </p>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-20">
                <Loading text="Sedang memanggil anggota..." />
              </div>
            ) : (
              <>
                {/* --- GRID ANGGOTA --- */}
                {filteredMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white rounded-4xl border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] hover:border-teal-400 hover:shadow-[4px_4px_0_0_#34d399] transition-all duration-300 overflow-hidden group hover:-translate-y-1 flex flex-col"
                      >
                        {/* Header Card (Banner & Avatar) */}
                        <div className="pt-6 px-6 flex flex-col items-center">
                            {/* Avatar Wrapper (Tanpa Badge Status) */}
                            <div className="relative mb-3 group-hover:scale-105 transition-transform duration-500">
                                <div className="w-24 h-24 rounded-full p-1 bg-white border-4 border-slate-100 shadow-md overflow-hidden">
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-full h-full object-cover rounded-full bg-slate-50"
                                    />
                                </div>
                            </div>
                            
                            {/* Name & Role */}
                            <div className="text-center w-full">
                                <h3 className="text-xl font-black text-slate-800 truncate px-2">
                                    {member.name}
                                </h3>
                                <p className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-0.5 rounded-full inline-block border border-teal-100 mt-1">
                                    {member.role}
                                </p>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                    {member.class}
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
                                <span className="text-lg font-black text-amber-600">{member.points}</span>
                            </div>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1 min-h-4"></div>

                        {/* Action Buttons */}
                        <div className="p-4 bg-slate-50 border-t-2 border-slate-100 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => router.push(`/members/${member.id}`)}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm shadow-[0_2px_0_0_#cbd5e1] hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#34d399] active:border-b-2 active:translate-y-0.5 transition-all"
                            >
                                <UserCircle2 className="h-4 w-4" />
                                Profile
                            </button>

                            <button
                                onClick={() => handleAddFriend(member.id, member.name)}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-400 border-2 border-teal-600 text-white font-bold text-sm shadow-[0_2px_0_0_#0f766e] hover:bg-teal-500 active:border-b-2 active:translate-y-0.5 transition-all"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add
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
                        Anggota Tidak Ditemukan
                    </h3>
                    <p className="text-slate-500 max-w-xs md:max-w-md text-sm md:text-base px-4">
                        Kami tidak dapat menemukan anggota dengan nama <span className="font-bold text-teal-600">"{search}"</span>.
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
          </div>
        </div>
      </div>
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
  );
};

export default Members;