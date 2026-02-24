"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import Loading from "@/components/ui/Loading";
import SuccessDataFound from "@/components/ui/SuccessDataFound";
import SearchInput from "@/components/ui/SearchInput";
import EmptyState from "@/components/ui/EmptyState";
import DetailButton from "@/components/ui/DetailButton";
import CartoonConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import AddButton from "@/components/ui/AddButton";
import {
  CheckCircle2,
  Clock3,
  Hourglass,
  BookOpen,
  ChevronDown,
  Plus,
  Target,
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string | null;
  duration: string;
  level: string;
  status: "in-progress" | "done" | "upcoming";
  thumbnail?: string;
}

const OurPrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession({
    required: false,
  });

  const isPrivileged =
    session?.user?.role === "instruktur" || session?.user?.role === "admin";
  const user = { id: "user-123" }; // Placeholder

  const statusOptions = [
    { value: "all", label: "Semua" },
    { value: "in-progress", label: "Sedang Berlangsung" },
    { value: "done", label: "Selesai" },
    { value: "upcoming", label: "Mendatang" },
  ];

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      if (!res.ok) throw new Error("Gagal mengambil data program");
      let data = await res.json();
      data = data.map((program: any, index: number) => ({
        ...program,
        thumbnail:
          program.thumbnail ||
          `https://picsum.photos/seed/program${index + 1}/400/250`,
      }));
      setPrograms(data);
    } catch (error: any) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    setProgramToDelete(programId);
    setShowConfirmDelete(true);
  };

  const confirmDeleteProgram = async () => {
    if (!programToDelete) return;

    try {
      setPrograms(programs.filter((p) => p.id !== programToDelete));

      showToast("Program berhasil dihapus", "success");
      setShowConfirmDelete(false);
      setProgramToDelete(null);
    } catch (error: any) {
      console.error("Error deleting program:", error);
      showToast(
        error.message || "Terjadi kesalahan saat menghapus program",
        "error"
      );
    }
  };

  const filteredPrograms = programs.filter(
    (program) =>
      (program?.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || program.status === statusFilter)
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loading text="Memuat..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Flex Container */}
            <div className="mb-8 lg:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Kiri: Judul & Deskripsi */}
              <div className="flex-1">
                <h1 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight mb-1.5 leading-tight">
                  Program Kurikulum
                </h1>
                <p className="text-slate-500 font-medium text-xs lg:text-lg">
                  Pendidikan dan pelatihan untuk meningkatkan kompetensi keagamaan.
                </p>
              </div>

              {/* Kanan: Badges & Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                
                {/* Status Badges (Hidden on very small screens if needed, but responsive here) */}
                <div className="flex flex-wrap gap-3 text-xs font-bold">
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 shadow-sm">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>Berlangsung</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Selesai</span>
                  </div>
                </div>

                {/* Add Button */}
                {isPrivileged && (
                  <AddButton
                    label="Buat Program"
                    onClick={() => router.push("/programs/create")}
                    icon={<Plus className="h-5 w-5" />}
                    color="emerald"
                    hideIcon={false}
                  />
                )}
              </div>
            </div>

            {/* Filters & Search */}
            {!loading && programs.length > 0 && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <SearchInput
                    placeholder="Cari program seru..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    className="w-full"
                  />
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`
                      w-full flex items-center justify-between rounded-2xl border-2 bg-white px-5 py-3.5 lg:py-4 
                      font-bold text-slate-700 transition-all cursor-pointer
                      ${
                        isDropdownOpen
                          ? "border-teal-400 shadow-[0_4px_0_0_#34d399] -translate-y-0.5"
                          : "border-slate-200 shadow-[0_4px_0_0_#e2e8f0] hover:border-teal-300"
                      }
                    `}
                  >
                    <span className="truncate mr-2">
                      {statusOptions.find((opt) => opt.value === statusFilter)
                        ?.label || "Semua Status"}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                        isDropdownOpen ? "rotate-180 text-teal-500" : ""
                      }`}
                      strokeWidth={3}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border-2 border-slate-200 rounded-2xl shadow-[0_8px_0_0_#cbd5e1] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-1.5 space-y-1">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setStatusFilter(option.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`
                              w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all
                              ${
                                statusFilter === option.value
                                  ? "bg-teal-50 text-teal-600"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }
                            `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-20">
                <Loading text="Memuat program..." />
              </div>
            ) : programs.length === 0 ? (
              <EmptyState
                icon="search"
                title="Belum ada program"
                description="Program kurikulum belum tersedia saat ini. Cek lagi nanti ya!"
              />
            ) : filteredPrograms.length === 0 ? (
              <EmptyState
                icon="search"
                title="Tidak ada program yang cocok"
                description="Coba cari dengan kata kunci lain atau ubah filter statusnya ya!"
                actionLabel="Reset Pencarian"
                onAction={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              />
            ) : (
              <>
                {/* ---- SUCCESS HEADER ---- */}
                {searchTerm && (
                  <div className="mb-8">
                    <SuccessDataFound
                      message={`Ditemukan ${filteredPrograms.length} program sesuai pencarian`}
                      icon="sparkles"
                    />
                  </div>
                )}

                {/* ---- GRID CONTENT ---- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {filteredPrograms.map((program) => {
                    const statusMeta: Record<
                      Program["status"],
                      {
                        label: string;
                        icon: any;
                        color: string;
                        bg: string;
                        border: string;
                      }
                    > = {
                      "in-progress": {
                        label: "Berlangsung",
                        icon: Clock3,
                        color: "text-amber-700",
                        bg: "bg-amber-100",
                        border: "border-amber-200",
                      },
                      done: {
                        label: "Selesai",
                        icon: CheckCircle2,
                        color: "text-emerald-700",
                        bg: "bg-emerald-100",
                        border: "border-emerald-200",
                      },
                      upcoming: {
                        label: "Mendatang",
                        icon: Hourglass,
                        color: "text-blue-700",
                        bg: "bg-blue-100",
                        border: "border-blue-200",
                      },
                    };
                    const meta =
                      statusMeta[program.status] || statusMeta["upcoming"];

                    return (
                      <div
                        key={program.id}
                        className="bg-white rounded-3xl lg:rounded-[2.5rem] border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1] sm:shadow-[0_8px_0_0_#cbd5e1] hover:border-teal-400 hover:shadow-[0_8px_0_0_#34d399] transition-all duration-300 overflow-hidden group hover:-translate-y-2 flex flex-col h-full"
                      >
                        {/* Image Area */}
                        <div className="relative h-40 md:h-52 overflow-hidden border-b-2 border-slate-100">
                          <img
                            src={program.thumbnail}
                            alt={program.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                          {/* Status Badge on Image */}
                          <div
                            className={`absolute top-4 right-4 px-3 py-1 rounded-full flex items-center gap-1.5 border-2 shadow-sm ${meta.bg} ${meta.border}`}
                          >
                            <meta.icon
                              className={`h-3.5 w-3.5 ${meta.color}`}
                              strokeWidth={3}
                            />
                            <span
                              className={`text-[10px] font-black uppercase tracking-wide ${meta.color}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-4 sm:p-6 flex flex-col justify-between flex-1">
                          <div className="mb-4">
                            <div className="mb-2 sm:mb-3">
                              <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-tight group-hover:text-teal-600 transition-colors line-clamp-2">
                                {program.title}
                              </h3>
                            </div>

                            {program.description && (
                              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-4 line-clamp-3">
                                {program.description}
                              </p>
                            )}

                            {/* Meta Info - Simple row without divider */}
                            <div className="mt-3 sm:mt-4 flex items-center gap-4 text-[10px] sm:text-[11px] font-bold text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Clock3 className="h-3.5 w-3.5 text-teal-400" />
                                <span>{program.duration}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Row: Grade on Left, Buttons on Right */}
                          <div className="mt-auto pt-5 border-t-2 border-slate-50 flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/50 border border-teal-100 text-teal-600 font-bold">
                                <Target className="h-3 w-3" strokeWidth={3} />
                                <span className="text-[9px] uppercase tracking-widest whitespace-nowrap">
                                  {program.level}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <DetailButton
                                role={session?.user?.role as any}
                                onClick={() =>
                                  router.push(`/programs/${program.id}`)
                                }
                                onEdit={() =>
                                  router.push(`/programs/${program.id}/edit`)
                                }
                                onDelete={() => handleDeleteProgram(program.id)}
                                label="Detail"
                                className="w-auto!"
                                showConfirm={false}
                                iconOnly={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ChatbotButton />

      {/* Confirm Delete Dialog */}
      <CartoonConfirmDialog
        type="warning"
        title="Hapus Data?"
        message="Apakah Anda yakin ingin menghapus program ini?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isOpen={showConfirmDelete}
        onConfirm={confirmDeleteProgram}
        onCancel={() => {
          setShowConfirmDelete(false);
          setProgramToDelete(null);
        }}
      />

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default OurPrograms;