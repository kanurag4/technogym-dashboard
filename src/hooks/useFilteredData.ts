import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import type { Activity, BiometricEntry } from '../types/domain';
import { startOfWeek, startOfMonth, groupBy, formatDate, formatWeek, formatMonthYear } from '../lib/utils';

export interface GroupedBar {
  label: string;
  value: number;
  date: Date;
  sessionCount?: number;
}

export interface StackedBar {
  label: string;
  indoor: number;
  outdoor: number;
  indoorDays: number;
  outdoorCount: number;
  date: Date;
}

function inDateRange(date: Date, from: Date | null, to: Date | null): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function useFilteredActivities(): Activity[] {
  const { data, filters } = useAppStore();
  return useMemo(() => {
    if (!data) return [];
    return data.activities.filter(
      (a) =>
        filters.activityTypes.includes(a.type) &&
        inDateRange(a.date, filters.dateFrom, filters.dateTo)
    );
  }, [data, filters.activityTypes, filters.dateFrom, filters.dateTo]);
}

export interface MetricSeries {
  metric: string;
  color: string;
  entries: BiometricEntry[];
}

export function useBiometricSeries(): MetricSeries | null {
  const { data, filters } = useAppStore();
  return useMemo(() => {
    if (!data) return null;
    const metric = filters.biometricMetrics[0];
    if (!metric) return null;
    const entries = data.biometrics.filter(
      (b) => b.metric === metric && inDateRange(b.date, filters.dateFrom, filters.dateTo)
    );
    if (entries.length === 0) return null;
    return { metric, color: '#3b82f6', entries };
  }, [data, filters.biometricMetrics, filters.dateFrom, filters.dateTo]);
}

