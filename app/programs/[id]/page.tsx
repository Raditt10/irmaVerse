"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  ArrowLeft, 
  Phone, 
  Mail, 
  CheckCircle2,
  Sparkles,
  BookOpen,
  Target,
  MessageCircle // Import icon untuk tombol chat
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string | null;
  duration: string;
  level: string;
  startDate?: string;
  endDate?: string;
  schedule?: string;
  location: string | null;
  instructor: string | null;
  quota: {
    filled: number;
    total: number;
  };
  status: "in-progress" | "done" | "upcoming";
  image?: string;
  syllabus?: string[];
  requirements?: string[];
  benefits?: string[];
}

const ProgramDetail = () => {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;

  useEffect(() => {
    loadUser();
    if (programId) {
      fetchProgramDetail();
    }
  }, [programId]);

  const loadUser = async () => {
    setUser({
      id: "user-123",
      full_name: "Rafaditya Syahputra",
      email: "rafaditya@irmaverse.local",
      avatar: "RS"
    });
  };

  const fetchProgramDetail = async () => {
    try {
      // Mock Data
      const mockPrograms: Program[] = [
        {
          id: "1",
          title: "Kedudukan akal dan wahyu",
          description: "Program pelatihan komprehensif untuk memahami hubungan akal dan wahyu dalam Islam. Peserta akan mempelajari berbagai pendekatan filosofis dan teologis dalam memahami kedudukan akal sebagai instrumen pemahaman wahyu.",
          duration: "3 bulan",
          level: "Pemula",
          startDate: "2024-12-01",
          endDate: "2025-02-28",
          schedule: "Setiap Sabtu, 14:00 - 16:00 WIB",
          location: "Aula Utama IRMA",
          instructor: "Ustadz Dr. Ahmad Zaki, M.Ag",
          quota: { filled: 18, total: 30 },
          status: "in-progress",
          image: "https://picsum.photos/seed/program1/1200/600",
          syllabus: [
            "Pengantar Epistemologi Islam",
            "Hakikat Akal dalam Perspektif Al-Quran",
            "Wahyu sebagai Sumber Pengetahuan",
            "Integrasi Akal dan Wahyu",
            "Studi Kasus: Isu Kontemporer"
          ],
          requirements: [
            "Telah mengikuti orientasi IRMA",
            "Memiliki pengetahuan dasar agama Islam",
            "Komitmen mengikuti seluruh sesi",
            "Membawa Al-Quran dan alat tulis"
          ],
          benefits: [
            "Pemahaman mendalam tentang epistemologi Islam",
            "Sertifikat resmi dari IRMA",
            "Modul pembelajaran digital",
            "Konsultasi dengan instruktur",
            "Akses ke perpustakaan digital"
          ]
        },
         {
          id: "2",
          title: "Kursus Bahasa Arab",
          description: "Program intensif pembelajaran Bahasa Arab dari tingkat dasar hingga mahir. Fokus pada kemampuan membaca, menulis, berbicara, dan memahami teks-teks Arab klasik maupun modern.",
          duration: "6 bulan",
          level: "Menengah",
          startDate: "2024-11-01",
          endDate: "2025-04-30",
          schedule: "Senin & Kamis, 18:30 - 20:00 WIB",
          location: "Ruang Multimedia",
          instructor: "Ustadz Muhammad Ali, Lc., M.A",
          quota: { filled: 22, total: 25 },
          status: "done",
          image: "https://picsum.photos/seed/program2/1200/600",
          syllabus: ["Nahwu dan Shorof Dasar", "Mufrodat dan Muhadatsah", "Membaca Kitab Kuning", "Gramatika Arab Lanjutan", "Praktik Komunikasi Arab"],
          requirements: ["Mampu membaca huruf hijaiyah", "Memiliki kamus Arab-Indonesia", "Mengerjakan tugas mingguan", "Minimal kehadiran 80%"],
          benefits: ["Kemampuan membaca kitab kuning", "Sertifikat kemahiran Bahasa Arab", "Buku panduan dan modul", "Workshop dengan native speaker", "Rekomendasi studi lanjut"]
        },
      ];

      const foundProgram = mockPrograms.find(p => p.id === programId) || mockPrograms[0]; 
      setProgram(foundProgram || null);
    } catch (error) {
      console.error("Error loading program:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Program["status"]) => {
    const statusConfig: Record<Program["status"], { label: string; color: string, icon: any }> = {
      "in-progress": { label: "Sedang Berlangsung", color: "bg-amber-100 text-amber-800 border-amber-300", icon: Clock },
      "done": { label: "Selesai", color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle2 },
      "upcoming": { label: "Segera Dibuka", color: "bg-blue-100 text-blue-800 border-blue-300", icon: Sparkles }
    };

    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase border-2 shadow-sm ${config.color}`}>
        <Icon className="w-3.5 h-3.5" strokeWidth={3} />
        {config.label}
      </div>
    );
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
         <Sparkles className="h-10 w-10 text-teal-400 animate-spin" />
         <p className="text-slate-500 font-bold animate-pulse">Memuat program seru...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-dashed border-slate-300 mb-6">
                <Target className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-700 mb-2">Program Tidak Ditemukan</h2>
            <button
              onClick={() => router.push('/programs')}
              className="mt-4 px-6 py-3 rounded-xl bg-teal-400 text-white font-black border-2 border-teal-600 border-b-4 hover:bg-teal-500 active:border-b-2 active:translate-y-[2px] transition-all"
            >
              Kembali ke Daftar Program
            </button>
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
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:ml-0">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Back Button */}
            <button
              onClick={() => router.push('/programs')}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition-colors group px-4 py-2 rounded-xl border-2 border-transparent hover:border-slate-200 hover:bg-white"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
              Kembali
            </button>

            {/* --- HERO SECTION --- */}
            <div className="relative bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1] overflow-hidden group">
              {/* Image Banner: Menggunakan <img> standar */}
              <div className="relative h-64 md:h-80 w-full overflow-hidden border-b-2 border-slate-200">
                <img
                   src={program.image || "https://picsum.photos/seed/program/1200/600"}
                   alt={program.title}
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                     {getStatusBadge(program.status)}
                     <span className="px-4 py-1.5 rounded-full text-xs font-black bg-white text-slate-800 border-2 border-slate-200 uppercase tracking-wide">
                       Level: {program.level}
                     </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-white mb-3 drop-shadow-md leading-tight">
                    {program.title}
                  </h1>
                  <p className="text-slate-100 text-sm md:text-lg font-medium max-w-2xl line-clamp-2">
                    {program.description}
                  </p>
                </div>
              </div>
            </div>

            {/* --- GRID LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN (Details) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Quick Stats Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mb-2 border-2 border-teal-100">
                            <Clock className="h-5 w-5 text-teal-500" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Durasi</span>
                        <span className="text-slate-800 font-black">{program.duration}</span>
                    </div>
                    <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2 border-2 border-indigo-100">
                            <Calendar className="h-5 w-5 text-indigo-500" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Jadwal</span>
                        <span className="text-slate-800 font-black text-sm">{program.schedule?.split(',')[0]}</span>
                    </div>
                    <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-2 border-2 border-rose-100">
                            <MapPin className="h-5 w-5 text-rose-500" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lokasi</span>
                        <span className="text-slate-800 font-black text-sm">{program.location}</span>
                    </div>
                </div>

                {/* Syllabus */}
                {program.syllabus && (
                  <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-xl border-2 border-purple-200">
                            <BookOpen className="h-6 w-6 text-purple-600" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">Silabus & Materi</h2>
                    </div>
                    <ul className="space-y-3">
                      {program.syllabus.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-colors">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-600 font-black text-sm shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-slate-700 font-bold text-sm md:text-base">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Requirements & Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Requirements */}
                    {program.requirements && (
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                <span className="text-amber-500"></span> Persyaratan
                            </h3>
                            <ul className="space-y-3">
                                {program.requirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm font-medium text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                     {/* Benefits */}
                     {program.benefits && (
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                <span className="text-emerald-500"></span> Manfaat
                            </h3>
                            <ul className="space-y-3">
                                {program.benefits.map((ben, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm font-medium text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        {ben}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
              </div>

              {/* RIGHT COLUMN (Instructor & CTA) */}
              <div className="space-y-6">
                
                {/* Instructor Card */}
                <div className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1] overflow-hidden p-6 text-center">
                    <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full mb-4 border-4 border-teal-100 overflow-hidden relative">
                         <div className="absolute inset-0 flex items-center justify-center bg-teal-500 text-white">
                             <User className="h-10 w-10" />
                         </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{program.instructor}</h3>
                    <p className="text-teal-600 text-xs font-bold uppercase tracking-wider mb-6 bg-teal-50 inline-block px-3 py-1 rounded-full border border-teal-100">
                        Instruktur Program
                    </p>

                    <div className="space-y-3">
                         {/* TOMBOL CHAT BARU */}
                        <button 
                           onClick={() => router.push(`/instructors/chat?name=${encodeURIComponent(program.instructor || "")}`)}
                           className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-indigo-600 bg-indigo-500 text-white shadow-[0_4px_0_0_#4338ca] hover:-translate-y-1 hover:shadow-[0_6px_0_0_#4338ca] active:translate-y-0 active:shadow-none transition-all"
                        >
                           <MessageCircle className="w-5 h-5" strokeWidth={3} />
                           <span className="font-black">Mulai Chat</span>
                        </button>

                        <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border-2 border-green-500 bg-green-500 text-white shadow-[0_4px_0_0_#15803d] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95">
                           <div className="bg-white/20 p-1 rounded-lg">
                                {/* Menggunakan img biasa */}
                                <img src="/WhatsApp.svg.webp" alt="WA" width={20} height={20} className="w-5 h-5 object-contain" />
                           </div>
                           <span className="font-bold flex-1 text-left">WhatsApp</span>
                        </a>
                         <a href="mailto:instruktur@irma.com" className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-all">
                           <Mail className="w-5 h-5 ml-1" />
                           <span className="font-bold text-sm flex-1 text-left">Email Instruktur</span>
                        </a>
                    </div>
                </div>

                {/* CTA Box */}
                {program.status !== "done" && (
                    <div className="bg-gradient-to-br from-teal-400 to-cyan-400 rounded-[2rem] p-6 text-white border-2 border-teal-600 shadow-[0_6px_0_0_#0f766e] text-center">
                        <h3 className="text-xl font-black mb-2">Tertarik Bergabung?</h3>
                        <p className="text-teal-50 text-sm font-medium mb-6 leading-relaxed">
                            Jangan lewatkan kesempatan untuk belajar langsung dari ahlinya. Kuota terbatas!
                        </p>
                        <button className="w-full py-4 rounded-xl bg-white text-teal-600 font-black border-2 border-teal-100 shadow-lg hover:bg-teal-50 hover:scale-105 transition-all flex items-center justify-center gap-2">
                            Daftar Sekarang
                        </button>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-50 border-2 border-amber-200 border-dashed rounded-2xl p-4">
                    <p className="text-xs text-amber-800 font-bold leading-relaxed text-center">
                        💡 Hubungi instruktur untuk detail materi dan persiapan sebelum kelas dimulai.
                    </p>
                </div>

              </div>

            </div>
          </div>
        </div>
        <ChatbotButton />
      </div>
    </div>
  );
};

export default ProgramDetail;