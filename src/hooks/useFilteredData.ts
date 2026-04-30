import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import type { Activity, BiometricEntry } from '../types/domain';
import { startOfWeek, startOfMonth, groupBy, formatDate, formatWeek, formatMonthYear } from '../lib/utils';

export interface GroupedBar {
  label: string;
  value: number;
  date: Date;
}

export interface StackedBar {
  label: string;
  indoor: number;
  outdoor: number;
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
    const grouped = groupBy(activities, (a) => {
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
        value: items.length,
        date: new Date(key),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [activities, filters.granularity]);
}

export function useCaloriesOverTime(): StackedBar[] {
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
        const indoor = items
          .filter((a) => a.sourceType === 'indoor')
          .reduce((s, a) => s + (a.calories ?? 0), 0);
        const outdoor = items
          .filter((a) => a.sourceType === 'outdoor')
          .reduce((s, a) => s + (a.calories ?? 0), 0);
        const d = new Date(key);
        return {
          label:
            filters.granularity === 'weekly'
              ? formatWeek(d)
              : formatMonthYear(d),
          indoor: Math.round(indoor),
          outdoor: Math.round(outdoor),
          date: d,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [activities, filters.granularity]);
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

export function useTotalWeightLifted(): GroupedBar[] {
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
        const d = new Date(key);
        return {
          label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d),
          value: Math.round(total),
          date: d,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-26);
  }, [data, filters.granularity, filters.dateFrom, filters.dateTo]);
}

export function useRowingPerformance(): Array<{
  label: string;
  date: Date;
  avgDistanceM: number;
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
        const avgDist = items.reduce((s, a) => s + (a.distanceM ?? a.metrics['RowingDistance'] ?? 0), 0) / items.length;
        const avgPow = items.reduce((s, a) => s + (a.metrics['AvgPower'] ?? 0), 0) / items.length;
        const avgSpm = items.reduce((s, a) => s + (a.metrics['AvgSpm'] ?? 0), 0) / items.length;
        return {
          label: filters.granularity === 'weekly' ? formatWeek(d) : formatMonthYear(d),
          date: d,
          avgDistanceM: Math.round(avgDist),
          avgPower: Math.round(avgPow),
          avgSpm: Math.round(avgSpm * 10) / 10,
          sessions: items.length,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data, filters.granularity, filters.dateFrom, filters.dateTo]);
}
