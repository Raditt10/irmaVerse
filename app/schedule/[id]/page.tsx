"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import ButtonEdit from "@/components/ui/ButtonEdit";
import DeleteButton from "@/components/ui/DeleteButton";
import { 
  Calendar, 
  MapPin, 
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

  const isInstructor = session?.user?.role === "instruktur" || session?.user?.role === "admin";

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

  const handleDelete = async () => {
    try {
        const response = await fetch(`/api/schedules/${scheduleId}`, {
            method: "DELETE",
        });

        if (!response.ok) throw new Error("Gagal menghapus event");

        router.push("/schedule"); 
    } catch (error) {
        console.error("Error deleting schedule:", error);
        alert("Gagal menghapus event. Silakan coba lagi.");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      "Segera hadir": "bg-emerald-400 text-white border-emerald-600 shadow-[2px_2px_0_0_#065f46] md:shadow-[4px_4px_0_0_#065f46]",
      "Sedang berlangsung": "bg-blue-400 text-white border-blue-600 shadow-[2px_2px_0_0_#1e40af] md:shadow-[4px_4px_0_0_#1e40af]",
      "Acara telah dilaksanakan": "bg-slate-400 text-white border-slate-600 shadow-[2px_2px_0_0_#475569] md:shadow-[4px_4px_0_0_#475569]"
    };

    const style = statusConfig[status] || statusConfig["Segera hadir"];
    return (
      <span className={`inline-flex items-center px-3 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black border-2 uppercase tracking-wide transform -rotate-2 ${style}`}>
        {status}
      </span>
    );
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-4 py-12 flex justify-center items-center">
             <div className="flex flex-col items-center animate-pulse">
                <Sparkles className="h-10 w-10 md:h-12 md:w-12 text-teal-400 mb-4 animate-spin" />
                <p className="text-slate-400 font-bold text-sm md:text-base">Sedang mengambil data event...</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- NOT FOUND STATE ---
  if (!schedule) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-4 md:px-6 py-12">
            <div className="max-w-3xl mx-auto text-center py-12 md:py-20 bg-white rounded-3xl md:rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] md:shadow-[8px_8px_0_0_#cbd5e1]">
                <div className="inline-block p-4 md:p-6 rounded-full bg-slate-50 border-2 border-slate-100 mb-6">
                    <SearchX className="h-10 w-10 md:h-16 md:w-16 text-slate-300" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-700 mb-2">Event Tidak Ditemukan</h2>
                <p className="text-slate-500 font-medium mb-8 text-sm md:text-base px-4">Sepertinya event ini sudah dihapus atau link-nya salah.</p>
                <button
                  onClick={() => router.push('/schedule')}
                  className="px-6 py-3 bg-teal-400 text-white font-black rounded-xl md:rounded-2xl border-2 border-teal-600 shadow-[4px_4px_0_0_#0f766e] hover:translate-y-0.5 hover:shadow-none transition-all text-sm md:text-base"
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
    <div className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <ChatbotButton />
        
        {/* Main Content Wrapper - Responsif padding */}
        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            
            {/* --- HEADER NAVIGATION & ACTIONS --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={() => router.back()}
                  className="self-start inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-500 font-bold hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#cbd5e1] active:translate-y-0.5 active:shadow-none transition-all text-sm lg:text-base"
                >
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" strokeWidth={3} />
                  Kembali
                </button>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end sm:self-auto">
                    {isInstructor && (
                        <>
                            <ButtonEdit 
                                id={schedule.id} 
                                basePath="/schedule" 
                                className="py-2! px-3! md:px-4! min-w-0! text-xs md:text-sm h-10! md:h-auto!" 
                            />
                            
                            <DeleteButton 
                                onClick={handleDelete}
                                variant="icon-only"
                                confirmTitle="Hapus Event?"
                                confirmMessage="Event ini akan dihapus permanen. Lanjutkan?"
                                className="p-2! md:p-2.5! rounded-xl h-10 w-10 md:h-auto md:w-auto"
                            />
                        </>
                    )}

                    <button className="p-2 md:p-2.5 bg-white rounded-xl border-2 border-slate-200 text-slate-400 hover:text-teal-500 hover:border-teal-400 transition-all shadow-sm h-10 w-10 md:h-auto md:w-auto flex items-center justify-center">
                        <Share2 className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* --- HERO SECTION --- */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] overflow-hidden border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] md:shadow-[8px_8px_0_0_#cbd5e1] group">
              <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
                <img
                  src={schedule.image || "https://picsum.photos/seed/event1/1200/600"}
                  alt={schedule.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10">
                  <div className="mb-3 md:mb-4">
                    {getStatusBadge(schedule.status || "")}
                  </div>
                  {/* Text Balance agar judul panjang rapi di HP */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 md:mb-3 leading-tight drop-shadow-md text-balance">
                    {schedule.title}
                  </h1>
                  <p className="text-slate-200 text-sm md:text-lg font-medium max-w-3xl line-clamp-2 leading-relaxed">
                    {schedule.description}
                  </p>
                </div>
              </div>
            </div>

            {/* --- CONTENT GRID --- */}
            {/* Di HP 1 kolom, di Desktop 3 kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* LEFT COLUMN: DETAILS */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                
                {/* Info Cards Grid - Di HP grid 1 atau 2, Desktop grid 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    {/* Date */}
                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-4xl border-2 border-slate-200 shadow-[2px_2px_0_0_#cbd5e1] md:shadow-[4px_4px_0_0_#cbd5e1] flex flex-row sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center hover:-translate-y-1 transition-transform">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-100 rounded-full flex items-center justify-center border-2 border-rose-200 shrink-0">
                            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-rose-500" />
                        </div>
                        <div>
                           <span className="block text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tanggal</span>
                           <span className="text-sm md:text-sm font-black text-slate-700">
                               {new Date(schedule.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </span>
                        </div>
                    </div>

                    {/* Time */}
                    {schedule.time && (
                        <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-4xl border-2 border-slate-200 shadow-[2px_2px_0_0_#cbd5e1] md:shadow-[4px_4px_0_0_#cbd5e1] flex flex-row sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center hover:-translate-y-1 transition-transform">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-200 shrink-0">
                                <Clock className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                            </div>
                            <div>
                                <span className="block text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Waktu</span>
                                <span className="text-sm md:text-sm font-black text-slate-700">{schedule.time}</span>
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    {schedule.location && (
                        <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-4xl border-2 border-slate-200 shadow-[2px_2px_0_0_#cbd5e1] md:shadow-[4px_4px_0_0_#cbd5e1] flex flex-row sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center hover:-translate-y-1 transition-transform">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-100 rounded-full flex items-center justify-center border-2 border-teal-200 shrink-0">
                                <MapPin className="h-5 w-5 md:h-6 md:w-6 text-teal-500" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Lokasi</span>
                                <span className="block text-sm md:text-sm font-black text-slate-700 line-clamp-1 sm:line-clamp-2">{schedule.location}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Full Description */}
                {schedule.fullDescription && (
                  <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] md:shadow-[6px_6px_0_0_#cbd5e1]">
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 rounded-full flex items-center justify-center border-2 border-indigo-200">
                            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-indigo-500" />
                        </div>
                        <h3 className="text-lg md:text-2xl font-black text-slate-800">Detail Lengkap</h3>
                    </div>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 font-medium leading-relaxed text-sm md:text-lg whitespace-pre-line text-justify md:text-left">
                            {schedule.fullDescription}
                        </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: INSTRUCTOR & CONTACT */}
              <div className="space-y-6 md:space-y-8">
                
                {/* Instructor Card */}
                <div className="bg-white rounded-3xl md:rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] md:shadow-[8px_8px_0_0_#cbd5e1] overflow-hidden text-center p-6 md:p-8 relative">
                  <div className="absolute top-0 left-0 w-full h-20 md:h-24 bg-gradient-to-br from-teal-400 to-emerald-500"></div>
                  
                  <div className="relative mb-4">
                    <div className="w-20 h-20 md:w-28 md:h-28 mx-auto rounded-full p-1 bg-white border-4 border-white shadow-md">
                        <img
                            src={schedule.pemateriAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${schedule.pemateri}`}
                            alt={schedule.pemateri || "Pemateri"}
                            className="w-full h-full rounded-full object-cover bg-slate-100"
                        />
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-slate-800 mb-1">{schedule.pemateri || "Pemateri"}</h3>
                  <p className="text-teal-600 font-bold text-xs md:text-sm bg-teal-50 inline-block px-3 py-1 rounded-lg border border-teal-100 mb-6">
                    {schedule.pemateriSpecialization || "Instruktur Ahli"}
                  </p>

                  <div className="space-y-3">
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 md:mb-4">— Hubungi Pemateri —</p>
                    
                    {/* WhatsApp Button - Full Width on Mobile */}
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-1.5 pr-4 rounded-xl md:rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 active:translate-y-0.5 transition-all group cursor-pointer w-full"
                    >
                      <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center border-2 border-emerald-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                         <Image src="/WhatsApp.svg.webp" alt="WA" width={20} height={20} className="w-5 h-5 md:w-6 md:h-6" onError={(e) => e.currentTarget.style.display='none'} />
                         <Phone className="w-4 h-4 md:w-5 md:h-5 hidden group-hover:block" /> 
                      </div>
                      <div className="ml-3 text-left">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">WhatsApp</p>
                        <p className="text-xs md:text-sm font-black text-slate-700">Chat Sekarang</p>
                      </div>
                    </a>

                    {/* Email Button */}
                    <a
                      href="mailto:instruktur@irmaverse.local"
                      className="flex items-center p-1.5 pr-4 rounded-xl md:rounded-2xl bg-white border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 active:translate-y-0.5 transition-all group cursor-pointer w-full"
                    >
                      <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-500 rounded-lg md:rounded-xl flex items-center justify-center border-2 border-blue-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                         <Mail className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                      </div>
                      <div className="ml-3 text-left">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Email</p>
                        <p className="text-xs md:text-sm font-black text-slate-700">Kirim Email</p>
                      </div>
                    </a>

                    {/* Phone Button */}
                    <a
                      href="tel:+6281234567890"
                      className="flex items-center p-1.5 pr-4 rounded-xl md:rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-500 hover:bg-slate-50 active:translate-y-0.5 transition-all group cursor-pointer w-full"
                    >
                      <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-700 rounded-lg md:rounded-xl flex items-center justify-center border-2 border-slate-800 text-white shrink-0 group-hover:scale-105 transition-transform">
                         <Phone className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                      </div>
                      <div className="ml-3 text-left">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Telepon</p>
                        <p className="text-xs md:text-sm font-black text-slate-700">+62 812-3456</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Important Note */}
                <div className="p-4 md:p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl md:rounded-4xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full animate-ping"></div>
                    </div>
                    <div>
                        <p className="text-xs md:text-sm font-black text-amber-800 mb-1">Penting!</p>
                        <p className="text-[10px] md:text-xs font-bold text-amber-700/80 leading-relaxed">
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