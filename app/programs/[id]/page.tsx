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
  Mail, 
  CheckCircle2,
  Sparkles,
  BookOpen,
  Target,
  MessageCircle,
  Hourglass,
  ListChecks,
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
  status: "in-progress" | "done" | "upcoming";
  image?: string;
  syllabus?: string[];
  requirements?: string[];
  benefits?: string[];
  sessions?: { id: string; title: string; description: string | null }[];
}

const ProgramDetail = () => {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<any>(null); // Placeholder user state
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
      setLoading(true);
      const res = await fetch(`/api/programs/${programId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal mengambil data program");
      }

      const data = await res.json();
      setProgram(data);
    } catch (error) {
      console.error("Error loading program:", error);
      setProgram(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Program["status"]) => {
    const statusConfig: Record<Program["status"], { label: string; color: string, bg: string, border: string, icon: any }> = {
      "in-progress": { label: "Berlangsung", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300", icon: Clock },
      "done": { label: "Selesai", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-300", icon: CheckCircle2 },
      "upcoming": { label: "Segera", color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-300", icon: Hourglass }
    };

    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase border-2 shadow-sm ${config.bg} ${config.color} ${config.border}`}>
        <Icon className="w-3.5 h-3.5" strokeWidth={3} />
        {config.label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
         <DashboardHeader />
         <div className="flex w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
               <Sparkles className="h-12 w-12 text-teal-400 animate-spin mb-4" />
               <p className="text-slate-500 font-bold animate-pulse">Sedang memuat detail program...</p>
            </div>
         </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-dashed border-slate-300 mb-6">
                <Target className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-700 mb-2">Program Tidak Ditemukan</h2>
            <button
              onClick={() => router.push('/programs')}
              className="mt-4 px-6 py-3 rounded-xl bg-teal-400 text-white font-black border-2 border-teal-600 border-b-4 hover:bg-teal-500 active:border-b-2 active:translate-y-0.5 transition-all"
            >
              Kembali ke Daftar
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
        
        {/* Main Content Area */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full max-w-[100vw] overflow-x-hidden">
          <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
            
            {/* Back Button */}
            <button
              onClick={() => router.push('/programs')}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition-all group px-4 py-2 rounded-xl border-2 border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform stroke-3" />
              Kembali
            </button>

            {/* --- HERO SECTION --- */}
            <div className="relative bg-white rounded-4xl lg:rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1] overflow-hidden group">
              {/* Image Banner */}
              <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden border-b-2 border-slate-200">
                <img
                   src={program.image || "https://picsum.photos/seed/program/1200/600"}
                   alt={program.title}
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-3 mb-3 lg:mb-4">
                     {getStatusBadge(program.status)}
                     <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-white/90 text-slate-800 border-2 border-white uppercase tracking-wide backdrop-blur-sm">
                       Level: {program.level}
                     </span>
                     <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-teal-500/90 text-white border-2 border-teal-400 uppercase tracking-wide backdrop-blur-sm flex items-center gap-1.5">
                       <Clock className="h-3.5 w-3.5" strokeWidth={3} />
                       {program.duration}
                     </span>
                  </div>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 drop-shadow-md leading-tight">
                    {program.title}
                  </h1>
                  <p className="text-slate-200 text-sm md:text-lg font-medium max-w-3xl line-clamp-2 leading-relaxed">
                    {program.description}
                  </p>
                </div>
              </div>
            </div>

            {/* --- GRID LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* LEFT COLUMN (Details) */}
              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                {/* Syllabus */}
                {program.syllabus && (
                  <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1]">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-2.5 bg-purple-100 rounded-2xl border-2 border-purple-200">
                            <BookOpen className="h-6 w-6 text-purple-600" strokeWidth={3} />
                        </div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800">Silabus & Materi</h2>
                    </div>
                    <ul className="space-y-3">
                      {program.syllabus.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-colors group">
                          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-white border-2 border-slate-200 text-slate-500 font-black text-sm shrink-0 group-hover:border-purple-300 group-hover:text-purple-600 transition-colors">
                            {idx + 1}
                          </span>
                          <span className="text-slate-700 font-bold text-sm md:text-base leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* --- JADWAL KAJIAN (SESSIONS) --- */}
                {program.sessions && program.sessions.length > 0 && (
                  <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-2.5 bg-teal-100 rounded-2xl border-2 border-teal-200">
                            <ListChecks className="h-6 w-6 text-teal-600" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-black text-slate-800">Jadwal Kajian</h2>
                            <p className="text-sm text-slate-500 font-bold italic">Bagian-bagian pembelajaran dalam program ini.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {program.sessions.map((session, idx) => (
                        <div key={session.id || idx} className="flex gap-4 md:gap-6 p-5 md:p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all group">
                          <div className="flex flex-col items-center gap-2">
                             <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-teal-600 font-black shadow-sm group-hover:border-teal-300 transition-colors">
                               {idx + 1}
                             </div>
                             <div className="w-0.5 flex-1 bg-slate-200 rounded-full last:hidden" />
                          </div>
                          
                          <div className="flex-1 space-y-2 py-1">
                             <h4 className="text-slate-800 font-black text-lg md:text-xl leading-tight group-hover:text-teal-700 transition-colors">
                               {session.title}
                             </h4>
                             {session.description && (
                               <p className="text-slate-500 font-bold text-sm md:text-base leading-relaxed">
                                 {session.description}
                               </p>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements & Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Requirements */}
                    {program.requirements && (
                        <div className="bg-white p-6 rounded-4xl border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1]">
                            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-2 h-6 bg-amber-400 rounded-full"></span> Persyaratan
                            </h3>
                            <ul className="space-y-3">
                                {program.requirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 leading-snug">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* Benefits */}
                    {program.benefits && (
                        <div className="bg-white p-6 rounded-4xl border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1]">
                            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-400 rounded-full"></span> Manfaat
                            </h3>
                            <ul className="space-y-3">
                                {program.benefits.map((ben, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 leading-snug">
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
              <div className="space-y-6 lg:space-y-8">
                
                {/* Instructor Card */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1] overflow-hidden p-6 lg:p-8 text-center">
                    <div className="w-28 h-28 mx-auto bg-slate-100 rounded-full mb-4 border-4 border-teal-100 overflow-hidden relative shadow-sm">
                         <div className="absolute inset-0 flex items-center justify-center bg-teal-500 text-white">
                             <User className="h-12 w-12" />
                         </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{program.instructor}</h3>
                    <p className="text-teal-600 text-xs font-bold uppercase tracking-wider mb-6 bg-teal-50 inline-block px-3 py-1 rounded-full border border-teal-100">
                        Instruktur Program
                    </p>

                    <div className="space-y-3">
                         {/* TOMBOL CHAT */}
                        <button 
                           onClick={() => router.push(`/instructors/chat?name=${encodeURIComponent(program.instructor || "")}`)}
                           className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-indigo-600 bg-indigo-500 text-white shadow-[0_4px_0_0_#4338ca] hover:bg-indigo-600 hover:shadow-[0_4px_0_0_#3730a3] active:translate-y-0.5 active:shadow-none transition-all group"
                        >
                           <MessageCircle className="w-5 h-5 group-hover:animate-bounce" strokeWidth={3} />
                           <span className="font-black">Mulai Chat</span>
                        </button>

                        <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500 text-white shadow-[0_4px_0_0_#047857] hover:bg-emerald-600 active:translate-y-0.5 active:shadow-none transition-all">
                           <div className="bg-white/20 p-1 rounded-lg">
                               <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" width={20} height={20} className="w-5 h-5 object-contain" />
                           </div>
                           <span className="font-bold flex-1 text-left">WhatsApp</span>
                        </a>
                         <a href="mailto:instruktur@irma.com" className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 hover:shadow-sm transition-all bg-white">
                           <Mail className="w-5 h-5 ml-1" strokeWidth={2.5} />
                           <span className="font-bold text-sm flex-1 text-left">Email Instruktur</span>
                        </a>
                    </div>
                </div>

                {/* CTA Box */}
                {program.status !== "done" && (
                    <div className="bg-linear-to-br from-teal-400 to-cyan-400 rounded-[2.5rem] p-6 lg:p-8 text-white border-2 border-teal-600 shadow-[0_6px_0_0_#0f766e] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        
                        <h3 className="text-2xl font-black mb-2 relative z-10">Tertarik Bergabung?</h3>
                        <p className="text-teal-50 text-sm font-bold mb-6 leading-relaxed relative z-10">
                            Jangan lewatkan kesempatan untuk belajar langsung dari ahlinya.
                        </p>
                        <button className="w-full py-4 rounded-2xl bg-white text-teal-600 font-black border-2 border-teal-100 shadow-lg hover:bg-teal-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative z-10">
                            Daftar Sekarang
                        </button>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-50 border-2 border-amber-200 border-dashed rounded-3xl p-5">
                    <p className="text-xs text-amber-800 font-bold leading-relaxed text-center">
                         Hubungi instruktur untuk detail materi dan persiapan sebelum kelas dimulai.
                    </p>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
      <ChatbotButton />
    </div>
  );
};

export default ProgramDetail;