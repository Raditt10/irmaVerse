"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/DashboardHeader";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/ChatbotButton";
import { Calendar, Clock, Search, BookOpen, Sparkles, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AddButton from "@/components/ui/AddButton";

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
  const [selectedInstructor, setSelectedInstructor] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: session } = useSession({
      required: true,
      onUnauthenticated() {
          if (typeof window !== "undefined") {
              window.location.href = "/auth";
          }
      }
  });

  // Cek Role: Apakah Admin atau Instruktur?
  const isPrivileged = session?.user?.role === "instruktur" || session?.user?.role === "admin";
  const programCategories = ["Semua", "Program Wajib", "Program Ekstra", "Program Next Level"];
  const classCategories = ["Semua", "Kelas 10", "Kelas 11", "Kelas 12"];

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, selectedProgram, selectedGrade, selectedInstructor, searchQuery]);

  const filterMaterials = async () => {
    const filtered = materials.filter((material) => {
      const matchesProgram =
        selectedProgram === "Semua" || material.category === selectedProgram;
      const matchesGrade =
        selectedGrade === "Semua" || material.grade === selectedGrade;
      const matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesProgram && matchesGrade && matchesSearch;
    });

    setFilteredMaterials(filtered);
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials");
      if (!res.ok) throw new Error("Failed fetch materials");

      const data = await res.json()

      setMaterials(data);
      setFilteredMaterials(data);
    } catch (error: any) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            
            {/* --- HEADER --- */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
                  {isPrivileged ? "Kelola Kajian" : "Kajian Mingguanku"}
                </h1>
                <p className="text-slate-500 text-lg font-medium">
                  {isPrivileged 
                    ? "Atur jadwal dan materi kajian untuk anggota"
                    : "Ikuti kajian seru bareng teman-teman!"
                  }
                </p>
              </div>
              
              {/* Tombol Buat Kajian untuk Instruktur/Admin */}
              {isPrivileged && (
                <AddButton
                  label="Buat Kajian"
                  onClick={() => router.push("/materials/create")}
                  icon={<Plus className="h-5 w-5" />}
                  color="emerald"
                  hideIcon={false}
                />
              )}
            </div>

            {/* Filters */}
            <div className="grid gap-6 mb-8 lg:grid-cols-[1fr_auto]">
              <div className="space-y-4">
                {/* Program Filter */}
                <div className="flex flex-wrap gap-3">
                  {programCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedProgram(category)}
                      className={`px-5 py-2 rounded-xl font-bold border-2 transition-all duration-200 ${
                        selectedProgram === category
                          ? "bg-teal-400 text-white border-teal-600 shadow-[0_4px_0_0_#0d9488] -translate-y-1"
                          : "bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-500 hover:shadow-[0_4px_0_0_#cbd5e1] hover:-translate-y-1"
                      } active:translate-y-0 active:shadow-none`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Class Filter */}
                <div className="flex flex-wrap gap-3">
                  {classCategories.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`px-4 py-1.5 rounded-xl font-bold border-2 text-sm transition-all duration-200 ${
                        selectedGrade === grade
                          ? "bg-emerald-400 text-white border-emerald-600 shadow-[0_3px_0_0_#059669] -translate-y-0.5"
                          : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-500 hover:shadow-[0_3px_0_0_#cbd5e1] hover:-translate-y-0.5"
                      } active:translate-y-0 active:shadow-none`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-80 self-start">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari materi / ustadz..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 rounded-2xl border-2 border-slate-200 focus:border-teal-400 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.2)] bg-white transition-colors duration-200 hover:border-emerald-500"
                />
              </div>
            </div>

            {/* Content Grid */}
            {loading ? (
              <div className="text-center py-20">
                <Sparkles className="h-10 w-10 text-teal-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-bold">Memuat kajian...</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-slate-100 border-dashed">
                <p className="text-slate-400 font-bold text-xl">Yah, tidak ada kajian yang cocok 😔</p>
                <button 
                  onClick={() => {setSelectedProgram("Semua"); setSelectedGrade("Semua"); setSearchQuery("")}}
                  className="mt-4 text-teal-500 font-bold underline decoration-wavy hover:text-teal-600"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1] hover:border-emerald-400 hover:shadow-[0_8px_0_0_#34d399] transition-all duration-300 overflow-hidden group hover:-translate-y-2 flex flex-col h-full"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-52 overflow-hidden border-b-2 border-slate-100">
                      <img
                        src={material.thumbnailUrl}
                        alt={material.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Badge: Baru */}
                      {!material.isJoined && (
                        <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-white shadow-md animate-bounce">
                          BARU!
                        </span>
                      )}

                      {/* Badge: Category */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-lg bg-teal-400 text-white text-xs font-bold border-2 border-teal-600 shadow-[0_2px_0_0_#0f766e]">
                          {material.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex-1">
                        {/* Class Badge Inline */}
                        {material.grade && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-200 mb-2 uppercase tracking-wide">
                            {material.grade}
                          </span>
                        )}
                        
                        <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-teal-600 transition-colors line-clamp-2">
                          {material.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-4">
                           <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                             <span className="text-xs">👤</span>
                           </div>
                           <p className="text-slate-500 font-bold text-sm">{material.instructor || "TBA"}</p>
                        </div>

                        {/* Info Row */}
                        <div className="flex items-center gap-4 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <Calendar className="h-4 w-4 text-teal-400" />
                            <span>
                              {new Date(material.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <div className="w-px h-4 bg-slate-300"></div>
                          {material.startedAt && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                              <Clock className="h-4 w-4 text-teal-400" />
                              <span>{material.startedAt}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* --- BUTTON ACTION DINAMIS --- */}
                      <div className="mt-auto">
                        {isPrivileged ? (
                          // Tombol untuk Instruktur/Admin (Pop Style Green)
                           <button
                             onClick={() => router.push(`/materials/${material.id}/edit`)}
                             className="w-full py-3 rounded-xl bg-emerald-400 text-white font-black border-2 border-emerald-600 border-b-4 hover:bg-emerald-500 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 group/btn"
                           >
                             <Sparkles className="w-4 h-4 group-hover/btn:animate-spin" /> Edit Kajian
                           </button>
                        ) : (
                          // Tombol untuk User Biasa
                          ["3","4"].includes(material.id) ? (
                             <div className="space-y-3">
                               <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-xs bg-emerald-50 py-1 rounded-lg justify-center text-center">
                                 <span className="w-full text-center">Kamu sudah mengikuti kajian ini, pada tanggal {material.date}.</span>
                               </div>
                               <button
                                 onClick={() => router.push(`/materials/${material.id}/recap`)}
                                 className="w-full py-3 rounded-xl bg-cyan-400 text-white font-black border-2 border-cyan-600 border-b-4 hover:bg-cyan-500 active:border-b-2 active:translate-y-[2px] transition-all"
                               >
                                 Lihat Rekapan
                               </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => router.push(`/materials/${material.id}/absensi`)}
                              className="w-full py-3 rounded-xl bg-teal-400 text-white font-black border-2 border-teal-600 border-b-4 hover:bg-teal-500 active:border-b-2 active:translate-y-[2px] transition-all shadow-lg hover:shadow-teal-200"
                            >
                              Aku Ikut! ✋
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatbotButton />
    </div>
  );
};

export default Materials;