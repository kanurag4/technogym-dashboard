export function parseMetricPairs(pairs: Array<{ n: string; v: number | string }>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const { n, v } of pairs) {
    const num = typeof v === 'string' ? parseFloat(v) : v;
    if (!isNaN(num)) result[n] = num;
  }
  return result;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7)); // Monday-anchored
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' });
}

export function formatWeek(date: Date): string {
  const d = startOfWeek(date);
  const yy = String(d.getFullYear()).slice(2);
  return `${d.getDate()}/${d.getMonth() + 1}/'${yy}`;
}

export function formatDayMonth(date: Date): string {
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' });
}

export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

export function secToMin(sec: number): number {
  return Math.round(sec / 60);
}

export function mToKm(m: number): number {
  return parseFloat((m / 1000).toFixed(1));
}

export function barDims(width: number, count: number): { barWidth: number; spacing: number } {
  const slot = (width - 60) / Math.max(count, 1);
  const barWidth = Math.max(24, Math.min(64, Math.floor(slot * 0.6)));
  const spacing = Math.max(8, Math.floor(slot * 0.4));
  return { barWidth, spacing };
}
