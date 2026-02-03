"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import { ArrowLeft, Download, Eye, MessageSquare } from "lucide-react";

interface AttendanceUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Attendance {
  id: string;
  userId: string;
  materialId: string;
  status: string;
  session?: string;
  date?: string;
  time?: string;
  location?: string;
  notes?: string;
  reason?: string;
  instructorArrival?: string;
  startTime?: string;
  endTime?: string;
  rating?: number;
  clarity?: string;
  relevance?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  user?: AttendanceUser;
}

interface Material {
  id: string;
  title: string;
  date: string;
}

const AttendanceViewer = () => {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    },
  });

  const [material, setMaterial] = useState<Material | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const materialId = params?.id as string;

  useEffect(() => {
    if (materialId) {
      fetchAttendances();
    }
  }, [materialId]);

  const fetchAttendances = async () => {
    try {
      const res = await fetch(`/api/materials/${materialId}/attendance`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("API Error:", res.status, errorData);
        
        if (res.status === 403) {
          alert("Anda tidak memiliki akses untuk melihat data ini");
          router.push("/materials");
          return;
        }
        throw new Error(`Failed to fetch attendance: ${res.status} ${errorData.error || ""}`);
      }

      const data = await res.json();
      setMaterial(data.material);
      setAttendances(data.attendances);
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      alert(`Gagal memuat data absensi: ${error.message}`);
      router.push("/materials");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Nama",
      "Email",
      "Status",
      "Tanggal Absen",
      "Catatan",
      "Rating",
      "Feedback",
    ];
    const rows = attendances.map((att) => [
      att.user?.name || "N/A",
      att.user?.email || "N/A",
      att.status || "-",
      att.date || "-",
      att.notes || "-",
      att.rating || "-",
      att.feedback || "-",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${materialId}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-500">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />

        <div className="flex-1 px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/materials")}
                  className="p-2 rounded-lg hover:bg-slate-200 transition"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                  <h1 className="text-3xl font-black text-slate-800">
                    Data Absensi
                  </h1>
                  <p className="text-slate-600">
                    {material?.title} - {material?.date && new Date(material.date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400 text-white font-bold border-2 border-emerald-600 border-b-4 hover:bg-emerald-500 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-600 mb-1">
                  Total Peserta
                </p>
                <p className="text-3xl font-black text-slate-800">
                  {attendances.length}
                </p>
              </div>

              <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-600 mb-1">
                  Hadir
                </p>
                <p className="text-3xl font-black text-emerald-600">
                  {attendances.filter((a) => a.status === "hadir").length}
                </p>
              </div>

              <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-600 mb-1">
                  Rating Rata-rata
                </p>
                <p className="text-3xl font-black text-amber-600">
                  {attendances.length > 0
                    ? (
                        attendances.reduce((sum, a) => sum + (a.rating || 0), 0) /
                        attendances.filter((a) => a.rating).length
                      ).toFixed(1)
                    : "-"}
                </p>
              </div>
            </div>

            {/* Attendance List */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-800">
                Daftar Peserta
              </h2>

              {attendances.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-slate-200 p-8 text-center">
                  <p className="text-slate-500">Belum ada data absensi</p>
                </div>
              ) : (
                attendances.map((att) => (
                  <div
                    key={att.id}
                    className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden"
                  >
                    {/* Header */}
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === att.id ? null : att.id)
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition group"
                    >
                      <div className="flex items-center gap-4 flex-1 text-left">
                        {att.user?.avatar ? (
                          <img
                            src={att.user.avatar}
                            alt={att.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-sm font-bold text-slate-600">
                              {att.user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="font-bold text-slate-800">
                            {att.user?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {att.user?.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              att.status === "hadir"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {att.status || "Tidak diketahui"}
                          </span>

                          {att.rating && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                              ⭐ {att.rating}
                            </span>
                          )}
                        </div>
                      </div>

                      <Eye className="h-5 w-5 text-slate-400 group-hover:text-slate-600 ml-2" />
                    </button>

                    {/* Expanded Details */}
                    {expandedId === att.id && (
                      <div className="border-t-2 border-slate-100 px-6 py-4 bg-slate-50 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          {att.date && (
                            <div>
                              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Tanggal Absen
                              </p>
                              <p className="text-sm text-slate-800 font-semibold">
                                {new Date(att.date).toLocaleDateString(
                                  "id-ID"
                                )}
                              </p>
                            </div>
                          )}

                          {att.time && (
                            <div>
                              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Waktu
                              </p>
                              <p className="text-sm text-slate-800 font-semibold">
                                {att.time}
                              </p>
                            </div>
                          )}

                          {att.location && (
                            <div>
                              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Lokasi
                              </p>
                              <p className="text-sm text-slate-800 font-semibold">
                                {att.location}
                              </p>
                            </div>
                          )}

                          {att.startTime && att.endTime && (
                            <div>
                              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Durasi
                              </p>
                              <p className="text-sm text-slate-800 font-semibold">
                                {att.startTime} - {att.endTime}
                              </p>
                            </div>
                          )}

                          {att.rating && (
                            <div>
                              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Rating
                              </p>
                              <p className="text-sm text-slate-800 font-semibold">
                                {att.rating} / 5 ⭐
                              </p>
                            </div>
                          )}

                          {att.clarity && (
                            <div>
                              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Kejelasan Materi
                              </p>
                              <p className="text-sm text-slate-800 font-semibold capitalize">
                                {att.clarity}
                              </p>
                            </div>
                          )}
                        </div>

                        {att.notes && (
                          <div>
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                              Catatan
                            </p>
                            <p className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200">
                              {att.notes}
                            </p>
                          </div>
                        )}

                        {att.feedback && (
                          <div>
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-2">
                              <MessageSquare className="h-3 w-3" />
                              Feedback
                            </p>
                            <p className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200">
                              {att.feedback}
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-slate-500 pt-2">
                          Dikirim pada:{" "}
                          {new Date(att.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <ChatbotButton />
    </div>
  );
};

export default AttendanceViewer;
