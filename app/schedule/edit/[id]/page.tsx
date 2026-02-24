"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/InputText";
import { Textarea } from "@/components/ui/textarea";
import CartoonNotification from "@/components/ui/Notification";
import { ArrowLeft, Upload, X } from "lucide-react";

const EditSchedule = () => {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    pemateri: "",
    thumbnailUrl: "",
    maxCapacity: "",
  });

  // Fetch existing schedule data
  useEffect(() => {
    if (scheduleId) {
      fetchScheduleData();
    }
  }, [scheduleId]);

  const fetchScheduleData = async () => {
    try {
      setFetchingData(true);
      const response = await fetch(`/api/schedules/${scheduleId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }

      const data = await response.json();

      // Check if user is the owner
      if (session?.user?.id !== data.instructorId && session?.user?.role !== "admin") {
        setNotification({
          type: "error",
          title: "Akses Ditolak",
          message: "Anda tidak memiliki akses untuk mengedit jadwal ini",
        });
        setTimeout(() => router.push("/schedule"), 2000);
        return;
      }

      // Format date to YYYY-MM-DD for input[type="date"]
      const dateObj = new Date(data.date);
      const formattedDate = dateObj.toISOString().split('T')[0];

      setFormData({
        title: data.title || "",
        description: data.description || "",
        date: formattedDate,
        time: data.time || "",
        location: data.location || "",
        pemateri: data.pemateri || "",
        thumbnailUrl: data.thumbnailUrl || "",
        maxCapacity: data.maxCapacity?.toString() || "",
      });
    } catch (error: any) {
      console.error("Error fetching schedule:", error);
      setNotification({
        type: "error",
        title: "Gagal",
        message: "Gagal memuat data jadwal",
      });
      setTimeout(() => router.push("/schedule"), 2000);
    } finally {
      setFetchingData(false);
    }
  };

  // Redirect if not instructor
  if (status === "authenticated" && session?.user?.role !== "instruktur" && session?.user?.role !== "admin") {
    router.push("/schedule");
    return null;
  }

  if (status === "loading" || fetchingData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Memuat...</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: data.url,
      }));
      setNotification({
        type: "success",
        title: "Berhasil!",
        message: "Gambar berhasil diunggah",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setNotification({
        type: "error",
        title: "Gagal",
        message: "Gagal mengunggah gambar",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.date || !formData.location) {
      setNotification({
        type: "warning",
        title: "Mohon Perhatian",
        message: "Lengkapi semua field yang wajib diisi",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: scheduleId,
        ...formData,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
      };

      const response = await fetch("/api/schedules", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update schedule");
      }

      const data = await response.json();
      setNotification({
        type: "success",
        title: "Berhasil!",
        message: "Jadwal berhasil diperbarui",
      });
      setTimeout(() => router.push(`/schedule/${data.id}`), 1500);
    } catch (error: any) {
      console.error("Error updating schedule:", error);
      setNotification({
        type: "error",
        title: "Gagal",
        message: error.message || "Terjadi kesalahan saat memperbarui jadwal",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 px-6 lg:px-8 py-12 lg:ml-0">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push(`/schedule/${scheduleId}`)}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 font-medium transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Detail
            </button>

            <div className="shadow-lg border-none bg-white rounded-lg overflow-hidden">
              <div className="bg-linear-to-r from-teal-500 to-cyan-500 text-white p-6">
                <h1 className="text-2xl font-bold">Edit Jadwal Kegiatan</h1>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Informasi Dasar</h3>

                    <div className="space-y-2">
                      <Label htmlFor="title">Judul Kegiatan *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Contoh: Pengajian Malam Jumat"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Jelaskan detail kegiatan..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Tanggal *</Label>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          value={formData.date}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Waktu</Label>
                        <Input
                          id="time"
                          name="time"
                          type="time"
                          value={formData.time}
                          onChange={handleChange}
                          placeholder="HH:MM"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Lokasi *</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="Contoh: Aula Utama"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pemateri">Pembicara/Pemateri</Label>
                        <Input
                          id="pemateri"
                          name="pemateri"
                          value={formData.pemateri}
                          onChange={handleChange}
                          placeholder="Nama pembicara"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxCapacity">Kapasitas Maksimal</Label>
                      <Input
                        id="maxCapacity"
                        name="maxCapacity"
                        type="number"
                        value={formData.maxCapacity}
                        onChange={handleChange}
                        placeholder="Contoh: 200"
                      />
                    </div>

                    {/* Thumbnail Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">Thumbnail Kegiatan</Label>
                      <div className="flex items-center gap-4">
                        <input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="thumbnail"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          {uploadingImage ? "Mengunggah..." : "Unggah Gambar"}
                        </label>
                        {formData.thumbnailUrl && (
                          <div className="relative">
                            <img
                              src={formData.thumbnailUrl}
                              alt="Thumbnail"
                              className="h-20 w-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, thumbnailUrl: "" })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => router.push(`/schedule/${scheduleId}`)}
                      className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatbotButton />

      {/* Notification */}
      {notification && (
        <CartoonNotification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={3000}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default EditSchedule;
