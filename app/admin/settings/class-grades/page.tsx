"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from "lucide-react";
import Toast from "@/components/ui/Toast";
import Loading from "@/components/ui/Loading";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ClassGrade {
  id: string;
  code: string;
  label: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function ClassGradesPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    },
  });

  const router = useRouter();
  const [grades, setGrades] = useState<ClassGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: "", label: "", order: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      if (
        session?.user?.role !== "admin" &&
        session?.user?.role !== "super_admin"
      ) {
        router.push("/");
        return;
      }
      fetchGrades();
    }
  }, [status, session, router]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings/class-grades");
      if (!res.ok) throw new Error("Failed to fetch grades");
      const data = await res.json();
      console.log("Fetched grades:", data);
      setGrades(data.grades || []);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setNotification({
        type: "error",
        message: "Gagal memuat data kelas",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.label.trim()) {
      setNotification({
        type: "error",
        message: "Kode dan label tidak boleh kosong",
      });
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/admin/settings/class-grades/${editingId}`
        : "/api/admin/settings/class-grades";
      const method = editingId ? "PATCH" : "POST";

      console.log("Submitting grade:", {
        code: formData.code,
        label: formData.label,
        order: formData.order,
        method,
        url,
      });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          label: formData.label,
          order: parseInt(String(formData.order)),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save grade");
      }

      const responseData = await res.json();
      console.log("Grade saved successfully:", responseData);

      setNotification({
        type: "success",
        message: editingId ? "Kelas diperbarui" : "Kelas ditambahkan",
      });

      resetForm();
      // Add a small delay to ensure database write completes
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchGrades();
    } catch (error) {
      console.error("Error saving grade:", error);
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Gagal menyimpan kelas",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (grade: ClassGrade) => {
    setFormData({
      code: grade.code,
      label: grade.label,
      order: grade.order,
    });
    setEditingId(grade.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(
        `/api/admin/settings/class-grades/${deleteTarget}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Failed to delete grade");

      setNotification({
        type: "success",
        message: "Kelas dihapus",
      });

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      await fetchGrades();
    } catch (error) {
      console.error("Error deleting grade:", error);
      setNotification({
        type: "error",
        message: "Gagal menghapus kelas",
      });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/settings/class-grades/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (!res.ok) throw new Error("Failed to update grade");

      setNotification({
        type: "success",
        message: `Kelas ${!currentActive ? "diaktifkan" : "dinonaktifkan"}`,
      });

      await fetchGrades();
    } catch (error) {
      console.error("Error updating grade:", error);
      setNotification({
        type: "error",
        message: "Gagal memperbarui status kelas",
      });
    }
  };

  const resetForm = () => {
    setFormData({ code: "", label: "", order: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loading text="Memuat data kelas..." />
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
                Manajemen Kelas
              </h1>
              <p className="text-slate-500 font-medium">
                Kelola kelas dan tingkat yang tersedia dalam sistem
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl border-2 border-emerald-600 shadow-[0_4px_0_0_#059669] hover:bg-emerald-600 active:translate-y-1 transition-all"
            >
              <Plus className="w-5 h-5" /> Tambah Kelas
            </button>
          </div>

          {/* Mobile Add Button */}
          <div className="md:hidden mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl border-2 border-emerald-600 shadow-[0_4px_0_0_#059669]"
            >
              <Plus className="w-5 h-5" /> Tambah Kelas
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 md:p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-slate-800">
                    {editingId ? "Edit Kelas" : "Tambah Kelas Baru"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Kode Kelas
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="Contoh: X, XI, XII"
                      maxLength={10}
                      className="w-full px-4 py-2 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Label Kelas
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      placeholder="Contoh: Kelas X, Kelas XI, Kelas XII"
                      className="w-full px-4 py-2 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Urutan Tampilan
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value),
                        })
                      }
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl border-2 border-emerald-600 shadow-[0_4px_0_0_#059669] hover:bg-emerald-600 active:translate-y-1 disabled:opacity-50 transition-all"
                    >
                      {submitting ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl border-2 border-slate-300 hover:bg-slate-300 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1] overflow-hidden">
            {grades.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 font-medium">
                  Belum ada data kelas
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Kode
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Label
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Urutan
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade, idx) => (
                      <tr
                        key={grade.id}
                        className={`border-b-2 border-slate-100 hover:bg-slate-50 transition-all ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm">
                            {grade.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">
                            {grade.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">
                            {grade.order}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleToggleActive(grade.id, grade.isActive)
                            }
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-sm transition-all ${
                              grade.isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {grade.isActive ? (
                              <>
                                <Eye className="w-4 h-4" /> Aktif
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" /> Nonaktif
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(grade)}
                              className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(grade.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                              title="Hapus"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 text-center">
              <p className="text-3xl font-black text-slate-800">
                {grades.length}
              </p>
              <p className="text-sm font-bold text-slate-600">Total Kelas</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 text-center">
              <p className="text-3xl font-black text-green-600">
                {grades.filter((g) => g.isActive).length}
              </p>
              <p className="text-sm font-bold text-slate-600">Aktif</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 text-center">
              <p className="text-3xl font-black text-gray-600">
                {grades.filter((g) => !g.isActive).length}
              </p>
              <p className="text-sm font-bold text-slate-600">Nonaktif</p>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        type="warning"
        title="Hapus Kelas?"
        message="Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
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
