"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";
import CartoonNotification from "@/components/ui/Notification";
import {
  Upload,
  X,
  Calendar,
  Type,
  Sparkles,
  Save,
  ArrowLeft,
  MapPin,
  Users,
  Mic,
} from "lucide-react";

const EditSchedule = () => {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Notification State
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
    maxCapacity: "",
    thumbnailUrl: "",
  });

  // Fetch existing schedule data
  useEffect(() => {
    if (scheduleId) {
      fetchScheduleData();
    }
  }, [scheduleId]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schedules/${scheduleId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!data) {
        throw new Error("Data jadwal tidak ditemukan (Empty Response)");
      }

      if (
        session?.user?.id !== data.instructorId &&
        session?.user?.role !== "admin"
      ) {
        setNotification({
          type: "error",
          title: "Akses Ditolak",
          message: "Anda tidak memiliki akses untuk mengedit jadwal ini",
        });
        setTimeout(() => router.push("/schedule"), 2000);
        return;
      }

      const dateObj = new Date(data.date);
      const formattedDate = dateObj.toISOString().split("T")[0];

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
    } finally {
      setLoading(false);
    }
  };

  if (
    status === "authenticated" &&
    session?.user?.role !== "instruktur" &&
    session?.user?.role !== "admin"
  ) {
    router.push("/schedule");
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const formDataToUpload = new FormData();
        formDataToUpload.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataToUpload,
        });

        if (!response.ok) throw new Error("Failed to upload");

        const data = await response.json();
        setFormData((prev) => ({ ...prev, thumbnailUrl: data.url }));
        setNotification({
          type: "success",
          title: "Berhasil!",
          message: "Gambar berhasil diunggah",
        });
      } catch (error) {
        setNotification({
          type: "error",
          title: "Gagal",
          message: "Gagal mengunggah gambar",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.location
    ) {
      setNotification({
        type: "warning",
        title: "Mohon Perhatian",
        message: "Lengkapi semua field yang wajib diisi",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: scheduleId,
        ...formData,
        maxCapacity: formData.maxCapacity
          ? parseInt(formData.maxCapacity)
          : null,
      };

      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Ignore parsing error
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : { id: scheduleId };
      } catch (e) {
        data = { id: scheduleId };
      }

      setNotification({
        type: "success",
        title: "Berhasil!",
        message: "Jadwal berhasil diperbarui",
      });
      
      const redirectId = data?.id || scheduleId;
      setTimeout(() => router.push(`/schedule/${redirectId}`), 1500);

    } catch (error: any) {
      console.error("Submit Error:", error);
      setNotification({
        type: "error",
        title: "Gagal",
        message: error.message || "Terjadi kesalahan saat menyimpan",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
         <DashboardHeader />
         <div className="flex">
            <Sidebar />
            <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
               <Sparkles className="w-12 h-12 text-teal-400 animate-spin mb-4" />
               <p className="text-slate-500 font-bold animate-pulse">Memuat data jadwal...</p>
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
        
        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
            
            {/* Header & Back Button */}
            <div className="flex flex-col gap-4 lg:gap-6">
              <button
                onClick={() => router.back()}
                className="self-start inline-flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-500 font-bold hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#cbd5e1] active:translate-y-0.5 active:shadow-none transition-all text-sm lg:text-base"
              >
                <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={3} />
                Kembali
              </button>
              
              <div>
                <h1 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight mb-2 flex items-center gap-2 lg:gap-3">
                   Edit Jadwal Kegiatan
                </h1>
                <p className="text-slate-500 font-medium text-sm lg:text-lg">
                  Update detail kegiatan yang sudah dibuat.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {/* --- KOLOM KIRI: FORM UTAMA --- */}
              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                
                {/* Card 1: Informasi Dasar */}
                <div className="bg-white p-5 lg:p-8 rounded-3xl lg:rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] lg:shadow-[8px_8px_0_0_#cbd5e1]">
                  <h2 className="text-lg lg:text-xl font-black text-slate-700 mb-4 lg:mb-6 flex items-center gap-2">
                    <Type className="h-5 w-5 lg:h-6 lg:w-6 text-teal-500" />
                    Informasi Dasar
                  </h2>

                  <div className="space-y-4 lg:space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs lg:text-sm font-bold text-slate-600 ml-1">
                        Judul Kegiatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Contoh: Pengajian Malam Jumat"
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 lg:px-5 lg:py-3.5 text-sm lg:text-base font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white focus:shadow-[0_4px_0_0_#34d399] transition-all placeholder:text-slate-400 placeholder:font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs lg:text-sm font-bold text-slate-600 ml-1">
                        Deskripsi <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        required
                        rows={5}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Jelaskan detail kegiatan..."
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 lg:px-5 lg:py-3.5 text-sm lg:text-base font-medium text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white focus:shadow-[0_4px_0_0_#34d399] transition-all placeholder:text-slate-400 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2: Waktu Pelaksanaan */}
                <div className="bg-white p-5 lg:p-8 rounded-3xl lg:rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] lg:shadow-[8px_8px_0_0_#cbd5e1]">
                  <h2 className="text-lg lg:text-xl font-black text-slate-700 mb-4 lg:mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-500" />
                    Waktu Pelaksanaan
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <DatePicker
                      label="Tanggal Pelaksanaan"
                      value={formData.date}
                      onChange={(date) =>
                        setFormData({ ...formData, date: date })
                      }
                      placeholder="Pilih tanggal"
                    />
                    <TimePicker
                      label="Jam Mulai"
                      value={formData.time}
                      onChange={(time) =>
                        setFormData({ ...formData, time: time })
                      }
                    />
                  </div>
                </div>

                {/* Card 3: Lokasi & Detail */}
                <div className="bg-white p-5 lg:p-8 rounded-3xl lg:rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] lg:shadow-[8px_8px_0_0_#cbd5e1]">
                  <h2 className="text-lg lg:text-xl font-black text-slate-700 mb-4 lg:mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 lg:h-6 lg:w-6 text-orange-500" />
                    Lokasi & Detail
                  </h2>

                  <div className="space-y-4 lg:space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs lg:text-sm font-bold text-slate-600 ml-1">
                        Lokasi Kegiatan <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="location"
                          required
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Contoh: Aula Utama"
                          className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-11 pr-4 py-3 lg:pl-12 lg:pr-5 lg:py-3.5 text-sm lg:text-base font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white focus:shadow-[0_4px_0_0_#34d399] transition-all placeholder:text-slate-400 placeholder:font-medium"
                        />
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs lg:text-sm font-bold text-slate-600 ml-1">
                          Pembicara
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="pemateri"
                            value={formData.pemateri}
                            onChange={handleInputChange}
                            placeholder="Nama pembicara"
                            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-11 pr-4 py-3 lg:pl-12 lg:pr-5 lg:py-3.5 text-sm lg:text-base font-medium text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white focus:shadow-[0_4px_0_0_#34d399] transition-all placeholder:text-slate-400"
                          />
                          <Mic className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs lg:text-sm font-bold text-slate-600 ml-1">
                          Kapasitas (Opsional)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="maxCapacity"
                            value={formData.maxCapacity}
                            onChange={handleInputChange}
                            placeholder="Contoh: 200"
                            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-11 pr-4 py-3 lg:pl-12 lg:pr-5 lg:py-3.5 text-sm lg:text-base font-medium text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white focus:shadow-[0_4px_0_0_#34d399] transition-all placeholder:text-slate-400"
                          />
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- KOLOM KANAN: MEDIA --- */}
              <div className="space-y-6 lg:space-y-8">
                {/* Upload Thumbnail */}
                <div className="bg-white p-5 lg:p-6 rounded-3xl lg:rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] lg:shadow-[8px_8px_0_0_#cbd5e1] text-center">
                  <label className="block text-xs lg:text-sm font-bold text-slate-600 mb-3 lg:mb-4">
                    Thumbnail Kegiatan
                  </label>
                  <div className="relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="upload-thumb"
                    />
                    {formData.thumbnailUrl ? (
                      <div className="relative w-full h-40 lg:h-52 rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-slate-200 group-hover:border-teal-400 transition-all">
                        <img
                          src={formData.thumbnailUrl}
                          alt="Thumbnail Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, thumbnailUrl: "" })
                          }
                          className="absolute top-2 right-2 p-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="upload-thumb"
                        className="flex flex-col items-center justify-center w-full h-40 lg:h-52 rounded-2xl lg:rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 group-hover:border-teal-400 group-hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <Upload className="w-8 h-8 lg:w-10 lg:h-10 text-slate-400 group-hover:text-teal-500 mb-2 transition-colors" />
                        <p className="text-xs lg:text-sm font-bold text-slate-500 group-hover:text-teal-600 transition-colors">
                          {uploading ? "Uploading..." : "Unggah Gambar"}
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl lg:rounded-3xl px-6 py-3.5 lg:py-4 border-2 lg:border-4 border-emerald-700 border-b-4 lg:border-b-8 shadow-[0_4px_0_0_#047857] active:translate-y-0.5 active:border-b-2 active:shadow-none transition-all flex items-center justify-center gap-2 lg:gap-3 text-base lg:text-lg"
                >
                  {submitting ? (
                    <>
                      <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 lg:w-6 lg:h-6" /> 
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
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