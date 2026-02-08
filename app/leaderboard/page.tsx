import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import DashboardHeader from "@/components/ui/Header";
import ChatbotButton from "@/components/ui/Chatbot";
import {
  Trophy,
  Medal,
  Crown,
  Search,
  Filter,
  ArrowUp,
  Minus,
  ArrowDown,
  Sparkles,
  ShieldCheck,
  Star
} from "lucide-react";

const MOCK_LEADERBOARD = [
  { id: "1", name: "Ahmad Syarif", role: "Ketua", points: 5240, avatarId: 10, badges: 15, trend: "up" },
  { id: "2", name: "Fatimah Zahra", role: "Sekretaris", points: 4950, avatarId: 22, badges: 12, trend: "up" },
  { id: "3", name: "Rizki Pratama", role: "Anggota", points: 4100, avatarId: 35, badges: 10, trend: "down" },
  { id: "4", name: "Siti Aminah", role: "Anggota", points: 3850, avatarId: 41, badges: 9, trend: "stable" },
  { id: "5", name: "Budi Santoso", role: "Anggota", points: 3200, avatarId: 55, badges: 8, trend: "up" },
  { id: "6", name: "Dewi Sartika", role: "Bendahara", points: 2900, avatarId: 64, badges: 7, trend: "down" },
  { id: "7", name: "Rafaditya S.", role: "Admin", points: 2450, avatarId: 70, badges: 8, trend: "up" }, // User login
  { id: "8", name: "Hendra Gunawan", role: "Anggota", points: 2100, avatarId: 82, badges: 5, trend: "stable" },
  { id: "9", name: "Maya Putri", role: "Anggota", points: 1800, avatarId: 91, badges: 4, trend: "down" },
  { id: "10", name: "Eko Kurniawan", role: "Anggota", points: 1500, avatarId: 100, badges: 3, trend: "stable" },
];

const LeaderboardPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { id: true, name: true, email: true },
  });

  if (!currentUser) redirect("/auth");

  const topThree = MOCK_LEADERBOARD.slice(0, 3);
  const restOfUsers = MOCK_LEADERBOARD.slice(3);

  const TrendIcon = ({ type }: { type: string }) => {
    if (type === "up") return <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200"><ArrowUp className="w-3 h-3 md:w-4 md:h-4 stroke-[3]" /></div>;
    if (type === "down") return <div className="p-1 rounded-full bg-rose-100 text-rose-600 border border-rose-200"><ArrowDown className="w-3 h-3 md:w-4 md:h-4 stroke-[3]" /></div>;
    return <div className="p-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200"><Minus className="w-3 h-3 md:w-4 md:h-4 stroke-[3]" /></div>;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}> {/* Font playful opsional */}
      <DashboardHeader />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto">
          
          {/* Header Page */}
          <div className="text-center mb-12 space-y-3 relative">
            <div className="inline-block relative">
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight z-10 relative">
                 Peringkat EXP
                </h1>
            </div>
            <p className="text-slate-500 font-bold text-lg">Pantau pencapaian terbaik minggu ini!</p>
          </div>

          {/* --- TOP 3 PODIUM SECTION (CHUNKY STYLE) --- */}
          <div className="flex justify-center items-end gap-4 md:gap-10 mb-16 px-4 pt-10">
            
            {/* JUARA 2 (Silver) */}
            <div className="flex flex-col items-center group order-1">
               <div className="relative mb-[-20px] z-20 transition-transform group-hover:-translate-y-2 duration-300">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-slate-400 bg-slate-200 overflow-hidden shadow-[0_4px_0_0_rgba(148,163,184,1)]">
                     <img src={`https://picsum.photos/200/200?random=${topThree[1].avatarId}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">2</div>
               </div>
               <div className="w-28 md:w-36 h-40 bg-slate-100 rounded-t-[2rem] border-[3px] border-slate-300 border-b-0 flex flex-col items-center justify-start pt-10 pb-4 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.05)] relative z-10">
                  <p className="font-black text-slate-700 text-sm md:text-base text-center px-2 line-clamp-1">{topThree[1].name}</p>
                  <div className="mt-2 bg-white px-3 py-1 rounded-full border-2 border-slate-200 shadow-sm">
                    <p className="text-xs font-black text-slate-500">{topThree[1].points} XP</p>
                  </div>
               </div>
            </div>

            {/* JUARA 1 (Gold) */}
            <div className="flex flex-col items-center group order-2 -mt-12 z-20">
               <div className="absolute -top-24 animate-[bounce_3s_infinite]">
                  <Crown className="w-12 h-12 text-amber-400 fill-amber-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]" strokeWidth={2.5} />
               </div>
               <div className="relative mb-[-25px] z-20 transition-transform group-hover:-translate-y-3 duration-300">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-[4px] border-amber-400 bg-amber-100 overflow-hidden shadow-[0_6px_0_0_#d97706]">
                     <img src={`https://picsum.photos/200/200?random=${topThree[0].avatarId}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-[3px] border-white shadow-md text-lg">1</div>
               </div>
               <div className="w-32 md:w-44 h-56 bg-amber-50 rounded-t-[2.5rem] border-[3px] border-amber-300 border-b-0 flex flex-col items-center justify-start pt-12 pb-4 shadow-[inset_0_-30px_60px_rgba(251,191,36,0.15)] relative z-10">
                  <p className="font-black text-amber-900 text-base md:text-lg text-center px-2 line-clamp-1">{topThree[0].name}</p>
                  <p className="text-xs text-amber-600/80 font-bold mb-2">{topThree[0].role}</p>
                  <div className="mt-1 bg-amber-400 px-4 py-1.5 rounded-full border-[3px] border-amber-500 shadow-[2px_2px_0_0_#b45309]">
                    <p className="text-sm font-black text-white">{topThree[0].points} XP</p>
                  </div>
               </div>
            </div>

            {/* JUARA 3 (Bronze) */}
            <div className="flex flex-col items-center group order-3">
               <div className="relative mb-[-20px] z-20 transition-transform group-hover:-translate-y-2 duration-300">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-orange-300 bg-orange-100 overflow-hidden shadow-[0_4px_0_0_#c2410c]">
                     <img src={`https://picsum.photos/200/200?random=${topThree[2].avatarId}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">3</div>
               </div>
               <div className="w-24 md:w-36 h-32 bg-orange-50 rounded-t-[2rem] border-[3px] border-orange-200 border-b-0 flex flex-col items-center justify-start pt-10 pb-4 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.05)] relative z-10">
                  <p className="font-black text-orange-900 text-sm md:text-base text-center px-2 line-clamp-1">{topThree[2].name}</p>
                  <div className="mt-2 bg-white px-3 py-1 rounded-full border-2 border-orange-100 shadow-sm">
                    <p className="text-xs font-black text-orange-500">{topThree[2].points} XP</p>
                  </div>
               </div>
            </div>
          </div>

          {/* --- MAIN LIST SECTION (FLOATING CARDS) --- */}
          <div className="max-w-4xl mx-auto">
            
            {/* Filter / Search Bar - Chunky Style */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 group">
                 <div className="absolute inset-0 bg-slate-200 rounded-2xl translate-y-1.5 translate-x-0 group-focus-within:translate-y-2 transition-transform" />
                 <div className="relative bg-white border-2 border-slate-200 rounded-2xl flex items-center px-4 py-3 group-focus-within:-translate-y-1 group-focus-within:border-teal-400 transition-transform">
                    <Search className="w-5 h-5 text-slate-400 mr-3" />
                    <input 
                      type="text" 
                      placeholder="Cari teman kamu..." 
                      className="w-full bg-transparent outline-none font-bold text-slate-600 placeholder:text-slate-300"
                    />
                 </div>
              </div>
              <button className="relative group active:scale-95 transition-transform">
                 <div className="absolute inset-0 bg-slate-200 rounded-2xl translate-y-1.5" />
                 <div className="relative bg-white border-2 border-slate-200 rounded-2xl p-3 flex items-center justify-center hover:-translate-y-1 hover:border-teal-400 transition-all">
                    <Filter className="w-6 h-6 text-slate-600" />
                 </div>
              </button>
            </div>

            {/* Header List */}
            <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
               <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
               <div className="col-span-6 sm:col-span-6">Peserta</div>
               <div className="col-span-2 hidden sm:block text-center">Badge</div>
               <div className="col-span-4 sm:col-span-3 text-right">Points</div>
            </div>

            {/* List Items - Floating Cards */}
            <div className="space-y-3 pb-24">
              {restOfUsers.map((user, index) => {
                const rank = index + 4;
                const isCurrentUser = user.name.includes("Rafaditya"); 

                return (
                  <div 
                    key={user.id} 
                    className={`relative group ${isCurrentUser ? 'z-10' : ''}`}
                  >
                    {/* Shadow Layer */}
                    <div className={`absolute inset-0 rounded-2xl translate-y-1.5 transition-transform ${isCurrentUser ? 'bg-teal-200 translate-y-2' : 'bg-slate-200 group-hover:translate-y-2'}`} />
                    
                    {/* Card Content */}
                    <div className={`
                        relative grid grid-cols-12 gap-4 p-4 items-center rounded-2xl border-2 transition-all duration-200
                        ${isCurrentUser 
                            ? 'bg-teal-50 border-teal-400 -translate-y-1' 
                            : 'bg-white border-slate-100 hover:-translate-y-1 hover:border-slate-300'
                        }
                    `}>
                      {/* Rank */}
                      <div className="col-span-2 sm:col-span-1 flex justify-center">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${isCurrentUser ? 'bg-teal-500 text-white shadow-[2px_2px_0_0_#115e59]' : 'bg-slate-100 text-slate-500'}`}>
                            {rank}
                         </div>
                      </div>

                      {/* Profile */}
                      <div className="col-span-6 sm:col-span-6 flex items-center gap-3 md:gap-4">
                         <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-200 shrink-0">
                            <img src={`https://picsum.photos/200/200?random=${user.avatarId}`} alt={user.name} className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                                <p className={`font-black text-sm md:text-base line-clamp-1 ${isCurrentUser ? 'text-teal-800' : 'text-slate-700'}`}>
                                {user.name}
                                </p>
                                {isCurrentUser && (
                                    <span className="bg-teal-200 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide border border-teal-300">You</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-slate-400">{user.role}</span>
                                <div className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                                <div className="hidden sm:flex items-center gap-1">
                                    <TrendIcon type={user.trend} />
                                </div>
                            </div>
                         </div>
                      </div>

                      {/* Badges (Desktop) */}
                      <div className="col-span-2 hidden sm:flex justify-center items-center">
                         <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                            <ShieldCheck className="w-4 h-4 text-indigo-500 fill-indigo-200" />
                            <span className="text-sm font-black text-indigo-600">{user.badges}</span>
                         </div>
                      </div>

                      {/* Points */}
                      <div className="col-span-4 sm:col-span-3 flex justify-end items-center pr-2">
                         <div className={`text-right ${isCurrentUser ? 'text-teal-700' : 'text-slate-700'}`}>
                            <span className="font-black text-lg md:text-xl block leading-none">{user.points.toLocaleString()}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Points</span>
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky User Rank (Mobile Only) - Floating HUD Style */}
          <div className="xl:hidden fixed bottom-6 left-4 right-4 z-40 animate-in slide-in-from-bottom-10 fade-in duration-500">
             <div className="bg-slate-900 text-white p-1 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border-2 border-slate-700">
                <div className="flex items-center justify-between bg-slate-800 rounded-[1.2rem] px-4 py-3 border border-slate-600">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center font-black text-lg shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border-t border-teal-400">
                            12
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-white">Rafaditya S.</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rank Anda</span>
                        </div>
                    </div>
                    <div className="text-right bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-700">
                        <span className="font-black text-lg text-teal-400">2,450</span>
                        <span className="text-[10px] font-bold text-slate-500 ml-1">XP</span>
                    </div>
                </div>
             </div>
          </div>

        </main>
      </div>

      <ChatbotButton />
    </div>
  );
};

export default LeaderboardPage;