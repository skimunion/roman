import { Employee, WorkEntry, WorkCategory } from '../types';
import { getMondayOfWeek, formatDateKey } from './dateUtils';

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Роман', role: 'зам по ніхуям', color: 'amber' },
  { id: 'emp-2', name: 'Назар', role: 'зам', color: 'indigo' },
  { id: 'emp-3', name: 'Славік', role: '', color: 'rose' },
  { id: 'emp-4', name: 'Руслан', role: '', color: 'sky' },
  { id: 'emp-5', name: 'Саша', role: '', color: 'purple' },
  { id: 'emp-6', name: 'Борис', role: '', color: 'teal' },
  { id: 'emp-7', name: 'Ігор', role: 'бос', color: 'emerald' },
  { id: 'emp-8', name: 'Сергій', role: '', color: 'cyan' },
];

export const INITIAL_LOCATIONS: string[] = [
  'Genk Турки',
  'Louven',
];

export const WORK_CATEGORIES: WorkCategory[] = [
  'Мурування та кладка',
  'Бетон та фундамент',
  'Малярні роботи',
  'Утеплення та фасад',
  'Загальнобудівельні роботи',
];

/**
 * Початкові дані з фотографії користувача:
 * Локації: Genk Турки (Пн-Вт) та Louven (Ср-Сб)
 * Працівники: Роман, Назар, Славік, Руслан, Саша, Борис, Ігор, Сергій
 * Разом за тиждень: 80 годин та 243 м²
 */
