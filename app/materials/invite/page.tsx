"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/DashboardHeader";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/ChatbotButton";
import { Calendar, Clock, Search, Sparkles, Plus, Users, BookOpen, Layers, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Material {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category?: string;
  grade?: string;
  startedAt?: string;
  date: string;
  participants?: number;
  thumbnailUrl?: string;
  isJoined: boolean;
}

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [selectedProgram, setSelectedProgram] = useState("Semua");
  const [selectedGrade, setSelectedGrade] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    },
  });

  const userRole = session?.user?.role;
  const isPrivileged = userRole === "instruktur" || userRole === "admin";

  const programCategories = ["Semua", "Program Wajib", "Program Ekstra", "Program Next Level"];
  const classCategories = ["Semua", "Kelas 10", "Kelas 11", "Kelas 12"];

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, selectedProgram, selectedGrade, searchQuery]);

  const filterMaterials = async () => {
    const filtered = materials.filter((material) => {
      const matchesProgram = selectedProgram === "Semua" || material.category === selectedProgram;
      const matchesGrade = selectedGrade === "Semua" || material.grade === selectedGrade;
      const matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesProgram && matchesGrade && matchesSearch;
    });

    setFilteredMaterials(filtered);
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials");
      if (!res.ok) throw new Error("Failed fetch materials");
      const data = await res.json();
      setMaterials(data);
      setFilteredMaterials(data);
    } catch (error: any) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return null;

  // Pisahkan Kajian Mendatang untuk Tampilan Admin
  const upcomingMaterials = filteredMaterials.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FDFBF7]" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            
            {/* --- HEADER MANAGEMENT --- */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-dotted border-slate-200 pb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-teal-100 p-2 rounded-xl border-2 border-teal-600 shadow-[4px_4px_0_0_#0d9488]">
                    <Settings2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="text-teal-600 font-black uppercase tracking-widest text-sm">Panel {userRole}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight mb-3">
                  {isPrivileged ? "Manajemen Kajian" : "Kajian Mingguanku"}
                </h1>
                <p className="text-slate-500 text-xl font-medium max-w-2xl">
                  {isPrivileged 
                    ? "Kelola materi, pantau peserta, dan buat jadwal kajian baru secara efisien."
                    : "Temukan materi seru untuk menambah skill dan imanmu!"
                  }
                </p>
              </div>

              {isPrivileged && (
                <button
                  onClick={() => router.push("/materials/create")}
                  className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-white transition-all duration-200 bg-teal-400 border-4 border-teal-600 rounded-3xl shadow-[0_12px_0_0_#0d9488] hover:shadow-[0_6px_0_0_#0d9488] hover:translate-y-[6px] active:shadow-none active:translate-y-[12px]"
                >
                  <Plus className="w-8 h-8 mr-2 stroke-[4]" />
                  <span className="text-2xl">Posting Materi</span>
                </button>
              )}
            </div>

            {/* --- ADMIN QUICK STATS --- */}
            {isPrivileged && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-[2rem] border-4 border-slate-200 shadow-[8px_8px_0_0_#cbd5e1] flex items-center gap-5">
                   <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center border-2 border-blue-600 shadow-[4px_4px_0_0_#2563eb]">
                      <BookOpen className="text-blue-600 w-8 h-8" />
                   </div>
                   <div>
                      <p className="text-slate-500 font-bold">Total Materi</p>
                      <h4 className="text-3xl font-black">{materials.length}</h4>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-4 border-slate-200 shadow-[8px_8px_0_0_#cbd5e1] flex items-center gap-5">
                   <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center border-2 border-amber-600 shadow-[4px_4px_0_0_#d97706]">
                      <Users className="text-amber-600 w-8 h-8" />
                   </div>
                   <div>
                      <p className="text-slate-500 font-bold">Total Peserta</p>
                      <h4 className="text-3xl font-black">1.2k+</h4>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-4 border-slate-200 shadow-[8px_8px_0_0_#cbd5e1] flex items-center gap-5">
                   <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center border-2 border-emerald-600 shadow-[4px_4px_0_0_#059669]">
                      <Layers className="text-emerald-600 w-8 h-8" />
                   </div>
                   <div>
                      <p className="text-slate-500 font-bold">Kategori Aktif</p>
                      <h4 className="text-3xl font-black">4</h4>
                   </div>
                </div>
              </div>
            )}

            {/* --- FILTERS --- */}
            <div className="bg-slate-100/50 p-6 rounded-[2.5rem] mb-12 border-2 border-slate-200/50">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {programCategories.map((category) => (
                      <button key={category} onClick={() => setSelectedProgram(category)} className={`px-5 py-2 rounded-xl font-bold border-2 transition-all duration-200 ${selectedProgram === category ? "bg-teal-400 text-white border-teal-600 shadow-[0_4px_0_0_#0d9488] -translate-y-1" : "bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:shadow-[0_4px_0_0_#cbd5e1] hover:-translate-y-1"}`}>{category}</button>
                    ))}
                  </div>
                </div>
                <div className="relative w-full lg:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input type="text" placeholder="Cari berdasarkan judul atau instruktur..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 py-7 rounded-2xl border-2 border-slate-200 focus:border-teal-400 bg-white font-bold" />
                </div>
              </div>
            </div>

            {/* --- KAJIAN MENDATANG SECTION (ADMIN ONLY) --- */}
            {isPrivileged && filteredMaterials.length > 0 && (
               <div className="mb-16">
                  <div className="flex items-center gap-2 mb-8">
                     <span className="text-2xl">🔥</span>
                     <h2 className="text-3xl font-black text-slate-800">Kajian Mendatang (Highlight)</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {upcomingMaterials.map((material) => (
                        <div key={`up-${material.id}`} className="bg-emerald-50 rounded-[2.5rem] border-4 border-emerald-200 p-2 relative overflow-hidden">
                           <div className="absolute top-4 right-4 z-10 bg-white px-4 py-1 rounded-full border-2 border-emerald-600 font-black text-emerald-600 text-xs shadow-sm">
                              URGENT
                           </div>
                           <div className="bg-white rounded-[2rem] p-6 h-full border-2 border-emerald-100">
                              <h3 className="text-xl font-black mb-4 line-clamp-1">{material.title}</h3>
                              <div className="flex items-center gap-3 text-slate-500 font-bold text-sm mb-4">
                                 <Calendar className="w-4 h-4 text-emerald-500" /> {material.date}
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                 <Users className="w-4 h-4 text-emerald-500" /> 45 Peserta
                              </div>
                              <button onClick={() => router.push(`/materials/${material.id}/edit`)} className="w-full py-3 rounded-xl bg-white text-emerald-600 font-black border-2 border-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">
                                 Kelola Sesi Ini
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* --- SEMUA DAFTAR MATERI --- */}
            <div className="flex items-center gap-2 mb-8">
               <span className="text-2xl">{isPrivileged ? "📁" : "📖"}</span>
               <h2 className="text-3xl font-black text-slate-800">{isPrivileged ? "Semua Database Materi" : "Pilihan Materi Untukmu"}</h2>
            </div>

            {loading ? (
              <div className="text-center py-24">
                <Sparkles className="h-16 w-16 text-teal-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-black text-2xl">Sinkronisasi data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredMaterials.map((material) => (
                  <div key={material.id} className="bg-white rounded-[3rem] border-2 border-slate-200 shadow-[0_12px_0_0_#cbd5e1] hover:border-teal-400 hover:shadow-[0_12px_0_0_#2dd4bf] transition-all duration-300 flex flex-col h-full group hover:-translate-y-3">
                    <div className="relative h-60 overflow-hidden rounded-t-[2.8rem]">
                      <img src={material.thumbnailUrl || `https://picsum.photos/seed/${material.id}/400/300`} alt={material.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <span className="px-4 py-1.5 rounded-xl bg-teal-400 text-white text-sm font-black border-2 border-teal-600 shadow-[0_4px_0_0_#0f766e]">
                          {material.category}
                        </span>
                        <span className="px-4 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-black border-2 border-slate-200 shadow-[0_4px_0_0_#cbd5e1]">
                          {material.grade || "Semua Kelas"}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-slate-800 mb-4 line-clamp-2 leading-tight group-hover:text-teal-600 transition-colors">{material.title}</h3>
                        <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                           <div className="w-10 h-10 rounded-full bg-teal-100 border-2 border-teal-500 flex items-center justify-center font-black text-teal-600">
                              {material.instructor.charAt(0)}
                           </div>
                           <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Instruktur</p>
                              <p className="text-slate-700 font-black">{material.instructor}</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                              <Calendar className="w-5 h-5 text-teal-400" /> {material.date}
                           </div>
                           <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                              <Clock className="w-5 h-5 text-teal-400" /> {material.startedAt}
                           </div>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {isPrivileged ? (
                          <div className="grid grid-cols-2 gap-3">
                             <button onClick={() => router.push(`/materials/${material.id}/edit`)} className="py-4 rounded-2xl bg-white text-slate-800 font-black border-2 border-slate-200 border-b-4 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all">
                               ⚙️ Edit
                             </button>
                             <button onClick={() => router.push(`/materials/${material.id}/participants`)} className="py-4 rounded-2xl bg-emerald-400 text-white font-black border-2 border-emerald-600 border-b-4 hover:bg-emerald-500 active:border-b-0 active:translate-y-1 transition-all shadow-md">
                               👥 Peserta
                             </button>
                          </div>
                        ) : (
                          <button onClick={() => router.push(`/materials/${material.id}/absensi`)} className="w-full py-4 rounded-2xl bg-teal-400 text-white font-black border-2 border-teal-600 border-b-4 hover:bg-teal-500 active:border-b-0 active:translate-y-1 transition-all shadow-lg text-lg">
                            Ikuti Sekarang ✋
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <ChatbotButton />
    </div>
  );
};

export default Materials;