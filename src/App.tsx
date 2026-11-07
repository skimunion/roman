/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  WorkEntry,
  Employee
} from './types';
import {
  getMondayOfWeek,
  shiftWeek,
  formatDateKey
} from './utils/dateUtils';
import {
  calculateWeekSummary,
  generateWeekCSV
} from './utils/calculations';
import {
  INITIAL_EMPLOYEES,
  INITIAL_LOCATIONS,
  getInitialWorkEntries
} from './utils/initialData';
import { Header } from './components/Header';
import { MainTimesheetTable } from './components/MainTimesheetTable';
import { WorkEntryModal } from './components/WorkEntryModal';
import { CrewRosterModal } from './components/CrewRosterModal';
import { DatePickerModal } from './components/DatePickerModal';
import { MapPin, Clock, Layers, Sparkles } from 'lucide-react';

const STORAGE_KEY_ENTRIES = 'cicwma_exact_photo_entries_v3';
const STORAGE_KEY_EMPLOYEES = 'cicwma_exact_photo_employees_v3';

export default function App() {
  const initialMonday = useMemo(() => getMondayOfWeek(new Date()), []);
  const [currentMonday, setCurrentMonday] = useState<Date>(initialMonday);

  // Load entries from localStorage or fallback to exact data from the user's photo
  const [entries, setEntries] = useState<WorkEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENTRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return getInitialWorkEntries(new Date());
  });

  // Load crew employees (exactly the 8 from the photo)
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_EMPLOYEES;
  });

  // Persist entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, [entries]);

  // Persist employees to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    } catch {
      // ignore
    }
  }, [employees]);

  // Compute Weekly calculations and aggregates
  const weekSummary = useMemo(() => {
    return calculateWeekSummary(currentMonday, entries, employees);
  }, [currentMonday, entries, employees]);

  // Existing unique locations (only Genk Турки and Louven)
  const existingLocations = useMemo(() => {
    const set = new Set<string>(INITIAL_LOCATIONS);
    entries.forEach((e) => {
      if (e.location) set.add(e.location);
    });
    return Array.from(set);
  }, [entries]);

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>(formatDateKey(currentMonday));
  const [modalDefaultEmployee, setModalDefaultEmployee] = useState<string>('Роман');
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Week navigation handlers
  const handlePrevWeek = useCallback(() => {
    setCurrentMonday((prev) => shiftWeek(prev, -1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentMonday((prev) => shiftWeek(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentMonday(getMondayOfWeek(new Date()));
  }, []);

  // Open modal when user clicks on a cell in the table
  const handleCellClick = useCallback(
    (dateStr: string, employeeName: string) => {
      // Check if there is an existing entry for this employee on this date
      const existing = entries.find(
        (e) => e.date === dateStr && e.employeeName.trim() === employeeName.trim()
      );

      if (existing) {
        setEditingEntry(existing);
        setModalDefaultDate(existing.date);
        setModalDefaultEmployee(existing.employeeName);
      } else {
        setEditingEntry(null);
        setModalDefaultDate(dateStr);
        setModalDefaultEmployee(employeeName);
      }
      setIsEntryModalOpen(true);
    },
    [entries]
  );

  // Open modal from header or date header
  const handleOpenAddForDate = useCallback((dateStr: string) => {
    setEditingEntry(null);
    setModalDefaultDate(dateStr);
    setModalDefaultEmployee(INITIAL_EMPLOYEES[0]?.name || 'Роман');
    setIsEntryModalOpen(true);
  }, []);

  const handleOpenAddGeneric = useCallback(() => {
    setEditingEntry(null);
    setModalDefaultDate(formatDateKey(currentMonday));
    setModalDefaultEmployee(INITIAL_EMPLOYEES[0]?.name || 'Роман');
    setIsEntryModalOpen(true);
  }, [currentMonday]);

  // Save entry (create or update)
  const handleSaveEntry = useCallback(
    (entryData: Omit<WorkEntry, 'id' | 'createdAt'> & { id?: string }) => {
      if (entryData.id) {
        // Edit existing
        setEntries((prev) =>
          prev.map((item) =>
            item.id === entryData.id
              ? {
                  ...item,
                  ...entryData,
                  location: entryData.location || item.location,
                  hoursWorked: Number(entryData.hoursWorked) || 0,
                  squareMeters: Number(entryData.squareMeters) || 0,
                }
              : item
          )
        );
      } else {
        // Check if there's already an entry for this employee and date to avoid duplicates
        setEntries((prev) => {
          const filtered = prev.filter(
            (e) => !(e.date === entryData.date && e.employeeName.trim() === entryData.employeeName.trim())
          );
          const newEntry: WorkEntry = {
            ...entryData,
            id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            location: entryData.location || 'Genk Турки',
            hoursWorked: Number(entryData.hoursWorked) || 0,
            squareMeters: Number(entryData.squareMeters) || 0,
            createdAt: Date.now(),
          };
          return [...filtered, newEntry];
        });
      }
    },
    []
  );

  // Delete entry
  const handleDeleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // CSV Export
  const handleExportCSV = useCallback(() => {
    const csvContent = generateWeekCSV(weekSummary, entries);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `CICWMA_Табель_Тиждень_${weekSummary.weekNumber}_${weekSummary.startDateStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [weekSummary, entries]);

  // Print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Reset strictly to the exact photo data
  const handleResetToPhoto = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_ENTRIES);
    localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
    setEmployees(INITIAL_EMPLOYEES);
    setEntries(getInitialWorkEntries(currentMonday));
  }, [currentMonday]);

  // Roster handlers
  const handleAddEmployee = useCallback((name: string, role: string) => {
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name,
      role,
    };
    setEmployees((prev) => [...prev, newEmp]);
  }, []);

  const handleDeleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col font-sans">
      {/* Header with Navigation and Actions */}
      <Header
        currentWeekMonday={currentMonday}
        formattedRange={weekSummary.formattedRange}
        weekNumber={weekSummary.weekNumber}
        year={weekSummary.year}
        totalManHours={weekSummary.totalManHours}
        totalSquareMeters={weekSummary.totalSquareMeters}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        onOpenDatePicker={() => setIsDatePickerOpen(true)}
        onOpenAddEntry={handleOpenAddGeneric}
        onOpenRoster={() => setIsRosterModalOpen(true)}
        onPrint={handlePrint}
        onExportCSV={handleExportCSV}
        onResetToPhoto={handleResetToPhoto}
      />

      {/* Main View - EXACT TABLE FROM THE PHOTO */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* The Exact Photo Table */}
        <div className="space-y-3">
          <MainTimesheetTable
            summary={weekSummary}
            allEntries={entries}
            onCellClick={handleCellClick}
            onAddEntryForDate={handleOpenAddForDate}
          />
        </div>

        {/* Clean Summary by Locations (Genk Турки & Louven) */}
        <div className="bg-[#0b1224] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm sm:text-base">
                Підсумки за об'єктами виконання робіт ({weekSummary.locationSummaries.length} об'єкти)
              </h3>
            </div>
            <div className="text-xs text-slate-400">
              Години та квадратні метри є двома незалежними розрахунками
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {weekSummary.locationSummaries.map((loc) => (
              <div
                key={loc.location}
                className="bg-[#080d1a] border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="font-bold text-white text-sm">{loc.location}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-950/80 text-sky-300 border border-sky-500/30">
                    {loc.entryCount} записів
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Години:</span>
                    <span className="font-black text-amber-400 text-sm">{loc.totalHours} год.</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Площа:</span>
                    <span className="font-black text-emerald-400 text-sm">{loc.totalSquareMeters} м²</span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 truncate">
                  Працівники: {loc.employees.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070b16] py-4 text-center text-xs text-slate-500 print:hidden flex items-center justify-center gap-2">
        <img
          src="/logo.png"
          alt="CICWMA Logo"
          className="w-5 h-5 object-contain rounded bg-white/95 p-0.5"
        />
        <p>CICWMA • Незалежний облік людино-годин та збудованих квадратних метрів за об'єктами</p>
      </footer>

      {/* Add / Edit Entry Modal */}
      <WorkEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveEntry}
        initialEntry={editingEntry}
        defaultDate={modalDefaultDate}
        defaultEmployeeName={modalDefaultEmployee}
        employees={employees}
        existingLocations={existingLocations}
      />

      {/* Crew Roster Modal (Management of the 8 employees) */}
      <CrewRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        employees={employees}
        onAddEmployee={handleAddEmployee}
        onDeleteEmployee={handleDeleteEmployee}
      />

      {/* Jump to Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        currentMonday={currentMonday}
        onSelectDate={(newMonday) => setCurrentMonday(newMonday)}
      />
    </div>
  );
}
