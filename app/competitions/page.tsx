"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/ui/DashboardHeader";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/ChatbotButton";
import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

interface CompetitionItem {
  id: string;
  title: string;
  date: string;
  prize: string;
  category: "Tahfidz" | "Seni" | "Bahasa" | "Lainnya";
  thumbnailUrl?: string;
  status: "upcoming" | "ongoing" | "finished";
  location: string;
}

const badgeStyles: Record<CompetitionItem["category"], string> = {
  Tahfidz: "bg-emerald-100 text-emerald-700",
  Seni: "bg-teal-100 text-teal-700",
  Bahasa: "bg-cyan-100 text-cyan-700",
  Lainnya: "bg-slate-100 text-slate-700"
};

const statusColors: Record<CompetitionItem["status"], string> = {
  upcoming: "bg-blue-100 text-blue-700",
  ongoing: "bg-green-100 text-green-700",
  finished: "bg-gray-100 text-gray-700"
};

const Competitions = () => {
  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/competitions");
      if (response.ok) {
        const data = await response.json();
        setCompetitions(data);
      }
    } catch (error) {
      console.error("Error fetching competitions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-block w-6 h-6 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
            <p className="text-slate-500 text-lg font-medium">Memuat...</p>
          </div>
          <p className="text-xs text-slate-400">Mohon tunggu, data sedang diproses</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100"
      style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}
    >
      <DashboardHeader/>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 px-6 lg:px-8 py-12 lg:ml-0">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-black text-slate-800 mb-2">
                    Info Perlombaan
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Informasi lomba keagamaan tingkat daerah hingga nasional
                  </p>
                </div>
                {session?.user?.role === "instruktur" && (
                  <button
                    onClick={() => router.push("/competitions/create")}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:from-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all"
                  >
                    + Tambahkan Info Perlombaan
                  </button>
                )}
              </div>
            </div>

            {competitions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">Belum ada perlombaan yang tersedia</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {competitions.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-64">
                      <img
                        src={
                          item.thumbnailUrl ||
                          "https://images.unsplash.com/photo-1585779034823-7e9ac8faec70?auto=format&fit=crop&w=1000&q=80"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeStyles[item.category]}`}
                        >
                          {item.category}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[item.status]}`}
                        >
                          {item.status === "upcoming" ? "Segera" : item.status === "ongoing" ? "Berlangsung" : "Selesai"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold text-slate-800 leading-tight">
                        {item.title}
                      </h3>
                      <div className="flex flex-col gap-2 text-slate-600 text-base">
                        <div className="flex items-center justify-between">
                          <span>Tanggal</span>
                          <span className="text-slate-900 font-semibold">{formatDate(item.date)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Hadiah</span>
                          <span className="text-emerald-600 font-semibold">{item.prize}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Lokasi</span>
                          <span className="text-slate-900 font-semibold text-sm">{item.location}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => router.push(`/competitions/${item.id}`)}
                        className="w-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3 transition-all duration-300 shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 flex items-center justify-center gap-2"
                      >
                        <span>Lihat Detail</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
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

export default Competitions;