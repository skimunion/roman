import React from 'react';
import { MapPin, Plus, Edit2 } from 'lucide-react';
import { WeekSummary, WorkEntry } from '../types';
import { formatHours, formatSquareMeters } from '../utils/calculations';

interface MainTimesheetTableProps {
  summary: WeekSummary;
  allEntries: WorkEntry[];
  onCellClick: (dateStr: string, employeeName: string) => void;
  onAddEntryForDate: (dateStr: string) => void;
}

export const MainTimesheetTable: React.FC<MainTimesheetTableProps> = ({
  summary,
  onCellClick,
  onAddEntryForDate,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800/90 bg-[#090e1c] shadow-2xl">
      <table className="w-full text-left border-collapse select-none">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-800 bg-[#0b1224] text-slate-300">
            {/* Employee Name Column */}
            <th className="py-4 px-5 text-sm font-black text-white whitespace-nowrap min-w-[160px]">
              ПІБ працівника
            </th>

            {/* 7 Days: Monday - Sunday */}
            {summary.days.map((d) => {
              const parts = d.date.split('-');
              const dayNum = parts[2] || '';
              const monthNum = parts[1] || '';
              const dayLocs = d.locations && d.locations.length > 0
                ? d.locations
                : Array.from(new Set(d.entries.map((e) => e.location?.trim()).filter(Boolean) as string[]));

              return (
                <th
                  key={d.date}
                  className="py-3 px-3 text-center align-top border-l border-slate-800/80 min-w-[110px]"
                >
                  <div className="font-extrabold text-sm text-white tracking-wide">
                    {d.shortDayName}
                  </div>
                  <div className="text-xs font-bold text-amber-400 mt-0.5">
                    {dayNum}.{monthNum}
                  </div>

                  {/* Location badge on the day */}
                  <div className="mt-2 flex flex-col items-center gap-1">
                    {dayLocs.length > 0 ? (
                      dayLocs.map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onAddEntryForDate(d.date)}
                          title={`Додати роботу на об'єкті: ${loc}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-950/70 hover:bg-sky-900/80 text-sky-400 border border-sky-500/40 hover:border-sky-400 transition cursor-pointer max-w-[125px] truncate"
                        >
                          <MapPin className="w-3 h-3 shrink-0 text-sky-400" />
                          <span className="truncate">{loc}</span>
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-600 font-medium py-1">—</span>
                    )}
                  </div>
                </th>
              );
            })}

            {/* Totals Columns */}
            <th className="py-4 px-3 text-center text-sm font-extrabold text-white border-l border-slate-800/80 min-w-[70px]">
              Днів
            </th>
            <th className="py-4 px-4 text-right text-sm font-black text-amber-400 border-l border-slate-800/80 min-w-[120px]">
              Всього годин
            </th>
            <th className="py-4 px-5 text-right text-sm font-black text-emerald-400 border-l border-slate-800/80 min-w-[140px]">
              Всього збудовано
            </th>
          </tr>
        </thead>

        {/* Table Body - Rows for Employees */}
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {summary.employeeSummaries.map((emp) => (
            <tr
              key={emp.employeeName}
              className="hover:bg-slate-800/30 transition-colors group"
            >
              {/* Employee Name */}
              <td className="py-3 px-5 text-sm font-bold text-white whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 shadow-sm shadow-amber-400/50" />
                  <span className="tracking-wide group-hover:text-amber-300 transition-colors">
                    {emp.employeeName}
                  </span>
                </div>
              </td>

              {/* 7 Daily Cells */}
              {summary.days.map((d) => {
                const h = emp.dayHours[d.date];
                const sqm = emp.daySquareMeters[d.date];
                const hasData = Boolean(h || sqm);

                return (
                  <td
                    key={d.date}
                    onClick={() => onCellClick(d.date, emp.employeeName)}
                    title={`Клікніть щоб записати або змінити роботу: ${emp.employeeName} (${d.dayName}, ${d.date})`}
                    className={`py-3 px-2 text-center text-sm border-l border-slate-800/80 transition cursor-pointer select-none ${
                      hasData ? 'hover:bg-amber-500/10' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {hasData ? (
                      <div className="space-y-0.5">
                        {h ? (
                          <span className="block font-black text-amber-400 text-sm tracking-tight">
                            {formatHours(h)}г
                          </span>
                        ) : null}
                        {sqm ? (
                          <span className="block font-black text-emerald-400 text-sm tracking-tight">
                            {formatSquareMeters(sqm)}м²
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-600 font-normal text-sm group-hover:text-slate-500">—</span>
                    )}
                  </td>
                );
              })}

              {/* Days count */}
              <td className="py-3 px-3 text-center text-sm font-bold text-white border-l border-slate-800/80">
                {emp.daysWorkedCount}
              </td>

              {/* Total Hours for employee */}
              <td className="py-3 px-4 text-right font-black text-amber-400 text-sm border-l border-slate-800/80 whitespace-nowrap">
                {formatHours(emp.totalHours)} год.
              </td>

              {/* Total Square Meters for employee */}
              <td className="py-3 px-5 text-right font-black text-emerald-400 text-sm border-l border-slate-800/80 whitespace-nowrap">
                {formatSquareMeters(emp.totalSquareMeters)} м²
              </td>
            </tr>
          ))}
        </tbody>

        {/* Table Footer - Grand Totals matching photo */}
        <tfoot>
          <tr className="border-t-2 border-slate-700 bg-[#080d1a] font-black">
            <td className="py-4 px-5 text-sm font-black text-white uppercase tracking-wider">
              РАЗОМ ЗА ДЕНЬ:
            </td>

            {summary.days.map((d) => {
              const h = d.totalHours;
              const sqm = d.totalSquareMeters;
              const hasData = h > 0 || sqm > 0;

              return (
                <td
                  key={d.date}
                  className="py-3 px-2 text-center text-sm border-l border-slate-800/80"
                >
                  {hasData ? (
                    <div className="space-y-0.5">
                      {h > 0 ? (
                        <span className="block font-black text-amber-400 text-sm tracking-tight">
                          {formatHours(h)}г
                        </span>
                      ) : null}
                      {sqm > 0 ? (
                        <span className="block font-black text-emerald-400 text-sm tracking-tight">
                          {formatSquareMeters(sqm)}м²
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-slate-600 font-medium text-sm">—</span>
                  )}
                </td>
              );
            })}

            {/* Total Workers count */}
            <td className="py-4 px-3 text-center text-xs font-bold text-white border-l border-slate-800/80 leading-tight">
              {summary.uniqueEmployeesCount} майстрів
            </td>

            {/* Grand Total Hours */}
            <td className="py-4 px-4 text-right text-base font-black text-amber-400 border-l border-slate-800/80 whitespace-nowrap">
              {formatHours(summary.totalManHours)} год.
            </td>

            {/* Grand Total Square Meters */}
            <td className="py-4 px-5 text-right text-base font-black text-emerald-400 border-l border-slate-800/80 whitespace-nowrap">
              {formatSquareMeters(summary.totalSquareMeters)} м²
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
