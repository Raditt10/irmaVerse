"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import DatePicker from "@/components/ui/DatePicker";
import CartoonNotification from "@/components/ui/Notification";
import {
  Type,
  Calendar,
  Save,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Plus,
  Trash2
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  startDate?: string;
  endDate?: string;
  schedule?: string;
  location: string;
  instructor: string;
  quota: {
    filled: number;
    total: number;
  };
  status: "in-progress" | "done" | "upcoming";
  image?: string;
  syllabus?: string[];
  requirements?: string[];
  benefits?: string[];
}

const EditProgram = () => {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    level: "",
    startDate: "",
    endDate: "",
    schedule: "",
    location: "",
    instructor: "",
    quotaTotal: "",
    syllabus: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
  });

  // Fetch program data
  useEffect(() => {
    if (programId) {
      fetchProgramData();
    }
  }, [programId]);

  const fetchProgramData = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockPrograms: Program[] = [
        {
          id: "1",
          title: "Kedudukan akal dan wahyu",
          description: "Program pelatihan komprehensif untuk memahami hubungan akal dan wahyu dalam Islam.",
          duration: "3 bulan",
          level: "Pemula",
          startDate: "2024-12-01",
          endDate: "2025-03-01",
          schedule: "Sabtu, 14:00 WIB",
          location: "Aula Utama IRMA",
          instructor: "Dr. Ahmad Zaki, M.Ag",
          quota: { filled: 18, total: 30 },
          status: "in-progress",
          image: "https://picsum.photos/seed/program1/1200/600",
          syllabus: [
            "Pengantar Epistemologi Islam",
            "Hakikat Akal dalam Perspektif Al-Quran",
            "Wahyu sebagai Sumber Pengetahuan",
            "Integrasi Akal dan Wahyu",
            "Studi Kasus: Isu Kontemporer"
          ],
          requirements: [
            "Telah mengikuti orientasi IRMA",
            "Komitmen mengikuti seluruh sesi",
            "Membawa Al-Quran dan alat tulis"
          ],
          benefits: [
            "Pemahaman mendalam epistemologi",
            "Sertifikat resmi dari IRMA",
            "Akses ke perpustakaan digital"
          ]
        },
      ];

      const program = mockPrograms.find(p => p.id === programId) || mockPrograms[0];

      setFormData({
        title: program.title || "",
        description: program.description || "",
        duration: program.duration || "",
        level: program.level || "",
        startDate: program.startDate || "",
        endDate: program.endDate || "",
        schedule: program.schedule || "",
        location: program.location || "",
        instructor: program.instructor || "",
        quotaTotal: program.quota?.total?.toString() || "",
        syllabus: program.syllabus || [],
        requirements: program.requirements || [],
        benefits: program.benefits || [],
      });
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: "error",
        title: "Gagal Memuat Data",
        message: err.message || "Tidak bisa memuat data program",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      setNotification({
        type: "warning",
        title: "Data Tidak Lengkap",
        message: "Harap isi semua field yang diperlukan",
      });
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setNotification({
        type: "success",
        title: "Berhasil!",
        message: "Program berhasil diperbarui. Mengalihkan...",
      });
      setTimeout(() => router.push("/programs"), 2000);
    } catch (error: any) {
      setNotification({
        type: "error",
        title: "Gagal Memperbarui",
        message: error.message || "Terjadi kesalahan saat memperbarui program",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Sparkles className="h-10 w-10 text-teal-400 animate-spin" />
            <p className="text-slate-500 font-bold animate-pulse">Memuat data program...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-12 w-full max-w-[100vw] overflow-hidden">
          <div className="max-w-5xl mx-auto">
            
            {/* Header & Back Button */}
            <div className="flex flex-col gap-4 lg:gap-6 mb-6 lg:mb-8">
              <button
                onClick={() => router.back()}
                className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-500 font-bold hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#34d399] active:border-b-2 active:translate-y-0.5 active:shadow-none transition-all"
              >
  <ArrowLeft className="h-5 w-5 stroke-3" />
                Kembali
              </button>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-2 flex items-center gap-3">
                  Edit Program
                </h1>
                <p className="text-slate-500 font-medium text-sm lg:text-lg">
                  Perbarui informasi dan detail program kurikulum.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* --- KOLOM KIRI: FORM UTAMA --- */}
              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                
                {/* 1. Informasi Dasar */}
                <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                  <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-teal-50 rounded-xl border border-teal-100">
                        <Type className="h-5 w-5 text-teal-500" strokeWidth={2.5} />
                    </div>
                    Informasi Dasar
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 ml-1">Judul Program</label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 ml-1">Deskripsi Program</label>
                      <textarea
                        name="description"
                        required
                        rows={5}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-medium text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Durasi</label>
                        <input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Level</label>
                        <div className="relative">
                            <select
                            name="level"
                            value={formData.level}
                            onChange={handleInputChange}
                            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all appearance-none cursor-pointer"
                            >
                            <option value="">Pilih Level</option>
                            <option value="Pemula">Pemula</option>
                            <option value="Menengah">Menengah</option>
                            <option value="Lanjutan">Lanjutan</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ArrowLeft className="h-4 w-4 text-slate-400 -rotate-90" strokeWidth={3} />
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Waktu & Lokasi */}
                <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                  <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                        <Calendar className="h-5 w-5 text-indigo-500" strokeWidth={2.5} />
                    </div>
                    Waktu & Lokasi
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DatePicker
                        label="Tanggal Mulai"
                        value={formData.startDate}
                        onChange={(date) => setFormData({ ...formData, startDate: date })}
                        placeholder="Pilih tanggal"
                      />
                      <DatePicker
                        label="Tanggal Selesai"
                        value={formData.endDate}
                        onChange={(date) => setFormData({ ...formData, endDate: date })}
                        placeholder="Pilih tanggal"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 ml-1">Jadwal Mingguan</label>
                      <input
                        type="text"
                        name="schedule"
                        value={formData.schedule}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 ml-1">Lokasi</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Instruktur & Quota */}
                <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                  <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                        <BookOpen className="h-5 w-5 text-amber-500" strokeWidth={2.5} />
                    </div>
                    Instruktur & Kapasitas
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 ml-1">Nama Instruktur</label>
                      <input
                        type="text"
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 ml-1">Total Kapasitas (Kuota)</label>
                      <input
                        type="number"
                        name="quotaTotal"
                        value={formData.quotaTotal}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Silabus & Materi */}
                <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                  <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                    Silabus & Materi
                  </h2>
                  <div className="space-y-3">
                    {formData.syllabus.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 lg:gap-3 group">
                        <span className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-purple-100 border-2 border-purple-200 text-purple-600 font-black text-xs lg:text-sm shrink-0">
                          {idx + 1}
                        </span>
                        
                        {/* PERBAIKAN UTAMA: 
                           min-w-0 agar input bisa mengecil (shrink) 
                           flex-1 agar input mengambil sisa ruang 
                        */}
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newSyllabus = [...formData.syllabus];
                            newSyllabus[idx] = e.target.value;
                            setFormData({ ...formData, syllabus: newSyllabus });
                          }}
                          className="flex-1 min-w-0 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-sm lg:text-base"
                        />
                        
                        <button
                          type="button"
                          onClick={() => {
                            const newSyllabus = formData.syllabus.filter((_, i) => i !== idx);
                            setFormData({ ...formData, syllabus: newSyllabus });
                          }}
                          className="p-2 lg:p-3 rounded-xl bg-red-50 text-red-500 border-2 border-transparent hover:border-red-200 hover:bg-red-100 transition-all active:scale-95 shrink-0"
                        >
                          <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, syllabus: [...formData.syllabus, ""] });
                    }}
                    className="mt-6 w-full py-3.5 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 text-purple-600 font-bold text-sm hover:bg-purple-100 hover:border-purple-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Tambah Item Silabus
                  </button>
                </div>

                {/* 5. Persyaratan & Manfaat */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Persyaratan */}
                  <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-amber-400 rounded-full"></div>
                      Persyaratan
                    </h2>
                    <div className="space-y-3">
                      {formData.requirements.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newReqs = [...formData.requirements];
                              newReqs[idx] = e.target.value;
                              setFormData({ ...formData, requirements: newReqs });
                            }}
                            className="flex-1 min-w-0 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newReqs = formData.requirements.filter((_, i) => i !== idx);
                              setFormData({ ...formData, requirements: newReqs });
                            }}
                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, requirements: [...formData.requirements, ""] });
                      }}
                      className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 text-amber-600 font-bold text-sm hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Tambah Syarat
                    </button>
                  </div>

                  {/* Manfaat */}
                  <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-emerald-400 rounded-full"></div>
                      Manfaat
                    </h2>
                    <div className="space-y-3">
                      {formData.benefits.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newBenefits = [...formData.benefits];
                              newBenefits[idx] = e.target.value;
                              setFormData({ ...formData, benefits: newBenefits });
                            }}
                            className="flex-1 min-w-0 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newBenefits = formData.benefits.filter((_, i) => i !== idx);
                              setFormData({ ...formData, benefits: newBenefits });
                            }}
                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, benefits: [...formData.benefits, ""] });
                      }}
                      className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-600 font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Tambah Manfaat
                    </button>
                  </div>
                </div>
              </div>

              {/* --- KOLOM KANAN: TOMBOL SUBMIT --- */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                  <p className="text-sm text-slate-500 font-medium mb-6">
                    Pastikan semua data sudah benar sebelum menyimpan perubahan.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:border-slate-400 text-white font-black text-base border-2 border-emerald-600 border-b-4 hover:border-b-4 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-200"
                  >
                    {submitting ? (
                        <>
                            <Sparkles className="h-5 w-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 stroke-3" />
                            Simpan Perubahan
                        </>
                    )}
                  </button>
                </div>
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
          duration={4000}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default EditProgram;