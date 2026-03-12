export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isWeekday(): boolean {
  const day = new Date().getDay();
  return day >= 1 && day <= 5;
}

export function isFriday(): boolean {
  return new Date().getDay() === 5;
}

export function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil((diff / oneWeek + start.getDay() + 1) / 7);
}

export function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export function getFriday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -2 : 5);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export function previousMonth(): { year: number; month: number } {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed, so current month - 1
  const year = month === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return { year, month: month === 0 ? 12 : month };
}

export function monthName(month: number): string {
  return new Date(2000, month - 1).toLocaleString("en", { month: "long" });
}
