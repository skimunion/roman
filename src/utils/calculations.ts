import {
  WorkEntry,
  DaySummary,
  WeekSummary,
  EmployeeWeeklySummary,
  CategorySummary,
  LocationSummary,
  WorkCategory,
  Employee
} from '../types';
import {
  getDaysOfWeek,
  formatDateKey,
  formatWeekRange,
  getWeekNumber,
  DAY_NAMES,
  SHORT_DAY_NAMES,
  MONTH_NAMES_UK
} from './dateUtils';

/**
 * Округлює число до вказаної кількості знаків (за замовчуванням 2).
 */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Форматування годин для відображення (напр., 8 або 7.5).
 */
export function formatHours(hours: number): string {
  const rounded = round(hours, 2);
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

/**
 * Форматування квадратних метрів для відображення (напр., 24 або 24.5 м²).
 */
export function formatSquareMeters(sqm: number): string {
  const rounded = round(sqm, 2);
  return `${rounded}`;
}

/**
 * Окремий підрахунок за день:
 * Розрахунок 1: Сума годин (незалежно від метрів)
 * Розрахунок 2: Сума метрів квадратних (незалежно від годин)
 * Також локації, де виконуються роботи
 */
export function calculateDaySummary(date: Date, entries: WorkEntry[]): DaySummary {
  const dateStr = formatDateKey(date);
  const dayEntries = entries.filter((e) => e.date === dateStr);

  // Незалежний розрахунок 1: людино-години
  const totalHours = round(
    dayEntries.reduce((sum, e) => sum + (Number(e.hoursWorked) || 0), 0)
  );

  // Незалежний розрахунок 2: збудовані квадратні метри
  const totalSquareMeters = round(
    dayEntries.reduce((sum, e) => sum + (Number(e.squareMeters) || 0), 0)
  );

  const uniqueEmployees = new Set(
    dayEntries
      .map((e) => e.employeeName.trim())
      .filter((name) => name.length > 0)
  );

  const uniqueLocationsList = Array.from(
    new Set(
      dayEntries
        .map((e) => (e.location || '').trim())
        .filter((loc) => loc.length > 0)
    )
  );

  const dayOfWeekIndex = date.getDay(); // 0 is Sun, 1 is Mon, etc.
  const dayName = DAY_NAMES[dayOfWeekIndex];
  const shortDayName = SHORT_DAY_NAMES[dayOfWeekIndex];
  const displayDate = `${date.getDate()} ${MONTH_NAMES_UK[date.getMonth()]}`;

  return {
    date: dateStr,
    dayName,
    shortDayName,
    displayDate,
    totalHours,
    totalSquareMeters,
    entryCount: dayEntries.length,
    employeeCount: uniqueEmployees.size,
    locationsCount: uniqueLocationsList.length,
    locations: uniqueLocationsList,
    entries: dayEntries.sort((a, b) => b.createdAt - a.createdAt),
  };
}

/**
 * Обчислення двох незалежних тижневих розрахунків:
 * 1. РОЗРАХУНОК ЛЮДИНО-ГОДИН (всього годин за тиждень, табель по працівниках)
 * 2. РОЗРАХУНОК ЗБУДОВАНИХ КВАДРАТНИХ МЕТРІВ (всього м² за тиждень, обсяги робіт по локаціях/категоріях)
 */
export function calculateWeekSummary(
  mondayDate: Date,
  allEntries: WorkEntry[],
  rosterEmployees?: Employee[]
): WeekSummary {
  const weekDays = getDaysOfWeek(mondayDate);
  const startDateStr = formatDateKey(weekDays[0]);
  const endDateStr = formatDateKey(weekDays[6]);

  const days: DaySummary[] = weekDays.map((d) => calculateDaySummary(d, allEntries));

  const weekEntries = allEntries.filter(
    (e) => e.date >= startDateStr && e.date <= endDateStr
  );

  // 1. РОЗРАХУНОК ЛЮДИНО-ГОДИН (незалежний)
  const totalManHours = round(
    days.reduce((sum, day) => sum + day.totalHours, 0)
  );
  const daysWithHours = days.filter((d) => d.totalHours > 0).length;

  // 2. РОЗРАХУНОК ЗБУДОВАНИХ КВАДРАТНИХ МЕТРІВ (незалежний)
  const totalSquareMeters = round(
    days.reduce((sum, day) => sum + day.totalSquareMeters, 0)
  );
  const daysWithSquareMeters = days.filter((d) => d.totalSquareMeters > 0).length;

  // Групування по працівниках (години та метри обраховуються незалежно)
  const employeeMap = new Map<
    string,
    {
      name: string;
      totalHours: number;
      totalSquareMeters: number;
      daysWorked: Set<string>;
      dayHours: Record<string, number>;
      daySquareMeters: Record<string, number>;
      dayLocations: Record<string, string[]>;
      dayTasks: Record<string, string[]>;
    }
  >();

  // Якщо передано активний склад бригади, показуємо їх у табелі навіть до записів
  if (rosterEmployees && rosterEmployees.length > 0) {
    rosterEmployees.forEach((emp) => {
      const name = emp.name.trim();
      if (!name) return;
      employeeMap.set(name, {
        name,
        totalHours: 0,
        totalSquareMeters: 0,
        daysWorked: new Set<string>(),
        dayHours: {},
        daySquareMeters: {},
        dayLocations: {},
        dayTasks: {},
      });
    });
  }

  weekEntries.forEach((entry) => {
    const key = entry.employeeName.trim();
    if (!key) return;

    if (!employeeMap.has(key)) {
      employeeMap.set(key, {
        name: key,
        totalHours: 0,
        totalSquareMeters: 0,
        daysWorked: new Set<string>(),
        dayHours: {},
        daySquareMeters: {},
        dayLocations: {},
        dayTasks: {},
      });
    }

    const rec = employeeMap.get(key)!;
    const hours = Number(entry.hoursWorked) || 0;
    const sqm = Number(entry.squareMeters) || 0;
    const loc = (entry.location || '').trim();
    const task = (entry.taskDescription || '').trim();

    // Запис що саме будували
    if (task) {
      if (!rec.dayTasks[entry.date]) {
        rec.dayTasks[entry.date] = [];
      }
      if (!rec.dayTasks[entry.date].includes(task)) {
        rec.dayTasks[entry.date].push(task);
      }
    }

    // Запис локації працівника на конкретну дату
    if (loc) {
      if (!rec.dayLocations[entry.date]) {
        rec.dayLocations[entry.date] = [];
      }
      if (!rec.dayLocations[entry.date].includes(loc)) {
        rec.dayLocations[entry.date].push(loc);
      }
    }

    // Незалежне додавання годин
    if (hours > 0) {
      rec.totalHours = round(rec.totalHours + hours);
      rec.dayHours[entry.date] = round((rec.dayHours[entry.date] || 0) + hours);
      rec.daysWorked.add(entry.date);
    }

    // Незалежне додавання квадратних метрів
    if (sqm > 0) {
      rec.totalSquareMeters = round(rec.totalSquareMeters + sqm);
      rec.daySquareMeters[entry.date] = round((rec.daySquareMeters[entry.date] || 0) + sqm);
      rec.daysWorked.add(entry.date);
    }
  });

  const rosterOrderMap = new Map<string, number>();
  if (rosterEmployees && rosterEmployees.length > 0) {
    rosterEmployees.forEach((emp, index) => {
      rosterOrderMap.set(emp.name.trim(), index);
    });
  }

  const employeeSummaries: EmployeeWeeklySummary[] = Array.from(employeeMap.values())
    .map((rec) => ({
      employeeName: rec.name,
      daysWorkedCount: rec.daysWorked.size,
      totalHours: rec.totalHours,
      totalSquareMeters: rec.totalSquareMeters,
      dayHours: rec.dayHours,
      daySquareMeters: rec.daySquareMeters,
      dayLocations: rec.dayLocations,
      dayTasks: rec.dayTasks,
    }))
    .sort((a, b) => {
      const idxA = rosterOrderMap.has(a.employeeName) ? rosterOrderMap.get(a.employeeName)! : 999;
      const idxB = rosterOrderMap.has(b.employeeName) ? rosterOrderMap.get(b.employeeName)! : 999;
      if (idxA !== idxB) return idxA - idxB;
      return b.totalHours - a.totalHours || b.totalSquareMeters - a.totalSquareMeters;
    });

  // Групування за локаціями / об'єктами ("де виконуються роботи")
  const locationMap = new Map<
    string,
    {
      hours: number;
      squareMeters: number;
      count: number;
      employees: Set<string>;
      categories: Set<string>;
      daysWorked: Set<string>;
      dayHours: Record<string, number>;
      daySquareMeters: Record<string, number>;
    }
  >();

  weekEntries.forEach((entry) => {
    const loc = (entry.location || 'Головний об’єкт').trim();
    if (!locationMap.has(loc)) {
      locationMap.set(loc, {
        hours: 0,
        squareMeters: 0,
        count: 0,
        employees: new Set(),
        categories: new Set(),
        daysWorked: new Set(),
        dayHours: {},
        daySquareMeters: {},
      });
    }
    const locRec = locationMap.get(loc)!;
    const h = Number(entry.hoursWorked) || 0;
    const sqm = Number(entry.squareMeters) || 0;

    locRec.hours = round(locRec.hours + h);
    locRec.squareMeters = round(locRec.squareMeters + sqm);
    locRec.count += 1;
    if (entry.employeeName) locRec.employees.add(entry.employeeName.trim());
    if (entry.category) locRec.categories.add(entry.category);
    if (h > 0 || sqm > 0) {
      locRec.daysWorked.add(entry.date);
      if (h > 0) {
        locRec.dayHours[entry.date] = round((locRec.dayHours[entry.date] || 0) + h);
      }
      if (sqm > 0) {
        locRec.daySquareMeters[entry.date] = round((locRec.daySquareMeters[entry.date] || 0) + sqm);
      }
    }
  });

  const locationSummaries: LocationSummary[] = Array.from(locationMap.entries())
    .map(([location, data]) => ({
      location,
      totalHours: data.hours,
      totalSquareMeters: data.squareMeters,
      percentageOfSquareMeters:
        totalSquareMeters > 0 ? round((data.squareMeters / totalSquareMeters) * 100, 1) : 0,
      percentageOfHours:
        totalManHours > 0 ? round((data.hours / totalManHours) * 100, 1) : 0,
      entryCount: data.count,
      employees: Array.from(data.employees).sort(),
      categories: Array.from(data.categories),
      daysWorkedCount: data.daysWorked.size,
      dayHours: data.dayHours,
      daySquareMeters: data.daySquareMeters,
    }))
    .sort((a, b) => b.totalSquareMeters - a.totalSquareMeters || b.totalHours - a.totalHours);

  // Групування за категоріями будівельних робіт
  const categoryMap = new Map<
    WorkCategory,
    { hours: number; squareMeters: number; count: number }
  >();

  weekEntries.forEach((entry) => {
    const cat = entry.category || 'Загальнобудівельні роботи';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { hours: 0, squareMeters: 0, count: 0 });
    }
    const catRec = categoryMap.get(cat)!;
    catRec.hours = round(catRec.hours + (Number(entry.hoursWorked) || 0));
    catRec.squareMeters = round(catRec.squareMeters + (Number(entry.squareMeters) || 0));
    catRec.count += 1;
  });

  const categorySummaries: CategorySummary[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      totalHours: data.hours,
      totalSquareMeters: data.squareMeters,
      percentageOfSquareMeters:
        totalSquareMeters > 0 ? round((data.squareMeters / totalSquareMeters) * 100, 1) : 0,
      entryCount: data.count,
    }))
    .sort((a, b) => b.totalSquareMeters - a.totalSquareMeters || b.totalHours - a.totalHours);

  const { week, year } = getWeekNumber(mondayDate);

  return {
    weekNumber: week,
    year,
    startDateStr,
    endDateStr,
    formattedRange: formatWeekRange(mondayDate),
    totalManHours,
    daysWithHours,
    totalSquareMeters,
    daysWithSquareMeters,
    totalEntries: weekEntries.length,
    uniqueEmployeesCount: employeeMap.size,
    uniqueLocationsCount: locationMap.size,
    days,
    employeeSummaries,
    categorySummaries,
    locationSummaries,
  };
}

/**
 * Експорт даних за тиждень у формат CSV з двома окремими колонками (Години та Метри кв.)
 * та об'єктом / місцем виконання робіт
 */
export function generateWeekCSV(weekSummary: WeekSummary, allEntries: WorkEntry[]): string {
  const weekEntries = allEntries
    .filter((e) => e.date >= weekSummary.startDateStr && e.date <= weekSummary.endDateStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const rows: string[] = [
    `# CICWMA: Тижневий табель та облік робіт`,
    `# Тиждень: ${weekSummary.weekNumber} (${weekSummary.formattedRange})`,
    `# РОЗРАХУНОК 1 (Людино-години): ${weekSummary.totalManHours} год.`,
    `# РОЗРАХУНОК 2 (Збудовані квадратні метри): ${weekSummary.totalSquareMeters} м²`,
    ``,
    `"Дата","День","Працівник","Об'єкт / Де виконуються роботи","Виконана робота","Категорія","Відпрацьовано годин (год)","Збудовано площі (м²)","Примітки"`,
  ];

  weekEntries.forEach((entry) => {
    const parts = entry.date.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayName = DAY_NAMES[d.getDay()];

    rows.push(
      `"${entry.date}","${dayName}","${entry.employeeName.replace(/"/g, '""')}","${(entry.location || '').replace(/"/g, '""')}","${(entry.taskDescription || '').replace(/"/g, '""')}","${entry.category}","${entry.hoursWorked || 0}","${entry.squareMeters || 0}","${(entry.notes || '').replace(/"/g, '""')}"`
    );
  });

  return rows.join('\n');
}
