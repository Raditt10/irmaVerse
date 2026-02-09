"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import Loading from "@/components/ui/Loading";
import SuccessDataFound from "@/components/ui/SuccessDataFound";
import SearchInput from "@/components/ui/SearchInput";
import EmptyState from "@/components/ui/EmptyState";
import { ArrowRight, Trophy, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import DeleteButton from "@/components/ui/DeleteButton";
import ButtonEdit from "@/components/ui/ButtonEdit";

interface CompetitionItem {
  id: string;
  title: string;
  date: string;
  prize: string;
  category: "Tahfidz" | "Seni" | "Bahasa" | "Lainnya";
  image: string;
  instructor: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

const badgeStyles: Record<CompetitionItem["category"], string> = {
  Tahfidz: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Seni: "bg-purple-100 text-purple-700 border-purple-200",
  Bahasa: "bg-blue-100 text-blue-700 border-blue-200",
  Lainnya: "bg-slate-100 text-slate-700 border-slate-200"
};

const Competitions = () => {
  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/competitions");
      const data = await response.json();
      
      if (!response.ok) {
        console.error("API error:", data);
        throw new Error(data.error || "Failed to fetch");
      }
      
      setCompetitions(data);
    } catch (error) {
      console.error("Error fetching competitions:", error);
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = "Gagal menghapus kompetisi";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // Jika response body bukan JSON, gunakan status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setCompetitions(competitions.filter((c) => c.id !== competitionId));
    } catch (error) {
      console.error("Error deleting competition:", error);
      alert(error instanceof Error ? error.message : "Gagal menghapus kompetisi");
    }
  };

  const filteredCompetitions = competitions.filter((comp) =>
    comp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-h-screen bg-[#FDFBF7]"
    >
      <DashboardHeader/>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 px-6 lg:px-8 py-12 lg:ml-0">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
                  Info Perlombaan
                </h1>
                <p className="text-slate-500 text-lg font-medium">
                  Tunjukkan bakatmu di ajang bergengsi ini!
                </p>
              </div>
              {session?.user?.role === "instruktur" && (
                <button
                  onClick={() => router.push("/competitions/create")}
                  className="px-6 py-3 rounded-2xl bg-emerald-400 text-white font-black border-2 border-emerald-600 border-b-4 hover:bg-emerald-500 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg hover:shadow-emerald-200"
                >
                  + Tambah Lomba
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <SearchInput
                placeholder="Cari lomba..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-full md:w-96"
              />
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-20">
                <Loading text="Memuat data lomba..." />
              </div>
            ) : filteredCompetitions.length === 0 ? (
              <EmptyState
                icon={competitions.length === 0 ? "calendar" : "search"}
                title={competitions.length === 0 ? "Belum Ada Lomba" : "Lomba Tidak Ditemukan"}
                description={
                  competitions.length === 0
                    ? "Tidak ada kompetisi yang tersedia saat ini. Silakan kembali lagi kemudian."
                    : `Kami tidak menemukan kompetisi dengan "${searchTerm}". Coba gunakan kata kunci lain.`
                }
                actionLabel={searchTerm ? "Hapus Pencarian" : undefined}
                onAction={searchTerm ? () => setSearchTerm("") : undefined}
              />
            ) : (
              <>
                {searchTerm && (
                  <div className="mb-8">
                    <SuccessDataFound 
                      message={`Hore! Ditemukan ${filteredCompetitions.length} lomba`}
                    />
                  </div>
                )}

                {/* Grid */}
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                  {filteredCompetitions.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1] hover:border-emerald-400 hover:shadow-[0_8px_0_0_#34d399] transition-all duration-300 overflow-hidden group hover:-translate-y-2 flex flex-col"
                    >
                  {/* Image Section */}
                  <div className="relative h-40 md:h-60 border-b-2 border-slate-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                    
                    {/* Badge Category */}
                    <span
                      className={`absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border-2 shadow-sm ${badgeStyles[item.category]}`}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 md:p-6 flex flex-col flex-1">
                    <h3 className="text-lg md:text-xl font-black text-slate-800 leading-tight mb-3 md:mb-4 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 bg-slate-50 p-3 md:p-4 rounded-2xl border-2 border-slate-100">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <div className="flex items-center gap-2 text-slate-500 font-bold">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          <span>Tanggal</span>
                        </div>
                        <span className="text-slate-800 font-black">{item.date}</span>
                      </div>
                      
                      <div className="w-full h-px bg-slate-200 dashed"></div>

                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <div className="flex items-center gap-2 text-slate-500 font-bold">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span>Hadiah</span>
                        </div>
                        <span className="text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {item.prize}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 md:gap-3 mt-auto flex-wrap md:flex-nowrap">
                      <button 
                        onClick={() => router.push(`/competitions/${item.id}`)}
                        className="flex-1 py-2 md:py-3 px-2 md:px-3 rounded-xl md:rounded-2xl bg-teal-400 text-white font-bold md:font-black text-sm md:text-base border-2 border-teal-600 border-b-3 md:border-b-4 hover:bg-teal-500 active:border-b-2 active:translate-y-px md:active:translate-y-0.5 transition-all flex items-center justify-center gap-1 md:gap-2 group/btn shadow-md hover:shadow-teal-100"
                      >
                        <span>Lihat Detail</span>
                        <ArrowRight className="h-3 md:h-4 w-3 md:w-4 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                      </button>

                      {session?.user?.role === "instruktur" && (
                        <>
                          <ButtonEdit
                            id={item.id}
                            basePath="/competitions"
                            className="flex-1 py-2 md:py-3 px-2 md:px-3 rounded-xl md:rounded-2xl text-sm md:text-base border-b-3 md:border-b-4"
                            label="Edit"
                          />
                          <DeleteButton
                            label=""
                            onClick={() => handleDeleteCompetition(item.id)}
                            variant="icon-only"
                            confirmTitle="Hapus Kompetisi?"
                            confirmMessage="Apakah Anda yakin ingin menghapus kompetisi ini?"
                            className="px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl bg-red-500 text-white font-bold border-2 border-red-600 border-b-3 md:border-b-4 hover:bg-red-600 active:border-b-2 active:translate-y-px md:active:translate-y-0.5 transition-all shadow-md hover:shadow-red-100"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ChatbotButton />
    </div>
  );
};

export default Competitions;