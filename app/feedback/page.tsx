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
    name: string;
    avatar?: string;
  };
}

export default function FeedbackPage() {
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
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<
    "feature_request" | "bug_report"
  >("feature_request");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFeedback();
    }
  }, [status]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setNotification({
        type: "error",
        message: "Judul dan deskripsi tidak boleh kosong",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          title,
          description,
          priority,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit feedback");

      setNotification({
        type: "success",
        message: "Terima kasih atas feedback Anda!",
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setShowForm(false);
      await fetchFeedback();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setNotification({
        type: "error",
        message: "Gagal mengirim feedback",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFeedback) return;

    try {
      const res = await fetch(`/api/feedback/${selectedFeedback}`, {
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

  const getTypeIcon = (type: string) => {
    return type === "bug_report" ? (
      <Bug className="w-5 h-5 text-red-500" />
    ) : (
      <Lightbulb className="w-5 h-5 text-yellow-500" />
    );
  };

  const getTypeLabel = (type: string) => {
    return type === "bug_report" ? "Bug Report" : "Feature Request";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: "Terbuka",
      in_progress: "Sedang Diproses",
      completed: "Selesai",
      closed: "Ditutup",
    };
    return labels[status] || status;
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
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto pb-32">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
                  Feedback & Saran
                </h1>
                <p className="text-slate-500 font-medium">
                  Bagikan ide dan laporkan bug untuk membantu kami berkembang
                </p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl border-2 border-emerald-600 shadow-[0_4px_0_0_#059669] hover:bg-emerald-600 active:translate-y-1 transition-all"
              >
                <Send className="w-5 h-5" /> Kirim Feedback
              </button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1] p-6 md:p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">
                  Feedback Baru
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Jenis Feedback
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        id: "feature_request",
                        label: "Feature Request",
                        icon: Lightbulb,
                      },
                      { id: "bug_report", label: "Bug Report", icon: Bug },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          setSelectedType(
                            id as "feature_request" | "bug_report",
                          )
                        }
                        className={`p-4 rounded-xl border-2 font-bold flex items-center gap-2 transition-all ${
                          selectedType === id
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Judul
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Jelaskan feedback Anda secara singkat"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Deskripsi Detail
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan detail feedback Anda..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Prioritas
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                    <option value="critical">Kritis</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl border-2 border-emerald-600 shadow-[0_4px_0_0_#059669] hover:bg-emerald-600 active:translate-y-1 disabled:opacity-50 transition-all"
                  >
                    {submitting ? "Mengirim..." : "Kirim Feedback"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl border-2 border-slate-300 hover:bg-slate-300 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile Add Button */}
          <div className="md:hidden mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl border-2 border-emerald-600 shadow-[0_4px_0_0_#059669]"
            >
              <Send className="w-5 h-5" /> Kirim Feedback
            </button>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {feedbackList.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Belum ada feedback</p>
              </div>
            ) : (
              feedbackList.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-[0_6px_0_0_#cbd5e1] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(feedback.type)}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800">
                          {feedback.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          oleh {feedback.users.name} •{" "}
                          {new Date(feedback.createdAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(feedback.priority)}`}
                    >
                      {feedback.priority}
                    </span>
                  </div>

                  <p className="text-slate-600 font-medium mb-4">
                    {feedback.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                        {getTypeLabel(feedback.type)}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {getStatusLabel(feedback.status)}
                      </span>
                    </div>
                    {session?.user?.id === feedback.users.name ||
                    session?.user?.role === "admin" ? (
                      <button
                        onClick={() => {
                          setSelectedFeedback(feedback.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-500 hover:text-red-700 font-bold text-sm"
                      >
                        Hapus
                      </button>
                    ) : null}
                  </div>

                  {feedback.response && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 font-bold mb-2">
                        Respons Admin:
                      </p>
                      <p className="text-slate-600 text-sm">
                        {feedback.response}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        type="warning"
        title="Hapus Feedback?"
        message="Apakah Anda yakin ingin menghapus feedback ini?"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedFeedback(null);
        }}
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
