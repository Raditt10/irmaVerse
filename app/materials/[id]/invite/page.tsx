"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ChatbotButton from "@/components/ui/Chatbot";
import SearchInput from "@/components/ui/SearchInput";
import { X, Plus, AlertCircle, CheckCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Toast {
  type: "success" | "error" | "warning";
  message: string;
  duration?: number;
}

export default function InvitePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data: session } = useSession();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: "success" | "error" | "warning", message: string) => {
    const id = Math.random();
    setToasts((prev) => [...prev, { type, message, duration: 3000 }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.message !== message));
    }, 3000);
  };

  const fetchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/materials/${id}/invite?q=${searchQuery}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("error", "Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query) fetchUsers(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const addUser = (user: User) => {
    // Check if user already selected
    if (selected.find((s) => s.id === user.id)) {
      showToast("warning", `${user.name} telah di tambahkan, tambahkan yang lain!`);
      return;
    }

    setSelected([...selected, user]);
    setQuery("");
    setResults([]);
    showToast("success", `${user.name} ditambahkan ke daftar invite`);
  };

  const removeUser = (userId: string) => {
    setSelected(selected.filter((u) => u.id !== userId));
  };

  const sendInvite = async () => {
    if (selected.length === 0) {
      showToast("error", "Pilih minimal 1 user untuk di-invite");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/materials/${id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selected.map((u) => u.id),
          invitedById: session?.user?.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const newInvites = data.newInvites || 0;
        const alreadyInvited = data.alreadyInvited?.length || 0;

        if (newInvites > 0) {
          showToast(
            "success",
            `${newInvites} user berhasil di-invite${
              alreadyInvited > 0 ? `, ${alreadyInvited} user sudah di-invite sebelumnya` : ""
            }`
          );
        } else if (alreadyInvited > 0) {
          showToast(
            "warning",
            `Semua ${alreadyInvited} user sudah di-invite sebelumnya`
          );
        }

        setSelected([]);
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        showToast("error", data.error || "Gagal mengirim invite");
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      showToast("error", "Terjadi kesalahan saat mengirim invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#FDFBF7]"

    >
      <DashboardHeader />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-800 mb-2">Invite Peserta</h1>
              <p className="text-slate-500 font-bold">Tambahkan peserta untuk kajian ini</p>
            </div>

            {/* Toast Notifications */}
            <div className="fixed top-6 right-6 z-50 space-y-2 max-w-md">
              {toasts.map((toast, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 shadow-lg font-bold animate-in fade-in slide-in-from-top-2 ${
                    toast.type === "success"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : toast.type === "warning"
                      ? "bg-amber-50 border-amber-300 text-amber-700"
                      : "bg-red-50 border-red-300 text-red-700"
                  }`}
                >
                  {toast.type === "success" ? (
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  )}
                  <span>{toast.message}</span>
                </div>
              ))}
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl border-4 border-slate-200 shadow-[0_8px_0_0_#cbd5e1] p-8">
              {/* Search Box */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Cari User yang Akan Di-Invite
                </label>
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Ketik nama atau email..."
                  className="w-full"
                />

                {/* Search Results */}
                {results.length > 0 && (
                  <div className="mt-4 bg-slate-50 rounded-2xl border-2 border-slate-200 max-h-64 overflow-auto">
                    {results.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => addUser(user)}
                        className="w-full px-4 py-3 hover:bg-slate-100 transition-colors text-left border-b border-slate-200 last:border-b-0"
                      >
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </button>
                    ))}
                  </div>
                )}

                {loading && (
                  <div className="mt-4 text-center text-slate-500 font-bold">
                    Mencari...
                  </div>
                )}
              </div>

              {/* Selected Users */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  User yang Akan Di-Invite ({selected.length})
                </label>

                {selected.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center">
                    <p className="text-slate-500 font-bold">Belum ada user yang dipilih</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selected.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-3"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                        <button
                          onClick={() => removeUser(user.id)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-300 transition-all active:translate-y-[2px]"
                >
                  Batal
                </button>
                <button
                  onClick={sendInvite}
                  disabled={selected.length === 0 || loading}
                  className="flex-1 px-6 py-3 bg-emerald-400 text-white font-black rounded-2xl border-2 border-emerald-600 border-b-4 shadow-[0_4px_0_0_#059669] hover:bg-emerald-500 active:border-b-2 active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Mengirim..." : "Kirim Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatbotButton />
    </div>
  );
}
