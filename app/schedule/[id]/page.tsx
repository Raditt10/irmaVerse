"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardHeader from "@/components/ui/DashboardHeader";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/ChatbotButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, User, Clock, Users, ArrowLeft, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: ""
  });
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
    setFormData(prev => ({
      ...prev,
      fullName: "Rafaditya Syahputra",
      email: "rafaditya@irmaverse.local"
    }));
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
      console.log("Looking for ID:", scheduleId, "Found:", foundSchedule);
      setSchedule(foundSchedule || null);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`✅ Pendaftaran berhasil!\n\nAnda telah terdaftar untuk: ${schedule?.title}\n\nKonfirmasi akan dikirim ke email: ${formData.email}`);
      router.push('/schedule');
    } catch (error) {
      alert("❌ Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setIsRegistering(false);
    }
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
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
        <DashboardHeader user={user} />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
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
    // Try to render with default data if not found
    const defaultSchedule: Schedule = {
      id: scheduleId,
      title: "Event Tidak Ditemukan",
      description: "Maaf, event yang Anda cari tidak tersedia.",
      date: new Date().toISOString().split('T')[0],
      location: "-",
      pemateri: "-",
      status: "Tidak Tersedia"
    };
    
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
        <DashboardHeader user={user} />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => router.push('/schedule')}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 font-semibold"
              >
                <ArrowLeft className="h-5 w-5" />
                Kembali ke Schedule
              </button>
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-lg mb-4">Event tidak ditemukan</p>
                <p className="text-sm text-slate-600 mb-6">ID yang dicari: {scheduleId}</p>
                <button
                  onClick={() => router.push('/schedule')}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  Kembali ke Daftar Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canRegister = schedule.status === "Segera hadir";
  const isFull = schedule.maxParticipants && schedule.registeredCount ? schedule.registeredCount >= schedule.maxParticipants : false;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
      <DashboardHeader user={user} />
      <div className="flex">
        <Sidebar />
        <ChatbotButton />
        <div className="flex-1 px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push('/schedule')}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 font-semibold"
            >
              <ArrowLeft className="h-5 w-5" />
              Kembali ke Schedule
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden border-slate-200">
                {/* Image */}
                <div className="h-64 overflow-hidden">
                  <img
                    src={schedule.image || "https://picsum.photos/800/400"}
                    alt={schedule.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <CardHeader>
                  <CardTitle className="text-3xl font-black text-slate-800">
                    {schedule.title}
                  </CardTitle>
                  <p className="text-slate-600 text-lg mt-2">{schedule.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Details */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Detail Acara</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-slate-500">Tanggal</p>
                          <p className="text-slate-800 font-semibold">
                            {new Date(schedule.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      {schedule.time && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500">Waktu</p>
                            <p className="text-slate-800 font-semibold">{schedule.time}</p>
                          </div>
                        </div>
                      )}
                      
                      {schedule.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500">Lokasi</p>
                            <p className="text-slate-800 font-semibold">{schedule.location}</p>
                          </div>
                        </div>
                      )}
                      
                      {schedule.registeredCount !== undefined && (
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-slate-500">Peserta</p>
                            <p className="text-slate-800 font-semibold">
                              {schedule.registeredCount} peserta terdaftar
                              {schedule.maxParticipants && ` / ${schedule.maxParticipants} maks`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="text-sm text-emerald-800">
                      <span className="font-semibold">Status:</span> {schedule.status}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hubungi Instruktur Section */}
            <div className="lg:col-span-full">
              <Card className="border-slate-200 sticky top-24">
                <CardHeader className="bg-linear-to-r from-teal-500 to-cyan-500 text-white py-8 px-8">
                  <CardTitle className="text-4xl font-black">Hubungi Instruktur Sekarang</CardTitle>
                </CardHeader>

                <CardContent className="mt-6 space-y-6">
                  {/* Instructor Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-6 w-6 text-teal-600 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 font-semibold">PEMATERI</p>
                        <p className="text-lg font-bold text-slate-800">{schedule.pemateri || "-"}</p>
                      </div>
                    </div>

                    <div className="h-px bg-slate-200"></div>

                    {/* Contact Methods */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* WhatsApp */}
                      <a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-all"
                      >
                        <div className="bg-green-500 text-white p-2 rounded-full shrink-0">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.173 0-5.898 1.847-5.898 4.13-.404 2.96-1.962 3.203-5.348 5.199 0 0-1.256.930 1.076 3.659 3.022 2.31 4.066 1.889 5.909 3.384 1.843 1.495 1.843 3.744 5.26 3.744 3.173 0 5.898-1.847 5.898-4.13-.404-2.96-1.962-3.203-5.348-5.199 0 0-1.256-.93 1.076-3.659-3.022-2.31-4.066-1.889-5.909-3.384zm0-2.172c4.417 0 8.031 2.686 8.031 6.002 0 .987-.184 1.911-.48 2.79.667 1.479 1.034 3.085 1.034 4.787 0 4.316-3.586 7.815-8.031 7.815-4.446 0-8.032-3.499-8.032-7.815 0-1.702.368-3.308 1.035-4.787-.295-.879-.48-1.803-.48-2.79 0-3.316 3.614-6.002 8.032-6.002z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 font-semibold">HUBUNGI VIA WHATSAPP</p>
                          <p className="text-sm font-semibold text-slate-800">+62 812-3456-7890</p>
                        </div>
                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>

                      {/* Email */}
                      <a
                        href="mailto:instruktur@irmaverse.local"
                        className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all"
                      >
                        <div className="bg-blue-500 text-white p-2 rounded-full shrink-0">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22 6 12 13 2 6" fill="none" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 font-semibold">HUBUNGI VIA EMAIL</p>
                          <p className="text-sm font-semibold text-slate-800">instruktur@irmaverse.local</p>
                        </div>
                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>

                      {/* Phone */}
                      <a
                        href="tel:+6281234567890"
                        className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-all"
                      >
                        <div className="bg-purple-500 text-white p-2 rounded-full shrink-0">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 font-semibold">HUBUNGI VIA TELEPON</p>
                          <p className="text-sm font-semibold text-slate-800">+62 812-3456-7890</p>
                        </div>
                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-amber-900">Perhatian</p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Hubungi instruktur langsung untuk mendapatkan informasi lebih detail tentang event ini, termasuk topik khusus yang akan dibahas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetail;