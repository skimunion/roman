export type WorkCategory =
  | 'Мурування та кладка'
  | 'Гіпсокартонні роботи'
  | 'Штукатурні роботи'
  | 'Плитка та підлога'
  | 'Покрівля та каркас'
  | 'Бетон та фундамент'
  | 'Малярні роботи'
  | 'Утеплення та фасад'
  | 'Загальнобудівельні роботи'
  | string;

export type EntryRecordType = 'both' | 'hours_only' | 'sqm_only';

export interface WorkEntry {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId?: string;
  employeeName: string;
  location: string; // Де виконуються роботи (Об'єкт / Локація / Ділянка)
  taskDescription?: string; // Опис робіт (необов'язково)
  category: WorkCategory;
  recordType?: EntryRecordType;
  hoursWorked: number; // Незалежний розрахунок 1: Години (може бути 0, якщо тільки метри)
  squareMeters: number; // Незалежний розрахунок 2: Квадратні метри (може бути 0, якщо тільки години)
  notes?: string;
  createdAt: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  color?: string;
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  dayName: string; // 'Понеділок', 'Вівторок', etc.
  shortDayName: string; // 'Пн', 'Вт', etc.
  displayDate: string; // '2 лист'
  // Розрахунок 1: Людино-години
  totalHours: number;
  // Розрахунок 2: Квадратні метри
  totalSquareMeters: number;
  entryCount: number;
  employeeCount: number;
  locationsCount: number;
  locations: string[];
  entries: WorkEntry[];
}

export interface EmployeeWeeklySummary {
  employeeName: string;
  daysWorkedCount: number;
  totalHours: number; // Окремий підсумок людино-годин
  totalSquareMeters: number; // Окремий підсумок квадратних метрів
  dayHours: Record<string, number>; // date -> hours
  daySquareMeters: Record<string, number>; // date -> m²
  dayLocations: Record<string, string[]>; // date -> locations
  dayTasks: Record<string, string[]>; // date -> what was built
}

export interface CategorySummary {
  category: WorkCategory;
  totalHours: number;
  totalSquareMeters: number;
  percentageOfSquareMeters: number;
  entryCount: number;
}

export interface LocationSummary {
  location: string;
  totalHours: number; // Незалежний підсумок годин на цьому об'єкті
  totalSquareMeters: number; // Незалежний підсумок площі на цьому об'єкті
  percentageOfSquareMeters: number;
  percentageOfHours: number;
  entryCount: number;
  employees: string[];
  categories: string[];
  daysWorkedCount: number;
  dayHours: Record<string, number>;
  daySquareMeters: Record<string, number>;
}

export interface WeekSummary {
  weekNumber: number;
  year: number;
  startDateStr: string; // YYYY-MM-DD (Monday)
  endDateStr: string; // YYYY-MM-DD (Sunday)
  formattedRange: string; // e.g. "2 – 8 листопада 2026 р."
  // РОЗРАХУНОК 1: Людино-години (незалежний)
  totalManHours: number;
  daysWithHours: number;
  // РОЗРАХУНОК 2: Квадратні метри (незалежний)
  totalSquareMeters: number;
  daysWithSquareMeters: number;
  totalEntries: number;
  uniqueEmployeesCount: number;
  uniqueLocationsCount: number;
  days: DaySummary[];
  employeeSummaries: EmployeeWeeklySummary[];
  categorySummaries: CategorySummary[];
  locationSummaries: LocationSummary[];
}

export type ViewTab = 'calendar' | 'ledger' | 'report';
