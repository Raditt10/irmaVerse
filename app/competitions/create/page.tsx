"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/DashboardHeader";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/ChatbotButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, ArrowLeft, Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";

const CreateCompetition = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    prize: "",
    category: "Tahfidz" as "Tahfidz" | "Seni" | "Bahasa" | "Lainnya",
    thumbnailUrl: "",
    contactPerson: "",
    contactNumber: "",
    contactEmail: "",
    maxParticipants: "",
  });

  const [requirements, setRequirements] = useState<string[]>([""]);
  const [judgingCriteria, setJudgingCriteria] = useState<string[]>([""]);
  const [prizes, setPrizes] = useState<{ rank: string; amount: string }[]>([
    { rank: "", amount: "" },
  ]);
  const [schedules, setSchedules] = useState<{ phase: string; date: string; description: string }[]>([
    { phase: "", date: "", description: "" },
  ]);

  // Redirect if not instructor
  if (status === "authenticated" && session?.user?.role !== "instruktur") {
    router.push("/competitions");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
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
      toast.success("Gambar berhasil diunggah");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Gagal mengunggah gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.date || !formData.location || !formData.prize || !formData.category) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        requirements: requirements.filter((r) => r.trim() !== ""),
        judgingCriteria: judgingCriteria.filter((j) => j.trim() !== ""),
        prizes: prizes.filter((p) => p.rank && p.amount),
        schedules: schedules.filter((s) => s.phase && s.date),
      };

      const response = await fetch("/api/competitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create competition");
      }

      const data = await response.json();
      toast.success("Perlombaan berhasil dibuat!");
      router.push(`/competitions/${data.id}`);
    } catch (error: any) {
      console.error("Error creating competition:", error);
      toast.error(error.message || "Terjadi kesalahan saat membuat perlombaan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 px-6 lg:px-8 py-12 lg:ml-0">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push("/competitions")}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 font-medium transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Perlombaan
            </button>

            <Card className="shadow-lg border-none">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold">Buat Perlombaan Baru</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Informasi Dasar</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Judul Perlombaan *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Contoh: Lomba Tahfidz Tingkat Nasional"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori *</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      >
                        <option value="Tahfidz">Tahfidz</option>
                        <option value="Seni">Seni</option>
                        <option value="Bahasa">Bahasa</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Jelaskan detail perlombaan..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Tanggal Perlombaan *</Label>
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
                        <Label htmlFor="location">Lokasi *</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="Contoh: Balai Soekarno Bandung"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prize">Hadiah Utama *</Label>
                        <Input
                          id="prize"
                          name="prize"
                          value={formData.prize}
                          onChange={handleChange}
                          placeholder="Contoh: Rp 10.000.000"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxParticipants">Max Peserta</Label>
                        <Input
                          id="maxParticipants"
                          name="maxParticipants"
                          type="number"
                          value={formData.maxParticipants}
                          onChange={handleChange}
                          placeholder="Contoh: 100"
                        />
                      </div>
                    </div>

                    {/* Thumbnail Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">Thumbnail Perlombaan</Label>
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

                  {/* Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Persyaratan</h3>
                    {requirements.map((req, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={req}
                          onChange={(e) => {
                            const newReqs = [...requirements];
                            newReqs[index] = e.target.value;
                            setRequirements(newReqs);
                          }}
                          placeholder={`Persyaratan ${index + 1}`}
                        />
                        {requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setRequirements(requirements.filter((_, i) => i !== index))}
                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setRequirements([...requirements, ""])}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Persyaratan
                    </button>
                  </div>

                  {/* Judging Criteria */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Kriteria Penilaian</h3>
                    {judgingCriteria.map((criteria, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={criteria}
                          onChange={(e) => {
                            const newCriteria = [...judgingCriteria];
                            newCriteria[index] = e.target.value;
                            setJudgingCriteria(newCriteria);
                          }}
                          placeholder={`Kriteria ${index + 1}`}
                        />
                        {judgingCriteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setJudgingCriteria(judgingCriteria.filter((_, i) => i !== index))}
                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setJudgingCriteria([...judgingCriteria, ""])}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Kriteria
                    </button>
                  </div>

                  {/* Prize Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Detail Hadiah per Ranking</h3>
                    {prizes.map((prize, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={prize.rank}
                          onChange={(e) => {
                            const newPrizes = [...prizes];
                            newPrizes[index].rank = e.target.value;
                            setPrizes(newPrizes);
                          }}
                          placeholder="Ranking (Juara 1, 2, 3...)"
                          className="flex-1"
                        />
                        <Input
                          value={prize.amount}
                          onChange={(e) => {
                            const newPrizes = [...prizes];
                            newPrizes[index].amount = e.target.value;
                            setPrizes(newPrizes);
                          }}
                          placeholder="Hadiah (Rp 10.000.000)"
                          className="flex-1"
                        />
                        {prizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPrizes(prizes.filter((_, i) => i !== index))}
                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPrizes([...prizes, { rank: "", amount: "" }])}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Hadiah
                    </button>
                  </div>

                  {/* Competition Schedules */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Jadwal Kompetisi</h3>
                    {schedules.map((schedule, index) => (
                      <div key={index} className="space-y-2 p-4 border border-slate-200 rounded-lg">
                        <div className="flex gap-2">
                          <Input
                            value={schedule.phase}
                            onChange={(e) => {
                              const newSchedules = [...schedules];
                              newSchedules[index].phase = e.target.value;
                              setSchedules(newSchedules);
                            }}
                            placeholder="Fase (Pendaftaran, Penyisihan, Final...)"
                            className="flex-1"
                          />
                          <Input
                            value={schedule.date}
                            onChange={(e) => {
                              const newSchedules = [...schedules];
                              newSchedules[index].date = e.target.value;
                              setSchedules(newSchedules);
                            }}
                            placeholder="Tanggal (1 - 30 Nov 2024)"
                            className="flex-1"
                          />
                          {schedules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSchedules(schedules.filter((_, i) => i !== index))}
                              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <Textarea
                          value={schedule.description}
                          onChange={(e) => {
                            const newSchedules = [...schedules];
                            newSchedules[index].description = e.target.value;
                            setSchedules(newSchedules);
                          }}
                          placeholder="Deskripsi (opsional)"
                          rows={2}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSchedules([...schedules, { phase: "", date: "", description: "" }])}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Jadwal
                    </button>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Kontak Person</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Nama</Label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        placeholder="Nama kontak person"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactNumber">Nomor Telepon</Label>
                        <Input
                          id="contactNumber"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          placeholder="08123456789"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={handleChange}
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => router.push("/competitions")}
                      className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {loading ? "Menyimpan..." : "Buat Perlombaan"}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ChatbotButton />
    </div>
  );
};

export default CreateCompetition;