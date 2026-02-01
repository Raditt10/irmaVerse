"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/DashboardHeader";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/ChatbotButton";
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  ArrowLeft, 
  Phone, 
  Mail, 
  Sparkles,
  SearchX,
  Share2
} from "lucide-react";
import Image from "next/image";

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  fullDescription?: string | null;
  date: string;
  time?: string;
  location: string | null;
  pemateri: string | null;
  pemateriAvatar?: string | null;
  pemateriSpecialization?: string | null;
  status?: string;
  image?: string;
  instructorId?: string;
}

const ScheduleDetail = () => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;

  useEffect(() => {
    if (scheduleId) {
      fetchScheduleDetail();
    }
  }, [scheduleId]);

  const fetchScheduleDetail = async () => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }
      const data = await response.json();
      
      const mappedSchedule = {
        ...data,
        instructorId: data.instructorId,
        status: data.status === "segera_hadir" 
          ? "Segera hadir" 
          : data.status === "ongoing" 
          ? "Sedang berlangsung" 
          : "Acara telah dilaksanakan",
        pemateriAvatar: data.instructor?.name 
          ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.instructor.name}`
          : null,
        pemateriSpecialization: data.instructor?.bidangKeahlian || "Instruktur",
        image: data.thumbnailUrl || `https://picsum.photos/seed/event${data.id}/800/400`,
      };
      
      setSchedule(mappedSchedule);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      "Segera hadir": "bg-emerald-400 text-white border-emerald-600 shadow-[4px_4px_0_0_#065f46]",
      "Sedang berlangsung": "bg-blue-400 text-white border-blue-600 shadow-[4px_4px_0_0_#1e40af]",
      "Acara telah dilaksanakan": "bg-slate-400 text-white border-slate-600 shadow-[4px_4px_0_0_#475569]"
    };

    const style = statusConfig[status] || statusConfig["Segera hadir"];
    return (
      <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black border-2 uppercase tracking-wide transform -rotate-2 ${style}`}>
        {status}
      </span>
    );
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-6 py-12 flex justify-center items-center">
             <div className="flex flex-col items-center animate-pulse">
                <Sparkles className="h-12 w-12 text-teal-400 mb-4 animate-spin" />
                <p className="text-slate-400 font-bold">Sedang mengambil data event...</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- NOT FOUND STATE ---
  if (!schedule) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-6 py-12">
            <div className="max-w-3xl mx-auto text-center py-20 bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[8px_8px_0_0_#cbd5e1]">
                <div className="inline-block p-6 rounded-full bg-slate-50 border-2 border-slate-100 mb-6">
                    <SearchX className="h-16 w-16 text-slate-300" />
                </div>
                <h2 className="text-3xl font-black text-slate-700 mb-2">Event Tidak Ditemukan</h2>
                <p className="text-slate-500 font-medium mb-8">Sepertinya event ini sudah dihapus atau link-nya salah.</p>
                <button
                  onClick={() => router.push('/schedule')}
                  className="px-8 py-3 bg-teal-400 text-white font-black rounded-2xl border-2 border-teal-600 shadow-[4px_4px_0_0_#0f766e] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  Kembali ke Jadwal
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <ChatbotButton />
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* --- HEADER NAVIGATION --- */}
            <div className="flex items-center justify-between">
                <button
                onClick={() => router.push('/schedule')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:border-teal-400 hover:text-teal-600 hover:shadow-[4px_4px_0_0_#cbd5e1] active:translate-y-[2px] active:shadow-none transition-all"
                >
                <ArrowLeft className="h-5 w-5" strokeWidth={3} />
                Kembali
                </button>
                <button className="p-2 bg-white rounded-xl border-2 border-slate-200 text-slate-400 hover:text-teal-500 hover:border-teal-400 transition-all">
                    <Share2 className="h-5 w-5" strokeWidth={2.5} />
                </button>
            </div>

            {/* --- HERO SECTION --- */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden border-2 border-slate-200 shadow-[8px_8px_0_0_#cbd5e1] group">
              <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
                <img
                  src={schedule.image || "https://picsum.photos/seed/event1/1200/600"}
                  alt={schedule.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10">
                  <div className="mb-4">
                    {getStatusBadge(schedule.status || "")}
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 leading-tight drop-shadow-md">
                    {schedule.title}
                  </h1>
                  <p className="text-slate-200 text-lg font-medium max-w-3xl line-clamp-2">
                    {schedule.description}
                  </p>
                </div>
              </div>
            </div>

            {/* --- CONTENT GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: DETAILS */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Date */}
                    <div className="bg-white p-5 rounded-[2rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center border-2 border-rose-200 mb-3">
                            <Calendar className="h-6 w-6 text-rose-500" />
                        </div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tanggal</span>
                        <span className="text-sm font-black text-slate-700">
                            {new Date(schedule.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    {/* Time */}
                    {schedule.time && (
                        <div className="bg-white p-5 rounded-[2rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-200 mb-3">
                                <Clock className="h-6 w-6 text-amber-500" />
                            </div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Waktu</span>
                            <span className="text-sm font-black text-slate-700">{schedule.time}</span>
                        </div>
                    )}

                    {/* Location */}
                    {schedule.location && (
                        <div className="bg-white p-5 rounded-[2rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center border-2 border-teal-200 mb-3">
                                <MapPin className="h-6 w-6 text-teal-500" />
                            </div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Lokasi</span>
                            <span className="text-sm font-black text-slate-700 line-clamp-2">{schedule.location}</span>
                        </div>
                    )}
                </div>

                {/* Full Description */}
                {schedule.fullDescription && (
                  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[6px_6px_0_0_#cbd5e1]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center border-2 border-indigo-200">
                            <Sparkles className="h-5 w-5 text-indigo-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">Detail Lengkap</h3>
                    </div>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 font-medium leading-relaxed text-lg">
                            {schedule.fullDescription}
                        </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: INSTRUCTOR & CONTACT */}
              <div className="space-y-8">
                
                {/* Instructor Card */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[8px_8px_0_0_#cbd5e1] overflow-hidden text-center p-8 relative">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-teal-400 to-emerald-500"></div>
                  
                  <div className="relative mb-4">
                    <div className="w-28 h-28 mx-auto rounded-full p-1 bg-white border-4 border-white shadow-md">
                        <img
                            src={schedule.pemateriAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${schedule.pemateri}`}
                            alt={schedule.pemateri || "Pemateri"}
                            className="w-full h-full rounded-full object-cover bg-slate-100"
                        />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-800 mb-1">{schedule.pemateri || "Pemateri"}</h3>
                  <p className="text-teal-600 font-bold text-sm bg-teal-50 inline-block px-3 py-1 rounded-lg border border-teal-100 mb-6">
                    {schedule.pemateriSpecialization || "Instruktur Ahli"}
                  </p>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">— Hubungi Pemateri —</p>
                    
                    {/* WhatsApp Button */}
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-1.5 pr-4 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 active:translate-y-[2px] transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center border-2 border-emerald-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                         {/* Fallback jika gambar WA tidak ada, pakai icon Phone */}
                         <Image src="/WhatsApp.svg.webp" alt="WA" width={24} height={24} className="w-6 h-6" onError={(e) => e.currentTarget.style.display='none'} />
                         <Phone className="w-5 h-5 hidden group-hover:block" /> 
                      </div>
                      <div className="ml-3 text-left">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">WhatsApp</p>
                        <p className="text-sm font-black text-slate-700">Chat Sekarang</p>
                      </div>
                    </a>

                    {/* Email Button */}
                    <a
                      href="mailto:instruktur@irmaverse.local"
                      className="flex items-center p-1.5 pr-4 rounded-2xl bg-white border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 active:translate-y-[2px] transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center border-2 border-blue-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                         <Mail className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <div className="ml-3 text-left">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Email</p>
                        <p className="text-sm font-black text-slate-700">Kirim Email</p>
                      </div>
                    </a>

                    {/* Phone Button */}
                    <a
                      href="tel:+6281234567890"
                      className="flex items-center p-1.5 pr-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-500 hover:bg-slate-50 active:translate-y-[2px] transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center border-2 border-slate-800 text-white shrink-0 group-hover:scale-105 transition-transform">
                         <Phone className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <div className="ml-3 text-left">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Telepon</p>
                        <p className="text-sm font-black text-slate-700">+62 812-3456</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Important Note */}
                <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-[2rem] shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                    </div>
                    <div>
                        <p className="text-sm font-black text-amber-800 mb-1">Penting!</p>
                        <p className="text-xs font-bold text-amber-700/80 leading-relaxed">
                            Pastikan Anda menghubungi instruktur pada jam kerja (08.00 - 16.00 WIB) untuk respon yang lebih cepat.
                        </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetail;