import React, { useState, useEffect } from 'react';
import { X, Clock, Layers, User, Briefcase, FileText, Check, MapPin } from 'lucide-react';
import { WorkEntry, WorkCategory, Employee, EntryRecordType } from '../types';
import { WORK_CATEGORIES, INITIAL_LOCATIONS } from '../utils/initialData';

interface WorkEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WorkEntry, 'id' | 'createdAt'> & { id?: string }) => void;
  initialEntry?: WorkEntry | null;
  defaultDate?: string;
  defaultEmployeeName?: string;
  employees: Employee[];
  existingLocations?: string[];
}

export const WorkEntryModal: React.FC<WorkEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
  defaultDate,
  defaultEmployeeName,
  employees,
  existingLocations = [],
}) => {
  const [date, setDate] = useState<string>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [category, setCategory] = useState<WorkCategory>('Мурування та кладка');
  const [recordType, setRecordType] = useState<EntryRecordType>('both');
  const [hoursWorked, setHoursWorked] = useState<string>('8');
  const [squareMeters, setSquareMeters] = useState<string>('20');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const allAvailableLocations = Array.from(
    new Set([...INITIAL_LOCATIONS, ...existingLocations])
  );

  useEffect(() => {
    if (initialEntry) {
      setDate(initialEntry.date);
      setEmployeeName(initialEntry.employeeName);
      setLocation(initialEntry.location || '');
      setCategory(initialEntry.category || 'Загальнобудівельні роботи');
      setRecordType(
        initialEntry.recordType ||
          (initialEntry.hoursWorked > 0 && initialEntry.squareMeters === 0
            ? 'hours_only'
            : initialEntry.hoursWorked === 0 && initialEntry.squareMeters > 0
            ? 'sqm_only'
            : 'both')
      );
      setHoursWorked(String(initialEntry.hoursWorked || 0));
      setSquareMeters(String(initialEntry.squareMeters || 0));
      setTaskDescription(initialEntry.taskDescription || '');
      setNotes(initialEntry.notes || '');
      setErrors({});
    } else {
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setEmployeeName(defaultEmployeeName || (employees.length > 0 ? employees[0].name : ''));
      setLocation(allAvailableLocations[0] || 'Genk Турки');
      setCategory('Мурування та кладка');
      setRecordType('both');
      setHoursWorked('8');
      setSquareMeters('20');
      setTaskDescription('');
      setNotes('');
      setErrors({});
    }
  }, [initialEntry, defaultDate, defaultEmployeeName, isOpen, employees]);

  if (!isOpen) return null;

  const numHours = recordType === 'sqm_only' ? 0 : parseFloat(String(hoursWorked).replace(',', '.')) || 0;
  const numSqm = recordType === 'hours_only' ? 0 : parseFloat(String(squareMeters).replace(',', '.')) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!date) {
      newErrors.date = 'Оберіть дату робіт';
    }
    if (!employeeName.trim()) {
      newErrors.employeeName = "Вкажіть ім'я працівника";
    }
    if (!location.trim()) {
      newErrors.location = 'Вкажіть об’єкт / місце, де виконуються роботи';
    }

    if (recordType === 'hours_only') {
      if (isNaN(numHours) || numHours <= 0) {
        newErrors.hoursWorked = 'Вкажіть кількість відпрацьованих годин (> 0)';
      }
    } else if (recordType === 'sqm_only') {
      if (isNaN(numSqm) || numSqm < 0.1 || numSqm > 1000) {
        newErrors.squareMeters = 'Вкажіть кількість квадратних метрів від 0.1 до 1000 м²';
      }
    } else if (recordType === 'both') {
      const hasHours = !isNaN(numHours) && numHours > 0;
      const hasSqm = !isNaN(numSqm) && numSqm > 0;
      if (!hasHours && !hasSqm) {
        newErrors.hoursWorked = 'Вкажіть години (> 0) або квадратні метри (від 0.1 до 1000 м²)';
      }
      if (hasSqm && (numSqm < 0.1 || numSqm > 1000)) {
        newErrors.squareMeters = 'Кількість квадратних метрів має бути від 0.1 до 1000 м²';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const matchedEmployee = employees.find(
      (emp) => emp.name.toLowerCase() === employeeName.trim().toLowerCase()
    );

    onSave({
      ...(initialEntry?.id ? { id: initialEntry.id } : {}),
      date,
      employeeId: matchedEmployee?.id,
      employeeName: employeeName.trim(),
      location: location.trim(),
      taskDescription: taskDescription.trim() || undefined,
      category,
      recordType,
      hoursWorked: numHours,
      squareMeters: numSqm,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              {initialEntry ? 'Редагувати запис роботи' : 'Запис щоденної роботи працівника'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Години та квадратні метри — це два незалежних окремих розрахунки
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрити діалогове вікно"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Date & Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="entry-date" className="block text-xs font-semibold text-slate-300 mb-1">
                Дата робіт <span className="text-amber-400">*</span>
              </label>
              <input
                id="entry-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {errors.date && <p className="text-rose-400 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="employee-name" className="block text-xs font-semibold text-slate-300 mb-1">
                ПІБ працівника <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="employee-name"
                  type="text"
                  list="employee-suggestions"
                  placeholder="напр. Олександр Мельник"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pl-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
                <datalist id="employee-suggestions">
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.role}
                    </option>
                  ))}
                </datalist>
              </div>
              {errors.employeeName && (
                <p className="text-rose-400 text-xs mt-1">{errors.employeeName}</p>
              )}
            </div>
          </div>

          {/* Row 2: ДЕ ВИКОНУЮТЬСЯ РОБОТИ (Об'єкт / Локація) */}
          <div>
            <label htmlFor="work-location" className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Де будуть виконувати роботи (Об'єкт / Будівельний майданчик) <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                id="work-location"
                type="text"
                list="location-suggestions"
                placeholder="напр. ЖК «Сонячний», Секція 2 або вул. Шевченка 15"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pl-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <MapPin className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
              <datalist id="location-suggestions">
                {allAvailableLocations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
            {errors.location && (
              <p className="text-rose-400 text-xs mt-1">{errors.location}</p>
            )}
          </div>

          {/* Row 3: Category & Work Performed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="work-category" className="block text-xs font-semibold text-slate-300 mb-1">
                Вид робіт / Категорія
              </label>
              <div className="relative">
                <select
                  id="work-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WorkCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer appearance-none"
                >
                  {WORK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Briefcase className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Що саме записуємо:
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setRecordType('both')}
                  className={`py-1 px-1.5 rounded-lg font-medium transition cursor-pointer text-center ${
                    recordType === 'both'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  І години, і м²
                </button>
                <button
                  type="button"
                  onClick={() => setRecordType('hours_only')}
                  className={`py-1 px-1.5 rounded-lg font-medium transition cursor-pointer text-center ${
                    recordType === 'hours_only'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Тільки години
                </button>
                <button
                  type="button"
                  onClick={() => setRecordType('sqm_only')}
                  className={`py-1 px-1.5 rounded-lg font-medium transition cursor-pointer text-center ${
                    recordType === 'sqm_only'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Тільки м²
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: ДВА НЕЗАЛЕЖНИХ РОЗРАХУНКИ: Години та Квадратні метри */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Розрахунок 1: Години */}
            <div
              className={`p-3 rounded-xl border transition ${
                recordType === 'sqm_only'
                  ? 'bg-slate-950/20 border-slate-800 opacity-40 pointer-events-none'
                  : 'bg-slate-950/60 border-amber-500/30'
              }`}
            >
              <label htmlFor="hours-worked" className="block text-xs font-semibold text-amber-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Розрахунок 1: Людино-години
                </span>
                {recordType === 'hours_only' && (
                  <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded">Тільки години</span>
                )}
              </label>
              <input
                id="hours-worked"
                type="number"
                step="0.5"
                min="0"
                max="24"
                disabled={recordType === 'sqm_only'}
                value={recordType === 'sqm_only' ? '0' : hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {/* Quick Hours Presets */}
              {recordType !== 'sqm_only' && (
                <div className="flex gap-1.5 mt-2">
                  {['4', '7.5', '8', '10'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHoursWorked(h)}
                      className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 hover:text-amber-300 transition cursor-pointer"
                    >
                      {h}г
                    </button>
                  ))}
                </div>
              )}
              {errors.hoursWorked && (
                <p className="text-rose-400 text-xs mt-1">{errors.hoursWorked}</p>
              )}
            </div>

            {/* Розрахунок 2: Квадратні метри */}
            <div
              className={`p-3 rounded-xl border transition ${
                recordType === 'hours_only'
                  ? 'bg-slate-950/20 border-slate-800 opacity-40 pointer-events-none'
                  : 'bg-slate-950/60 border-emerald-500/30'
              }`}
            >
              <label htmlFor="square-meters" className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  Розрахунок 2: Квадратні метри (м²)
                </span>
                <span className="text-[10px] text-emerald-300/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  від 0.1 до 1000 м²
                </span>
              </label>
              <input
                id="square-meters"
                type="number"
                step="0.1"
                min="0.1"
                max="1000"
                placeholder="напр. 16.5 або 0.1 - 1000"
                disabled={recordType === 'hours_only'}
                value={recordType === 'hours_only' ? '0' : squareMeters}
                onChange={(e) => setSquareMeters(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {/* Quick SQM Presets */}
              {recordType !== 'hours_only' && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {['0.1', '0.5', '10', '16.5', '26', '50', '100'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSquareMeters(m)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 hover:text-emerald-300 transition cursor-pointer"
                    >
                      {m}м²
                    </button>
                  ))}
                </div>
              )}

              {/* Що саме будували (відображається в таблиці поруч з м²) */}
              {recordType !== 'hours_only' && (
                <div className="mt-3 pt-2.5 border-t border-emerald-500/25">
                  <label htmlFor="task-description" className="block text-xs font-bold text-emerald-300 mb-1 flex items-center justify-between">
                    <span>Що саме будували:</span>
                    <span className="text-[10px] text-emerald-400/80 font-normal">відображається в таблиці</span>
                  </label>
                  <input
                    id="task-description"
                    type="text"
                    list="built-suggestions"
                    placeholder="напр. Стіни, Кладка цегли, Перегородки, Фасад"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <datalist id="built-suggestions">
                    <option value="Стіни" />
                    <option value="Перегородки" />
                    <option value="Кладка цегли" />
                    <option value="Газоблок" />
                    <option value="Фасад" />
                    <option value="Штукатурка" />
                    <option value="Плитка" />
                    <option value="Стяжка" />
                  </datalist>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Стіни', 'Перегородки', 'Кладка цегли', 'Газоблок', 'Фасад'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTaskDescription(item)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer border ${
                          taskDescription === item
                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:text-emerald-300 border-slate-700 hover:border-emerald-500/40'
                        }`}
                      >
                        +{item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {errors.squareMeters && (
                <p className="text-rose-400 text-xs mt-1">{errors.squareMeters}</p>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
            ℹ️ <strong>Зверніть увагу:</strong> години та квадратні метри рахуються незалежно. Ви можете вказати тільки години (напр. підготовчі чи погодинні роботи), тільки квадратні метри (відрядні обсяги), або обидва показники окремо.
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="entry-notes" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Примітки / Зауваження виконроба (необов'язково)
            </label>
            <input
              id="entry-notes"
              type="text"
              placeholder="напр. Прийнято технаглядом, поверх 2, кімната 4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{initialEntry ? 'Оновити запис' : 'Зберегти запис'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
