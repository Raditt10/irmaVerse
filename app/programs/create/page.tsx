"use client";
import Link from "next/link";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";

export default function CreateProgramPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="flex">
        <Sidebar />

        <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800 mb-4">Buat Program</h1>
            <p className="text-slate-600 mb-6">Halaman pembuatan program belum diimplementasikan. Untuk sementara ini halaman placeholder.</p>

            <div className="flex gap-3">
              <Link
                href="/programs"
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Kembali ke daftar program
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
