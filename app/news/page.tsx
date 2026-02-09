"use client";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import SearchInput from "@/components/ui/SearchInput";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { ArrowRight, Calendar, Eye, Share2, Bookmark, Filter, Plus, Pencil, Trash2, Search, HelpCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CartoonNotification from "@/components/ui/Notification";

interface NewsItem {
  id: string;
  title: string;
  deskripsi: string;
  content: string;
  category: "Prestasi" | "Kerjasama" | "Update" | "Event" | "Pengumuman";
  createdAt: string;
  image: string | null;
  slug: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
}

const categoryStyles: Record<NewsItem["category"], string> = {
  Prestasi: "bg-emerald-500 text-white",
  Kerjasama: "bg-cyan-500 text-white",
  Update: "bg-blue-500 text-white",
  Event: "bg-purple-500 text-white",
  Pengumuman: "bg-amber-500 text-white"
};

// Algoritma Levenshtein untuk mengecek kemiripan string (Typos)
const getLevenshteinDistance = (a: string, b: string) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const News = () => {
  const { data: session } = useSession();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // State untuk Suggestion / "Mungkin maksud Anda"
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [selectedCategory, searchTerm, news]);

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/news");
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to fetch news");
      }
      const data = await response.json();
      setNews(data);
      setFilteredNews(data);
    } catch (error: any) {
      console.error("Error fetching news:", error);
      setNotification({
        type: "error",
        title: "Gagal",
        message: `Gagal memuat berita: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = news;
    setSuggestion(null); // Reset suggestion awal
    
    // Filter by Category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      const exactMatches = filtered.filter(item =>
        item.title.toLowerCase().includes(lowerTerm) ||
        item.deskripsi.toLowerCase().includes(lowerTerm)
      );
      
      filtered = exactMatches;

      // Logika "Did you mean..." hanya jalan jika hasil sedikit atau 0
      if (filtered.length === 0 && news.length > 0) {
        let bestMatch = "";
        let lowestDistance = Infinity;

        // Cek kemiripan dengan semua Judul Berita
        news.forEach((item) => {
          const titleDistance = getLevenshteinDistance(lowerTerm, item.title.toLowerCase());
          
          // Normalisasi jarak berdasarkan panjang string (agar kata pendek vs panjang fair)
          const relativeDistance = titleDistance - (Math.abs(item.title.length - lowerTerm.length) * 0.5);

          // Threshold toleransi typo (bisa disesuaikan)
          if (relativeDistance < lowestDistance && titleDistance < item.title.length * 0.6) {
            lowestDistance = relativeDistance;
            bestMatch = item.title;
          }
        });

        // Jika ditemukan match yang cukup dekat (tapi bukan exact match)
        if (bestMatch && bestMatch.toLowerCase() !== lowerTerm) {
          setSuggestion(bestMatch);
        }
      }
    }
    
    setFilteredNews(filtered);
  };

  const handleSuggestionClick = () => {
    if (suggestion) {
      setSearchTerm(suggestion);
    }
  };

  const handleDelete = (id: string) => {
    setSelectedNewsId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedNewsId) return;

    setDeleteDialogOpen(false);

    try {
      const response = await fetch(`/api/news?id=${selectedNewsId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        setNotification({
          type: "error",
          title: "Gagal",
          message: error.error,
        });
        return;
      }

      setNotification({
        type: "success",
        title: "Berhasil!",
        message: "Berita berhasil dihapus!",
      });
      setSelectedNewsId(null);
      fetchNews();
    } catch (error) {
      console.error("Error deleting news:", error);
      setNotification({
        type: "error",
        title: "Gagal",
        message: "Gagal menghapus berita. Silakan coba lagi.",
      });
    }
  };

  const categories = ["Semua", "Prestasi", "Kerjasama", "Update", "Event", "Pengumuman"];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <DashboardHeader/>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-black text-slate-800 mb-2">
                    Berita IRMA
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Berita terkini seputar kegiatan dan perkembangan IRMA Verse
                  </p>
                </div>
                
                {session?.user?.role === "admin" && (
                  <Link
                    href="/news/create"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-5 w-5" />
                    Buat Berita
                  </Link>
                )}
              </div>
            </div>

            {/* Search & Filter */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-4 relative">
                  <div className="flex-1">
                     <SearchInput
                        placeholder="Cari judul berita..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="w-full"
                      />
                  </div>
                </div>

                {/* --- PROFESSIONAL "DID YOU MEAN" SUGGESTION UI --- */}
                {suggestion && filteredNews.length === 0 && (
                   <div className="flex items-center gap-2 px-2 animate-[fadeIn_0.5s_ease-out]">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <p className="text-slate-500 text-sm">
                        Mungkin maksud Anda:{" "}
                        <button 
                          onClick={handleSuggestionClick}
                          className="font-bold text-teal-600 hover:text-teal-700 hover:underline italic transition-colors"
                        >
                          "{suggestion}"
                        </button>
                        ?
                      </p>
                   </div>
                )}
              </div>
              
              {/* Category Pills */}
              <CategoryFilter
                categories={categories}
                subCategories={[]}
                selectedCategory={selectedCategory}
                selectedSubCategory=""
                onCategoryChange={setSelectedCategory}
                onSubCategoryChange={() => {}}
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Memuat berita...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">Tidak ada berita ditemukan</h3>
                <p className="text-slate-500 text-sm">Coba kata kunci lain atau ubah filter kategori.</p>
                {suggestion && (
                    <button 
                        onClick={handleSuggestionClick}
                        className="mt-4 text-sm px-4 py-2 bg-teal-50 text-teal-700 rounded-full font-medium hover:bg-teal-100 transition-colors"
                    >
                        Cari "{suggestion}" saja
                    </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredNews.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-slate-100/50`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="sm:w-72 h-56 sm:h-auto shrink-0 relative overflow-hidden">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1633613286991-611bcfb63dba?auto=format&fit=crop&w=800&q=80"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent sm:hidden" />
                        <span
                          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-lg tracking-wide ${categoryStyles[item.category]}`}
                        >
                          {item.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(item.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
                            </div>
                          </div>

                          <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2 leading-tight">
                            {item.title}
                          </h2>

                          <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                            {item.deskripsi}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-linear-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-[10px] text-white font-bold">
                                {(item.author.name || "A").charAt(0)}
                             </div>
                             <span className="text-sm font-medium text-slate-500 truncate max-w-[100px] sm:max-w-none">
                                {item.author.name || "Admin"}
                             </span>
                          </div>

                          <div className="flex gap-2">
                            {session?.user?.role === "admin" && (
                              <>
                                <Link
                                  href={`/news/edit/${item.id}`}
                                  className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors text-slate-400"
                                  title="Edit berita"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-slate-400"
                                  title="Hapus berita"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            
                            <Link
                              href={`/news/${item.slug}`}
                              className="pl-4 pr-2 py-2 rounded-lg bg-slate-50 text-slate-600 font-semibold hover:bg-teal-50 hover:text-teal-600 transition-all duration-300 flex items-center gap-2 text-sm group/btn"
                            >
                              <span>Baca</span>
                              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
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
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        type="warning"
        title="Hapus Berita"
        message="Apakah Anda yakin ingin menghapus berita ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Notification */}
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

export default News;