export function useWorkoutFrequency(): GroupedBar[] {
  const activities = useFilteredActivities();
  const { filters } = useAppStore();

  return useMemo(() => {
    const indoorOnly = activities.filter((a) => a.sourceType === 'indoor');
    const grouped = groupBy(indoorOnly, (a) => {
      const bucket =
        filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });

    return Object.entries(grouped)
      .map(([key, items]) => ({
        label:
          filters.granularity === 'weekly'
            ? formatWeek(new Date(key))
            : formatMonthYear(new Date(key)),
        value: new Set(items.map((a) => formatDate(a.date))).size,
        date: new Date(key),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [activities, filters.granularity]);
}

export function useCaloriesOverTime(mode: 'total' | 'avg' = 'total'): StackedBar[] {
  const activities = useFilteredActivities();
  const { filters } = useAppStore();

  return useMemo(() => {
    const grouped = groupBy(activities, (a) => {
      const bucket =
        filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });

    return Object.entries(grouped)
      .map(([key, items]) => {
        const indoorItems = items.filter((a) => a.sourceType === 'indoor');
        const outdoorItems = items.filter((a) => a.sourceType === 'outdoor');
        const indoorTotal = indoorItems.reduce((s, a) => s + (a.calories ?? 0), 0);
        const outdoorTotal = outdoorItems.reduce((s, a) => s + (a.calories ?? 0), 0);
        const indoorDays = new Set(indoorItems.map((a) => formatDate(a.date))).size;
        const indoor = mode === 'avg' && indoorDays > 0
          ? Math.round(indoorTotal / indoorDays)
          : Math.round(indoorTotal);
        const outdoor = mode === 'avg' && outdoorItems.length > 0
          ? Math.round(outdoorTotal / outdoorItems.length)
          : Math.round(outdoorTotal);
        const d = new Date(key);
        return {
          label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d),
          indoor,
          outdoor,
          indoorDays,
          outdoorCount: outdoorItems.length,
          date: d,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [activities, filters.granularity, mode]);
}

export function useActivityTypeBreakdown(): Array<{ type: string; calories: number; color: string }> {
  const activities = useFilteredActivities();

  const COLORS: Record<string, string> = {
    strength: '#3b82f6',
    cardio: '#10b981',
    rowing: '#f59e0b',
    outdoor: '#8b5cf6',
  };

  return useMemo(() => {
    const grouped = groupBy(activities, (a) => a.type);
    return Object.entries(grouped)
      .map(([type, items]) => ({
        type,
        calories: Math.round(items.reduce((s, a) => s + (a.calories ?? 0), 0)),
        color: COLORS[type] ?? '#6b7280',
      }))
      .filter((d) => d.calories > 0);
  }, [activities]);
}

export function useTotalWeightLifted(mode: 'total' | 'avg' = 'total'): GroupedBar[] {
  const { data, filters } = useAppStore();

  return useMemo(() => {
    if (!data) return [];
    const strengthActivities = data.activities.filter(
      (a) =>
        a.type === 'strength' &&
        inDateRange(a.date, filters.dateFrom, filters.dateTo)
    );
    const grouped = groupBy(strengthActivities, (a) => {
      const bucket =
        filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });
    return Object.entries(grouped)
      .map(([key, items]) => {
        const total = items.reduce((s, a) => s + (a.metrics['TotalIsoWeight'] ?? 0), 0);
        const distinctDays = new Set(items.map((a) => formatDate(a.date))).size;
        const value = mode === 'avg' && distinctDays > 0 ? Math.round(total / distinctDays) : Math.round(total);
        const d = new Date(key);
        return {
          label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d),
          value,
          date: d,
          sessionCount: distinctDays,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [data, filters.granularity, filters.dateFrom, filters.dateTo, mode]);
}

export function useCardioDistance(mode: 'total' | 'avg' = 'total'): GroupedBar[] {
  const { data, filters } = useAppStore();

  return useMemo(() => {
    if (!data) return [];
    const cardioActivities = data.activities.filter(
      (a) =>
        (a.type === 'cardio' || a.type === 'outdoor') &&
        inDateRange(a.date, filters.dateFrom, filters.dateTo)
    );
    const grouped = groupBy(cardioActivities, (a) => {
      const bucket = filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });
    return Object.entries(grouped)
      .map(([key, items]) => {
        const totalM = items.reduce((s, a) => s + (a.distanceM ?? a.metrics['HDistance'] ?? 0), 0);
        const indoorDays = new Set(items.filter((a) => a.sourceType === 'indoor').map((a) => formatDate(a.date))).size;
        const outdoorCount = items.filter((a) => a.sourceType === 'outdoor').length;
        const sessionCount = indoorDays + outdoorCount;
        const km = mode === 'avg' && sessionCount > 0 ? totalM / sessionCount / 1000 : totalM / 1000;
        const d = new Date(key);
        return {
          label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d),
          value: parseFloat(km.toFixed(1)),
          date: d,
          sessionCount,
        };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [data, filters.granularity, filters.dateFrom, filters.dateTo, mode]);
}

export function useCardioPace(): GroupedBar[] {
  const { data, filters } = useAppStore();
  return useMemo(() => {
    if (!data) return [];
    const activities = data.activities.filter(
      (a) =>
        (a.type === 'cardio' || a.type === 'outdoor') &&
        (a.metrics['AvgPace'] ?? 0) > 0 &&
        inDateRange(a.date, filters.dateFrom, filters.dateTo)
    );
    const grouped = groupBy(activities, (a) => {
      const bucket = filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });
    return Object.entries(grouped)
      .map(([key, items]) => {
        const avg = items.reduce((s, a) => s + (a.metrics['AvgPace'] ?? 0), 0) / items.length;
        const d = new Date(key);
        return { label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d), value: Math.round(avg), date: d };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [data, filters.granularity, filters.dateFrom, filters.dateTo]);
}

export function useCardioElevation(): GroupedBar[] {
  const { data, filters } = useAppStore();
  return useMemo(() => {
    if (!data) return [];
    const activities = data.activities.filter(
      (a) =>
        (a.type === 'cardio' || a.type === 'outdoor') &&
        (a.metrics['Elevation'] ?? 0) > 0 &&
        inDateRange(a.date, filters.dateFrom, filters.dateTo)
    );
    const grouped = groupBy(activities, (a) => {
      const bucket = filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });
    return Object.entries(grouped)
      .map(([key, items]) => {
        const total = items.reduce((s, a) => s + (a.metrics['Elevation'] ?? 0), 0);
        const d = new Date(key);
        return { label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d), value: Math.round(total), date: d };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [data, filters.granularity, filters.dateFrom, filters.dateTo]);
}

export function useCardioCalories(mode: 'total' | 'avg' = 'total'): GroupedBar[] {
  const { data, filters } = useAppStore();
  return useMemo(() => {
    if (!data) return [];
    const activities = data.activities.filter(
      (a) =>
        (a.type === 'cardio' || a.type === 'rowing' || a.type === 'outdoor') &&
        inDateRange(a.date, filters.dateFrom, filters.dateTo)
    );
    const grouped = groupBy(activities, (a) => {
      const bucket = filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });
    return Object.entries(grouped)
      .map(([key, items]) => {
        const total = items.reduce((s, a) => s + (a.calories ?? 0), 0);
        const indoorDays = new Set(items.filter((a) => a.sourceType === 'indoor').map((a) => formatDate(a.date))).size;
        const outdoorCount = items.filter((a) => a.sourceType === 'outdoor').length;
        const sessionCount = indoorDays + outdoorCount;
        const value = mode === 'avg' && sessionCount > 0 ? Math.round(total / sessionCount) : Math.round(total);
        const d = new Date(key);
        return { label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d), value, date: d, sessionCount };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [data, filters.granularity, filters.dateFrom, filters.dateTo, mode]);
}

export function useTrainingLoad(): GroupedBar[] {
  const activities = useFilteredActivities();
  const { filters } = useAppStore();
  return useMemo(() => {
    const grouped = groupBy(activities, (a) => {
      const bucket = filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });
    return Object.entries(grouped)
      .map(([key, items]) => {
        const totalMin = items.reduce((s, a) => s + (a.durationSec ?? 0), 0) / 60;
        const d = new Date(key);
        return { label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d), value: Math.round(totalMin), date: d };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [activities, filters.granularity]);
}

export function useWorkoutDays(): GroupedBar[] {
  const activities = useFilteredActivities();
  const { filters } = useAppStore();
  return useMemo(() => {
    const grouped = groupBy(activities, (a) => {
      const bucket = filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });
    return Object.entries(grouped)
      .map(([key, items]) => {
        const uniqueDays = new Set(items.map((a) => formatDate(a.date))).size;
        const d = new Date(key);
        return { label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d), value: uniqueDays, date: d };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [activities, filters.granularity]);
}

export function useMetsMinTrend(): GroupedBar[] {
  const activities = useFilteredActivities();
  const { filters } = useAppStore();
  return useMemo(() => {
    const withMets = activities.filter((a) => (a.metrics['MetsMin'] ?? 0) > 0);
    const grouped = groupBy(withMets, (a) => {
      const bucket = filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });
    return Object.entries(grouped)
      .map(([key, items]) => {
        const total = items.reduce((s, a) => s + (a.metrics['MetsMin'] ?? 0), 0);
        const d = new Date(key);
        return { label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d), value: parseFloat(total.toFixed(1)), date: d };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [activities, filters.granularity]);
}

export function useRowingPerformance(): Array<{
  label: string;
  date: Date;
  avgDistanceM: number;
  totalDistanceM: number;
  totalCalories: number;
  avgPower: number;
  avgSpm: number;
  sessions: number;
}> {
  const { data, filters } = useAppStore();

  return useMemo(() => {
    if (!data) return [];
    const rowingSessions = data.activities.filter(
      (a) =>
        a.type === 'rowing' &&
        inDateRange(a.date, filters.dateFrom, filters.dateTo)
    );

    const grouped = groupBy(rowingSessions, (a) => {
      const bucket = filters.granularity === 'weekly' ? startOfWeek(a.date) : startOfMonth(a.date);
      return formatDate(bucket);
    });

    return Object.entries(grouped)
      .map(([key, items]) => {
        const d = new Date(key);
        const totalDist = items.reduce((s, a) => s + (a.distanceM ?? a.metrics['RowingDistance'] ?? 0), 0);
        const totalCal = items.reduce((s, a) => s + (a.calories ?? 0), 0);
        const avgPow = items.reduce((s, a) => s + (a.metrics['AvgPower'] ?? 0), 0) / items.length;
        const avgSpm = items.reduce((s, a) => s + (a.metrics['AvgSpm'] ?? 0), 0) / items.length;
        return {
          label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d),
          date: d,
          avgDistanceM: Math.round(totalDist / items.length),
          totalDistanceM: Math.round(totalDist),
          totalCalories: Math.round(totalCal),
          avgPower: Math.round(avgPow),
          avgSpm: Math.round(avgSpm * 10) / 10,
          sessions: items.length,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data, filters.granularity, filters.dateFrom, filters.dateTo]);
}
