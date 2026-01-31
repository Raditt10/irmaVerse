"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/DashboardHeader";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/ChatbotButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin,
  Users,
  Clock,
  Mail,
  Phone,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

import Image from "next/image";

interface Competition {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  prize: string;
  category: "Tahfidz" | "Seni" | "Bahasa" | "Lainnya";
  image: string;
  requirements: string[];
  timeline: Array<{
    phase: string;
    date: string;
  }>;
  judging_criteria: string[];
  prizes: Array<{
    rank: string;
    amount: string;
  }>;
  contact_person: string;
  contact_number: string;
  contact_email: string;
  status: "upcoming" | "ongoing" | "finished";
  participants?: number;
  max_participants?: number;
  instructorId?: string;
}

const CompetitionDetail = () => {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const competitionId = params.id as string;
  const { data: session } = useSession();

  useEffect(() => {
    loadUser();
    if (competitionId) {
      fetchCompetitionDetail();
    }
  }, [competitionId]);

  const loadUser = async () => {
    setUser({
      id: "user-123",
      full_name: "Rafaditya Syahputra",
      email: "rafaditya@irmaverse.local",
      avatar: "RS"
    });
  };

  const fetchCompetitionDetail = async () => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch competition");
      }

      const data = await response.json();
      
      // Format the data to match the component's expected structure
      const formattedCompetition: Competition = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: new Date(data.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        location: data.location,
        prize: data.prize,
        category: data.category,
        image: data.thumbnailUrl || "https://images.unsplash.com/photo-1585779034823-7e9ac8faec70?auto=format&fit=crop&w=1200&q=80",
        requirements: data.requirements || [],
        timeline: data.schedules?.map((s: any) => ({
          phase: s.phase,
          date: s.date,
        })) || [],
        judging_criteria: data.judgingCriteria || [],
        prizes: data.prizes || [],
        contact_person: data.contactPerson || data.instructor?.name || "",
        contact_number: data.contactNumber || data.instructor?.notelp || "",
        contact_email: data.contactEmail || data.instructor?.email || "",
        status: data.status,
        participants: data.currentParticipants,
        max_participants: data.maxParticipants,
        instructorId: data.instructorId,
      };

      setCompetition(formattedCompetition);
    } catch (error) {
      console.error("Error fetching competition:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompetition = async () => {
    if (!competition) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/competitions?id=${competition.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete competition");
      }

      toast.success("Perlombaan berhasil dihapus!");
      router.push("/competitions");
    } catch (error: any) {
      console.error("Error deleting competition:", error);
      toast.error(error.message || "Terjadi kesalahan saat menghapus perlombaan");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditCompetition = () => {
    if (!competition) return;
    router.push(`/competitions/edit/${competition.id}`);
  };

  const getStatusBadge = (status: Competition["status"]) => {
    const statusConfig: Record<Competition["status"], { label: string; color: string }> = {
      "upcoming": { label: "Akan Datang", color: "bg-blue-100 text-blue-700 border-blue-200" },
      "ongoing": { label: "Sedang Berlangsung", color: "bg-amber-100 text-amber-700 border-amber-200" },
      "finished": { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
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
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center py-12">
                <p className="text-slate-500">Memuat detail lomba...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-5xl mx-auto">
              <button
                onClick={() => router.push('/competitions')}
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </button>
              <Card className="text-center py-12">
                <CardContent className="space-y-4">
                  <p className="text-slate-600 text-lg">Kompetisi tidak ditemukan</p>
                  <p className="text-sm text-slate-500">ID: {competitionId}</p>
                  <button
                    onClick={() => router.push('/competitions')}
                    className="inline-block px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Lihat Semua Kompetisi
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
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <ChatbotButton />
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Back Button */}
            <button
              onClick={() => router.push('/competitions')}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Info Perlombaan
            </button>

            {/* Hero Image & Title */}
            <Card className="overflow-hidden">
              <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden bg-linear-to-br from-teal-500 to-cyan-600">
                <img
                  src={competition.image}
                  alt={competition.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <div className="mb-3">
                    {getStatusBadge(competition.status)}
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
                    {competition.title}
                  </h1>
                  <p className="text-slate-100 text-sm sm:text-base max-w-2xl">
                    {competition.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Info Cards */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Informasi Kompetisi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <Calendar className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Tanggal</p>
                          <p className="text-sm font-semibold text-slate-800">{competition.date}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <MapPin className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Lokasi</p>
                          <p className="text-sm font-semibold text-slate-800">{competition.location}</p>
                        </div>
                      </div>

                      {/* Ikon Award di info hadiah dihapus */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Hadiah Juara 1</p>
                          <p className="text-sm font-semibold text-slate-800">{competition.prize}</p>
                        </div>
                      </div>

                      {competition.participants !== undefined && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                          <Users className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">Peserta</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {competition.participants} / {competition.max_participants}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                {competition.timeline && competition.timeline.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        Jadwal Kompetisi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {competition.timeline.map((item, index) => (
                          <div key={index} className="flex gap-4 pb-4 last:pb-0 last:border-b-0 border-b border-slate-200">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              {index < competition.timeline.length - 1 && (
                                <div className="w-0.5 h-12 bg-teal-200 mt-2" />
                              )}
                            </div>
                            <div className="pt-1">
                              <p className="text-sm font-semibold text-slate-800">{item.phase}</p>
                              <p className="text-xs text-slate-600">{item.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Prize Distribution */}
                {competition.prizes && competition.prizes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        Hadiah Pemenang
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {competition.prizes.map((item, index) => (
                          <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                            <span className="text-sm font-semibold text-slate-800">{item.rank}</span>
                            <span className="text-sm font-bold text-emerald-600">{item.amount}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Registration CTA */}
                <Card className="overflow-hidden border-teal-200 bg-linear-to-br from-teal-50 to-cyan-50">
                  <CardContent className="p-6 text-center">
                    {/* Ikon Award di CTA dihapus */}
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Siap Membuktikan Kemampuanmu?</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Daftarkan diri kamu sekarang dan tunjukkan prestasi terbaik kamu!
                    </p>
                    <button className="w-full py-3 rounded-xl bg-linear-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:from-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300">
                      Hubungi Panitia Sekarang juga!
                    </button>
                  </CardContent>
                </Card>

                {/* Info Note */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-900 mb-1">Informasi Penting</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Hubungi panitia untuk detail lebih lanjut dan konfirmasi pendaftaran Anda.
                  </p>
                </div>
              </div>

              {/* Contact Card */}
              <div className="space-y-6">
                <Card className="overflow-hidden border-slate-200 shadow-sm">
                  <div className="p-8 text-center">
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-linear-to-br from-teal-500 to-cyan-600 p-0.5 flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <span className="text-2xl font-bold text-teal-600">
                              {competition.contact_person.split(' ')[0][0]}{competition.contact_person.split(' ')[1]?.[0] || ''}
                            </span>
                          </div>
                        </div>
                        {/* Ikon Award di avatar panitia dihapus */}
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">
                        {competition.contact_person}
                      </h3>
                      <p className="text-slate-600 text-sm font-semibold">
                        Panitia Kompetisi
                      </p>
                    </div>

                    {/* Contact Section Title */}
                    <p className="text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                      Hubungi panitia untuk informasi lebih lanjut
                    </p>

                    {/* Contact Buttons */}
                    <div className="space-y-3">
                      <a
                        href={`https://wa.me/${competition.contact_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors group"
                      >
                        <div className="p-2 bg-green-500 text-white rounded-lg shrink-0">
                          <Image
                            src="/WhatsApp.svg.webp"
                            alt="WhatsApp"
                            width={20}
                            height={20}
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs text-slate-600 font-medium">WhatsApp</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">{competition.contact_number}</p>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-slate-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </a>

                      <a
                        href={`mailto:${competition.contact_email}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group"
                      >
                        <div className="p-2 bg-blue-500 text-white rounded-lg shrink-0">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs text-slate-600 font-medium">Email</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">{competition.contact_email}</p>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-slate-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </a>

                      <a
                        href={`tel:${competition.contact_number}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors group"
                      >
                        <div className="p-2 bg-slate-600 text-white rounded-lg shrink-0">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs text-slate-600 font-medium">Telepon</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">{competition.contact_number}</p>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-slate-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </Card>

                {/* Admin Actions - Only for Instructor who created this competition */}
                {session?.user?.role === "instruktur" && 
                 session?.user?.id === competition.instructorId && (
                  <Card className="overflow-hidden border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        Kelola Perlombaan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <button
                        onClick={handleEditCompetition}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Perlombaan
                      </button>
                      <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus Perlombaan
                      </button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Perlombaan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus perlombaan <strong>{competition?.title}</strong>?
              Tindakan ini tidak dapat dibatalkan dan semua data terkait akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteCompetition}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompetitionDetail;
