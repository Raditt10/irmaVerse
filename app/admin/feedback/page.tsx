"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Send,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import Loading from "@/components/ui/Loading";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Feedback {
  id: string;
  type: "feature_request" | "bug_report";
  title: string;
  description: string;
  status: string;
  priority: string;
  votes: number;
  response?: string;
  createdAt: string;
  users: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    },
  });

  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<
    "all" | "feature_request" | "bug_report"
  >("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      if (
        session?.user?.role !== "admin" &&
        session?.user?.role !== "super_admin"
      ) {
        router.push("/");
        return;
      }
      fetchFeedback();
    }
  }, [status, session, router]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/feedback");
      if (!res.ok) throw new Error("Failed to fetch feedback");
      const data = await res.json();
      setFeedbackList(data.feedback || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setNotification({
        type: "error",
        message: "Gagal memuat feedback",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/feedback/${selectedFeedback.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus || selectedFeedback.status,
          priority: newPriority || selectedFeedback.priority,
          response: responseText || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to update feedback");

      setNotification({
        type: "success",
        message: "Feedback diperbarui",
      });

      setShowResponseForm(false);
      setResponseText("");
      setNewStatus("");
      setNewPriority("");
      setSelectedFeedback(null);
      await fetchFeedback();
    } catch (error) {
      console.error("Error updating feedback:", error);
      setNotification({
        type: "error",
        message: "Gagal memperbarui feedback",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      const res = await fetch(`/api/feedback/${selectedFeedback.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete feedback");

      setNotification({
        type: "success",
        message: "Feedback dihapus",
      });

      setShowDeleteConfirm(false);
      setSelectedFeedback(null);
      await fetchFeedback();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      setNotification({
        type: "error",
        message: "Gagal menghapus feedback",
      });
    }
  };

  const getFilteredFeedback = () => {
    return feedbackList.filter((f) => {
      if (filterType !== "all" && f.type !== filterType) return false;
      if (filterStatus !== "all" && f.status !== filterStatus) return false;
      if (filterPriority !== "all" && f.priority !== filterPriority)
        return false;
      return true;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "bug_report" ? (
      <Bug className="w-5 h-5 text-red-500" />
    ) : (
      <Lightbulb className="w-5 h-5 text-yellow-500" />
    );
  };

  const filteredFeedback = getFilteredFeedback();
  const stats = {
    total: feedbackList.length,
    open: feedbackList.filter((f) => f.status === "open").length,
    inProgress: feedbackList.filter((f) => f.status === "in_progress").length,
    completed: feedbackList.filter((f) => f.status === "completed").length,
    critical: feedbackList.filter((f) => f.priority === "critical").length,
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loading text="Memuat feedback..." />
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
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto pb-32">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
              Manajemen Feedback
            </h1>
            <p className="text-slate-500 font-medium">
              Review dan kelola feedback dari pengguna
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
            {[
              { label: "Total", value: stats.total, bg: "bg-slate-100" },
              { label: "Terbuka", value: stats.open, bg: "bg-blue-100" },
              {
                label: "Diproses",
                value: stats.inProgress,
                bg: "bg-yellow-100",
              },
              { label: "Selesai", value: stats.completed, bg: "bg-green-100" },
              { label: "Kritis", value: stats.critical, bg: "bg-red-100" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} rounded-2xl p-4 text-center border-2 border-slate-200`}
              >
                <p className="text-2xl md:text-3xl font-black text-slate-800">
                  {stat.value}
                </p>
                <p className="text-xs md:text-sm font-bold text-slate-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 md:p-6 mb-8 shadow-[0_6px_0_0_#cbd5e1]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Jenis
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium text-sm"
                >
                  <option value="all">Semua</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="bug_report">Bug Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium text-sm"
                >
                  <option value="all">Semua</option>
                  <option value="open">Terbuka</option>
                  <option value="in_progress">Sedang Diproses</option>
                  <option value="completed">Selesai</option>
                  <option value="closed">Ditutup</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Prioritas
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium text-sm"
                >
                  <option value="all">Semua</option>
                  <option value="critical">Kritis</option>
                  <option value="high">Tinggi</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Rendah</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  &nbsp;
                </label>
                <button
                  onClick={() => {
                    setFilterType("all");
                    setFilterStatus("all");
                    setFilterPriority("all");
                  }}
                  className="w-full px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-all text-sm"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  Tidak ada feedback yang sesuai dengan filter
                </p>
              </div>
            ) : (
              filteredFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className={`bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                    selectedFeedback?.id === feedback.id
                      ? "border-emerald-500 bg-emerald-50 shadow-[0_6px_0_0_#10b981]"
                      : "border-slate-200 hover:shadow-[0_6px_0_0_#cbd5e1]"
                  }`}
                  onClick={() => {
                    setSelectedFeedback(feedback);
                    setNewStatus(feedback.status);
                    setNewPriority(feedback.priority);
                    setResponseText(feedback.response || "");
                    setShowResponseForm(false);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(feedback.type)}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800">
                          {feedback.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {feedback.users.name} •{" "}
                          {new Date(feedback.createdAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(feedback.priority)}`}
                      >
                        {feedback.priority}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(feedback.status)}`}
                      >
                        {feedback.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 font-medium text-sm">
                    {feedback.description}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Detail Panel */}
          {selectedFeedback && (
            <div className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white border-l-4 border-emerald-500 shadow-2xl z-40 overflow-y-auto">
              <div className="p-6 border-b-2 border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-xl font-bold text-slate-800">
                  Detail Feedback
                </h3>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Status */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="open">Terbuka</option>
                    <option value="in_progress">Sedang Diproses</option>
                    <option value="completed">Selesai</option>
                    <option value="closed">Ditutup</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Prioritas
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                    <option value="critical">Kritis</option>
                  </select>
                </div>

                {/* Response */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Respons
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Masukkan respons untuk pengguna..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateFeedback}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-emerald-500 text-white font-bold rounded-lg border-2 border-emerald-600 shadow-[0_4px_0_0_#059669] hover:bg-emerald-600 active:translate-y-1 disabled:opacity-50 transition-all"
                  >
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                    }}
                    className="px-4 py-3 bg-red-100 text-red-700 font-bold rounded-lg border-2 border-red-300 hover:bg-red-200 transition-all"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Overlay */}
          {selectedFeedback && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
              onClick={() => setSelectedFeedback(null)}
            />
          )}
        </main>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        type="warning"
        title="Hapus Feedback?"
        message="Apakah Anda yakin ingin menghapus feedback ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteFeedback}
        onClose={() => setShowDeleteConfirm(false)}
      />

      {/* Toast */}
      <Toast
        show={!!notification}
        type={notification?.type || "info"}
        message={notification?.message || ""}
        onClose={() => setNotification(null)}
      />

      <ChatbotButton />
    </div>
  );
}
