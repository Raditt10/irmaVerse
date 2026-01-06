"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardHeader from "@/components/ui/DashboardHeader";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/ChatbotButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, User, Clock, Users, ArrowLeft, Phone, Mail, MessageCircle } from "lucide-react";

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time?: string;
  location: string | null;
  pemateri: string | null;
  registeredCount?: number;
  status?: string;
  image?: string;
  maxParticipants?: number;
}

const ScheduleDetail = () => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;

  useEffect(() => {
    loadUser();
    if (scheduleId) {
      fetchScheduleDetail();
    }
  }, [scheduleId]);

  const loadUser = async () => {
    setUser({
      id: "user-123",
      full_name: "Rafaditya Syahputra",
      email: "rafaditya@irmaverse.local",
      avatar: "RS"
    });
  };

  const fetchScheduleDetail = async () => {
    try {
      const mockSchedules: Schedule[] = [
        {
          id: "1",
          title: "Semesta 1",
          description: "Belajar strategi dakwah di era digital",
          date: "2024-11-25",
          time: "13:00 WIB",
          location: "Aula Utama",
          pemateri: "Ustadz Ahmad Zaki",
          registeredCount: 45,
          maxParticipants: 100,
          status: "Acara telah dilaksanakan",
          image: "https://picsum.photos/seed/event1/800/400"
        },
        {
          id: "2",
          title: "Semesta 2",
          description: "Persiapan menyambut bulan suci",
          date: "2024-11-28",
          time: "14:00 WIB",
          location: "Musholla",
          pemateri: "Ustadzah Fatimah",
          registeredCount: 67,
          maxParticipants: 100,
          status: "Segera hadir",
          image: "https://picsum.photos/seed/event2/800/400"
        },
        {
          id: "3",
          title: "Buka Puasa Bersama",
          description: "Meningkatkan kemampuan menghafal Al-Quran",
          date: "2024-12-01",
          time: "15:00 WIB",
          location: "Ruang Tahfidz",
          pemateri: "Ustadz Muhammad Rizki",
          registeredCount: 32,
          maxParticipants: 80,
          status: "Sedang berlangsung",
          image: "https://picsum.photos/seed/event3/800/400"
        },
        {
          id: "4",
          title: "Seminar Akhlak Pemuda",
          description: "Membangun karakter islami generasi muda",
          date: "2024-12-05",
          time: "09:00 WIB",
          location: "Aula Besar",
          pemateri: "Ustadz Abdullah Hakim",
          registeredCount: 89,
          maxParticipants: 150,
          status: "Acara telah dilaksanakan",
          image: "https://picsum.photos/seed/event4/800/400"
        }
      ];

      const foundSchedule = mockSchedules.find(s => s.id === scheduleId);
      setSchedule(foundSchedule || null);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      "Segera hadir": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Sedang berlangsung": "bg-blue-100 text-blue-700 border-blue-200",
      "Acara telah dilaksanakan": "bg-slate-100 text-slate-600 border-slate-200"
    };

    const color = statusConfig[status] || statusConfig["Segera hadir"];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
        {status}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Memuat...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
        <DashboardHeader user={user} />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center py-12">
                <p className="text-slate-500">Memuat detail event...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
        <DashboardHeader user={user} />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-5xl mx-auto">
              <button
                onClick={() => router.push('/schedule')}
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </button>
              <Card className="text-center py-12">
                <CardContent className="space-y-4">
                  <p className="text-slate-600 text-lg">Event tidak ditemukan</p>
                  <p className="text-sm text-slate-500">ID: {scheduleId}</p>
                  <button
                    onClick={() => router.push('/schedule')}
                    className="inline-block px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Lihat Semua Event
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
      <DashboardHeader user={user} />
      <div className="flex">
        <Sidebar />
        <ChatbotButton />
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Back Button */}
            <button
              onClick={() => router.push('/schedule')}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Jadwal
            </button>

            {/* Hero Image & Title */}
            <Card className="overflow-hidden">
              <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden bg-linear-to-br from-teal-500 to-cyan-600">
                <img
                  src={schedule.image || "https://picsum.photos/seed/event1/1200/600"}
                  alt={schedule.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <div className="mb-3">
                    {getStatusBadge(schedule.status || "")}
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
                    {schedule.title}
                  </h1>
                  <p className="text-slate-100 text-sm sm:text-base max-w-2xl">
                    {schedule.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Detail Event</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <Calendar className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Tanggal</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {new Date(schedule.date).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {schedule.time && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                          <Clock className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Waktu</p>
                            <p className="text-sm font-semibold text-slate-800">{schedule.time}</p>
                          </div>
                        </div>
                      )}

                      {schedule.location && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                          <MapPin className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Lokasi</p>
                            <p className="text-sm font-semibold text-slate-800">{schedule.location}</p>
                          </div>
                        </div>
                      )}

                      {schedule.registeredCount !== undefined && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                          <Users className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Pendaftar</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {schedule.registeredCount}
                              {schedule.maxParticipants && ` / ${schedule.maxParticipants}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Instructor Contact */}
              <div className="space-y-6">
                <Card className="overflow-hidden border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-teal-500 to-cyan-600 p-0.5">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <User className="h-7 w-7 text-teal-600" />
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">Pemateri</p>
                        <CardTitle className="text-xl font-bold text-slate-800">{schedule.pemateri || "-"}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <p className="text-sm text-slate-600 mb-4">Hubungi instruktur untuk informasi lebih lanjut</p>

                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors group"
                    >
                      <div className="p-2 bg-green-500 text-white rounded-lg shrink-0">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600 font-medium">WhatsApp</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">+62 812-3456-7890</p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-slate-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                      href="mailto:instruktur@irmaverse.local"
                      className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group"
                    >
                      <div className="p-2 bg-blue-500 text-white rounded-lg shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600 font-medium">Email</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">instruktur@irmaverse.local</p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-slate-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                      href="tel:+6281234567890"
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors group"
                    >
                      <div className="p-2 bg-slate-600 text-white rounded-lg shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600 font-medium">Telepon</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">+62 812-3456-7890</p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-slate-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </CardContent>
                </Card>

                {/* Info Note */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-900 mb-1">Informasi</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Hubungi instruktur untuk detail materi dan persiapan yang diperlukan.
                  </p>
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
