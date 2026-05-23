import React, { useState, useEffect, useRef } from 'react';
import { Clock as ClockIcon, Check } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "시간 선택",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Split current value into hour and minute
  const [selectedHour, setSelectedHour] = useState(value ? value.split(':')[0] : '10');
  const [selectedMinute, setSelectedMinute] = useState(value ? value.split(':')[1] : '00');
  const hoursContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && hoursContainerRef.current) {
      setTimeout(() => {
        const activeEl = hoursContainerRef.current?.querySelector('[data-selected="true"]');
        if (activeEl) {
          activeEl.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      }, 50);
    }
  }, [isOpen]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '30'];

  const handleSelectHour = (h: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHour(h);
    const newTime = `${h}:${selectedMinute}`;
    onChange(newTime);
  };

  const handleSelectMinute = (m: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMinute(m);
    const newTime = `${selectedHour}:${m}`;
    onChange(newTime);
    setIsOpen(false); // Close popover when minute is chosen as final selection
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="h-[46px] w-full bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between px-2.5 sm:px-4 focus-within:ring-2 focus-within:ring-[#FFD500] cursor-pointer hover:bg-slate-100/50 transition-colors"
      >
        <span className="font-bold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
          {value ? `${selectedHour}시 ${selectedMinute}분` : placeholder}
        </span>
        <ClockIcon size={15} className="text-slate-400 shrink-0 ml-1" />
      </div>

      {/* Popover Clock Picker */}
      {isOpen && (
        <div className="absolute top-[52px] right-0 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 w-[240px] select-none">
          <div className="flex gap-3">
            {/* Hours Column */}
            <div className="flex-1 border-r border-slate-100 pr-2">
              <div className="text-[10px] font-black text-slate-400 mb-2 pl-1 select-none">시 (HOUR)</div>
              <div ref={hoursContainerRef} className="flex flex-col gap-1 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scroll-smooth">
                {hours.map((h) => {
                  const isHourSelected = selectedHour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={(e) => handleSelectHour(h, e)}
                      data-selected={isHourSelected ? "true" : "false"}
                      className={`
                        h-7 shrink-0 rounded-lg text-xs font-semibold flex items-center justify-between px-2 transition-all cursor-pointer
                        ${isHourSelected 
                          ? "bg-slate-900 text-[#FFD500] font-bold" 
                          : "text-slate-600 hover:bg-slate-100"
                        }
                      `}
                    >
                      <span>{h}시</span>
                      {isHourSelected && <Check size={11} className="text-[#FFD500] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="w-[85px]">
              <div className="text-[10px] font-black text-slate-400 mb-2 pl-1 select-none">분 (MIN)</div>
              <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto pr-1">
                {minutes.map((m) => {
                  const isMinuteSelected = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={(e) => handleSelectMinute(m, e)}
                      className={`
                        h-7 px-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shrink-0
                        ${isMinuteSelected 
                          ? "bg-[#FFD500] text-slate-900 font-bold" 
                          : "text-slate-600 hover:bg-slate-100"
                        }
                      `}
                    >
                      <span>{m}분</span>
                      {isMinuteSelected && <Check size={11} className="text-slate-900 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-slate-900 text-[#FFD500] text-[10px] font-bold rounded-lg cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
