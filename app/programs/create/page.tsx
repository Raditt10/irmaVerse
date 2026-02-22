"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import { Input } from "@/components/ui/InputText";
import { Textarea } from "@/components/ui/textarea";
import Toast from "@/components/ui/Toast";
import {
  Upload,
  X,
  Plus,
  Calendar,
  Type,
  Users,
  Sparkles,
  Save,
  ArrowLeft,
  BookOpen,
  Rocket,
  Library,
  Target,
  ChevronDown,
  GraduationCap,
  Clock,
  Trash2,
  ListChecks,
  RotateCcw,
} from "lucide-react";

const CreateProgram = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Program Wajib",
    grade: "Semua",
    thumbnailUrl: "",
    duration: "",
    syllabus: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
    sessions: [] as { title: string; description: string }[],
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name: "syllabus" | "requirements" | "benefits", index: number, value: string) => {
    const newArray = [...formData[name]];
    newArray[index] = value;
    setFormData((prev) => ({ ...prev, [name]: newArray }));
  };

  const addArrayItem = (name: "syllabus" | "requirements" | "benefits") => {
    setFormData((prev) => ({ ...prev, [name]: [...prev[name], ""] }));
  };

  const removeArrayItem = (name: "syllabus" | "requirements" | "benefits", index: number) => {
    const newArray = formData[name].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [name]: newArray }));
  };

  const handleSessionChange = (index: number, field: "title" | "description", value: string) => {
    const newSessions = [...formData.sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    setFormData((prev) => ({ ...prev, sessions: newSessions }));
  };

  const addSession = () => {
    setFormData((prev) => ({ 
      ...prev, 
      sessions: [...prev.sessions, { title: `Kajian ${prev.sessions.length + 1}`, description: "" }] 
    }));
  };

  const removeSession = (index: number) => {
    const newSessions = formData.sessions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, sessions: newSessions }));
  };

  const generateSessionsTemplate = (count: number) => {
    const newSessions = Array.from({ length: count }, (_, i) => ({
      title: `Kajian ${i + 1}`,
      description: "",
    }));
    setFormData((prev) => ({ ...prev, sessions: newSessions }));
    showToast(`${count} Template Kajian berhasil dibuat`, "success");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          showToast(error.error || "Gagal mengunggah gambar", "error");
          return;
        }

        const data = await res.json();
        setFormData((prev) => ({ ...prev, thumbnailUrl: data.url }));
        showToast("Banner program berhasil diunggah", "success");
      } catch (error: any) {
        showToast("Terjadi kesalahan saat mengunggah gambar", "error");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Judul program wajib diisi", "error");
      return;
    }
    if (formData.title.length < 5) {
      showToast("Judul program minimal 5 karakter", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Gagal membuat program");
      }

      showToast("Program kurikulum berhasil diterbitkan! ✨", "success");
      setTimeout(() => router.push("/programs"), 1500);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-12 w-full max-w-[100vw] overflow-hidden">
          <div className="max-w-5xl mx-auto">
            {/* Header & Back Button */}
            <div className="flex flex-col gap-4 mb-8">
              <button
                onClick={() => router.back()}
                className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-500 font-bold hover:border-emerald-400 hover:text-emerald-600 hover:shadow-[0_4px_0_0_#cbd5e1] active:translate-y-0.5 active:shadow-none transition-all"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={3} />
                Kembali
              </button>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-2 flex items-center gap-3">
                  Program Kurikulum Baru
                </h1>
                <p className="text-slate-500 font-medium text-lg">
                  Rancang kurikulum terbaik untuk santri IRMA.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* --- LEFT COLUMN: CONTENT --- */}
              <div className="lg:col-span-2 space-y-8">
                {/* Detail Utama */}
                <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                  <h2 className="text-xl font-black text-slate-700 mb-6 flex items-center gap-2">
                    <Type className="h-6 w-6 text-emerald-500" /> Detail Program
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-600 ml-1">
                        Nama Program Kurikulum
                      </label>
                      <Input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Contoh: Tahfizh Akhir Pekan (Juz 30)"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-600 ml-1">
                        Deskripsi Program
                      </label>
                      <Textarea
                        name="description"
                        rows={6}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Jelaskan visi dan materi yang akan dipelajari dalam program ini..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-4 border-t-2 border-slate-50">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 ml-1 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-emerald-500" /> Durasi
                        </label>
                        <Input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          placeholder="e.g. 12 Sesi / 3 Bulan"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Silabus & Materi */}
                <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                  <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                    Silabus & Materi
                  </h2>
                  <div className="space-y-4">
                    {formData.syllabus.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 border-2 border-purple-100 text-purple-600 font-black text-sm shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayChange("syllabus", idx, e.target.value)}
                          placeholder="e.g. Pengenalan Tajwid Dasar"
                          className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem("syllabus", idx)}
                          className="p-3 rounded-xl bg-red-50 text-red-500 border-2 border-transparent hover:border-red-200 transition-all shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("syllabus")}
                      className="w-full py-3.5 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 text-purple-600 font-bold text-sm hover:bg-purple-100/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" /> Tambah Item Silabus
                    </button>
                  </div>
                </div>

                {/* Persyaratan & Manfaat */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            onChange={(e) => handleArrayChange("requirements", idx, e.target.value)}
                            placeholder="e.g. Lancar membaca Quran"
                            className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem("requirements", idx)}
                            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem("requirements")}
                        className="w-full py-3 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 text-amber-600 font-bold text-sm hover:bg-amber-100/50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Tambah Syarat
                      </button>
                    </div>
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
                            onChange={(e) => handleArrayChange("benefits", idx, e.target.value)}
                            placeholder="e.g. Sertifikat resmi"
                            className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem("benefits", idx)}
                            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem("benefits")}
                        className="w-full py-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-600 font-bold text-sm hover:bg-emerald-100/50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Tambah Manfaat
                      </button>
                    </div>
                  </div>
                </div>

                {/* --- DAFTAR KAJIAN (SESSIONS) --- */}
                <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-1">
                        <div className="w-1.5 h-8 bg-teal-500 rounded-full"></div>
                        Bagian Kajian Program
                      </h2>
                      <p className="text-sm text-slate-500 font-bold ml-4">Kelola sesi atau tahapan dalam program ini.</p>
                    </div>
                    
                    {/* Template Controls */}
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2">Template:</span>
                      {[4, 8, 12].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => generateSessionsTemplate(num)}
                          className="px-3 py-1.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-black text-xs hover:border-teal-400 hover:text-teal-600 transition-all shadow-sm active:translate-y-0.5 active:shadow-none"
                        >
                          {num} Sesi
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, sessions: [] })}
                        className="p-1.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                        title="Reset Semua"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.sessions.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                        <div className="w-16 h-16 bg-white rounded-3xl border-2 border-slate-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <ListChecks className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-slate-500 font-black mb-1">Belum ada bagian kajian</h4>
                        <p className="text-slate-400 text-sm font-bold mb-6">Mulai dengan menambah sesi atau gunakan template di atas.</p>
                        <button
                          type="button"
                          onClick={addSession}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-black rounded-2xl shadow-[0_4px_0_0_#0f766e] border-2 border-teal-400 hover:bg-teal-600 active:translate-y-1 active:shadow-none transition-all"
                        >
                          <Plus className="w-5 h-5" /> Tambah Kajian Pertama
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-4">
                          {formData.sessions.map((session, idx) => (
                            <div key={idx} className="group relative bg-slate-50 p-5 rounded-[2rem] border-2 border-slate-100 hover:border-teal-400 hover:bg-white transition-all">
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center justify-between sm:justify-start gap-4">
                                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500 text-white font-black text-sm shadow-[0_3px_0_0_#0f766e]">
                                    {idx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeSession(idx)}
                                    className="sm:hidden p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                                <div className="flex-1 space-y-3">
                                  <input
                                    type="text"
                                    value={session.title || ""}
                                    onChange={(e) => handleSessionChange(idx, "title", e.target.value)}
                                    placeholder="Judul Kajian / Sesi"
                                    className="w-full bg-transparent border-b-2 border-slate-200 focus:border-teal-400 outline-none py-1 font-black text-slate-800 placeholder:text-slate-300 transition-colors"
                                  />
                                  <textarea
                                    value={session.description || ""}
                                    onChange={(e) => handleSessionChange(idx, "description", e.target.value)}
                                    placeholder="Apa yang akan dibahas di sesi ini? (Opsional)"
                                    rows={1}
                                    className="w-full bg-transparent border-none outline-none resize-none text-sm font-bold text-slate-500 placeholder:text-slate-300"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSession(idx)}
                                  className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all shrink-0"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={addSession}
                          className="w-full py-4 rounded-[2rem] border-2 border-dashed border-teal-200 bg-teal-50/30 text-teal-600 font-black text-sm hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" /> Tambah Bagian Kajian Lain
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Tingkat Kelas */}
                <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1]">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-8 text-center sm:text-left">
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-4 ml-1 flex items-center justify-center sm:justify-start gap-2">
                        <Target className="h-4 w-4 text-emerald-500" /> Target Kelas
                      </h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        {["Semua", "Kelas 10", "Kelas 11", "Kelas 12"].map((grade) => (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => setFormData({ ...formData, grade })}
                            className={`px-6 py-2.5 rounded-full font-black text-sm transition-all border-2 ${
                              formData.grade === grade
                                ? "bg-emerald-500 text-white border-emerald-600 shadow-[0_4px_0_0_#059669]"
                                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                            }`}
                          >
                            {grade}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN: MEDIA & SUBMIT --- */}
              <div className="lg:col-span-1 space-y-6">
                <div className="sticky top-8 space-y-6">
                  {/* Thumbnail Card */}
                  <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1] text-center">
                    <label className="block text-sm font-bold text-slate-600 mb-4">
                      Banner Program
                    </label>
                    <div className="relative group overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 aspect-video flex flex-col items-center justify-center bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 transition-all cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      {formData.thumbnailUrl ? (
                        <>
                          <img
                            src={formData.thumbnailUrl}
                            alt="Banner Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="h-10 w-10 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          {uploading ? (
                            <Sparkles className="h-10 w-10 text-emerald-400 animate-spin" />
                          ) : (
                            <>
                              <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Upload className="h-8 w-8 text-slate-400 group-hover:text-emerald-500" />
                              </div>
                              <span className="text-sm font-bold text-slate-400 group-hover:text-emerald-600">
                                Pilih Gambar Banner
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Submit Card */}
                  <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white border-2 border-emerald-600 shadow-[0_6px_0_0_#059669]">
                    <div className="flex items-center gap-3 mb-4">
                      <GraduationCap className="h-8 w-8 text-emerald-100" strokeWidth={2.5} />
                      <h3 className="text-xl font-black">Siap Terbit?</h3>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-white text-emerald-600 font-black text-lg rounded-2xl shadow-[0_4px_0_0_#d1fae5] border-2 border-emerald-100 hover:bg-emerald-50 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <Sparkles className="h-6 w-6 animate-spin" />
                      ) : (
                        <>
                          <Rocket className="h-6 w-6" />
                          Terbitkan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ChatbotButton />
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default CreateProgram;
