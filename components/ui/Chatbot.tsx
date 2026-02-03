"use client";
import { useState } from "react";
import { X, Send, Sparkles } from "lucide-react";

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3"
    >
      
      {isOpen && (
        <div className="w-[calc(100vw-32px)] md:w-[380px] h-[60vh] md:h-[600px] bg-gradient-to-b from-slate-50 to-white rounded-[2.5rem] shadow-2xl border-2 border-emerald-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 origin-bottom-right">
          
          {/* Header Chat */}
          <div className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 p-4 md:p-5 flex items-center justify-between shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-white overflow-hidden bg-white shadow-md">
                  <img src="/ci irma.jpg" alt="Ci Irma" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-3 border-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-white">
                <h3 className="font-black text-sm md:text-base leading-none">Ci Irma AI</h3>
                <span className="text-[10px] md:text-xs text-emerald-50 font-bold opacity-95">Online • Siap Membantu</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-200">
            
            <div className="flex justify-center">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                Hari ini, 08:30
              </span>
            </div>

            {/* Message: Bot */}
            <div className="flex items-start gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-emerald-100 border-2 border-emerald-300 overflow-hidden shrink-0 shadow-sm">
                <img src="/ci irma.jpg" alt="Bot" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className="bg-white px-3 py-2.5 md:px-4 md:py-3 rounded-2xl rounded-tl-none border-2 border-emerald-100 shadow-sm text-slate-700 text-xs md:text-sm leading-relaxed font-medium">
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
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2.5 md:px-4 md:py-3 rounded-2xl rounded-tr-none shadow-md text-white text-xs md:text-sm leading-relaxed font-medium">
                  <p>Waalaikumsalam Ci, jadwal kajian minggu ini apa ya?</p>
                </div>
                <span className="text-[10px] text-slate-400 font-bold mr-1">Read 08:32</span>
              </div>
            </div>

             {/* Message: Bot (Typing) */}
             <div className="flex items-start gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-emerald-100 border-2 border-emerald-300 overflow-hidden shrink-0 shadow-sm">
                <img src="/ci irma.jpg" alt="Bot" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white px-3 py-2.5 md:px-4 md:py-3 rounded-2xl rounded-tl-none border-2 border-emerald-100 shadow-sm w-fit">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 bg-white border-t-2 border-emerald-100">
            {/* Quick Suggestions */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {["Jadwal Kajian", "Info Materi", "Cara Kuis"].map((text) => (
                <button key={text} className="shrink-0 whitespace-nowrap px-3 py-1.5 bg-emerald-50 border-2 border-emerald-200 rounded-full text-[10px] md:text-xs font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all hover:scale-105">
                  {text}
                </button>
              ))}
            </div>

            {/* Input Field */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 md:p-2.5 rounded-2xl border-2 border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <input 
                type="text" 
                placeholder="Tulis pesan..." 
                className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-slate-700 placeholder:text-slate-400 font-medium px-2"
              />

              <button className="p-2 md:p-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full shadow-lg hover:shadow-emerald-500/30 transition-all transform active:scale-95 flex items-center justify-center border-2 border-emerald-600">
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Toggle Button */}
      <div className="group relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`relative h-14 w-14 md:h-16 md:w-16 rounded-full shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center transition-all duration-300 overflow-hidden border-3 ${isOpen ? 'border-slate-300 rotate-90 bg-gradient-to-br from-slate-100 to-slate-200' : 'border-emerald-500 hover:scale-110 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 shadow-emerald-500/40'}`}
        >
          {isOpen ? (
             <X className="w-7 h-7 md:w-8 md:h-8 text-slate-600" />
          ) : (
            <>
              <img 
                src="/ci irma.jpg" 
                alt="Ci Irma" 
                className="h-full w-full object-cover" 
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-yellow-600" />
              </div>
            </>
          )}
        </button>

        {/* Tooltip */}
        {!isOpen && (
          <div className="hidden md:block absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl whitespace-nowrap shadow-xl border-2 border-emerald-400">
              Chat dengan Ci Irma
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 rotate-45 border-r-2 border-b-2 border-emerald-400"></div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatbotButton;