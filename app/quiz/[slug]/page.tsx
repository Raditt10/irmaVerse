"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  X, 
  Check, 
  ArrowRight,
  ArrowLeft,
  Trophy, 
  Home,
  RotateCcw,
  Sparkles,
  AlertCircle
} from "lucide-react";
import Loading from "@/components/ui/Loading";
import DashboardHeader from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import CartoonConfirmDialog from "@/components/ui/ConfirmDialog";

interface Question {
  id: string,
  quizId: string,
  question: string,
  options: {
    id: string,
    questionId: string,
    order: number,
    option: string,
    selectedAnswer?: string,
  }[],
}

// Palet warna opsi yang disesuaikan dengan tema terang
const OPTION_STYLES = [
  { base: "bg-red-50 border-red-200 text-red-700", hover: "hover:bg-red-100 hover:border-red-300 shadow-[0_4px_0_0_#fca5a5]" },
  { base: "bg-blue-50 border-blue-200 text-blue-700", hover: "hover:bg-blue-100 hover:border-blue-300 shadow-[0_4px_0_0_#93c5fd]" },
  { base: "bg-amber-50 border-amber-200 text-amber-700", hover: "hover:bg-amber-100 hover:border-amber-300 shadow-[0_4px_0_0_#fcd34d]" },
  { base: "bg-emerald-50 border-emerald-200 text-emerald-700", hover: "hover:bg-emerald-100 hover:border-emerald-300 shadow-[0_4px_0_0_#6ee7b7]" }
];

