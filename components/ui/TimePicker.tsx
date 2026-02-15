"use client";

import { useState } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  label?: string;
  placeholder?: string;
}

export default function TimePicker({
  value = "",
  onChange,
  label = "Waktu",
  placeholder = "HH:MM",
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(value ? parseInt(value.split(":")[0]) : 0);
  const [minutes, setMinutes] = useState(
    value ? parseInt(value.split(":")[1]) : 0
  );

  const handleHourChange = (newHour: number) => {
    if (newHour >= 0 && newHour <= 23) {
      setHours(newHour);
    }
  };

  const handleMinuteChange = (newMinute: number) => {
    if (newMinute >= 0 && newMinute <= 59) {
      setMinutes(newMinute);
    }
  };

  const handleConfirm = () => {
    const timeString = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
    onChange?.(timeString);
    setIsOpen(false);
  };

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return placeholder;
    return timeString;
  };

  return (
    <div className="relative w-full">
      <style>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 bg-white text-slate-700 font-bold flex items-center justify-between gap-2 shadow-[0_4px_0_0_#cbd5e1] hover:border-teal-400 hover:shadow-[0_4px_0_0_#14b8a6] transition-all active:translate-y-[2px] active:shadow-none"
      >
        <span className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-500" />
          {formatDisplayTime(value)}
        </span>
      </button>

      {isOpen && (
        <div className="fixed md:absolute bottom-0 md:bottom-full md:left-0 md:mb-2 z-50 bg-white rounded-t-3xl md:rounded-3xl border-4 border-slate-300 shadow-[0_8px_16px_rgba(0,0,0,0.1)] p-4 w-full md:max-w-sm md:w-auto inset-x-0 md:inset-auto md:mt-0">
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="font-black text-base text-slate-800">Pilih Waktu</h3>
          </div>

          {/* Time Input Grid */}
          <div className="flex items-center justify-center gap-3">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleHourChange(hours + 1)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors mb-1"
              >
                <ChevronUp className="h-4 w-4 text-teal-600 font-black" />
              </button>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-4 border-teal-300 rounded-2xl px-6 py-4 min-w-28 text-center">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={String(hours).padStart(2, "0")}
                  onChange={(e) => handleHourChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent text-4xl font-black text-teal-600 text-center border-none outline-none leading-tight"
                />
              </div>

              <button
                type="button"
                onClick={() => handleHourChange(hours - 1)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors mt-1"
              >
                <ChevronDown className="h-4 w-4 text-teal-600 font-black" />
              </button>

              <span className="text-xs font-bold text-slate-600 mt-1">Jam</span>
            </div>

            {/* Separator */}
            <div className="text-4xl font-black text-slate-400 mb-6">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleMinuteChange(minutes + 1)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors mb-1"
              >
                <ChevronUp className="h-4 w-4 text-cyan-600 font-black" />
              </button>

              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 border-4 border-cyan-300 rounded-2xl px-6 py-4 min-w-28 text-center">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={String(minutes).padStart(2, "0")}
                  onChange={(e) => handleMinuteChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent text-4xl font-black text-cyan-600 text-center border-none outline-none leading-tight"
                />
              </div>

              <button
                type="button"
                onClick={() => handleMinuteChange(minutes - 1)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors mt-1"
              >
                <ChevronDown className="h-4 w-4 text-cyan-600 font-black" />
              </button>

              <span className="text-xs font-bold text-slate-600 mt-1">Menit</span>
            </div>
          </div>

          {/* Time Display */}
          <div className="text-center p-3 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl border-2 border-teal-300 mt-4 mb-3">
            <div className="text-2xl font-black text-teal-700">
              {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-teal-400 text-white font-black text-sm rounded-xl border-2 border-teal-600 shadow-[0_4px_0_0_#0f766e] hover:bg-teal-500 transition-all active:translate-y-[2px] active:shadow-none"
            >
              Pilih
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
