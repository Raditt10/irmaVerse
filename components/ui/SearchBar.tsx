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
  SearchX // Import icon baru
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
    <div ref={searchRef} className="relative w-full font-sans" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" strokeWidth={2.5} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Cari kajian, event, atau teman..."
          className="w-full pl-12 pr-10 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-[3px_3px_0_0_#34d399] transition-all font-bold text-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={3} />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] z-50 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              <div className="inline-flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-bold">Mencari...</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            /* --- UPDATE: MENGGUNAKAN ICON SEARCHX --- */
            <div className="p-8 text-center flex flex-col items-center">
               <div className="h-12 w-12 bg-slate-100 rounded-full border-2 border-slate-200 flex items-center justify-center mb-3">
                  <SearchX className="h-6 w-6 text-slate-400" strokeWidth={2.5} />
               </div>
               <p className="text-slate-600 font-bold text-sm">Tidak ada hasil untuk "{query}"</p>
            </div>
            /* ---------------------------------------- */
          ) : (
            <div className="py-2">
              
              {/* Berita Section */}
              {groupedResults.berita.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Newspaper className="h-3 w-3" /> Berita & Artikel
                  </div>
                  {groupedResults.berita.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 hover:bg-emerald-50/50 text-left transition-colors flex items-start gap-3 group border-l-4 border-transparent hover:border-emerald-400"
                    >
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.title}
                          className="h-10 w-10 rounded-lg object-cover border-2 border-slate-100 shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
                            <Newspaper className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 leading-tight line-clamp-1 group-hover:text-emerald-700">
                          {result.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">
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
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 border-t border-slate-100 mt-2 pt-3">
                    <GraduationCap className="h-3 w-3" /> Instruktur
                  </div>
                  {groupedResults.instruktur.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-2.5 hover:bg-amber-50/50 text-left transition-colors flex items-center gap-3 group border-l-4 border-transparent hover:border-amber-400"
                    >
                      {result.image ? (
                        <img 
                          src={result.image} 
                          alt={result.title} 
                          className="h-9 w-9 rounded-full border-2 border-amber-200 object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
                           <GraduationCap className="h-5 w-5" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-amber-700">
                          {result.title}
                        </div>
                        {result.bidangKeahlian && (
                          <div className="text-xs text-slate-500 font-medium truncate">
                            Spesialis: {result.bidangKeahlian}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {/* Pengguna Section */}
              {groupedResults.pengguna.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 border-t border-slate-100 mt-2 pt-3">
                    <User className="h-3 w-3" /> Pengguna
                  </div>
                  {groupedResults.pengguna.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-2.5 hover:bg-blue-50/50 text-left transition-colors flex items-center gap-3 group border-l-4 border-transparent hover:border-blue-400"
                    >
                      {result.image ? (
                        <img 
                          src={result.image} 
                          alt={result.title} 
                          className="h-9 w-9 rounded-full border-2 border-blue-200 object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
                           <User className="h-5 w-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                          {result.title}
                        </div>
                        <div className="text-xs text-slate-500 font-medium truncate">
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