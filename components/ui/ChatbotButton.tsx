"use client";
import { useState } from "react";
import { X, Send, Paperclip, Smile, MoreVertical } from "lucide-react";

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Font family yang sama dengan Dashboard
  const fontStyle = { fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" };

  return (
    // PARENT CONTAINER: Mengatur posisi tombol di pojok kanan bawah
    <div 
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3" 
      style={fontStyle}
    >
      
      {/* --- SECTION CHAT WINDOW --- */}
      {/* PERBAIKAN MOBILE:
         1. w-[calc(100vw-32px)] -> Lebar otomatis menyesuaikan layar HP dikurangi margin (agar tidak terpotong).
         2. md:w-[380px] -> Lebar tetap untuk layar Desktop/Tablet.
         3. h-[60vh] -> Tinggi 60% layar di HP.
         4. md:h-[600px] -> Tinggi tetap di Desktop.
      */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] md:w-[380px] h-[60vh] md:h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 origin-bottom-right">
          
          {/* 1. Header Chat */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-3 md:p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white/30 overflow-hidden bg-white">
                  <img src="/ci irma.jpg" alt="Ci Irma" className="w-full h-full object-cover" />
                </div>
                {/* Online Indicator */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-teal-600 rounded-full"></div>
              </div>
              <div className="text-white">
                <h3 className="font-bold text-sm md:text-base leading-none">Ci Irma AI</h3>
                <span className="text-[10px] md:text-xs text-teal-100 font-medium opacity-90">Online • Siap Membantu</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 md:p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Chat Area (Scrollable) */}
          <div className="flex-1 bg-slate-50 p-3 md:p-4 overflow-y-auto flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-200">
            
            {/* Timestamp */}
            <div className="flex justify-center">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                Hari ini, 08:30
              </span>
            </div>

            {/* Message: Bot (Ci Irma) */}
            <div className="flex items-start gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-teal-100 border border-teal-200 overflow-hidden shrink-0">
                <img src="/ci irma.jpg" alt="Bot" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className="bg-white p-2.5 md:p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-slate-700 text-xs md:text-sm leading-relaxed">
                  <p>
                    Assalamualaikum! 👋 <br/>
                    Saya Ci Irma, asisten virtual kamu. Ada yang bisa saya bantu seputar jadwal kajian atau materi hari ini?
                  </p>
                </div>
              </div>
            </div>

            {/* Message: User */}
            <div className="flex items-end justify-end gap-2">
              <div className="flex flex-col gap-1 max-w-[85%] items-end">
                <div className="bg-teal-600 p-2.5 md:p-3 rounded-2xl rounded-tr-none shadow-sm text-white text-xs md:text-sm leading-relaxed">
                  <p>Waalaikumsalam Ci, jadwal kajian minggu ini apa ya?</p>
                </div>
                <span className="text-[10px] text-slate-400 font-bold mr-1">Read 08:32</span>
              </div>
            </div>

             {/* Message: Bot (Typing Indicator) */}
             <div className="flex items-start gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-teal-100 border border-teal-200 overflow-hidden shrink-0">
                <img src="/ci irma.jpg" alt="Bot" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white px-3 py-2 md:px-4 md:py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm w-fit">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            {/* Quick Suggestions Chips (Mobile: Horizontal Scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {["Jadwal Kajian", "Info Materi", "Cara Kuis"].map((text) => (
                <button key={text} className="shrink-0 whitespace-nowrap px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] md:text-xs font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors">
                  {text}
                </button>
              ))}
            </div>

            {/* Input Field */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 md:p-2 rounded-full border border-slate-200 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-100 transition-all">
              <button className="hidden md:block p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-full hover:bg-slate-200">
                <Smile className="w-5 h-5" />
              </button>
              
              <input 
                type="text" 
                placeholder="Tulis pesan..." 
                className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-slate-700 placeholder:text-slate-400 font-medium px-2"
              />
              
              <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-full hover:bg-slate-200">
                <Paperclip className="w-4 h-4" />
              </button>

              <button className="p-2 md:p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center">
                <Send className="w-3 h-3 md:w-4 md:h-4 ml-0.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* --- TOGGLE BUTTON (Bulat) --- */}
      <div className="group relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`relative h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-teal-500/30 flex items-center justify-center transition-all duration-300 overflow-hidden border-2 ${isOpen ? 'border-slate-200 rotate-90 bg-slate-100' : 'border-teal-600 hover:scale-105 bg-white'}`}
        >
          {isOpen ? (
             <X className="w-6 h-6 md:w-8 md:h-8 text-slate-500" />
          ) : (
            <img 
              src="/ci irma.jpg" 
              alt="Ci Irma" 
              className="h-full w-full object-cover" 
            />
          )}
        </button>

        {/* Tooltip (Hanya muncul jika chat tertutup di Desktop) */}
        {!isOpen && (
          <div className="hidden md:block absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg whitespace-nowrap shadow-xl">
              Chat dengan Ci Irma
              <div className="absolute -bottom-1 right-5 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatbotButton;