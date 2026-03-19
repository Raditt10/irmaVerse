"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import { Plus, Edit2, X, GraduationCap } from "lucide-react";
import Toast from "@/components/ui/Toast";
import Loading from "@/components/ui/Loading";

interface Program {
  id: string;
  title: string;
  classGradeId?: string;
  class_grade?: {
    id: string;
    code: string;
    label: string;
  };
}

interface ClassGrade {
  id: string;
  code: string;
  label: string;
}

export default function ProgramClassAssignmentPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    },
  });

  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      if (
        session?.user?.role !== "admin" &&
        session?.user?.role !== "super_admin"
      ) {
        router.push("/");
        return;
      }
      fetchData();
    }
  }, [status, session, router]);

  useEffect(() => {
    const filtered = programs.filter((p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredPrograms(filtered);
  }, [searchTerm, programs]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all programs
      const programsRes = await fetch("/api/programs");
      if (!programsRes.ok) throw new Error("Failed to fetch programs");
      const programsData = await programsRes.json();
      const allPrograms = programsData.programs || [];

      // Fetch all classes
      const classesRes = await fetch("/api/admin/settings/class-grades");
      if (!classesRes.ok) throw new Error("Failed to fetch classes");
      const classesData = await classesRes.json();

      setPrograms(allPrograms);
      setFilteredPrograms(allPrograms);
      setClasses(classesData.grades || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotification({
        type: "error",
        message: "Gagal memuat data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program);
    setSelectedClass(program.classGradeId || "");
  };

  const handleAssignClass = async () => {
    if (!selectedProgram) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/programs/class-assignment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: selectedProgram.id,
          classGradeId: selectedClass || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to assign class");

      setNotification({
        type: "success",
        message: "Kelas berhasil diassign ke program",
      });

      setSelectedProgram(null);
      setSelectedClass("");
      await fetchData();
    } catch (error) {
      console.error("Error assigning class:", error);
      setNotification({
        type: "error",
        message: "Gagal mengassign kelas",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loading text="Memuat data..." />
          </div>
        </div>
      </div>
    );
  }

  const assignedPrograms = programs.filter((p) => p.classGradeId);
  const unassignedPrograms = programs.filter((p) => !p.classGradeId);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto pb-32">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
              Atur Kelas Program
            </h1>
            <p className="text-slate-500 font-medium">
              Assign kelas ke setiap program kurikulum
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari program..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 text-center">
              <p className="text-2xl font-black text-slate-800">
                {programs.length}
              </p>
              <p className="text-xs font-bold text-slate-600">Total Program</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-emerald-200 p-4 text-center">
              <p className="text-2xl font-black text-emerald-600">
                {assignedPrograms.length}
              </p>
              <p className="text-xs font-bold text-emerald-600">
                Sudah Diassign
              </p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-yellow-200 p-4 text-center">
              <p className="text-2xl font-black text-yellow-600">
                {unassignedPrograms.length}
              </p>
              <p className="text-xs font-bold text-yellow-600">
                Belum Diassign
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Program List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1]">
                <div className="p-4 border-b-2 border-slate-200 bg-slate-50 rounded-t-2xl">
                  <h2 className="text-lg font-black text-slate-800">
                    Daftar Program
                  </h2>
                </div>

                <div className="divide-y-2 divide-slate-200">
                  {filteredPrograms.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 font-medium">
                      Program tidak ditemukan
                    </div>
                  ) : (
                    filteredPrograms.map((program) => (
                      <button
                        key={program.id}
                        onClick={() => handleSelectProgram(program)}
                        className={`w-full p-4 text-left transition-all ${
                          selectedProgram?.id === program.id
                            ? "bg-emerald-50 border-l-4 border-emerald-500"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-slate-800 flex-1">
                            {program.title}
                          </h3>
                          {program.class_grade && (
                            <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold whitespace-nowrap ml-2">
                              {program.class_grade.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {program.classGradeId ? (
                            <span className="text-emerald-600 font-semibold">
                              ✓ Kelas: {program.class_grade?.code}
                            </span>
                          ) : (
                            <span className="text-yellow-600 font-semibold">
                              ⚠ Belum ada kelas
                            </span>
                          )}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Assignment Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1] p-6 sticky top-32">
                <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Assign Kelas
                </h2>

                {selectedProgram ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-600 mb-2">
                        Program Terpilih:
                      </p>
                      <p className="text-sm font-bold text-slate-800 line-clamp-2">
                        {selectedProgram.title}
                      </p>
                    </div>

                    {selectedProgram.class_grade && (
                      <div className="p-3 rounded-lg bg-emerald-50 border-2 border-emerald-200">
                        <p className="text-xs font-bold text-emerald-700 mb-1">
                          Kelas Saat Ini:
                        </p>
                        <p className="text-sm font-bold text-emerald-900">
                          {selectedProgram.class_grade.label}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Pilih Kelas:
                      </label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium text-sm"
                      >
                        <option value="">-- Tidak ada kelas --</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.label} ({cls.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleAssignClass}
                      disabled={submitting}
                      className="w-full px-4 py-3 bg-emerald-500 text-white font-bold rounded-lg border-2 border-emerald-600 shadow-[0_4px_0_0_#059669] hover:bg-emerald-600 active:translate-y-1 disabled:opacity-50 transition-all text-sm"
                    >
                      {submitting ? "Menyimpan..." : "Assign Kelas"}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProgram(null);
                        setSelectedClass("");
                      }}
                      className="w-full px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-all text-sm"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">
                      Pilih program di sebelah untuk mengassign kelas
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

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
