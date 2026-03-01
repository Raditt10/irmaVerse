"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import SearchInput from "@/components/ui/SearchInput";
import Loading from "@/components/ui/Loading";
import {
  BookOpen,
  FileText,
  Calendar,
  ArrowLeft,
  Eye,
  User,
} from "lucide-react";

interface RekapanItem {
  id: string;
  materialId: string;
  materialTitle: string;
  instructor: string;
  date: string;
  category: string;
  grade: string;
  contentPreview: string;
  updatedAt: string;
}

const RekapanListPage = () => {
  const router = useRouter();
  const [rekapanList, setRekapanList] = useState<RekapanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    },
  });

  useEffect(() => {
    if (status === "authenticated") {
      fetchRekapan();
    }
  }, [status]);

  const fetchRekapan = async () => {
    try {
      setLoading(true);
      // Fetch all materials the user has access to
      const matRes = await fetch("/api/materials");
      if (!matRes.ok) throw new Error("Gagal mengambil data");
      const materials = await matRes.json();

      // For each material, try to fetch its rekapan
      const rekapanPromises = materials.map(async (mat: any) => {
        try {
          const res = await fetch(`/api/materials/${mat.id}/rekapan`);
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.id,
            materialId: mat.id,
            materialTitle: mat.title,
            instructor: mat.instructor || "TBA",
            date: mat.date,
            category: mat.category || "",
            grade: mat.grade || "",
            contentPreview:
              data.content.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
            updatedAt: data.updatedAt,
          };
        } catch {
          return null;
        }
      });

      const results = (await Promise.all(rekapanPromises)).filter(Boolean);
      setRekapanList(results as RekapanItem[]);
    } catch (error) {
      console.error("Error fetching rekapan:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRekapan = rekapanList.filter(
    (item) =>
      item.materialTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.instructor.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const CATEGORY_STYLE: Record<string, string> = {
    "Program Wajib": "bg-rose-100 text-rose-700 border-rose-200",
    "Program Ekstra": "bg-purple-100 text-purple-700 border-purple-200",
    "Program Next Level": "bg-amber-100 text-amber-700 border-amber-200",
    "Program Susulan": "bg-slate-100 text-slate-700 border-slate-200",
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
            <Loading text="Memuat rekapan kajian..." size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 lg:mb-10">
              <button
                onClick={() => router.push("/materials")}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition-all group px-4 py-2 rounded-xl border-2 border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm mb-4"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform stroke-3" />
                Kembali
              </button>

              <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-2 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-teal-500" />
                Rekapan Kajian
              </h1>
              <p className="text-slate-500 font-medium text-sm lg:text-lg">
                Baca ringkasan materi dari kajian yang telah berlangsung.
              </p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-4 mb-6">
              <SearchInput
                placeholder="Cari judul kajian atau pemateri..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full md:w-96"
              />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white px-5 py-3 rounded-2xl border-2 border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Rekapan
                </span>
                <p className="text-2xl font-black text-slate-800">
                  {rekapanList.length}
                </p>
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {filteredRekapan.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-300">
                  <FileText className="h-16 w-16 text-slate-300 mb-4" />
                  <h3 className="text-xl font-black text-slate-800 mb-2">
                    Belum ada rekapan
                  </h3>
                  <p className="text-slate-500">
                    {searchQuery
                      ? "Rekapan yang kamu cari tidak ditemukan."
                      : "Instruktur belum membuat rekapan untuk kajian yang kamu ikuti."}
                  </p>
                </div>
              ) : (
                filteredRekapan.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      router.push(`/materials/${item.materialId}/rekapan`)
                    }
                    className="bg-white rounded-3xl border-2 border-slate-200 p-5 lg:p-6 hover:border-teal-400 hover:shadow-[0_4px_0_0_#34d399] transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Category & Grade badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {item.category && (
                            <span
                              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${CATEGORY_STYLE[item.category] || "bg-slate-100 text-slate-600 border-slate-200"}`}
                            >
                              {item.category}
                            </span>
                          )}
                          {item.grade && (
                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border bg-slate-50 text-slate-600 border-slate-200">
                              {item.grade}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg md:text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-teal-600 transition-colors">
                          {item.materialTitle}
                        </h3>

                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-3 line-clamp-2">
                          {item.contentPreview}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {item.instructor}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(item.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>

                      <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-600 font-bold border-2 border-teal-200 border-b-4 hover:bg-teal-50 hover:border-teal-400 active:border-b-2 active:translate-y-0.5 transition-all text-sm shrink-0">
                        <Eye className="h-4 w-4" strokeWidth={2.5} />
                        Baca
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <ChatbotButton />
    </div>
  );
};

export default RekapanListPage;
