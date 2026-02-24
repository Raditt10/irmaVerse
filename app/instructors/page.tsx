"use client";
import { useEffect, useState, useRef } from "react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import Loading from "@/components/ui/Loading";
import SuccessDataFound from "@/components/ui/SuccessDataFound";
import SearchInput from "@/components/ui/SearchInput";
import { 
  Star, 
  BookOpen, 
  MessageCircle, 
  SearchX, 
  RefreshCcw, 
  ChevronDown,
  Heart
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Instructor {
  id: string;
  name: string;
  specialization: string;
  description: string;
  bio?: string;
  avatar: string;
  rating: number;
  studentsCount: number;
  kajianCount: number;
  tags: string[];
  verified: boolean;
  featured?: boolean;
}

const Instructors = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteInstructorIds, setFavoriteInstructorIds] = useState<Set<string>>(new Set());
  
  // State untuk Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: session } = useSession();

  // Menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchInstructors();
    // Load favorites from localStorage on mount
    const favoritesJson = localStorage.getItem("favoriteInstructors");
    if (favoritesJson) {
      try {
        const favoriteIds = JSON.parse(favoritesJson);
        setFavoriteInstructorIds(new Set(favoriteIds));
      } catch (error) {
        console.error("Error parsing favorites:", error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favoriteInstructors", JSON.stringify(Array.from(favoriteInstructorIds)));
  }, [favoriteInstructorIds]);

  const fetchInstructors = async () => {
    try {
      const res = await fetch("/api/instructors");
      if (!res.ok) throw new Error("Gagal mengambil data instruktur");
      const data = await res.json();
      
      const mapped = data.map((u: any) => ({
        id: u.id,
        name: u.name || "-",
        specialization: u.bidangKeahlian || "Umum",
        description: u.pengalaman || "Belum ada deskripsi.",
        bio: u.bio || u.bioProfile || "",
        avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name || "user"}`,
        rating: u.rating || 5.0,
        studentsCount: u.studentsCount || 0,
        kajianCount: u.kajianCount || 0,
        tags: u.tags || ["Fiqih", "Tafsir", "Hadits"],
        verified: true,
        featured: u.featured || false,
      }));
      setInstructors(mapped);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mendapatkan list spesialisasi unik untuk dropdown
  const uniqueSpecializations = ["all", ...Array.from(new Set(instructors.map(i => i.specialization)))];

  // Toggle favorite instructor
  const toggleFavorite = (instructorId: string) => {
    const newFavorites = new Set(favoriteInstructorIds);
    if (newFavorites.has(instructorId)) {
      newFavorites.delete(instructorId);
    } else {
      newFavorites.add(instructorId);
    }
    setFavoriteInstructorIds(newFavorites);
  };

  // Logic Filtering
  const filteredInstructors = instructors.filter((instructor) => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          instructor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = specializationFilter === "all" || instructor.specialization === specializationFilter;
    const matchesFavorite = !showFavoritesOnly || favoriteInstructorIds.has(instructor.id);
    
    return matchesSearch && matchesFilter && matchesFavorite;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="mb-8 lg:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-2">
                  {showFavoritesOnly ? "Instruktur Favorit" : "Daftar Instruktur"}
                </h1>
                <p className="text-slate-500 font-medium text-sm lg:text-lg">
                  {showFavoritesOnly 
                    ? "Instruktur favorit yang telah kamu pilih" 
                    : "Para instruktur terbaik kami yang siap membimbing kamu!"}
                </p>
              </div>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 lg:px-6 py-3 rounded-2xl border-2 border-b-4 font-bold flex items-center gap-2 transition-all ${
                  showFavoritesOnly
                    ? 'bg-rose-400 border-rose-500 text-white shadow-lg hover:bg-rose-500 active:border-b-2 active:translate-y-0.5'
                    : 'bg-white border-slate-200 text-slate-600 shadow-[0_4px_0_0_#e2e8f0] hover:border-rose-300 hover:text-rose-500 active:border-b-2 active:translate-y-0.5'
                }`}
              >
                <Heart className={`h-5 w-5 ${
                  showFavoritesOnly ? 'fill-white' : 'group-hover:fill-rose-500'
                }`} strokeWidth={2.5} />
                <span className="hidden sm:inline text-sm lg:text-base">
                  {showFavoritesOnly ? "Semua Instruktur" : "Favorit"}
                </span>
              </button>
            </div>

            {/* Filter & Search Section */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <SearchInput
                  placeholder="Cari nama instruktur atau keahlian..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="w-full shadow-sm hover:shadow-md transition-shadow duration-300"
                />
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`
                    w-full flex items-center justify-between rounded-2xl border-2 px-5 py-3.5 lg:py-4
                    font-bold text-slate-700 transition-all cursor-pointer bg-white
                    ${isDropdownOpen 
                      ? 'border-teal-400 shadow-[0_4px_0_0_#34d399] -translate-y-0.5' 
                      : 'border-slate-200 shadow-[0_4px_0_0_#e2e8f0] hover:border-teal-300 hover:text-teal-600'
                    }
                  `}
                >
                  <span className="capitalize text-sm lg:text-base truncate pr-2">
                    {specializationFilter === "all" ? "Semua Keahlian" : specializationFilter}
                  </span>
                  <ChevronDown 
                    className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-teal-500' : 'text-slate-400'}`} 
                    strokeWidth={3} 
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border-2 border-slate-200 rounded-2xl shadow-[0_8px_0_0_#cbd5e1] overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1.5 space-y-1">
                      {uniqueSpecializations.map((spec) => (
                        <button
                          key={spec}
                          onClick={() => {
                            setSpecializationFilter(spec);
                            setIsDropdownOpen(false);
                          }}
                          className={`
                            w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all capitalize
                            ${specializationFilter === spec 
                              ? 'bg-teal-50 text-teal-600' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
                          `}
                        >
                          {spec === "all" ? "Semua Keahlian" : spec}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
               <div className="text-center py-20">
                 <Loading text="Memuat data instruktur..." />
               </div>
            ) : (
              <>
                {filteredInstructors.length === 0 ? (
                  /* ---- EMPTY STATE ---- */
                  <div className="flex flex-col items-center justify-center py-16 md:py-20 px-4 text-center bg-white rounded-[2.5rem] border-2 border-slate-200 border-dashed">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <SearchX className="h-10 w-10 md:h-12 md:w-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-700 mb-2">
                      Yah, instruktur tidak ditemukan...
                    </h3>
                    <p className="text-slate-500 font-medium max-w-md mb-8 text-sm md:text-base">
                      Coba cari dengan kata kunci lain atau ubah filter keahliannya ya!
                    </p>
                    <button 
                      onClick={() => { setSearchTerm(""); setSpecializationFilter("all"); }}
                      className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl shadow-[0_4px_0_0_#e2e8f0] hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#34d399] active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      <span>Reset Pencarian</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* ---- SUCCESS HEADER ---- */}
                    {(searchTerm || specializationFilter !== "all" || showFavoritesOnly) && (
                      <div className="mb-8">
                        <SuccessDataFound 
                          message={`Hore! Ditemukan ${filteredInstructors.length} instruktur yang cocok!`}
                        />
                      </div>
                    )}

                    {/* ---- GRID CONTENT ---- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {filteredInstructors.map((instructor) => (
                        <div
                          key={instructor.id}
                          className={`bg-white rounded-[2.5rem] border-2 transition-all duration-300 overflow-hidden group hover:-translate-y-2 flex flex-col relative ${
                            instructor.featured 
                              ? 'border-amber-400 shadow-[0_8px_0_0_#fbbf24]' 
                              : 'border-slate-200 shadow-[0_8px_0_0_#cbd5e1] hover:border-emerald-400 hover:shadow-[0_8px_0_0_#34d399]'
                          }`}
                        >
                          {/* Featured Badge & Favorite Button */}
                          <div className="absolute top-5 right-5 z-10 flex gap-2 items-center">
                            {instructor.featured && (
                              <div className="bg-amber-400 text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-amber-500 shadow-sm flex items-center gap-1 animate-pulse">
                                <Star className="w-3 h-3 fill-white" strokeWidth={3} />
                                <span>POPULER</span>
                              </div>
                            )}
                            <button
                              onClick={() => toggleFavorite(instructor.id)}
                              className="bg-white border-2 border-slate-200 rounded-full p-2.5 shadow-md hover:bg-rose-50 hover:border-rose-300 transition-all hover:-translate-y-1"
                            >
                              <Heart 
                                className={`h-5 w-5 transition-colors ${
                                  favoriteInstructorIds.has(instructor.id)
                                    ? 'fill-rose-500 text-rose-500'
                                    : 'text-slate-400 hover:text-rose-400'
                                }`} 
                                strokeWidth={2.5} 
                              />
                            </button>
                          </div>

                          <div className="p-6 md:p-8 flex-1 flex flex-col">
                            {/* Avatar Section */}
                            <div className="flex justify-center mb-4 mt-2">
                              <div className="relative group-hover:scale-105 transition-transform duration-500">
                                <div className={`w-28 h-28 rounded-full overflow-hidden border-4 shadow-lg ${
                                   instructor.featured ? 'border-amber-200' : 'border-teal-100'
                                }`}>
                                  <img
                                    src={instructor.avatar}
                                    alt={instructor.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Name & Specialization */}
                            <div className="text-center mb-4">
                              <h3 className="text-xl font-black text-slate-800 mb-1 leading-tight line-clamp-1">
                                {instructor.name}
                              </h3>
                              <p className="text-teal-600 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full inline-block border border-teal-100">
                                {instructor.specialization}
                              </p>
                            </div>

                            {/* Description */}
                            <p className="text-slate-500 text-sm text-center mb-6 line-clamp-2 font-medium px-2 leading-relaxed">
                              {instructor.description}
                            </p> 

                            {/* Stats Widget */}
                            <div className="grid grid-cols-2 gap-0 mb-6 bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden">
                              <div className="py-3 text-center border-r-2 border-slate-200 hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="font-black text-lg text-slate-700">{instructor.rating}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rating</p>
                              </div>
                              <div className="py-3 text-center hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                  <span className="font-black text-lg text-slate-700">{instructor.kajianCount}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kajian</p>
                              </div>
                            </div>

                            {/* Bio Section */}
                            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 min-h-20 flex items-center">
                              <p className="text-slate-600 text-sm font-medium text-center leading-relaxed">
                                {instructor.bio && instructor.bio.trim() !== ""
                                  ? instructor.bio
                                  : "Instruktur ini belum membuat bio profile di akun nya"}
                              </p>
                            </div>

                            {/* Buttons */}
                            <div className="space-y-3 mt-auto">
                              {session?.user?.id !== instructor.id ? (
                                <>
                                  <Link
                                    href={`/instructors/chat?instructorId=${encodeURIComponent(instructor.id)}`}
                                    className="w-full py-3.5 rounded-2xl bg-teal-400 text-white font-black border-2 border-teal-600 border-b-4 hover:bg-teal-500 hover:shadow-lg hover:shadow-teal-200 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 group/btn shadow-lg"
                                  >
                                    <MessageCircle className="w-5 h-5 group-hover/btn:animate-bounce" strokeWidth={2.5} />
                                    Mulai Chat
                                  </Link>
                                  
                                  <button className="w-full py-3.5 rounded-2xl bg-white text-slate-600 font-bold border-2 border-slate-200 border-b-4 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                    <BookOpen className="w-4 h-4" strokeWidth={2.5} />
                                    Lihat Kajian
                                  </button>
                                </>
                              ) : (
                                <button className="w-full py-3.5 rounded-2xl bg-teal-400 text-white font-black border-2 border-teal-600 border-b-4 hover:bg-teal-500 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                  Lihat Profile Saya
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ChatbotButton />
    </div>
  );
};

export default Instructors;