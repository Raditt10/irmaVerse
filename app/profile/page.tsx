"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Award,
  Trophy,
  Star,
  Target,
  Flame,
  BookOpen,
  MessageCircle,
  BarChart3,
  Clock3,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ProfileInformationForm from "./_components/ProfileInformationForm";

const Profile = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    },
  });

  const stats = {
    totalPoints: 2450,
    totalBadges: 8,
    totalQuizzes: 24,
    averageScore: 87,
    streak: 7,
    level: 5,
    rank: 12,
  };

  const programs = [
    { id: "1", title: "Kedudukan akal dan wahyu", duration: "3 bulan", level: "Program Wajib", status: "in-progress" },
    { id: "2", title: "Kursus Bahasa Arab", duration: "6 bulan", level: "Program Wajib", status: "done" },
    { id: "3", title: "Training Imam & Khatib", duration: "2 bulan", level: "Lanjutan", status: "in-progress" },
    { id: "4", title: "Tahsin & Tajwid Intensif", duration: "4 bulan", level: "Program Wajib", status: "done" },
    { id: "5", title: "Manajemen Masjid Modern", duration: "3 bulan", level: "Lanjutan", status: "upcoming" },
    { id: "6", title: "Media Dakwah Digital", duration: "5 bulan", level: "Program Wajib", status: "upcoming" },
  ] as const;

  const activities = [
    { type: "quiz", title: "Menyelesaikan Quiz Dasar Islam", date: "Hari ini, 14:30", points: "+50" },
    { type: "badge", title: "Mendapat Badge Konsisten", date: "Hari ini, 09:00", points: "+100" },
    { type: "discussion", title: "Berkomentar di Diskusi Sholat", date: "Kemarin, 20:15", points: "+20" },
    { type: "material", title: "Membaca Materi Tauhid", date: "Kemarin, 18:00", points: "+30" },
    { type: "level", title: "Naik ke Level 5", date: "2 hari lalu", points: "+200" },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <BarChart3 className="h-5 w-5 text-indigo-600" />;
      case "badge":
        return <Award className="h-5 w-5 text-amber-600" />;
      case "discussion":
        return <MessageCircle className="h-5 w-5 text-emerald-600" />;
      case "material":
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case "level":
        return <Trophy className="h-5 w-5 text-rose-600" />;
      default:
        return <Star className="h-5 w-5 text-slate-600" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case "quiz": return "bg-indigo-100 border-indigo-200";
      case "badge": return "bg-amber-100 border-amber-200";
      case "discussion": return "bg-emerald-100 border-emerald-200";
      case "material": return "bg-blue-100 border-blue-200";
      case "level": return "bg-rose-100 border-rose-200";
      default: return "bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />

      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="max-w-7xl mx-auto">

            {/* Profile Header */}
            <div className="mb-8 lg:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-2">
                  Profile Saya
                </h1>
                <p className="text-slate-500 font-medium text-sm lg:text-lg">
                  Kelola informasi akun dan pantau pencapaianmu di sini.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* --- LEFT COLUMN (Profile Info & Activity) --- */}
              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                
                {/* 1. Profile Form Card */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] p-6 lg:p-8">
                   {/* Kita asumsikan ProfileInformationForm sudah responsif di dalamnya, 
                       tapi container ini memberinya "rumah" yang konsisten */}
                   <ProfileInformationForm stats={stats || 0} level={stats.level || 0} rank={stats.rank || 0} />
                </div>

                {/* 2. Activity History */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                        <Clock3 className="h-6 w-6 text-indigo-500" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800">Aktivitas Terbaru</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-3xl border-2 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all duration-300 group"
                      >
                        <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center border-2 ${getActivityBg(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                            {activity.title}
                          </p>
                          <p className="text-xs font-bold text-slate-400 mt-0.5">
                            {activity.date}
                          </p>
                        </div>
                        <span className="text-emerald-500 font-black text-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          {activity.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN (Stats & Programs) --- */}
              <div className="space-y-6 lg:space-y-8">
                
                {/* 1. Stats Card */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                        <BarChart3 className="h-6 w-6 text-amber-500" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800">Statistik</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Total Points */}
                    <div className="flex items-center justify-between p-4 rounded-3xl border-2 border-amber-100 bg-linear-to-r from-amber-50 to-orange-50">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl border border-amber-200 shadow-xs">
                            <Trophy className="h-5 w-5 text-amber-500" />
                        </div>
                        <span className="text-sm font-bold text-amber-800">Total Poin</span>
                      </div>
                      <span className="text-xl font-black text-amber-600">{stats.totalPoints}</span>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center justify-between p-4 rounded-3xl border-2 border-sky-100 bg-linear-to-r from-sky-50 to-blue-50">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl border border-sky-200 shadow-xs">
                            <Award className="h-5 w-5 text-sky-500" />
                        </div>
                        <span className="text-sm font-bold text-sky-800">Badge</span>
                      </div>
                      <span className="text-xl font-black text-sky-600">{stats.totalBadges}</span>
                    </div>

                    {/* Quiz */}
                    <div className="flex items-center justify-between p-4 rounded-3xl border-2 border-purple-100 bg-linear-to-r from-purple-50 to-fuchsia-50">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl border border-purple-200 shadow-xs">
                            <BookOpen className="h-5 w-5 text-purple-500" />
                        </div>
                        <span className="text-sm font-bold text-purple-800">Quiz</span>
                      </div>
                      <span className="text-xl font-black text-purple-600">{stats.totalQuizzes}</span>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center justify-between p-4 rounded-3xl border-2 border-rose-100 bg-linear-to-r from-rose-50 to-red-50">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl border border-rose-200 shadow-xs">
                            <Flame className="h-5 w-5 text-rose-500" />
                        </div>
                        <span className="text-sm font-bold text-rose-800">Streak</span>
                      </div>
                      <span className="text-xl font-black text-rose-600">{stats.streak} Hari</span>
                    </div>

                    {/* Average */}
                    <div className="flex items-center justify-between p-4 rounded-3xl border-2 border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl border border-emerald-200 shadow-xs">
                            <Target className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="text-sm font-bold text-emerald-800">Rata-rata</span>
                      </div>
                      <span className="text-xl font-black text-emerald-600">{stats.averageScore}%</span>
                    </div>
                  </div>
                </div>

                {/* 2. Completed Programs */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-[4px_4px_0_0_#cbd5e1] p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-teal-50 rounded-xl border border-teal-100">
                        <CheckCircle2 className="h-6 w-6 text-teal-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 leading-tight">Program Tuntas</h2>
                        <p className="text-xs font-bold text-slate-400">Kurikulum yang selesai</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {programs
                      .filter((program) => program.status === "done")
                      .map((program) => (
                        <Link
                          key={program.id}
                          href={`/programs/${program.id}`}
                          className="relative group block"
                        >
                          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm hover:border-teal-400 hover:shadow-[0_4px_0_0_#34d399] active:translate-y-0.5 active:shadow-none transition-all duration-200 flex flex-col gap-2 cursor-pointer">
                            <div className="flex justify-between items-start">
                                <p className="text-sm lg:text-base font-bold text-slate-800 leading-tight group-hover:text-teal-600 transition-colors line-clamp-2">
                                    {program.title}
                                </p>
                                <Sparkles className="h-4 w-4 text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                              <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                <Clock3 className="h-3 w-3 text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-600 uppercase">{program.duration}</span>
                              </span>
                              <span className="bg-teal-50 px-2 py-1 rounded-lg border border-teal-100 text-[10px] font-bold text-teal-600 uppercase">
                                {program.level}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      {programs.filter(p => p.status === 'done').length === 0 && (
                          <div className="text-center py-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                              <p className="text-slate-400 font-bold text-sm">Belum ada program yang tuntas.</p>
                          </div>
                      )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;