export default function QuizSessionPage() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  if (!slug) {console.log("No slug detected"); return null;}

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion =
    questions?.length > 0
      ? questions[currentIndex]
      : null;
  const totalQuestions = questions?.length;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  useEffect(() => {
    fetchQuestion();
  }, [slug]);
  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/${slug}`);
      const data = await res.json();
      if(!res.ok) {
        switch(data.code){
          case "NOT_FOUND":
            throw new Error("Quiz not found");
          default:
            throw new Error("Failed to fetch question");
      }}

      setQuestions(data.questions);
      setTitle(data.title);
      setDescription(data.description);
      console.log(questions);
    } catch (error) {
      console.error("Error fetching question:", error);
    }finally{
      setLoading(false);
    }
  };

  const handleSaveAnswer = async () => {
     if (!answers) return;
    setLoading(true);
    try{
      const req = await fetch(`api/quiz/${slug}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: currentQuestion?.id ?? null,
          optionId: answers ?? null,
        }),
      });
      const data = await req.json();
      if (data.error) {
        console.error("Error submitting answer:", data.error);
        return;
      }
      setScore((prev) => prev + 1);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitAnswer = async() => {
    try{
      const req = await fetch(`api/quiz/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          
        }),
      });
      const data = await req.json();
      if (data.error) {
        console.error("Error submitting answer:", data.error);
        return;
      }
      setScore((prev) => prev + 1);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setLoading(false);
    }
  };

    const handlePrevQuestion = () => {
    if (currentIndex <= totalQuestions && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      setShowExitConfirm(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleExitConfirm = () => {
    setShowExitConfirm(false);
    router.push("/quiz");
  };

  if (!loading && questions?.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        Quiz tidak memiliki pertanyaan.
      </div>
    );
  }

  if (!Array.isArray(questions)) {
    return null;
  }

  // --- RENDER RESULT SCREEN ---
  if (isFinished) {
    const finalScore = Math.round((score / totalQuestions) * 100);
    let message = "";
    let iconColor = "";
    
    if (finalScore === 100) { message = "Sempurna! Luar biasa!"; iconColor = "text-yellow-400"; }
    else if (finalScore >= 75) { message = "Kerja Bagus! Hampir sempurna."; iconColor = "text-emerald-400"; }
    else if (finalScore >= 50) { message = "Lumayan, tingkatkan lagi belajarnya!"; iconColor = "text-blue-400"; }
    else { message = "Jangan menyerah, coba pelajari materinya lagi ya."; iconColor = "text-red-400"; }

    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans" style={{ fontFamily: "'Inter', 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, sans-serif" }}>
        <DashboardHeader />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full text-center relative z-10 border-4 border-slate-200 shadow-[0_12px_0_0_#cbd5e1] animate-in fade-in zoom-in duration-500">
              
              <div className="relative w-28 h-28 mx-auto mb-6">
                <div className="absolute inset-0 bg-slate-100 rounded-full animate-ping opacity-70" />
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center border-4 border-slate-100 shadow-md z-10">
                  <Trophy className={`h-14 w-14 ${iconColor}`} />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">Kuis Selesai!</h1>
              <p className="text-slate-500 font-bold mb-8">{message}</p>

              <div className="bg-slate-50 rounded-3xl p-6 mb-8 border-2 border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-emerald-100 rounded-full blur-xl opacity-50" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Skor Akhir</p>
                <p className="text-6xl font-black text-emerald-500 drop-shadow-sm relative z-10">{finalScore}</p>
                <p className="text-sm font-bold text-slate-500 mt-2 relative z-10">Benar {score} dari {totalQuestions} Soal</p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => router.push("/quiz")}
                  className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-lg shadow-sm"
                >
                  <Home className="h-5 w-5" /> Kembali ke Beranda
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl border-2 border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-5 w-5 text-slate-400" /> Ulangi Kuis
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // --- RENDER ACTIVE QUIZ ---
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans" style={{ fontFamily: "'Inter', 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, sans-serif" }}>
      <DashboardHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Menyembunyikan sidebar di mobile saat mengerjakan kuis agar area lebih luas, tapi tetap ada di desktop */}
        <div className="hidden lg:block h-[calc(100vh-64px)] shrink-0">
          <Sidebar />
        </div>

        <main className="flex-1 flex flex-col relative w-full h-[calc(100vh-64px)] lg:h-auto overflow-hidden">
          
          {/* Header Internal Kuis */}
          <div className="bg-white border-b-2 border-slate-100 p-4 lg:px-8 lg:py-5 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowExitConfirm(true)}
                className="w-10 h-10 bg-slate-50 hover:bg-red-50 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors border-2 border-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <h2 className="font-black text-slate-800 text-lg leading-none">{title}</h2>
                <p className="text-xs font-bold text-slate-400">{description}</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto max-w-[200px] sm:max-w-xs ml-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wider">
                      Memuat Soal...
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 md:h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `0%` }}
                    />
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border-2 border-amber-100 rounded-xl">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-600 font-black text-sm">{score * 100}</span>
                </div>
              </div>
            ):(
              <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto max-w-[200px] sm:max-w-xs ml-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wider">
                      Soal {currentIndex + 1} / {totalQuestions}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 md:h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-screen w-full bg-[#FDFBF7] flex items-center justify-center font-sans" style={{ fontFamily: "'Inter', 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, sans-serif" }}>
              <Loading text="Menyiapkan Pertanyaan..." size="lg" />
            </div>
          ):(
            <>
            {questions.length === 0 ? (
              <div className="flex items-center justify-center h-screen">
                Quiz tidak memiliki pertanyaan.
              </div>
            ):(
              <>
              {/* Area Konten Kuis (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50 mix-blend-multiply">
                <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 md:gap-8 pb-28 lg:pb-8">
                  
                  {/* Question Card */}
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_0_0_#cbd5e1] border-2 border-slate-200 relative">
                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <span className="font-black text-emerald-600">{currentIndex + 1}</span>
                    </div>
                    <p className="text-xl md:text-2xl font-black text-slate-800 leading-relaxed pt-2">
                      {currentQuestion?.question}
                    </p>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {currentQuestion?.options?.map((option, idx) => {
                      const isSelected = answers?.[currentQuestion.id] === option.id;
                      
                      // Styling state
                      const baseStyle = OPTION_STYLES[idx % 4];
                      let currentState = "";

                      if (isSelected) {
                        // Sedang dipilih
                        currentState = "bg-white border-slate-800 shadow-[0_6px_0_0_#1e293b] text-slate-800 transform -translate-y-1 ring-2 ring-slate-800";
                      } else if (answers) {
                        // Ada yang lain dipilih
                        currentState = "bg-white border-slate-200 text-slate-500 opacity-60";
                      } else {
                        // Default
                        currentState = `${baseStyle.base} ${baseStyle.hover} hover:-translate-y-1 transition-transform`;
                      }
                      

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                          className={`
                            w-full relative rounded-2xl p-5 md:p-6 flex items-center border-2
                            transition-all duration-200 active:translate-y-1 active:shadow-none text-left
                            ${currentState}
                          `}
                        >
                          {/* Option Letter (A, B, C, D) */}
                          <div className={`
                            w-8 h-8 rounded-xl flex items-center justify-center font-black mr-4 shrink-0
                            ${isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}
                          `}>
                            {String.fromCharCode(65 + idx)}
                          </div>

                          <span className="text-base md:text-lg font-bold pr-8">
                            {option.option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTION BAR */}
              <div className="absolute lg:static bottom-0 left-0 w-full p-4 bg-white border-t-2 border-slate-100 z-20 shrink-0 lg:p-6">
                <div className="max-w-3xl mx-auto flex justify-end">

                  {/* Previous Question Button */}
                  {currentIndex > 0 && (
                    <button
                      onClick={handlePrevQuestion}
                      className={`w-full md:w-auto px-8 py-3.5 md:py-4 rounded-xl font-black text-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2`}
                    >
                      <ArrowLeft className="h-5 w-5" strokeWidth={3} />
                      Soal Sebelumnya
                    </button>
                  )}

                  {/* Next Question Button */}
                  <button
                    onClick={currentIndex === totalQuestions - 1 ? handleSubmitAnswer : handleNextQuestion}
                    className={`w-full md:w-auto px-8 py-3.5 md:py-4 rounded-xl font-black text-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2`}
                  >
                    {currentIndex === totalQuestions - 1 ? "Selesaikan Kuis" : "Lanjut Soal Berikut"} 
                    <ArrowRight className="h-5 w-5" strokeWidth={3} />
                  </button>
                </div>
              </div>
              </>
            )}
            </>
          )}
          
        </main>
      </div>

      {/* Confirmation Dialog saat klik X */}
      <CartoonConfirmDialog
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={handleExitConfirm}
        title="Tinggalkan Kuis?"
        message="Kamu belum menyelesaikan kuis ini. Progres kamu akan disimpan jika keluar sekarang."
        type="warning"
        confirmText="Ya, Keluar"
        cancelText="Lanjut Mengerjakan"
      />
    </div>
  );
}