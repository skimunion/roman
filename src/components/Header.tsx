import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  CalendarDays,
  Printer,
  Download,
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  currentWeekMonday: Date;
  formattedRange: string;
  weekNumber: number;
  year: number;
  totalManHours: number;
  totalSquareMeters: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onOpenDatePicker: () => void;
  onOpenAddEntry: () => void;
  onOpenRoster: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
  onResetToPhoto: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  formattedRange,
  weekNumber,
  totalManHours,
  totalSquareMeters,
  onPrevWeek,
  onNextWeek,
  onToday,
  onOpenDatePicker,
  onOpenAddEntry,
  onOpenRoster,
  onPrint,
  onExportCSV,
  onResetToPhoto,
}) => {
  return (
    <header className="bg-[#0b1224] border-b border-slate-800 text-white sticky top-0 z-30 shadow-xl">
      {/* Top Branding & Main Controls */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-xl bg-white/95 border border-amber-500/40 p-1 flex items-center justify-center shadow-lg shadow-amber-500/15 overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="CICWMA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span className="text-amber-400">CICWMA</span>
                  <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Табель обліку
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Незалежний облік людино-годин та збудованих м² за об'єктами
              </p>
            </div>
          </div>

          {/* Week Navigation Controls */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shadow-sm self-start lg:self-center">
            <button
              onClick={onPrevWeek}
              aria-label="Попередній тиждень"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Попередній тиждень"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={onToday}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Перейти на поточний тиждень"
            >
              Сьогодні
            </button>

            <button
              onClick={onOpenDatePicker}
              className="px-3 py-1 text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-800 text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Обрати дату або тиждень"
            >
              <CalendarDays className="w-4 h-4 text-amber-400" />
              <span>
                Тиждень {weekNumber} • <strong className="text-white">{formattedRange}</strong>
              </span>
            </button>

            <button
              onClick={onNextWeek}
              aria-label="Наступний тиждень"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Наступний тиждень"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons & Totals */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenRoster}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Керування списком працівників (8 майстрів)"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Бригада (8)</span>
            </button>

            <button
              onClick={onExportCSV}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Завантажити звіт у форматі CSV"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={onPrint}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Роздрукувати таблицю на принтері"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Друк</span>
            </button>

            <button
              onClick={onResetToPhoto}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 transition cursor-pointer"
              title="Скинути дані точно до фотографії"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Зразок з фото</span>
            </button>

            <button
              onClick={onOpenAddEntry}
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Записати роботу</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Real-Time Totals Pill */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-200">Табель за тиждень:</span>
            <span>Клікніть на будь-яку клітинку щоб швидко внести або змінити години чи $м^2$</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Людино-годин:</span>
              <span className="font-black text-amber-400">{totalManHours} год.</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Збудовано:</span>
              <span className="font-black text-emerald-400">{totalSquareMeters} м²</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
