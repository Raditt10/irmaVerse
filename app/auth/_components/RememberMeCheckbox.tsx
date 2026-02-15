"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface RememberMeCheckboxProps {
  name?: string;
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const RememberMeCheckbox = ({ 
  name = "remember", 
  id = "remember", 
  checked: controlledChecked,
  onChange 
}: RememberMeCheckboxProps) => {
  const [internalChecked, setInternalChecked] = useState(false);
  
  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    if (onChange) {
      onChange(newChecked);
    } else {
      setInternalChecked(newChecked);
    }
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <div className="relative">
        <input 
          type="checkbox" 
          id={id} 
          name={name} 
          className="peer sr-only" // Sembunyikan checkbox asli
          checked={isChecked}
          onChange={handleChange}
        />
        {/* Kotak Custom */}
        <div className={`
          w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center shadow-[2px_2px_0_0_#cbd5e1] group-hover:shadow-[2px_2px_0_0_#10b981]
          ${isChecked 
            ? 'bg-emerald-500 border-emerald-600 shadow-[2px_2px_0_0_#065f46]' 
            : 'bg-white border-slate-300 group-hover:border-emerald-400'
          }
        `}>
          <Check 
            className={`w-4 h-4 text-white transition-transform duration-200 ${isChecked ? 'scale-100' : 'scale-0'}`} 
            strokeWidth={4} 
          />
        </div>
      </div>
      <span className={`text-sm font-bold transition-colors ${isChecked ? 'text-emerald-700' : 'text-slate-500 group-hover:text-emerald-600'}`}>
        Ingat saya
      </span>
    </label>
  );
};

export default RememberMeCheckbox;