"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import { ArrowLeft, Eye, Edit3, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Toaster, toast } from "sonner";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const categories = ["Prestasi", "Kerjasama", "Update", "Event", "Pengumuman"];

export default function CreateNewsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const role = session?.user?.role?.toLowerCase();
  const isPrivileged = role === "admin" || role === "instruktur";

  if (status === "authenticated" && !isPrivileged) {
    router.push("/news");
    return null;
  }
  const [user, setUser] = useState<any>({
    id: "user-123",
    full_name: "Admin IRMA",
    email: "admin@irmaverse.local",
    avatar: "AI",
  });

  const [formData, setFormData] = useState({
    title: "",
    category: "Prestasi",
    content: "",
    image: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        image: data.url,
      }));
      toast.success("Gambar berhasil diupload!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal mengupload gambar. Silakan coba lagi.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
        return;
      }

      const news = await response.json();
      toast.success("Berita berhasil dibuat!");
      router.push(`/news/${news.slug}`);
    } catch (error) {
      console.error("Error creating news:", error);
      toast.error("Gagal membuat berita. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100"
      style={{

      }}
    >
      <DashboardHeader/>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold mb-6 lg:mb-8 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
              Kembali
            </Link>

            {/* Form Container */}
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[0_8px_0_0_#cbd5e1] p-6 sm:p-8 lg:p-12">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 mb-2 leading-tight">
                Buat Berita Baru
              </h1>
              <p className="text-slate-500 font-medium text-sm sm:text-base lg:text-lg mb-8">
                Buat berita menggunakan format Markdown
              </p>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Title */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-700 mb-2 sm:mb-3">
                    Judul Berita *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Masukkan judul berita..."
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 sm:px-5 py-3.5 sm:py-4 text-sm sm:text-base font-medium shadow-sm transition-all focus:outline-none focus:border-teal-400 focus:shadow-[0_4px_0_0_#34d399] -translate-y-0.5"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-700 mb-2 sm:mb-3">
                    Kategori *
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 sm:px-5 py-3.5 sm:py-4 text-sm sm:text-base font-medium shadow-sm transition-all focus:outline-none focus:border-teal-400 focus:shadow-[0_4px_0_0_#34d399] -translate-y-0.5 appearance-none cursor-pointer"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {/* Select indicator trick */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-700 mb-2 sm:mb-3">
                    Gambar Berita *
                  </label>
                  
                  <div className="space-y-4">
                    {/* Upload Button */}
                    <label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center justify-center gap-3 w-full px-6 py-10 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-teal-50 hover:border-teal-400 hover:text-teal-600 cursor-pointer transition-all ${
                        uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <ImageIcon className="h-10 w-10 text-slate-400 group-hover:text-teal-500 transition-colors" />
                      <div className="text-center">
                        <p className="text-sm sm:text-base font-bold text-slate-700">
                          {uploadingImage ? "Mengupload..." : "Klik untuk upload gambar"}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                          Format: JPG, PNG, GIF, WebP (Max 5MB)
                        </p>
                      </div>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                      required
                    />

                    {/* Image Preview */}
                    {formData.image && (
                      <div className="mt-4 animate-in fade-in zoom-in-95 duration-300">
                        <p className="text-sm font-bold text-slate-700 mb-2">
                          Preview Gambar:
                        </p>
                        <div className="rounded-2xl border-4 border-slate-100 overflow-hidden shadow-sm inline-block max-w-full">
                           <img
                             src={formData.image}
                             alt="Preview"
                             className="w-full sm:max-w-md h-48 sm:h-56 object-cover"
                           />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content (Markdown) */}
                <div className="w-full overflow-hidden">
                  <div className="flex flex-row items-center justify-between mb-2 sm:mb-3">
                    <label className="block text-sm sm:text-base font-bold text-slate-700">
                      Konten (Markdown) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-teal-50 text-xs sm:text-sm font-bold text-teal-600 border px border-teal-200 hover:bg-teal-100 transition-colors"
                    >
                      {showPreview ? (
                        <>
                          <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5}/>
                          Edit
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5}/>
                          Preview
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div data-color-mode="light" className="w-full">
                    <div className="rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
                      <MDEditor
                        value={formData.content}
                        onChange={(val) =>
                          setFormData((prev) => ({ ...prev, content: val || "" }))
                        }
                        preview={showPreview ? "preview" : "edit"}
                        height={350}
                        visibleDragbar={false}
                        className="w-full max-w-full"
                        style={{ minHeight: '350px' }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-3 leading-relaxed">
                    Gunakan toolbar di atas untuk format teks. Mendukung: heading, bold, italic, links, lists, code blocks, dll.
                  </p>
                </div>

                {/* Preview Note */}
                <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 sm:p-5 flex gap-3 items-start">
                  <div className="text-sky-500 mt-0.5 shrink-0 text-xl">💡</div>
                  <p className="text-xs sm:text-sm text-sky-800 font-medium leading-relaxed">
                     Deskripsi singkat akan dibuat otomatis dari 160 karakter pertama konten Anda. Slug (URL) juga dibuat otomatis berdasarkan judul berita.
                  </p>
                </div>

                {/* Submit Area */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:flex-1 order-1 sm:order-2 px-6 py-3.5 sm:py-4 rounded-2xl bg-teal-400 text-white font-black border-2 border-teal-600 border-b-4 hover:bg-teal-500 hover:shadow-lg active:border-b-2 active:translate-y-0.5 transition-all text-sm sm:text-base cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Menyimpan..." : "Publikasikan Berita"}
                  </button>
                  <Link
                    href="/news"
                    className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3.5 sm:py-4 rounded-2xl bg-white text-slate-600 font-bold border-2 border-slate-200 border-b-4 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:border-b-2 active:translate-y-0.5 transition-all text-center text-sm sm:text-base"
                  >
                    Batal
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ChatbotButton />
      <Toaster position="top-right" richColors />
    </div>
  );
}
