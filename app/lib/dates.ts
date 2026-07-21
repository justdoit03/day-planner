// Помощники для дат. Дедлайн хранится строкой "YYYY-MM-DD" (локальная дата),
// поэтому сравнение таких строк лексикографически = сравнению дат.

// Сегодняшняя дата в локальном поясе как "YYYY-MM-DD"
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Дата через N дней от сегодня как "YYYY-MM-DD"
export function isoInDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isOverdue(due?: string | null): boolean {
  if (!due) return false;
  return due < todayISO();
}

export function isDueToday(due?: string | null): boolean {
  if (!due) return false;
  return due === todayISO();
}

// «на сьогодні або прострочено» — то, что просится в план на сегодня
export function isDueTodayOrOverdue(due?: string | null): boolean {
  if (!due) return false;
  return due <= todayISO();
}
