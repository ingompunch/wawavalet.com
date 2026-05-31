import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  theme?: 'light' | 'dark';
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "연도-월-일",
  className = "",
  theme = "light"
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

  // Initialize view to the selected date or today defensively
  const parsedDate = value ? new Date(value) : null;
  const isValid = parsedDate && !isNaN(parsedDate.getTime());
  const initialDate = isValid ? parsedDate : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  const getCalendarDays = (year: number, month: number) => {
    const currentMonthFirstDay = new Date(year, month, 1).getDay();
    const currentMonthTotalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = currentMonthFirstDay - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      days.push({
        dateStr: `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= currentMonthTotalDays; d++) {
      days.push({
        dateStr: `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding up to a grid of 6 rows (42 cells)
    const remainingCells = 42 - days.length;
    for (let d = 1; d <= remainingCells; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({
        dateStr: `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(dateStr);
    setIsOpen(false);
  };

  const formattedDate = value ? (() => {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const yy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  })() : "";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-[46px] w-full rounded-xl flex items-center justify-between px-2.5 sm:px-4 focus-within:ring-2 focus-within:ring-[#FFD500] cursor-pointer transition-colors border",
          theme === 'dark' 
            ? "bg-slate-950 border-white/10 hover:bg-slate-900 text-white" 
            : "bg-slate-50 border-slate-100 hover:bg-slate-100/50 text-slate-700"
        )}
      >
        <span className={cn(
          "font-bold text-xs sm:text-sm whitespace-nowrap",
          theme === 'dark' ? "text-white" : "text-slate-700"
        )}>
          {formattedDate || placeholder}
        </span>
        <CalendarIcon size={15} className="text-slate-400 shrink-0 ml-1" />
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className={cn(
          "absolute top-[52px] left-0 z-50 border rounded-2xl shadow-xl p-4 w-[290px] select-none",
          theme === 'dark'
            ? "bg-[#1E1E1E] border-white/10 text-white shadow-black/60"
            : "bg-white border-slate-100 text-slate-800 shadow-xl"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className={cn(
                "p-1 rounded-lg transition-colors",
                theme === 'dark' ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
              )}
            >
              <ChevronLeft size={18} />
            </button>
            <span className={cn(
              "font-bold text-sm",
              theme === 'dark' ? "text-white" : "text-slate-800"
            )}>
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className={cn(
                "p-1 rounded-lg transition-colors",
                theme === 'dark' ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
              )}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDays.map((wd, idx) => (
              <span
                key={idx}
                className={`text-[11px] font-bold py-1 ${
                  idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-slate-400"
                }`}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {getCalendarDays(viewYear, viewMonth).map((day, idx) => {
              const isSelected = value === day.dateStr;
              const isToday = day.dateStr === new Date().toISOString().split('T')[0];
              const cellDayOfWeek = idx % 7;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleSelectDay(day.dateStr, e)}
                  className={`
                    h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer
                    ${!day.isCurrentMonth ? "text-slate-500/60 font-normal" : theme === 'dark' ? "text-slate-300" : "text-slate-700"}
                    ${isSelected 
                      ? "bg-[#FFD500] text-slate-900 font-bold shadow-sm animate-pulse-subtle" 
                      : isToday 
                        ? theme === 'dark' 
                          ? "border border-[#FFD500] text-[#FFD500] font-bold" 
                          : "border border-slate-900 text-slate-900 font-bold" 
                        : theme === 'dark'
                          ? "hover:bg-slate-800"
                          : "hover:bg-slate-100"
                    }
                    ${day.isCurrentMonth && !isSelected && cellDayOfWeek === 0 ? "text-red-500" : ""}
                    ${day.isCurrentMonth && !isSelected && cellDayOfWeek === 6 ? "text-blue-500" : ""}
                  `}
                >
                  {day.dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
