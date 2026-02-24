"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  User, 
  Newspaper, 
  GraduationCap, 
  ArrowRight, 
  SearchX 
} from "lucide-react";
import debounce from "lodash/debounce";

interface SearchResult {
  id: string;
  type: "news" | "user" | "instructor";
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  category?: string;
  email?: string;
  role?: string;
  bio?: string;
  bidangKeahlian?: string;
  pengalaman?: string;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    performSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "news":
        router.push(`/news/${result.slug}`);
        break;
      case "user":
        router.push(`/members/${result.id}`);
        break;
      case "instructor":
        router.push(`/instructors`);
        break;
    }
    handleClear();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groupedResults = {
    berita: results.filter((r) => r.type === "news"),
    pengguna: results.filter((r) => r.type === "user"),
    instruktur: results.filter((r) => r.type === "instructor"),
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative group">
        {/* ICON SEARCH: Digeser ke kanan (left-5) dan ukurannya diperbesar sedikit (h-5 w-5) */}
        <Search 
          className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" 
          strokeWidth={2.5} 
        />
        
        {/* INPUT: Padding kiri diperlebar (pl-14) dan tinggi ditambah (py-3) */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Cari kajian, event, atau teman..."
          className="w-full pl-14 pr-12 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-[3px_3px_0_0_#34d399] transition-all font-bold text-sm"
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] z-50 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 animate-in fade-in zoom-in-95 duration-200">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              <div className="inline-flex items-center gap-3">
                <div className="h-6 w-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-bold text-slate-600">Sedang mencari...</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center">
               <div className="h-16 w-16 bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center justify-center mb-4">
                  <SearchX className="h-8 w-8 text-slate-400" strokeWidth={2.5} />
               </div>
               <p className="text-slate-700 font-black text-base">Tidak ditemukan</p>
               <p className="text-slate-500 text-xs mt-1 font-medium">Coba kata kunci lain ya!</p>
            </div>
          ) : (
            <div className="py-2">
              
              {/* Berita Section */}
              {groupedResults.berita.length > 0 && (
                <div className="mb-2">
                  <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Newspaper className="h-3 w-3" /> Berita & Artikel
                  </div>
                  {groupedResults.berita.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-5 py-3 hover:bg-emerald-50/50 text-left transition-colors flex items-start gap-4 group border-l-4 border-transparent hover:border-emerald-400"
                    >
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.title}
                          className="h-12 w-12 rounded-xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
                            <Newspaper className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 leading-tight line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {result.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide border border-emerald-200">
                                {result.category || "Berita"}
                            </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Instruktur Section */}
              {groupedResults.instruktur.length > 0 && (
                <div className="mb-2">
                  <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-t border-slate-100 mt-2 pt-3">
                    <GraduationCap className="h-3 w-3" /> Instruktur
                  </div>
                  {groupedResults.instruktur.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-5 py-3 hover:bg-amber-50/50 text-left transition-colors flex items-center gap-4 group border-l-4 border-transparent hover:border-amber-400"
                    >
                      {result.image ? (
                        <img 
                          src={result.image} 
                          alt={result.title} 
                          className="h-10 w-10 rounded-full border-2 border-amber-200 object-cover shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center shrink-0 text-amber-600 shadow-sm">
                           <GraduationCap className="h-5 w-5" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                          {result.title}
                        </div>
                        {result.bidangKeahlian && (
                          <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            Spesialis: {result.bidangKeahlian}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                    </button>
                  ))}
                </div>
              )}

              {/* Pengguna Section */}
              {groupedResults.pengguna.length > 0 && (
                <div>
                  <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-t border-slate-100 mt-2 pt-3">
                    <User className="h-3 w-3" /> Pengguna
                  </div>
                  {groupedResults.pengguna.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-5 py-3 hover:bg-blue-50/50 text-left transition-colors flex items-center gap-4 group border-l-4 border-transparent hover:border-blue-400"
                    >
                      {result.image ? (
                        <img 
                          src={result.image} 
                          alt={result.title} 
                          className="h-10 w-10 rounded-full border-2 border-blue-200 object-cover shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center shrink-0 text-blue-600 shadow-sm">
                           <User className="h-5 w-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                          {result.title}
                        </div>
                        <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {result.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}