export function getInitialWorkEntries(referenceDate: Date = new Date()): WorkEntry[] {
  const monday = getMondayOfWeek(referenceDate);

  const getDateStr = (offsetDays: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offsetDays);
    return formatDateKey(d);
  };

  const mon = getDateStr(0); // Пн 02.11
  const tue = getDateStr(1); // Вт 03.11
  const wed = getDateStr(2); // Ср 04.11
  const thu = getDateStr(3); // Чт 05.11
  const fri = getDateStr(4); // Пт 06.11
  const sat = getDateStr(5); // Сб 07.11

  let idCounter = 1;
  const now = Date.now();

  return [
    // Пн 02.11 - Genk Турки (Разом: 8г)
    {
      id: `entry-${idCounter++}`,
      date: mon,
      employeeName: 'Ігор',
      location: 'Genk Турки',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 4,
      squareMeters: 0,
      createdAt: now - 600000,
    },
    {
      id: `entry-${idCounter++}`,
      date: mon,
      employeeName: 'Сергій',
      location: 'Genk Турки',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 4,
      squareMeters: 0,
      createdAt: now - 590000,
    },

    // Вт 03.11 - Genk Турки (Разом: 50г)
    {
      id: `entry-${idCounter++}`,
      date: tue,
      employeeName: 'Роман',
      location: 'Genk Турки',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 10,
      squareMeters: 0,
      createdAt: now - 500000,
    },
    {
      id: `entry-${idCounter++}`,
      date: tue,
      employeeName: 'Назар',
      location: 'Genk Турки',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 10,
      squareMeters: 0,
      createdAt: now - 490000,
    },
    {
      id: `entry-${idCounter++}`,
      date: tue,
      employeeName: 'Славік',
      location: 'Genk Турки',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 10,
      squareMeters: 0,
      createdAt: now - 480000,
    },
    {
      id: `entry-${idCounter++}`,
      date: tue,
      employeeName: 'Саша',
      location: 'Genk Турки',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 10,
      squareMeters: 0,
      createdAt: now - 470000,
    },
    {
      id: `entry-${idCounter++}`,
      date: tue,
      employeeName: 'Борис',
      location: 'Genk Турки',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 10,
      squareMeters: 0,
      createdAt: now - 460000,
    },

    // Ср 04.11 - Louven (Разом: 12г)
    {
      id: `entry-${idCounter++}`,
      date: wed,
      employeeName: 'Роман',
      location: 'Louven',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 4,
      squareMeters: 0,
      createdAt: now - 400000,
    },
    {
      id: `entry-${idCounter++}`,
      date: wed,
      employeeName: 'Назар',
      location: 'Louven',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 4,
      squareMeters: 0,
      createdAt: now - 390000,
    },
    {
      id: `entry-${idCounter++}`,
      date: wed,
      employeeName: 'Ігор',
      location: 'Louven',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 4,
      squareMeters: 0,
      createdAt: now - 380000,
    },

    // Чт 05.11 - Louven (Разом: 99м²)
    {
      id: `entry-${idCounter++}`,
      date: thu,
      employeeName: 'Роман',
      location: 'Louven',
      taskDescription: 'Стіни',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 16.5,
      createdAt: now - 300000,
    },
    {
      id: `entry-${idCounter++}`,
      date: thu,
      employeeName: 'Назар',
      location: 'Louven',
      taskDescription: 'Стіни',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 16.5,
      createdAt: now - 290000,
    },
    {
      id: `entry-${idCounter++}`,
      date: thu,
      employeeName: 'Славік',
      location: 'Louven',
      taskDescription: 'Стіни',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 16.5,
      createdAt: now - 280000,
    },
    {
      id: `entry-${idCounter++}`,
      date: thu,
      employeeName: 'Руслан',
      location: 'Louven',
      taskDescription: 'Стіни',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 16.5,
      createdAt: now - 270000,
    },
    {
      id: `entry-${idCounter++}`,
      date: thu,
      employeeName: 'Саша',
      location: 'Louven',
      taskDescription: 'Стіни',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 16.5,
      createdAt: now - 260000,
    },
    {
      id: `entry-${idCounter++}`,
      date: thu,
      employeeName: 'Ігор',
      location: 'Louven',
      taskDescription: 'Стіни',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 16.5,
      createdAt: now - 250000,
    },

    // Пт 06.11 - Louven (Разом: 10г та 104м²)
    {
      id: `entry-${idCounter++}`,
      date: fri,
      employeeName: 'Роман',
      location: 'Louven',
      taskDescription: 'Перегородки',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 26,
      createdAt: now - 200000,
    },
    {
      id: `entry-${idCounter++}`,
      date: fri,
      employeeName: 'Назар',
      location: 'Louven',
      taskDescription: 'Перегородки',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 26,
      createdAt: now - 190000,
    },
    {
      id: `entry-${idCounter++}`,
      date: fri,
      employeeName: 'Славік',
      location: 'Louven',
      taskDescription: 'Перегородки',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 26,
      createdAt: now - 180000,
    },
    {
      id: `entry-${idCounter++}`,
      date: fri,
      employeeName: 'Руслан',
      location: 'Louven',
      category: 'Загальнобудівельні роботи',
      recordType: 'hours_only',
      hoursWorked: 10,
      squareMeters: 0,
      createdAt: now - 170000,
    },
    {
      id: `entry-${idCounter++}`,
      date: fri,
      employeeName: 'Ігор',
      location: 'Louven',
      taskDescription: 'Перегородки',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 26,
      createdAt: now - 160000,
    },

    // Сб 07.11 - Louven (Разом: 40м²)
    {
      id: `entry-${idCounter++}`,
      date: sat,
      employeeName: 'Роман',
      location: 'Louven',
      taskDescription: 'Фасад',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 10,
      createdAt: now - 100000,
    },
    {
      id: `entry-${idCounter++}`,
      date: sat,
      employeeName: 'Назар',
      location: 'Louven',
      taskDescription: 'Фасад',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 10,
      createdAt: now - 90000,
    },
    {
      id: `entry-${idCounter++}`,
      date: sat,
      employeeName: 'Славік',
      location: 'Louven',
      taskDescription: 'Фасад',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 10,
      createdAt: now - 80000,
    },
    {
      id: `entry-${idCounter++}`,
      date: sat,
      employeeName: 'Ігор',
      location: 'Louven',
      taskDescription: 'Фасад',
      category: 'Мурування та кладка',
      recordType: 'sqm_only',
      hoursWorked: 0,
      squareMeters: 10,
      createdAt: now - 70000,
    },
  ];
}
